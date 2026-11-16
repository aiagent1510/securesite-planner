import { db } from "@/lib/db"
import { requireUser } from "@/lib/coppereye/auth"
import { jsonOk, jsonErr, badRequest } from "@/lib/coppereye/api-helpers"
import { analyzePhoto, generateBrief, fallbackBrief } from "@/lib/coppereye/ai"
import { wizardFor } from "@/lib/coppereye/categories"

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const job = await db.job.findUnique({
      where: { id },
      include: { survey: { include: { photos: true } } },
    })
    if (!job || !job.survey) return Response.json({ error: "Job not found" }, { status: 404 })

    const isOwner = job.customerId === user.id
    const isEngineer = user.role === "ENGINEER"
    if (!isOwner && !isEngineer) return Response.json({ error: "Not allowed" }, { status: 403 })

    if (job.survey.analyzed && job.survey.aiBrief) {
      return jsonOk({ analyzed: true, brief: job.survey.aiBrief, cached: true })
    }

    const steps = wizardFor(job.category)
    const answers = job.survey.answers ? JSON.parse(job.survey.answers) : {}
    const photos = job.survey.photos.slice(0, 8)

    const photoNotes: { stepTitle: string; note: string }[] = []
    let anyVisionFailed = false

    if (photos.length > 0) {
      const stepTitle = (stepId: string) => steps.find((s) => s.id === stepId)?.title ?? "Walk-round"
      const results = await Promise.allSettled(
        photos.map((p) =>
          analyzePhoto({
            stepTitle: stepTitle(p.stepId),
            category: job.category,
            notes: answers[p.stepId],
            dataUrl: `data:${p.mimeType};base64,${p.data}`,
          })
        )
      )
      for (let i = 0; i < results.length; i++) {
        const r = results[i]
        const photo = photos[i]
        if (r.status === "fulfilled") {
          photoNotes.push({ stepTitle: stepTitle(photo.stepId), note: r.value })
          await db.surveyPhoto.update({ where: { id: photo.id }, data: { aiNote: r.value } }).catch(() => {})
        } else {
          anyVisionFailed = true
          console.error("photo analysis failed:", r.reason)
        }
      }
    }

    const briefInput = {
      category: job.category,
      title: job.title,
      description: job.description,
      propertyType: job.propertyType,
      postcode: job.postcode,
      town: job.town,
      budget: job.budget,
      steps,
      answers,
      photoNotes,
    }

    let brief: string
    try {
      brief = await generateBrief(briefInput)
    } catch (err) {
      console.error("brief generation failed:", err)
      brief = fallbackBrief(briefInput)
    }

    await db.survey.update({
      where: { id: job.survey.id },
      data: { aiBrief: brief, analyzed: true },
    })

    return jsonOk({ analyzed: true, brief, visionDegraded: anyVisionFailed })
  } catch (err) {
    return jsonErr(err)
  }
}

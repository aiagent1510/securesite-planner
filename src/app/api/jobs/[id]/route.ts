import { db } from "@/lib/db"
import { requireUser } from "@/lib/coppereye/auth"
import { jsonOk, jsonErr, badRequest } from "@/lib/coppereye/api-helpers"
import { engineerRating, getEngineerProfileMap } from "@/lib/coppereye/jobs"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const job = await db.job.findUnique({
      where: { id },
      include: {
        customer: true,
        survey: { include: { photos: { orderBy: { createdAt: "asc" } } } },
        quotes: { orderBy: { createdAt: "desc" }, include: { engineer: true } },
      },
    })
    if (!job) return Response.json({ error: "Job not found" }, { status: 404 })

    const isOwner = user.role === "CUSTOMER" && job.customerId === user.id
    const isEngineer = user.role === "ENGINEER"
    if (!isOwner && !isEngineer) return Response.json({ error: "Not allowed" }, { status: 403 })

    const hasReview = isOwner
      ? (await db.review.count({ where: { jobId: job.id } })) > 0
      : (await db.review.count({ where: { jobId: job.id, engineerId: user.id } })) > 0

    // Customer sees every quote; engineers only see their own
    const visibleQuotes = isOwner ? job.quotes : job.quotes.filter((q) => q.engineerId === user.id)
    const engineerIds = visibleQuotes.map((q) => q.engineerId)
    const profileMap = await getEngineerProfileMap(engineerIds)
    const ratingMap = new Map<string, { rating: number | null; reviews: number }>()
    for (const eid of new Set(engineerIds)) {
      ratingMap.set(eid, await engineerRating(eid))
    }

    const unlocked = isEngineer
      ? (await db.unlock.findUnique({ where: { engineerId_jobId: { engineerId: user.id, jobId: job.id } } })) !== null
      : true

    return jsonOk({
      job: {
        id: job.id,
        title: job.title,
        category: job.category,
        description: job.description,
        town: job.town,
        postcode: job.postcode,
        propertyType: job.propertyType,
        budget: job.budget,
        preferredDate: job.preferredDate,
        status: job.status,
        createdAt: job.createdAt,
        awardedEngineerId: job.awardedEngineerId,
        customerName: job.customer.name,
      },
      contact: {
        name: job.customer.name,
        phone: unlocked ? job.customer.phone : null,
        email: unlocked ? job.customer.email : null,
      },
      unlocked,
      hasReview,
      survey: job.survey
        ? {
            analyzed: job.survey.analyzed,
            answers: job.survey.answers ? JSON.parse(job.survey.answers) : {},
            aiBrief: job.survey.aiBrief,
            photos: job.survey.photos.map((p) => ({
              id: p.id,
              stepId: p.stepId,
              aiNote: p.aiNote,
              dataUrl: `data:${p.mimeType};base64,${p.data}`,
            })),
          }
        : null,
      quotes: visibleQuotes.map((q) => {
        const prof = profileMap.get(q.engineerId)
        const rating = ratingMap.get(q.engineerId)
        return {
          id: q.id,
          amount: q.amount,
          laborHours: q.laborHours,
          materialsNote: q.materialsNote,
          message: q.message,
          status: q.status,
          createdAt: q.createdAt,
          engineerId: q.engineerId,
          engineerName: q.engineer.name,
          businessName: prof?.businessName ?? null,
          headline: prof?.headline ?? null,
          yearsExperience: prof?.yearsExperience ?? 0,
          verified: prof?.verified ?? false,
          rating: rating?.rating ?? null,
          reviews: rating?.reviews ?? 0,
        }
      }),
    })
  } catch (err) {
    return jsonErr(err)
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const body = await request.json()
    const status = String(body.status ?? "")

    const job = await db.job.findUnique({ where: { id } })
    if (!job) return Response.json({ error: "Job not found" }, { status: 404 })

    const isOwner = job.customerId === user.id
    const isAwardedEngineer = job.awardedEngineerId === user.id
    if (!isOwner && !isAwardedEngineer) return Response.json({ error: "Not allowed" }, { status: 403 })

    if (status === "CANCELLED" && isOwner && job.status === "OPEN") {
      await db.job.update({ where: { id }, data: { status: "CANCELLED" } })
      return jsonOk({ ok: true, status: "CANCELLED" })
    }
    if (status === "COMPLETED" && job.status === "AWARDED" && (isOwner || isAwardedEngineer)) {
      await db.job.update({ where: { id }, data: { status: "COMPLETED" } })
      if (isAwardedEngineer) {
        await db.engineerProfile.update({
          where: { userId: user.id },
          data: { jobsCompleted: { increment: 1 } },
        }).catch(() => {})
      }
      return jsonOk({ ok: true, status: "COMPLETED" })
    }
    return badRequest("That status change isn't allowed")
  } catch (err) {
    return jsonErr(err)
  }
}

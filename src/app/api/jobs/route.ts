import { db } from "@/lib/db"
import { requireUser, requireCustomer, AuthError } from "@/lib/coppereye/auth"
import { jsonOk, jsonErr, badRequest } from "@/lib/coppereye/api-helpers"
import { wizardFor } from "@/lib/coppereye/categories"
import { briefPreview, timeAgo, engineerRating, getEngineerProfileMap } from "@/lib/coppereye/jobs"

const MAX_PHOTOS = 10
const MAX_PHOTO_CHARS = 3_000_000 // ~2.2MB per image as base64

export async function GET() {
  try {
    const user = await requireUser()

    if (user.role === "CUSTOMER") {
      const jobs = await db.job.findMany({
        where: { customerId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          survey: { include: { _count: { select: { photos: true } } } },
          quotes: true,
          reviews: true,
          awardedEngineer: { select: { id: true, name: true, engineerProfile: { select: { businessName: true } } } },
        },
      })
      return jsonOk({
        myJobs: jobs.map((j) => ({
          id: j.id,
          title: j.title,
          category: j.category,
          description: j.description,
          town: j.town,
          postcode: j.postcode,
          status: j.status,
          budget: j.budget,
          propertyType: j.propertyType,
          createdAt: j.createdAt,
          createdAtLabel: timeAgo(j.createdAt),
          quoteCount: j.quotes.filter((q) => q.status !== "WITHDRAWN").length,
          newQuotes: j.quotes.filter((q) => q.status === "PENDING").length,
          photoCount: j.survey?._count.photos ?? 0,
          analyzed: j.survey?.analyzed ?? false,
          hasReview: j.reviews.length > 0,
          awardedEngineer: j.awardedEngineer
            ? { name: j.awardedEngineer.name, businessName: j.awardedEngineer.engineerProfile?.businessName ?? null }
            : null,
        })),
      })
    }

    // Engineer: open job feed + jobs I've interacted with
    const [openJobs, unlockedRows, myQuotes] = await Promise.all([
      db.job.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        take: 60,
        include: {
          survey: { include: { _count: { select: { photos: true } } } },
          quotes: { where: { engineerId: user.id } },
          unlocks: { where: { engineerId: user.id } },
        },
      }),
      db.unlock.findMany({ where: { engineerId: user.id }, select: { jobId: true } }),
      db.quote.findMany({
        where: { engineerId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          job: {
            include: {
              customer: { select: { name: true } },
              survey: { include: { _count: { select: { photos: true } } } },
            },
          },
        },
      }),
    ])

    const unlockedIds = new Set(unlockedRows.map((u) => u.jobId))

    return jsonOk({
      feed: openJobs.map((j) => ({
        id: j.id,
        title: j.title,
        category: j.category,
        description: j.description,
        town: j.town,
        postcode: j.postcode,
        status: j.status,
        budget: j.budget,
        propertyType: j.propertyType,
        preferredDate: j.preferredDate,
        createdAt: j.createdAt,
        createdAtLabel: timeAgo(j.createdAt),
        photoCount: j.survey?._count.photos ?? 0,
        analyzed: j.survey?.analyzed ?? false,
        briefPreview: briefPreview(j.survey?.aiBrief ?? null),
        myQuote: j.quotes.length > 0 ? { id: j.quotes[0].id, amount: j.quotes[0].amount, status: j.quotes[0].status } : null,
        unlocked: unlockedIds.has(j.id),
      })),
      myQuotes: myQuotes.map((q) => ({
        id: q.id,
        amount: q.amount,
        status: q.status,
        message: q.message,
        createdAt: q.createdAt,
        createdAtLabel: timeAgo(q.createdAt),
        jobId: q.job.id,
        jobTitle: q.job.title,
        jobCategory: q.job.category,
        jobStatus: q.job.status,
        jobTown: q.job.town,
        customerName: q.job.customer.name,
      })),
    })
  } catch (err) {
    return jsonErr(err)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCustomer()
    const body = await request.json()

    const title = String(body.title ?? "").trim()
    const category = String(body.category ?? "").trim()
    const postcode = String(body.postcode ?? "").trim().toUpperCase()
    if (title.length < 5) return badRequest("Please give the job a short title")
    if (!category) return badRequest("Please choose a category")
    if (!/^[A-Z]{1,2}\d/i.test(postcode)) return badRequest("Please enter a valid UK postcode")

    const survey = body.survey ?? {}
    const answers = survey.answers ?? {}
    const photos: { stepId: string; dataUrl: string }[] = Array.isArray(survey.photos) ? survey.photos.slice(0, MAX_PHOTOS) : []

    for (const p of photos) {
      if (!p.dataUrl || !p.dataUrl.startsWith("data:image/")) return badRequest("Photos must be image files")
      if (p.dataUrl.length > MAX_PHOTO_CHARS) return badRequest("A photo is too large — try taking it again")
    }

    const job = await db.job.create({
      data: {
        customerId: user.id,
        title,
        category,
        description: body.description ? String(body.description).trim() : null,
        postcode,
        town: body.town ? String(body.town).trim() : null,
        propertyType: body.propertyType ? String(body.propertyType) : null,
        budget: body.budget ? String(body.budget) : null,
        preferredDate: body.preferredDate ? String(body.preferredDate) : null,
        survey: {
          create: {
            answers: JSON.stringify(answers),
            photos: {
              create: photos.map((p) => {
                const [meta, data] = p.dataUrl.split(",")
                const mime = meta.slice(5).split(";")[0] || "image/jpeg"
                return { stepId: String(p.stepId), data, mimeType: mime }
              }),
            },
          },
        },
      },
    })

    return jsonOk({ jobId: job.id, steps: wizardFor(category).length }, 201)
  } catch (err) {
    if (err instanceof AuthError && err.status === 403) return jsonErr(err)
    return jsonErr(err)
  }
}

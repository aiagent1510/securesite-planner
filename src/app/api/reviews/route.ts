import { db } from "@/lib/db"
import { requireCustomer } from "@/lib/coppereye/auth"
import { jsonOk, jsonErr, badRequest } from "@/lib/coppereye/api-helpers"

export async function POST(request: Request) {
  try {
    const user = await requireCustomer()
    const body = await request.json()

    const jobId = String(body.jobId ?? "")
    const rating = Number(body.rating)
    const comment = body.comment ? String(body.comment).trim().slice(0, 1000) : null

    if (!jobId) return badRequest("Missing job")
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return badRequest("Rating must be 1-5 stars")

    const job = await db.job.findUnique({ where: { id: jobId } })
    if (!job) return Response.json({ error: "Job not found" }, { status: 404 })
    if (job.customerId !== user.id) return Response.json({ error: "Not allowed" }, { status: 403 })
    if (job.status !== "COMPLETED") return badRequest("You can review the job once it is marked completed")
    if (!job.awardedEngineerId) return badRequest("No engineer was awarded this job")

    const existing = await db.review.findUnique({ where: { jobId } })
    if (existing) return badRequest("You have already reviewed this job")

    const review = await db.review.create({
      data: {
        jobId,
        customerId: user.id,
        engineerId: job.awardedEngineerId,
        rating,
        comment,
      },
    })

    return jsonOk({ ok: true, reviewId: review.id }, 201)
  } catch (err) {
    return jsonErr(err)
  }
}

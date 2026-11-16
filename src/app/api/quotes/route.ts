import { db } from "@/lib/db"
import { requireEngineer } from "@/lib/coppereye/auth"
import { jsonOk, jsonErr, badRequest } from "@/lib/coppereye/api-helpers"
import { timeAgo } from "@/lib/coppereye/jobs"

export async function GET() {
  try {
    const user = await requireEngineer()
    const quotes = await db.quote.findMany({
      where: { engineerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { job: { include: { customer: { select: { name: true } } } } },
    })
    return jsonOk({
      quotes: quotes.map((q) => ({
        id: q.id,
        amount: q.amount,
        status: q.status,
        message: q.message,
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
    const user = await requireEngineer()
    const body = await request.json()

    const jobId = String(body.jobId ?? "")
    const amount = Number(body.amount)
    if (!jobId) return badRequest("Missing job")
    if (!Number.isFinite(amount) || amount <= 0) return badRequest("Enter a valid quote amount")

    const job = await db.job.findUnique({ where: { id: jobId } })
    if (!job) return Response.json({ error: "Job not found" }, { status: 404 })
    if (job.status !== "OPEN") return badRequest("This job is no longer accepting quotes")

    const existing = await db.quote.findUnique({
      where: { jobId_engineerId: { jobId, engineerId: user.id } },
    })

    const data = {
      amount: Math.round(amount * 100) / 100,
      laborHours: body.laborHours ? Number(body.laborHours) : null,
      materialsNote: body.materialsNote ? String(body.materialsNote).trim() : null,
      message: body.message ? String(body.message).trim() : null,
      status: "PENDING",
    }

    let quote
    if (existing) {
      quote = await db.quote.update({ where: { id: existing.id }, data })
    } else {
      quote = await db.quote.create({
        data: { ...data, jobId, engineerId: user.id },
      })
    }

    return jsonOk({ ok: true, quoteId: quote.id, updated: existing !== null }, 201)
  } catch (err) {
    return jsonErr(err)
  }
}

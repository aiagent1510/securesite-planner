import { db } from "@/lib/db"
import { requireCustomer } from "@/lib/coppereye/auth"
import { jsonOk, jsonErr, badRequest } from "@/lib/coppereye/api-helpers"

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCustomer()
    const { id } = await params

    const quote = await db.quote.findUnique({ where: { id }, include: { job: true } })
    if (!quote) return Response.json({ error: "Quote not found" }, { status: 404 })
    if (quote.job.customerId !== user.id) return Response.json({ error: "Not allowed" }, { status: 403 })
    if (quote.job.status !== "OPEN") return badRequest("This job has already been awarded or closed")

    const result = await db.$transaction(async (tx) => {
      // Accept the chosen quote
      const accepted = await tx.quote.update({ where: { id }, data: { status: "ACCEPTED" } })
      // Reject all other pending quotes on the same job
      await tx.quote.updateMany({
        where: { jobId: quote.jobId, id: { not: id }, status: "PENDING" },
        data: { status: "REJECTED" },
      })
      await tx.job.update({
        where: { id: quote.jobId },
        data: { status: "AWARDED", awardedEngineerId: quote.engineerId },
      })
      return accepted
    })

    return jsonOk({ ok: true, quoteId: result.id })
  } catch (err) {
    return jsonErr(err)
  }
}

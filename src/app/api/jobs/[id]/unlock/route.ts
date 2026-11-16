import { db } from "@/lib/db"
import { requireEngineer } from "@/lib/coppereye/auth"
import { jsonOk, jsonErr, badRequest } from "@/lib/coppereye/api-helpers"
import { UNLOCK_COST } from "@/lib/coppereye/jobs"

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireEngineer()
    const { id } = await params

    const job = await db.job.findUnique({
      where: { id },
      include: { customer: { select: { name: true, phone: true, email: true } } },
    })
    if (!job) return Response.json({ error: "Job not found" }, { status: 404 })

    const existing = await db.unlock.findUnique({
      where: { engineerId_jobId: { engineerId: user.id, jobId: id } },
    })

    if (existing) {
      return jsonOk({
        alreadyUnlocked: true,
        contact: { name: job.customer.name, phone: job.customer.phone, email: job.customer.email },
      })
    }

    const profile = await db.engineerProfile.findUnique({ where: { userId: user.id } })
    if (!profile) return badRequest("Engineer profile missing")
    if (profile.credits < UNLOCK_COST) {
      return Response.json(
        { error: `You need ${UNLOCK_COST} credits to unlock this job — top up in the Credits tab`, needCredits: true },
        { status: 402 }
      )
    }

    await db.$transaction([
      db.unlock.create({ data: { engineerId: user.id, jobId: id, cost: UNLOCK_COST } }),
      db.engineerProfile.update({ where: { userId: user.id }, data: { credits: { decrement: UNLOCK_COST } } }),
      db.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -UNLOCK_COST,
          type: "UNLOCK",
          description: `Unlocked customer contact for: ${job.title}`,
          jobId: id,
        },
      }),
    ])

    return jsonOk({
      alreadyUnlocked: false,
      contact: { name: job.customer.name, phone: job.customer.phone, email: job.customer.email },
      credits: profile.credits - UNLOCK_COST,
    })
  } catch (err) {
    return jsonErr(err)
  }
}

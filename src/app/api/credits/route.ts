import { db } from "@/lib/db"
import { requireEngineer } from "@/lib/coppereye/auth"
import { jsonOk, jsonErr, badRequest } from "@/lib/coppereye/api-helpers"

const BUNDLES: Record<string, { credits: number; label: string }> = {
  starter: { credits: 20, label: "Starter pack — 20 credits" },
  standard: { credits: 50, label: "Standard pack — 50 credits" },
  pro: { credits: 100, label: "Pro pack — 100 credits" },
  business: { credits: 250, label: "Business pack — 250 credits" },
}

export async function GET() {
  try {
    const user = await requireEngineer()
    const profile = await db.engineerProfile.findUnique({ where: { userId: user.id } })
    const transactions = await db.creditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    })
    return jsonOk({
      balance: profile?.credits ?? 0,
      transactions: transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        createdAt: t.createdAt,
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
    const bundle = BUNDLES[String(body.bundle ?? "")]
    if (!bundle) return badRequest("Choose a credit pack")

    const profile = await db.engineerProfile.update({
      where: { userId: user.id },
      data: { credits: { increment: bundle.credits } },
    })

    await db.creditTransaction.create({
      data: {
        userId: user.id,
        amount: bundle.credits,
        type: "PURCHASE",
        description: `${bundle.label} (demo payment — no money taken)`,
      },
    })

    return jsonOk({ ok: true, balance: profile.credits })
  } catch (err) {
    return jsonErr(err)
  }
}

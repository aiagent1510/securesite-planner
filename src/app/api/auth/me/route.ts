import { db } from "@/lib/db"
import { getSessionUser } from "@/lib/coppereye/auth"
import { jsonOk, jsonErr } from "@/lib/coppereye/api-helpers"

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return jsonOk({ user: null })

    if (user.role === "ENGINEER") {
      const profile = await db.engineerProfile.findUnique({ where: { userId: user.id } })
      const rating = await db.review.aggregate({
        where: { engineerId: user.id },
        _avg: { rating: true },
        _count: { rating: true },
      })
      return jsonOk({
        user,
        engineerProfile: profile,
        stats: {
          rating: rating._avg.rating ? Math.round(rating._avg.rating * 10) / 10 : null,
          reviews: rating._count.rating,
        },
      })
    }
    return jsonOk({ user })
  } catch (err) {
    return jsonErr(err)
  }
}

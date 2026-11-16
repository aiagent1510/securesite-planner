import { db } from "@/lib/db"
import { requireUser } from "@/lib/coppereye/auth"
import { jsonOk, jsonErr, badRequest } from "@/lib/coppereye/api-helpers"

export async function GET() {
  try {
    const user = await requireUser()
    if (user.role === "ENGINEER") {
      const profile = await db.engineerProfile.findUnique({ where: { userId: user.id } })
      const rating = await db.review.aggregate({
        where: { engineerId: user.id },
        _avg: { rating: true },
        _count: { rating: true },
      })
      const recentReviews = await db.review.findMany({
        where: { engineerId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { customer: { select: { name: true } } },
      })
      return jsonOk({
        user,
        engineerProfile: profile,
        rating: rating._avg.rating ? Math.round(rating._avg.rating * 10) / 10 : null,
        reviewCount: rating._count.rating,
        reviews: recentReviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          customerName: r.customer.name,
          createdAt: r.createdAt,
        })),
      })
    }
    return jsonOk({ user })
  } catch (err) {
    return jsonErr(err)
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser()
    const body = await request.json()

    const name = body.name !== undefined ? String(body.name).trim() : user.name
    if (name.length < 2) return badRequest("Name must be at least 2 characters")

    const phone = body.phone !== undefined ? (body.phone ? String(body.phone).trim() : null) : user.phone
    const postcode =
      body.postcode !== undefined ? (body.postcode ? String(body.postcode).trim().toUpperCase() : null) : user.postcode

    await db.user.update({ where: { id: user.id }, data: { name, phone, postcode } })

    if (user.role === "ENGINEER") {
      const profile = await db.engineerProfile.findUnique({ where: { userId: user.id } })
      if (!profile) return badRequest("Engineer profile missing")

      await db.engineerProfile.update({
        where: { userId: user.id },
        data: {
          businessName: body.businessName !== undefined ? String(body.businessName).trim() || `${name} Security` : profile.businessName,
          headline: body.headline !== undefined ? String(body.headline).trim().slice(0, 120) : profile.headline,
          bio: body.bio !== undefined ? String(body.bio).trim().slice(0, 2000) : profile.bio,
          tradeTypes: body.tradeTypes !== undefined ? Array.isArray(body.tradeTypes) ? body.tradeTypes.join(",") : String(body.tradeTypes) : profile.tradeTypes,
          coverageArea: body.coverageArea !== undefined ? String(body.coverageArea).trim().slice(0, 120) : profile.coverageArea,
          yearsExperience: body.yearsExperience !== undefined ? Math.max(0, Math.min(60, Number(body.yearsExperience) || 0)) : profile.yearsExperience,
          accreditations: body.accreditations !== undefined ? String(body.accreditations).trim() : profile.accreditations,
        },
      })
    }

    return jsonOk({ ok: true })
  } catch (err) {
    return jsonErr(err)
  }
}

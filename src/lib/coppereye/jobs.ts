import { db } from "@/lib/db"

export const UNLOCK_COST = 3

export async function engineerRating(engineerId: string): Promise<{ rating: number | null; reviews: number }> {
  const agg = await db.review.aggregate({
    where: { engineerId },
    _avg: { rating: true },
    _count: { rating: true },
  })
  return {
    rating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
    reviews: agg._count.rating,
  }
}

export async function getEngineerProfileMap(userIds: string[]) {
  const profiles = await db.engineerProfile.findMany({ where: { userId: { in: userIds } } })
  return new Map(profiles.map((p) => [p.userId, p]))
}

export function briefPreview(brief: string | null): string | null {
  if (!brief) return null
  const clean = brief.replace(/[#*`>]/g, "").replace(/\n{2,}/g, "\n").trim()
  return clean.length > 320 ? clean.slice(0, 320) + "…" : clean
}

export function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days < 30 ? `${days}d ago` : date.toLocaleDateString("en-GB")
}

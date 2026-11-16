import { db } from "@/lib/db"
import { createSession, hashPassword } from "@/lib/coppereye/auth"
import { jsonOk, jsonErr, badRequest } from "@/lib/coppereye/api-helpers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email ?? "").trim().toLowerCase()
    const password = String(body.password ?? "")
    const name = String(body.name ?? "").trim()
    const role = body.role === "ENGINEER" ? "ENGINEER" : "CUSTOMER"
    const phone = body.phone ? String(body.phone).trim() : null
    const postcode = body.postcode ? String(body.postcode).trim().toUpperCase() : null

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest("Please enter a valid email address")
    if (password.length < 6) return badRequest("Password must be at least 6 characters")
    if (name.length < 2) return badRequest("Please enter your name")

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) return badRequest("An account with this email already exists — try signing in")

    const user = await db.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        name,
        role,
        phone,
        postcode,
        ...(role === "ENGINEER"
          ? {
              engineerProfile: {
                create: {
                  businessName: `${name} Security`,
                  credits: 20,
                },
              },
              creditTransactions: {
                create: {
                  amount: 20,
                  type: "BONUS",
                  description: "Welcome bonus — 20 free credits",
                },
              },
            }
          : {}),
      },
      include: { engineerProfile: true },
    })

    await createSession(user.id)
    return jsonOk({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, postcode: user.postcode },
      engineerProfile: user.engineerProfile,
    }, 201)
  } catch (err) {
    return jsonErr(err)
  }
}

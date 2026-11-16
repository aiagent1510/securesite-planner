import { db } from "@/lib/db"
import { createSession, verifyPassword } from "@/lib/coppereye/auth"
import { jsonOk, jsonErr, badRequest } from "@/lib/coppereye/api-helpers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email ?? "").trim().toLowerCase()
    const password = String(body.password ?? "")

    if (!email || !password) return badRequest("Email and password are required")

    const user = await db.user.findUnique({ where: { email }, include: { engineerProfile: true } })
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return Response.json({ error: "Incorrect email or password" }, { status: 401 })
    }

    await createSession(user.id)
    return jsonOk({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, postcode: user.postcode },
      engineerProfile: user.engineerProfile,
    })
  } catch (err) {
    return jsonErr(err)
  }
}

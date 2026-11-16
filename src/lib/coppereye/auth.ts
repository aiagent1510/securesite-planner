import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export const SESSION_COOKIE = "ce_session"
const SESSION_DAYS = 30

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":")
    if (!salt || !hash) return false
    const candidate = scryptSync(password, salt, 64)
    const expected = Buffer.from(hash, "hex")
    return candidate.length === expected.length && timingSafeEqual(candidate, expected)
  } catch {
    return false
  }
}

export function tokenFor(userId: string): string {
  return createHash("sha256")
    .update(`${userId}:${randomBytes(32).toString("hex")}`)
    .digest("hex")
}

export async function createSession(userId: string): Promise<string> {
  const token = tokenFor(userId)
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await db.session.create({ data: { token, userId, expiresAt } })
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  })
  return token
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token) {
    await db.session.deleteMany({ where: { token } })
  }
  store.delete(SESSION_COOKIE)
}

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  postcode: string | null
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const store = await cookies()
    const token = store.get(SESSION_COOKIE)?.value
    if (!token) return null
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    })
    if (!session) return null
    if (session.expiresAt < new Date()) {
      await db.session.delete({ where: { id: session.id } }).catch(() => {})
      return null
    }
    const u = session.user
    return { id: u.id, email: u.email, name: u.name, role: u.role, phone: u.phone, postcode: u.postcode }
  } catch {
    return null
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) throw new AuthError("Not signed in")
  return user
}

export async function requireEngineer(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.role !== "ENGINEER") throw new AuthError("Engineer account required", 403)
  return user
}

export async function requireCustomer(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.role !== "CUSTOMER") throw new AuthError("Customer account required", 403)
  return user
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.status = status
  }
}

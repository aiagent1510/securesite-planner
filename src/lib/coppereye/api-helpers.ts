import { AuthError } from "./auth"

export function jsonOk(data: unknown, status = 200) {
  return Response.json(data as object, { status })
}

export function jsonErr(error: unknown) {
  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  const message = error instanceof Error ? error.message : "Something went wrong"
  console.error("API error:", error)
  return Response.json({ error: message }, { status: 500 })
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 })
}

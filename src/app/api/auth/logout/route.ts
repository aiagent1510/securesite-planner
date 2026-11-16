import { destroySession } from "@/lib/coppereye/auth"
import { jsonOk, jsonErr } from "@/lib/coppereye/api-helpers"

export async function POST() {
  try {
    await destroySession()
    return jsonOk({ ok: true })
  } catch (err) {
    return jsonErr(err)
  }
}

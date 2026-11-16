"use client"

export async function api<T>(path: string, options?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = options ?? {}
  const res = await fetch(path, {
    ...rest,
    headers: { "Content-Type": "application/json", ...(rest.headers ?? {}) },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data as { error?: string }).error ?? `Request failed (${res.status})`
    throw Object.assign(new Error(message), { status: res.status, data })
  }
  return data as T
}

/** Compress an image file client-side to keep uploads fast and DB-friendly. */
export function fileToCompressedDataUrl(file: File, maxSize = 1280, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Could not read that file"))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error("Could not read that image"))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas not supported"))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL("image/jpeg", quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

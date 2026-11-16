"use client"

import { Badge } from "@/components/ui/badge"
import { CATEGORY_LABEL } from "@/lib/coppereye/categories"
import { ShieldCheck, Star, Sparkles } from "lucide-react"
import type { ReactNode } from "react"

/* ---------- tiny markdown renderer for AI briefs ---------- */
export function BriefMarkdown({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/)
  return (
    <div className="space-y-4 text-sm leading-relaxed text-zinc-200">
      {blocks.map((block, i) => {
        const lines = block.split("\n")
        const first = lines[0].trim()
        if (first.startsWith("### ")) {
          return <h4 key={i} className="text-sm font-semibold text-[#e09863]">{inline(first.slice(4))}</h4>
        }
        if (first.startsWith("## ")) {
          return (
            <div key={i}>
              <h3 className="mb-2 text-base font-bold tracking-tight text-[#e09863]">{inline(first.slice(3))}</h3>
              {renderBody(lines.slice(1))}
            </div>
          )
        }
        return renderBody(lines, i)
      })}
    </div>
  )
}

function renderBody(lines: string[], key?: number) {
  const isList = lines.every((l) => /^\s*(\d+\.|-)\s/.test(l))
  if (isList && lines.length > 0) {
    return (
      <ul key={key} className="ml-1 space-y-1.5">
        {lines.map((l, i) => {
          const m = l.match(/^\s*(\d+\.|-)\s(.*)$/)
          if (!m) return <li key={i}>{inline(l)}</li>
          return (
            <li key={i} className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c47a4e]" />
              <span>{inline(m[2])}</span>
            </li>
          )
        })}
      </ul>
    )
  }
  return <p key={key}>{lines.map((l, i) => <span key={i}>{inline(l)}{i < lines.length - 1 ? " " : null}</span>)}</p>
}

function inline(text: string): ReactNode {
  // **bold** segments
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i} className="font-semibold text-white">{p.slice(2, -2)}</strong>
    }
    return <span key={i}>{p}</span>
  })
}

/* ---------- atoms ---------- */

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge variant="outline" className="border-[#c47a4e]/50 bg-[#c47a4e]/10 text-[#e09863]">
      {CATEGORY_LABEL[category] ?? category}
    </Badge>
  )
}

const STATUS_STYLES: Record<string, string> = {
  OPEN: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  AWARDED: "border-[#c47a4e]/50 bg-[#c47a4e]/15 text-[#e09863]",
  COMPLETED: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  CANCELLED: "border-zinc-600/60 bg-zinc-700/30 text-zinc-400",
  PENDING: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  ACCEPTED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  REJECTED: "border-zinc-600/60 bg-zinc-700/30 text-zinc-400",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status] ?? "border-zinc-600 text-zinc-300"}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  )
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</div>
      {hint ? <div className="mt-1 text-xs text-[#e09863]">{hint}</div> : null}
    </div>
  )
}

export function Stars({ rating, count, size = "sm" }: { rating: number | null; count?: number; size?: "sm" | "md" }) {
  const value = rating ?? 0
  return (
    <span className={`inline-flex items-center gap-1 ${size === "md" ? "text-sm" : "text-xs"}`}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`${size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"} ${
              n <= Math.round(value) ? "fill-[#e09863] text-[#e09863]" : "fill-zinc-700 text-zinc-700"
            }`}
          />
        ))}
      </span>
      {rating != null ? (
        <span className="font-semibold text-zinc-200">{rating.toFixed(1)}</span>
      ) : (
        <span className="text-zinc-500">No reviews yet</span>
      )}
      {count != null && count > 0 ? <span className="text-zinc-500">({count})</span> : null}
    </span>
  )
}

export function VerifiedMark({ verified }: { verified: boolean }) {
  if (!verified) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
      <ShieldCheck className="h-3.5 w-3.5" /> Verified
    </span>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#c47a4e] border-t-transparent ${className ?? ""}`} />
  )
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#c47a4e]/10 text-[#e09863]">{icon}</div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-zinc-400">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function SparkleBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[#e09863]">
      <Sparkles className="h-3.5 w-3.5" /> AI brief
    </span>
  )
}

export function CopperLogo({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`flex ${size === "sm" ? "h-7 w-7" : "h-9 w-9"} items-center justify-center rounded-lg bg-gradient-to-br from-[#e09863] to-[#8a4e2a] shadow-[0_0_18px_rgba(196,122,78,0.35)]`}>
        <svg viewBox="0 0 24 24" className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} fill="none" stroke="#0b0b0d" strokeWidth="2.4" strokeLinecap="round">
          <circle cx="12" cy="12" r="3.2" fill="#0b0b0d" stroke="none" />
          <path d="M12 2.5v3.2M12 18.3v3.2M2.5 12h3.2M18.3 12h3.2" />
          <circle cx="12" cy="12" r="7.5" />
        </svg>
      </span>
      <span className={`${size === "sm" ? "text-base" : "text-lg"} font-extrabold tracking-tight text-white`}>
        Copper<span className="text-[#e09863]">Eye</span>
      </span>
    </span>
  )
}

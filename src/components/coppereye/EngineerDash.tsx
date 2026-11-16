"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { api } from "./client"
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/coppereye/categories"
import { EmptyState, StatCard, StatusBadge, CategoryBadge, Stars, SparkleBadge, VerifiedMark, Spinner } from "./ui-bits"
import type { CreditState, FeedJob, MyQuote, ProfileResponse } from "./types"
import { useToast } from "@/hooks/use-toast"
import {
  Coins, Briefcase, Send, Plus, Camera, ChevronRight, Loader2, Save,
  MapPin, Star,
} from "lucide-react"
import { useEffect, useState } from "react"

/* ============================= OVERVIEW / FEED ============================= */

interface FeedProps {
  feed: FeedJob[]
  myQuotes: MyQuote[]
  loading: boolean
  onOpenJob: (jobId: string) => void
  onGoCredits: () => void
}

export function EngineerOverview({ feed, myQuotes, loading, onOpenJob, onGoCredits }: FeedProps) {
  const won = myQuotes.filter((q) => q.status === "ACCEPTED").length
  const pending = myQuotes.filter((q) => q.status === "PENDING").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Job feed</h1>
        <p className="text-sm text-zinc-400">Every job below arrives with a full AI walk-round survey — quote without the call-out</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Open jobs" value={feed.length} />
        <StatCard label="Quotes pending" value={pending} />
        <StatCard label="Jobs won" value={won} />
        <StatCard
          label="This week's leads"
          value={feed.filter((j) => Date.now() - new Date(j.createdAt).getTime() < 7 * 86400000).length}
        />
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/60" />)}
        </div>
      ) : feed.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-6 w-6" />}
          title="No open jobs right now"
          body="New customer jobs appear here the moment they're posted. Check back soon — or tune your profile to win more of them."
        />
      ) : (
        <div className="grid gap-3">
          {feed.map((j) => (
            <button
              key={j.id}
              onClick={() => onOpenJob(j.id)}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-left transition-colors hover:border-[#c47a4e]/50 hover:bg-zinc-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryBadge category={j.category} />
                    {j.analyzed ? <SparkleBadge /> : null}
                    <span className="text-xs text-zinc-500">{j.createdAtLabel}</span>
                  </div>
                  <h3 className="mt-1.5 font-semibold leading-snug text-white">{j.title}</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    <MapPin className="mr-1 inline h-3 w-3" />{j.town ? `${j.town}, ` : ""}{j.postcode}
                    {j.propertyType ? ` · ${j.propertyType}` : ""}
                    {j.preferredDate ? ` · ${j.preferredDate}` : ""}
                    {j.photoCount > 0 ? <span> · <Camera className="mr-0.5 inline h-3 w-3" />{j.photoCount} photo{j.photoCount === 1 ? "" : "s"}</span> : null}
                  </p>
                  {j.briefPreview ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">{j.briefPreview}</p>
                  ) : null}
                  {j.myQuote ? (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                      <Send className="h-3 w-3" /> Your quote: £{j.myQuote.amount.toFixed(2)} ({j.myQuote.status.toLowerCase()})
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {j.budget ? <span className="rounded-md border border-zinc-700 bg-zinc-800/70 px-2 py-1 text-xs font-medium text-zinc-200">{j.budget}</span> : null}
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================= MY QUOTES ============================= */

export function MyQuotesPanel({ quotes, loading, onOpenJob }: { quotes: MyQuote[]; loading: boolean; onOpenJob: (id: string) => void }) {
  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My quotes</h1>
        <p className="text-sm text-zinc-400">Everything you've quoted, and where it stands</p>
      </div>
      {quotes.length === 0 ? (
        <EmptyState
          icon={<Send className="h-6 w-6" />}
          title="No quotes sent yet"
          body="Open a job from the feed, review the AI survey brief and send your first quote — quoting is free, you only spend credits to unlock contact details."
        />
      ) : (
        <div className="grid gap-3">
          {quotes.map((q) => (
            <button
              key={q.id}
              onClick={() => onOpenJob(q.jobId)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-left transition-colors hover:border-[#c47a4e]/50"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={q.jobCategory} />
                  <StatusBadge status={q.jobStatus} />
                </div>
                <h3 className="mt-1.5 truncate font-semibold text-white">{q.jobTitle}</h3>
                <p className="text-xs text-zinc-500">{q.customerName} · {q.jobTown ?? ""} · quoted {q.createdAtLabel}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold text-[#e09863]">£{q.amount.toFixed(2)}</div>
                <StatusBadge status={q.status} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================= CREDITS ============================= */

const BUNDLE_ROWS = [
  { id: "starter", credits: 20, price: "£29", per: "£1.45 / credit" },
  { id: "standard", credits: 50, price: "£59", per: "£1.18 / credit" },
  { id: "pro", credits: 100, price: "£99", per: "£0.99 / credit" },
  { id: "business", credits: 250, price: "£199", per: "£0.80 / credit" },
]

export function CreditsPanel({ onChanged }: { onChanged: () => void }) {
  const [state, setState] = useState<CreditState | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const { toast } = useToast()

  async function load() {
    try {
      setState(await api<CreditState>("/api/credits"))
    } catch {
      /* handled by parent auth */
    }
  }
  useEffect(() => { load() }, [])

  async function buy(bundle: string) {
    setBusy(bundle)
    try {
      await api("/api/credits", { method: "POST", json: { bundle } })
      toast({ title: "Credits added", description: "Demo payment — no money was taken." })
      await load()
      onChanged()
    } catch (err) {
      toast({ title: "Could not add credits", description: err instanceof Error ? err.message : undefined, variant: "destructive" })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Credits</h1>
        <p className="text-sm text-zinc-400">Unlock customer contact details to confirm details or quote over the phone — 3 credits each</p>
      </div>

      <div className="rounded-xl border border-[#c47a4e]/50 bg-gradient-to-br from-[#c47a4e]/15 to-transparent p-5">
        <div className="flex items-center gap-3">
          <Coins className="h-8 w-8 text-[#e09863]" />
          <div>
            <div className="text-3xl font-extrabold text-white">{state?.balance ?? "…"}</div>
            <div className="text-xs uppercase tracking-wide text-zinc-400">Credits available</div>
          </div>
          <span className="ml-auto rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-400">≈ {state ? Math.floor(state.balance / 3) : "—"} unlocks</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {BUNDLE_ROWS.map((b) => (
          <div key={b.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center">
            <div className="text-2xl font-bold text-white">{b.credits}</div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">credits</div>
            <div className="mt-2 text-lg font-semibold text-[#e09863]">{b.price}</div>
            <div className="text-xs text-zinc-500">{b.per}</div>
            <Button
              onClick={() => buy(b.id)}
              disabled={busy !== null}
              size="sm"
              className="mt-3 w-full bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]"
            >
              {busy === b.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null} Buy
            </Button>
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-600">Demo payment mode — packs credit instantly, no real charge. Real payments slot in later (Stripe/SumUp).</p>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h2 className="font-bold text-white">History</h2>
        {state && state.transactions.length > 0 ? (
          <ul className="mt-3 divide-y divide-zinc-800">
            {state.transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <div className="truncate text-zinc-200">{t.description}</div>
                  <div className="text-xs text-zinc-500">
                    {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <span className={`font-semibold ${t.amount >= 0 ? "text-emerald-400" : "text-[#e09863]"}`}>
                  {t.amount >= 0 ? `+${t.amount}` : t.amount}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">No transactions yet.</p>
        )}
      </div>
    </div>
  )
}

/* ============================= PROFILE ============================= */

export function EngineerProfilePanel() {
  const [data, setData] = useState<ProfileResponse | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    businessName: "", headline: "", bio: "", coverageArea: "", yearsExperience: "0", accreditations: "",
    tradeTypes: [] as string[],
  })
  const { toast } = useToast()

  useEffect(() => {
    api<ProfileResponse>("/api/profile").then((d) => {
      setData(d)
      const p = d.engineerProfile
      setForm({
        businessName: p?.businessName ?? "",
        headline: p?.headline ?? "",
        bio: p?.bio ?? "",
        coverageArea: p?.coverageArea ?? "",
        yearsExperience: String(p?.yearsExperience ?? 0),
        accreditations: p?.accreditations ?? "",
        tradeTypes: p?.tradeTypes ? p.tradeTypes.split(",").filter(Boolean) : [],
      })
    }).catch(() => {})
  }, [])

  function toggleTrade(id: string) {
    setForm((f) => ({
      ...f,
      tradeTypes: f.tradeTypes.includes(id) ? f.tradeTypes.filter((t) => t !== id) : [...f.tradeTypes, id],
    }))
  }

  async function save() {
    setSaving(true)
    try {
      await api("/api/profile", {
        method: "PUT",
        json: {
          ...form,
          yearsExperience: Number(form.yearsExperience) || 0,
        },
      })
      toast({ title: "Profile saved", description: "Customers and job listings now show your new details." })
      const d = await api<ProfileResponse>("/api/profile")
      setData(d)
    } catch (err) {
      toast({ title: "Could not save", description: err instanceof Error ? err.message : undefined, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (!data) return <div className="flex justify-center py-16"><Spinner /></div>

  const p = data.engineerProfile

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Engineer profile</h1>
        <p className="text-sm text-zinc-400">This is what sells you on quotes and job listings — keep it sharp</p>
      </div>

      {/* Public preview */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{p?.businessName}</h2>
              <VerifiedMark verified={p?.verified ?? false} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <Stars rating={data.rating ?? null} count={data.reviewCount ?? 0} />
              {p ? <span>{p.jobsCompleted} jobs completed</span> : null}
              {p?.coverageArea ? <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.coverageArea}</span> : null}
            </div>
            {p?.headline ? <p className="mt-2 max-w-2xl text-sm text-zinc-300">{p.headline}</p> : null}
            {form.tradeTypes.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.tradeTypes.map((t) => (
                  <span key={t} className="rounded-md border border-[#c47a4e]/40 bg-[#c47a4e]/10 px-2 py-0.5 text-xs text-[#e09863]">
                    {CATEGORY_LABEL[t] ?? t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-center">
            <div className="inline-flex items-center gap-1 text-lg font-bold text-[#e09863]"><Coins className="h-4 w-4" /> {p?.credits ?? 0}</div>
            <div className="text-xs text-zinc-500">credits</div>
          </div>
        </div>
        {data.reviews && data.reviews.length > 0 ? (
          <div className="mt-4 border-t border-zinc-800 pt-4">
            <h3 className="text-sm font-semibold text-white">Recent reviews</h3>
            <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {data.reviews.map((r) => (
                <li key={r.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-[#e09863] text-[#e09863]" : "fill-zinc-700 text-zinc-700"}`} />
                      ))}
                    </span>
                    <span className="text-xs text-zinc-500">{r.customerName}</span>
                  </div>
                  {r.comment ? <p className="mt-1 text-zinc-300">{r.comment}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Edit form */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h2 className="font-bold text-white">Edit profile</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-zinc-300">Business name</Label>
            <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="mt-1 border-zinc-700 bg-zinc-900 text-white" />
          </div>
          <div>
            <Label className="text-zinc-300">Coverage area</Label>
            <Input value={form.coverageArea} onChange={(e) => setForm({ ...form, coverageArea: e.target.value })} placeholder="e.g. Stockport + 20 miles" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-zinc-300">Headline</Label>
            <Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="One line that sums up what you do" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-zinc-300">About your business</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} placeholder="Experience, specialities, warranties, how you work…" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
          </div>
          <div>
            <Label className="text-zinc-300">Years of experience</Label>
            <Input type="number" min="0" max="60" value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })} className="mt-1 border-zinc-700 bg-zinc-900 text-white" />
          </div>
          <div>
            <Label className="text-zinc-300">Accreditations</Label>
            <Input value={form.accreditations} onChange={(e) => setForm({ ...form, accreditations: e.target.value })} placeholder="SSAIB, DBS checked, Part P…" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-zinc-300">Trades you cover</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleTrade(c.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.tradeTypes.includes(c.id)
                      ? "border-[#c47a4e] bg-[#c47a4e]/15 text-[#e09863]"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Button onClick={save} disabled={saving} className="mt-4 bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save profile
        </Button>
      </div>
    </div>
  )
}

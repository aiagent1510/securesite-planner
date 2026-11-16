"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { api } from "./client"
import { CATEGORY_LABEL, wizardFor } from "@/lib/coppereye/categories"
import type { JobDetailResponse, QuoteItem } from "./types"
import { BriefMarkdown, CategoryBadge, StatusBadge, Stars, Spinner, VerifiedMark } from "./ui-bits"
import {
  Sparkles, Camera, Coins, Phone, Mail, ArrowLeft, Loader2, Star,
  ClipboardCheck, ShieldCheck, Ban, CheckCircle2, Eye,
} from "lucide-react"

interface Props {
  jobId: string
  viewerRole: "CUSTOMER" | "ENGINEER"
  onBack: () => void
  onChanged: () => void
  onCreditsChanged: (balance: number) => void
}

export function JobDetail({ jobId, viewerRole, onBack, onChanged, onCreditsChanged }: Props) {
  const [data, setData] = useState<JobDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unlockedContact, setUnlockedContact] = useState<{ name: string; phone: string | null; email: string | null } | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const analyzedOnce = useRef(false)

  const load = useCallback(async () => {
    try {
      const d = await api<JobDetailResponse>(`/api/jobs/${jobId}`)
      setData(d)
      setUnlockedContact(d.unlocked ? d.contact : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load job")
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    load()
  }, [load])

  // Auto-run AI analysis (owner customer only) if the brief isn't ready yet
  useEffect(() => {
    if (!data || analyzedOnce.current) return
    const needsAnalysis =
      viewerRole === "CUSTOMER" &&
      data.survey &&
      !data.survey.analyzed &&
      data.job.status !== "CANCELLED"
    if (needsAnalysis) {
      analyzedOnce.current = true
      setAnalyzing(true)
      api<{ analyzed: boolean }>(`/api/jobs/${jobId}/analyze`, { method: "POST" })
        .then(() => load())
        .catch((err) => {
          console.error("auto analyze failed:", err)
          setError("AI brief is taking longer than expected — it will appear here when ready.")
        })
        .finally(() => setAnalyzing(false))
    }
  }, [data, viewerRole, jobId, load])

  async function acceptQuote(quoteId: string) {
    if (!confirm("Accept this quote? Other engineers will be notified the job is taken.")) return
    setError(null)
    try {
      await api(`/api/quotes/${quoteId}/accept`, { method: "POST" })
      await load()
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not accept quote")
    }
  }

  async function setStatus(status: string) {
    setError(null)
    try {
      await api(`/api/jobs/${jobId}`, { method: "PATCH", json: { status } })
      await load()
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update job")
    }
  }

  async function unlock() {
    setError(null)
    try {
      const res = await api<{ contact: { name: string; phone: string | null; email: string | null }; credits?: number }>(
        `/api/jobs/${jobId}/unlock`,
        { method: "POST" }
      )
      setUnlockedContact(res.contact)
      if (typeof res.credits === "number") onCreditsChanged(res.credits)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unlock contact")
    }
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner /></div>
  }
  if (!data) {
    return (
      <div className="space-y-4">
        {error ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
        <Button variant="outline" onClick={onBack} className="border-zinc-700 text-zinc-200"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      </div>
    )
  }

  const { job, survey, quotes } = data
  const isOwner = viewerRole === "CUSTOMER"
  const steps = wizardFor(job.category)
  const myQuote = quotes[0] ?? null

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> {isOwner ? "My jobs" : "Job feed"}
      </button>

      {/* Header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={job.category} />
              <StatusBadge status={job.status} />
              {survey?.analyzed ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#e09863]">
                  <Sparkles className="h-3.5 w-3.5" /> AI brief ready
                </span>
              ) : null}
            </div>
            <h1 className="mt-2 text-2xl font-bold text-white">{job.title}</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {job.town ? `${job.town}, ` : ""}{job.postcode} · {job.propertyType ?? "Property n/a"} · {job.budget ?? "Flexible budget"}
              {job.preferredDate ? ` · ${job.preferredDate}` : ""}
            </p>
            {job.description ? <p className="mt-3 max-w-2xl text-sm text-zinc-300">{job.description}</p> : null}
          </div>
          <div className="text-right text-sm text-zinc-500">
            <div>Posted by {job.customerName}</div>
            <div>{new Date(job.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
          </div>
        </div>
        {error ? <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
      </div>

      {/* AI brief */}
      <div className="rounded-xl border border-[#c47a4e]/40 bg-[#c47a4e]/[0.06] p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold text-[#e09863]">
            <Sparkles className="h-4 w-4" /> AI surveyor brief
          </h2>
          {analyzing ? (
            <span className="inline-flex items-center gap-2 text-xs text-zinc-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analysing your walk-round…
            </span>
          ) : null}
        </div>
        {survey?.aiBrief ? (
          <div className="mt-3 max-h-[28rem] overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 [scrollbar-width:thin]">
            <BriefMarkdown text={survey.aiBrief} />
          </div>
        ) : survey?.analyzed ? (
          <p className="mt-3 text-sm text-zinc-400">Brief unavailable — engineers can quote from the walk-round notes and photos below.</p>
        ) : (
          <p className="mt-3 text-sm text-zinc-400">
            {analyzing ? "The AI surveyor is reviewing the photos and notes. This usually takes under a minute…" : "AI brief not generated yet."}
          </p>
        )}
      </div>

      {/* Walk-round photos + notes */}
      {survey && (survey.photos.length > 0 || Object.keys(survey.answers).some((k) => survey.answers[k]?.trim())) ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="flex items-center gap-2 font-bold text-white">
            <Camera className="h-4 w-4 text-[#e09863]" /> Walk-round evidence
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {survey.photos.map((p) => {
              const stepTitle = steps.find((s) => s.id === p.stepId)?.title ?? "Walk-round"
              return (
                <div key={p.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                  <img src={p.dataUrl} alt={stepTitle} className="max-h-56 w-full rounded-md object-cover" />
                  <div className="mt-2 text-sm font-medium text-zinc-200">{stepTitle}</div>
                  {p.aiNote ? <p className="mt-1 text-xs leading-relaxed text-[#e09863]"><Sparkles className="mr-1 inline h-3 w-3" />{p.aiNote}</p> : null}
                  {survey.answers[p.stepId]?.trim() ? <p className="mt-1 text-xs text-zinc-400">Customer: {survey.answers[p.stepId]}</p> : null}
                </div>
              )
            })}
            {steps
              .filter((s) => survey.answers[s.id]?.trim() && !survey.photos.some((p) => p.stepId === s.id))
              .map((s) => (
                <div key={s.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                  <div className="text-sm font-medium text-zinc-200">{s.title}</div>
                  <p className="mt-1 text-xs text-zinc-400">{survey.answers[s.id]}</p>
                </div>
              ))}
          </div>
        </div>
      ) : null}

      {/* Contact card — engineer only */}
      {viewerRole === "ENGINEER" ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="flex items-center gap-2 font-bold text-white">
            <Coins className="h-4 w-4 text-[#e09863]" /> Customer contact
          </h2>
          {unlockedContact ? (
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="font-medium text-white">{unlockedContact.name}</div>
              {unlockedContact.phone ? (
                <a href={`tel:${unlockedContact.phone}`} className="flex items-center gap-2 text-[#e09863] hover:underline">
                  <Phone className="h-4 w-4" /> {unlockedContact.phone}
                </a>
              ) : null}
              {unlockedContact.email ? (
                <a href={`mailto:${unlockedContact.email}`} className="flex items-center gap-2 text-[#e09863] hover:underline">
                  <Mail className="h-4 w-4" /> {unlockedContact.email}
                </a>
              ) : null}
              <p className="mt-2 text-xs text-zinc-500">Quoting from the brief or a quick call — your choice.</p>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-400">
                Unlock {job.customerName}&apos;s phone & email for <span className="font-semibold text-[#e09863]">3 credits</span> to confirm details or quote over the phone.
              </p>
              <Button onClick={unlock} className="bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]">
                <Coins className="mr-2 h-4 w-4" /> Unlock — 3 credits
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {/* Quote form / quotes */}
      {viewerRole === "ENGINEER" ? (
        <QuoteForm jobId={job.id} existing={myQuote} jobStatus={job.status} onSaved={() => { load(); onChanged() }} />
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="font-bold text-white">
            Quotes ({quotes.filter((q) => q.status !== "REJECTED").length})
          </h2>
          {quotes.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-400">
              No quotes yet. Engineers are reviewing your AI brief and walk-round — quotes usually arrive within days of posting.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {quotes.map((q) => (
                <QuoteCard key={q.id} quote={q} isOwner={isOwner} jobStatus={job.status} onAccept={() => acceptQuote(q.id)} />
              ))}
            </div>
          )}
          {/* Customer job actions */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
            {job.status === "OPEN" ? (
              <Button variant="outline" size="sm" onClick={() => { if (confirm("Cancel this job?")) setStatus("CANCELLED") }} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Ban className="mr-2 h-4 w-4" /> Cancel job
              </Button>
            ) : null}
            {job.status === "AWARDED" ? (
              <Button variant="outline" size="sm" onClick={() => { if (confirm("Mark this job as completed?")) setStatus("COMPLETED") }} className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark completed
              </Button>
            ) : null}
            {job.status === "COMPLETED" && !data.hasReview ? (
              <Button size="sm" onClick={() => setReviewOpen(true)} className="bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]">
                <Star className="mr-2 h-4 w-4" /> Leave a review
              </Button>
            ) : null}
            {job.status === "COMPLETED" && data.hasReview ? (
              <span className="inline-flex items-center text-sm text-emerald-400"><CheckCircle2 className="mr-1.5 h-4 w-4" /> You reviewed this job — thank you</span>
            ) : null}
          </div>
        </div>
      )}

      {/* Review modal */}
      {data.job.awardedEngineerId ? (
        <ReviewModal
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          jobId={job.id}
          engineerName={job.customerName && quotes.find((q) => q.engineerId === job.awardedEngineerId)?.businessName || "your engineer"}
          onDone={() => { load(); onChanged() }}
        />
      ) : null}
    </div>
  )
}

/* ---------------- engineer quote form ---------------- */
function QuoteForm({ jobId, existing, jobStatus, onSaved }: { jobId: string; existing: QuoteItem | null; jobStatus: string; onSaved: () => void }) {
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "")
  const [hours, setHours] = useState(existing?.laborHours ? String(existing.laborHours) : "")
  const [materials, setMaterials] = useState(existing?.materialsNote ?? "")
  const [message, setMessage] = useState(existing?.message ?? "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api("/api/quotes", {
        method: "POST",
        json: { jobId, amount: Number(amount), laborHours: hours ? Number(hours) : null, materialsNote: materials, message },
      })
      setSaved(true)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save quote")
    } finally {
      setBusy(false)
    }
  }

  const closed = jobStatus !== "OPEN"
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h2 className="font-bold text-white">{existing ? "Your quote" : "Send a quote"}</h2>
      {existing ? (
        <div className="mt-2 flex items-center gap-3">
          <span className="text-2xl font-extrabold text-[#e09863]">£{existing.amount.toFixed(2)}</span>
          <StatusBadge status={existing.status} />
        </div>
      ) : null}
      {closed ? (
        <p className="mt-2 text-sm text-zinc-400">This job is {jobStatus.toLowerCase()} — quoting is closed. {existing ? "You can view your quote above." : ""}</p>
      ) : (
        <form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-zinc-300">Quote amount (£)</Label>
            <Input required type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 1450" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
          </div>
          <div>
            <Label className="text-zinc-300">Estimated hours</Label>
            <Input type="number" min="0.5" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. 7" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-zinc-300">Materials included / notes</Label>
            <Input value={materials} onChange={(e) => setMaterials(e.target.value)} placeholder="e.g. 4x turret cams + 8ch NVR included; customer supplies ladder access" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-zinc-300">Message to the customer</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Why you're the right choice, what's included, availability…" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
          </div>
          {error ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300 sm:col-span-2">{error}</p> : null}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy} className="bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}
              {existing ? "Update quote" : "Submit quote"}
            </Button>
            {saved && !busy ? <span className="ml-3 text-sm text-emerald-400">Saved</span> : null}
          </div>
        </form>
      )}
    </div>
  )
}

/* ---------------- quote card (customer view) ---------------- */
function QuoteCard({ quote, jobStatus, onAccept }: { quote: QuoteItem; isOwner: boolean; jobStatus: string; onAccept: () => void }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{quote.businessName ?? quote.engineerName}</span>
            <VerifiedMark verified={quote.verified} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
            <Stars rating={quote.rating} count={quote.reviews} />
            {quote.yearsExperience > 0 ? <span>{quote.yearsExperience} yrs experience</span> : null}
          </div>
          {quote.headline ? <p className="mt-1.5 max-w-xl text-xs text-zinc-500">{quote.headline}</p> : null}
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-[#e09863]">£{quote.amount.toFixed(2)}</div>
          {quote.laborHours ? <div className="text-xs text-zinc-500">est. {quote.laborHours}h labour</div> : null}
        </div>
      </div>
      {quote.materialsNote ? <p className="mt-2 text-sm text-zinc-300"><span className="text-zinc-500">Materials:</span> {quote.materialsNote}</p> : null}
      {quote.message ? <p className="mt-1.5 text-sm text-zinc-300">&ldquo;{quote.message}&rdquo;</p> : null}
      <div className="mt-3 flex items-center justify-between">
        <StatusBadge status={quote.status} />
        {jobStatus === "OPEN" && quote.status === "PENDING" ? (
          <Button onClick={onAccept} size="sm" className="bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]">
            <ShieldCheck className="mr-1.5 h-4 w-4" /> Accept quote
          </Button>
        ) : null}
      </div>
    </div>
  )
}

/* ---------------- review modal ---------------- */
function ReviewModal({ open, onOpenChange, jobId, engineerName, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; jobId: string; engineerName: string; onDone: () => void }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      await api("/api/reviews", { method: "POST", json: { jobId, rating, comment } })
      onOpenChange(false)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save review")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-[#121214] text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Review {engineerName}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>
              <Star className={`h-8 w-8 ${n <= rating ? "fill-[#e09863] text-[#e09863]" : "text-zinc-600"}`} />
            </button>
          ))}
        </div>
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="How did the job go? (optional)" className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
        {error ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
        <Button onClick={submit} disabled={busy} className="bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />} Publish review
        </Button>
      </DialogContent>
    </Dialog>
  )
}

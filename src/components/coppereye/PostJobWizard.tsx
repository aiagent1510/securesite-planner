"use client"

import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { api, fileToCompressedDataUrl } from "./client"
import { CATEGORIES, PROPERTY_TYPES, BUDGETS, wizardFor, CATEGORY_LABEL } from "@/lib/coppereye/categories"
import { Sparkles, Camera, ArrowRight, ArrowLeft, Check, Loader2, X, ImagePlus, ClipboardList, PartyPopper } from "lucide-react"

interface Props {
  customerPostcode?: string | null
  onDone: (jobId: string) => void
  onCancel: () => void
}

export function PostJobWizard({ customerPostcode, onDone, onCancel }: Props) {
  const [phase, setPhase] = useState(0) // 0 details, 1..n walk steps, n+1 review, n+2 done
  const [category, setCategory] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [postcode, setPostcode] = useState(customerPostcode ?? "")
  const [town, setTown] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [budget, setBudget] = useState("")
  const [preferredDate, setPreferredDate] = useState("")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [photos, setPhotos] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdJobId, setCreatedJobId] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const steps = useMemo(() => (category ? wizardFor(category) : []), [category])
  const totalPhases = steps.length + 3 // details + steps + review + done

  function pickCategory(id: string) {
    setCategory(id)
    setAnswers({})
    setPhotos({})
    setPhase(0)
  }

  async function handleFile(stepId: string, file?: File | null) {
    if (!file) return
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      setPhotos((p) => ({ ...p, [stepId]: dataUrl }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read photo")
    }
  }

  function removePhoto(stepId: string) {
    setPhotos((p) => {
      const copy = { ...p }
      delete copy[stepId]
      return copy
    })
    if (fileRefs.current[stepId]) fileRefs.current[stepId]!.value = ""
  }

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      const photoPayload = Object.entries(photos).map(([stepId, dataUrl]) => ({ stepId, dataUrl }))
      const res = await api<{ jobId: string }>("/api/jobs", {
        method: "POST",
        json: {
          title,
          description,
          category,
          postcode,
          town,
          propertyType,
          budget,
          preferredDate,
          survey: { answers, photos: photoPayload },
        },
      })
      setCreatedJobId(res.jobId)
      setPhase(steps.length + 2)
      // Kick off AI analysis in the background — the job detail page will show progress
      fetch(`/api/jobs/${res.jobId}/analyze`, { method: "POST", headers: { "Content-Type": "application/json" } }).catch(() => {})
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post the job")
    } finally {
      setBusy(false)
    }
  }

  /* ---------------- Phase 0: job details ---------------- */
  if (phase === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">What do you need doing?</h2>
          <p className="mt-1 text-sm text-zinc-400">Pick a category — the AI surveyor changes its walk-round to match.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => pickCategory(c.id)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                category === c.id
                  ? "border-[#c47a4e] bg-[#c47a4e]/10"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-[#c47a4e]/60 hover:bg-zinc-900"
              }`}
            >
              <div className="font-semibold text-white">{c.label}</div>
              <div className="mt-1 text-xs leading-snug text-zinc-500">{c.blurb}</div>
            </button>
          ))}
        </div>
        {category ? (
          <>
            <JobDetailsForm
              title={title} setTitle={setTitle}
              description={description} setDescription={setDescription}
              postcode={postcode} setPostcode={setPostcode}
              town={town} setTown={setTown}
              propertyType={propertyType} setPropertyType={setPropertyType}
              budget={budget} setBudget={setBudget}
              preferredDate={preferredDate} setPreferredDate={setPreferredDate}
            />
            {error ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
            <div className="flex justify-between">
              <Button variant="ghost" onClick={onCancel} className="text-zinc-400">Cancel</Button>
              <Button
                onClick={() => {
                  if (title.trim().length < 5) {
                    setError("Please give the job a short title")
                    return
                  }
                  if (!postcode.trim()) {
                    setError("Please enter your postcode")
                    return
                  }
                  setError(null)
                  setPhase(1)
                }}
                className="bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]"
              >
                Start AI walk-round <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <Button variant="ghost" onClick={onCancel} className="text-zinc-400">Cancel</Button>
        )}
      </div>
    )
  }

  /* ---------------- Phase n+2: done ---------------- */
  if (phase === steps.length + 2) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
        <PartyPopper className="mx-auto h-10 w-10 text-emerald-400" />
        <h2 className="mt-3 text-2xl font-bold text-white">Job posted!</h2>
        <p className="mt-2 text-sm text-zinc-300">
          Your job is now live for engineers. While you wait, the AI surveyor is turning your walk-round into a full
          install brief — open the job to watch it appear, then compare quotes as they arrive.
        </p>
        <Button
          onClick={() => createdJobId && onDone(createdJobId)}
          className="mt-6 bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]"
        >
          Open my job <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    )
  }

  const isReview = phase === steps.length + 1
  const stepIndex = phase - 1
  const step = steps[stepIndex]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* progress */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
          <span>
            {isReview ? "Final check" : stepIndex >= 0 ? `Walk-round: step ${stepIndex + 1} of ${steps.length}` : ""}
          </span>
          <span className="text-[#e09863]">{CATEGORY_LABEL[category]}</span>
        </div>
        <Progress value={Math.round((phase / totalPhases) * 100)} className="h-2 bg-zinc-800 [&>div]:bg-[#c47a4e]" />
      </div>

      {isReview ? (
        /* ---------------- Review & submit ---------------- */
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Check it over and post</h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm">
            <div className="font-semibold text-white">{title}</div>
            <div className="mt-1 text-zinc-400">
              {CATEGORY_LABEL[category]} · {town ? `${town}, ` : ""}{postcode} · {propertyType || "Property not stated"} · {budget || "Flexible budget"}
            </div>
            {description ? <p className="mt-2 text-zinc-300">{description}</p> : null}
            <div className="mt-4 space-y-3">
              {steps.map((s) => (
                <div key={s.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-200">{s.title}</span>
                    <span className="text-xs text-zinc-500">
                      {photos[s.id] ? "1 photo" : "no photo"} · {answers[s.id]?.trim() ? "notes" : "no notes"}
                    </span>
                  </div>
                  {answers[s.id]?.trim() ? <p className="mt-1 text-sm text-zinc-400">{answers[s.id]}</p> : null}
                  {photos[s.id] ? (
                    <img src={photos[s.id]} alt={s.title} className="mt-2 h-28 w-auto rounded-lg border border-zinc-800 object-cover" />
                  ) : null}
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs text-zinc-500">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#e09863]" />
              After posting, the AI surveyor turns all of this into an install brief for engineers — camera/sensor positions, cable routes, kit quantities and questions to confirm.
            </p>
          </div>
          {error ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setPhase(phase - 1)} className="border-zinc-700 text-zinc-200 hover:bg-zinc-800">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={submit} disabled={busy} className="bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Post job & start AI brief
            </Button>
          </div>
        </div>
      ) : (
        /* ---------------- Walk-round steps ---------------- */
        <div className="space-y-4">
          <div className="rounded-xl border border-[#c47a4e]/40 bg-[#c47a4e]/10 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#e09863]">
              <Sparkles className="h-4 w-4" /> AI surveyor says
            </div>
            <h2 className="mt-1 text-xl font-bold text-white">{step.title}</h2>
            <p className="mt-2 text-sm text-zinc-300">{step.instruction}</p>
            <ul className="mt-3 space-y-1.5">
              {step.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs text-zinc-400">
                  <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c47a4e]" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <Label className="text-zinc-300">Your notes for this step (optional)</Label>
            <Textarea
              value={answers[step.id] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [step.id]: e.target.value }))}
              placeholder="Anything the AI should know — sizes, materials, what worries you most…"
              rows={3}
              className="mt-1.5 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
            />

            <div className="mt-4">
              <Label className="text-zinc-300">Photo for this step</Label>
              {photos[step.id] ? (
                <div className="relative mt-2 inline-block">
                  <img src={photos[step.id]} alt={step.title} className="max-h-64 rounded-lg border border-zinc-700 object-cover" />
                  <button
                    onClick={() => removePhoto(step.id)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => fileRefs.current[step.id]?.click()}
                    className="mt-2 flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 py-8 text-zinc-400 transition-colors hover:border-[#c47a4e]/60 hover:text-[#e09863]"
                  >
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-sm">Take or upload a photo</span>
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-600">
                      <Camera className="h-3 w-3" /> On a phone? The camera opens automatically
                    </span>
                  </button>
                  <input
                    ref={(el) => { fileRefs.current[step.id] = el }}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFile(step.id, e.target.files?.[0])}
                  />
                </>
              )}
            </div>
          </div>

          {error ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => (phase === 1 ? setPhase(0) : setPhase(phase - 1))}
              className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> {phase === 1 ? "Back to details" : "Previous step"}
            </Button>
            <Button onClick={() => setPhase(phase + 1)} className="bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]">
              {stepIndex === steps.length - 1 ? "Review & post" : "Next step"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- inline details form used inside phase 0->1 transition ---------- */
export function JobDetailsForm(props: {
  title: string; setTitle: (v: string) => void
  description: string; setDescription: (v: string) => void
  postcode: string; setPostcode: (v: string) => void
  town: string; setTown: (v: string) => void
  propertyType: string; setPropertyType: (v: string) => void
  budget: string; setBudget: (v: string) => void
  preferredDate: string; setPreferredDate: (v: string) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label className="text-zinc-300">Job title</Label>
        <Input value={props.title} onChange={(e) => props.setTitle(e.target.value)} placeholder="e.g. 4-camera CCTV for semi-detached house" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
      </div>
      <div className="sm:col-span-2">
        <Label className="text-zinc-300">Describe the job</Label>
        <Textarea value={props.description} onChange={(e) => props.setDescription(e.target.value)} placeholder="What you want protected, any incidents, preferences…" rows={3} className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
      </div>
      <div>
        <Label className="text-zinc-300">Postcode</Label>
        <Input value={props.postcode} onChange={(e) => props.setPostcode(e.target.value)} placeholder="SK4 2HA" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
      </div>
      <div>
        <Label className="text-zinc-300">Town / area</Label>
        <Input value={props.town} onChange={(e) => props.setTown(e.target.value)} placeholder="Stockport" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
      </div>
      <div>
        <Label className="text-zinc-300">Property type</Label>
        <Select value={props.propertyType} onValueChange={props.setPropertyType}>
          <SelectTrigger className="mt-1 border-zinc-700 bg-zinc-900 text-white"><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
            {PROPERTY_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-zinc-300">Budget</Label>
        <Select value={props.budget} onValueChange={props.setBudget}>
          <SelectTrigger className="mt-1 border-zinc-700 bg-zinc-900 text-white"><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
            {BUDGETS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="sm:col-span-2">
        <Label className="text-zinc-300">Preferred timing (optional)</Label>
        <Input value={props.preferredDate} onChange={(e) => props.setPreferredDate(e.target.value)} placeholder="e.g. flexible, ideally within 3 weeks" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
      </div>
      <p className="flex items-center gap-2 text-xs text-zinc-500 sm:col-span-2">
        <ClipboardList className="h-3.5 w-3.5 text-[#e09863]" /> Next: the AI surveyor walks you round the property.
      </p>
    </div>
  )
}

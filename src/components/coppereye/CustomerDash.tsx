"use client"

import { Button } from "@/components/ui/button"
import { EmptyState, StatCard, StatusBadge, CategoryBadge, SparkleBadge } from "./ui-bits"
import type { CustomerJob } from "./types"
import { Plus, ClipboardList, MessageSquareQuote, CheckCircle2, Camera, ChevronRight } from "lucide-react"

interface Props {
  jobs: CustomerJob[]
  loading: boolean
  onOpenJob: (jobId: string) => void
  onPostJob: () => void
}

export function CustomerOverview({ jobs, loading, onOpenJob, onPostJob }: Props) {
  const totalQuotes = jobs.reduce((n, j) => n + j.quoteCount, 0)
  const newQuotes = jobs.reduce((n, j) => n + j.newQuotes, 0)
  const completed = jobs.filter((j) => j.status === "COMPLETED").length
  const open = jobs.filter((j) => j.status === "OPEN").length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Your jobs</h1>
          <p className="text-sm text-zinc-400">Track quotes from vetted security engineers</p>
        </div>
        <Button onClick={onPostJob} className="bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]">
          <Plus className="mr-2 h-4 w-4" /> Post a job
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Open jobs" value={open} />
        <StatCard label="Quotes received" value={totalQuotes} hint={newQuotes > 0 ? `${newQuotes} new` : undefined} />
        <StatCard label="Completed" value={completed} />
        <StatCard label="AI briefs ready" value={jobs.filter((j) => j.analyzed).length} />
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/60" />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title="No jobs yet"
          body="Post your first job and walk the property with the AI surveyor — it takes about 5 minutes and gets you accurate quotes without anyone visiting."
          action={
            <Button onClick={onPostJob} className="bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]">
              <Plus className="mr-2 h-4 w-4" /> Post a job
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {jobs.map((j) => (
            <button
              key={j.id}
              onClick={() => onOpenJob(j.id)}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-left transition-colors hover:border-[#c47a4e]/50 hover:bg-zinc-900"
            >
              <div className="flex items-center justify-between gap-2">
                <CategoryBadge category={j.category} />
                <StatusBadge status={j.status} />
              </div>
              <h3 className="mt-2 font-semibold leading-snug text-white">{j.title}</h3>
              <p className="mt-1 text-xs text-zinc-500">
                {j.town ? `${j.town}, ` : ""}{j.postcode} · {j.createdAtLabel}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                <span className={`inline-flex items-center gap-1.5 ${j.newQuotes > 0 ? "font-semibold text-emerald-400" : "text-zinc-400"}`}>
                  <MessageSquareQuote className="h-3.5 w-3.5" /> {j.quoteCount} quote{j.quoteCount === 1 ? "" : "s"}
                  {j.newQuotes > 0 ? ` · ${j.newQuotes} new` : ""}
                </span>
                {j.photoCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-zinc-400"><Camera className="h-3.5 w-3.5" /> {j.photoCount}</span>
                ) : null}
                {j.analyzed ? <SparkleBadge /> : null}
                {j.status === "COMPLETED" && j.awardedEngineer ? (
                  <span className="inline-flex items-center gap-1.5 text-zinc-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {j.awardedEngineer.businessName ?? j.awardedEngineer.name}
                  </span>
                ) : null}
                <ChevronRight className="ml-auto h-4 w-4 text-zinc-600" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

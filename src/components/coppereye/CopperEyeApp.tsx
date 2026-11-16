"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { api } from "./client"
import { Landing } from "./Landing"
import { AuthModal } from "./AuthModal"
import { PostJobWizard } from "./PostJobWizard"
import { CustomerOverview } from "./CustomerDash"
import { EngineerOverview, MyQuotesPanel, CreditsPanel, EngineerProfilePanel } from "./EngineerDash"
import { JobDetail } from "./JobDetail"
import { CopperLogo } from "./ui-bits"
import type { CustomerJob, EngineerJobsResponse, EngineerProfile, MeResponse, SessionUser } from "./types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, LogOut, Save, Coins as CoinsIcon } from "lucide-react"

type CustomerTab = "overview" | "post" | "profile"
type EngineerTab = "overview" | "quotes" | "credits" | "profile"

export default function Page() {
  const [booted, setBooted] = useState(false)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [engineerProfile, setEngineerProfile] = useState<EngineerProfile | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authRole, setAuthRole] = useState<"CUSTOMER" | "ENGINEER">("CUSTOMER")
  const [customerTab, setCustomerTab] = useState<CustomerTab>("overview")
  const [engineerTab, setEngineerTab] = useState<EngineerTab>("overview")
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const { toast } = useToast()

  const refreshMe = useCallback(async () => {
    try {
      const me = await api<MeResponse>("/api/auth/me")
      setUser(me.user)
      setEngineerProfile(me.engineerProfile ?? null)
    } catch {
      setUser(null)
    } finally {
      setBooted(true)
    }
  }, [])

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  function onAuthed(me: MeResponse) {
    setUser(me.user)
    setEngineerProfile(me.engineerProfile ?? null)
    setSelectedJobId(null)
    if (me.user?.role === "ENGINEER") setEngineerTab("overview")
    else setCustomerTab("overview")
  }

  async function signOut() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {})
    setUser(null)
    setEngineerProfile(null)
    setSelectedJobId(null)
  }

  function openAuth(role: "CUSTOMER" | "ENGINEER") {
    setAuthRole(role)
    setAuthOpen(true)
  }

  function refreshEngineerCredits() {
    api<MeResponse>("/api/auth/me").then((me) => {
      setEngineerProfile(me.engineerProfile ?? null)
    }).catch(() => {})
  }

  if (!booted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0d]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c47a4e] border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Landing
          onCustomer={() => openAuth("CUSTOMER")}
          onEngineer={() => openAuth("ENGINEER")}
        />
        <AuthModal open={authOpen} defaultRole={authRole} onOpenChange={setAuthOpen} onAuthed={onAuthed} />
      </>
    )
  }

  /* ============== CUSTOMER ============== */
  if (user.role === "CUSTOMER") {
    return (
      <div className="flex min-h-screen flex-col bg-[#0b0b0d] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#0b0b0d]/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <CopperLogo />
            <nav className="flex items-center gap-1 overflow-x-auto max-sm:max-w-[70vw] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(
                [
                  ["overview", "My jobs"],
                  ["post", "Post a job"],
                  ["profile", "Profile"],
                ] as [CustomerTab, string][]
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => { setCustomerTab(tab); setSelectedJobId(null) }}
                  className={`rounded-lg max-sm:px-2 px-3 py-1.5 max-sm:text-xs text-sm font-medium whitespace-nowrap transition-colors ${
                    customerTab === tab && !selectedJobId ? "bg-[#c47a4e]/15 text-[#e09863]" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="mx-2 h-5 w-px bg-zinc-700" />
              <span className="hidden text-sm text-zinc-400 sm:block">Hi, {user.name.split(" ")[0]}</span>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-zinc-400 hover:text-white">
                <LogOut className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {customerTab === "post" ? (
            <PostJobWizard
              customerPostcode={user.postcode}
              onCancel={() => setCustomerTab("overview")}
              onDone={(jobId) => { setCustomerTab("overview"); setSelectedJobId(jobId) }}
            />
          ) : selectedJobId ? (
            <JobDetail
              jobId={selectedJobId}
              viewerRole="CUSTOMER"
              onBack={() => setSelectedJobId(null)}
              onChanged={refreshMe}
              onCreditsChanged={() => {}}
            />
          ) : customerTab === "profile" ? (
            <CustomerProfilePanel user={user} onSaved={refreshMe} />
          ) : (
            <CustomerJobsLoader onOpenJob={setSelectedJobId} onPostJob={() => setCustomerTab("post")} />
          )}
        </main>

        <footer className="border-t border-zinc-800/80">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-zinc-500 sm:flex-row">
            <CopperLogo size="sm" />
            <span>CCTV · Alarms · Gates · Access · Smart security — homes & business</span>
          </div>
        </footer>
      </div>
    )
  }

  /* ============== ENGINEER ============== */
  return (
    <div className="flex min-h-screen flex-col bg-[#0b0b0d] text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#0b0b0d]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <CopperLogo />
          <nav className="flex items-center gap-1 overflow-x-auto max-sm:max-w-[70vw] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(
              [
                ["overview", "Job feed"],
                ["quotes", "My quotes"],
                ["credits", "Credits"],
                ["profile", "Profile"],
              ] as [EngineerTab, string][]
            ).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => { setEngineerTab(tab); setSelectedJobId(null) }}
                className={`rounded-lg max-sm:px-2 px-3 py-1.5 max-sm:text-xs text-sm font-medium whitespace-nowrap transition-colors ${
                  engineerTab === tab && !selectedJobId ? "bg-[#c47a4e]/15 text-[#e09863]" : "text-zinc-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
            <span className="mx-2 h-5 w-px bg-zinc-700" />
            <button
              onClick={() => { setEngineerTab("credits"); setSelectedJobId(null) }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#c47a4e]/50 bg-[#c47a4e]/10 px-2.5 py-1.5 text-sm font-semibold text-[#e09863] hover:bg-[#c47a4e]/20"
              title="Credits"
            >
              <CoinsIcon className="h-4 w-4" /> {engineerProfile?.credits ?? 0}
            </button>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-zinc-400 hover:text-white">
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {selectedJobId ? (
          <JobDetail
            jobId={selectedJobId}
            viewerRole="ENGINEER"
            onBack={() => setSelectedJobId(null)}
            onChanged={refreshMe}
            onCreditsChanged={refreshEngineerCredits}
          />
        ) : engineerTab === "overview" ? (
          <EngineerJobsLoader
            onOpenJob={setSelectedJobId}
            onGoCredits={() => setEngineerTab("credits")}
          />
        ) : engineerTab === "quotes" ? (
          <EngineerQuotesLoader onOpenJob={setSelectedJobId} />
        ) : engineerTab === "credits" ? (
          <CreditsPanel onChanged={refreshEngineerCredits} />
        ) : (
          <EngineerProfilePanel />
        )}
      </main>

      <footer className="border-t border-zinc-800/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-zinc-500 sm:flex-row">
          <CopperLogo size="sm" />
          <span>CCTV · Alarms · Gates · Access · Smart security — homes & business</span>
        </div>
      </footer>
    </div>
  )
}

/* ---------- data loaders ---------- */

async function fetchWithRetry<T>(path: string, attempts = 3): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await api<T>(path)
    } catch (err) {
      lastErr = err
      await new Promise((r) => setTimeout(r, 700 * (i + 1)))
    }
  }
  throw lastErr
}

function CustomerJobsLoader({ onOpenJob, onPostJob }: { onOpenJob: (id: string) => void; onPostJob: () => void }) {
  const [jobs, setJobs] = useState<CustomerJob[] | null>(null)
  const load = useCallback(() => {
    fetchWithRetry<{ myJobs: CustomerJob[] }>("/api/jobs").then((d) => setJobs(d.myJobs)).catch(() => setJobs([]))
  }, [])
  useEffect(() => { load() }, [load])
  return <CustomerOverview jobs={jobs ?? []} loading={jobs === null} onOpenJob={onOpenJob} onPostJob={onPostJob} />
}

function EngineerJobsLoader({ onOpenJob, onGoCredits }: { onOpenJob: (id: string) => void; onGoCredits: () => void }) {
  const [data, setData] = useState<EngineerJobsResponse | null>(null)
  const load = useCallback(() => {
    fetchWithRetry<EngineerJobsResponse>("/api/jobs").then(setData).catch(() => setData({ feed: [], myQuotes: [] }))
  }, [])
  useEffect(() => { load() }, [load])
  return (
    <EngineerOverview
      feed={data?.feed ?? []}
      myQuotes={data?.myQuotes ?? []}
      loading={data === null}
      onOpenJob={onOpenJob}
      onGoCredits={onGoCredits}
    />
  )
}

function EngineerQuotesLoader({ onOpenJob }: { onOpenJob: (id: string) => void }) {
  const [data, setData] = useState<EngineerJobsResponse | null>(null)
  useEffect(() => {
    fetchWithRetry<EngineerJobsResponse>("/api/jobs").then(setData).catch(() => setData({ feed: [], myQuotes: [] }))
  }, [])
  return <MyQuotesPanel quotes={data?.myQuotes ?? []} loading={data === null} onOpenJob={onOpenJob} />
}

/* ---------- customer profile ---------- */

function CustomerProfilePanel({ user, onSaved }: { user: SessionUser; onSaved: () => void }) {
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone ?? "")
  const [postcode, setPostcode] = useState(user.postcode ?? "")
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()

  async function save() {
    setBusy(true)
    try {
      await api("/api/profile", { method: "PUT", json: { name, phone, postcode } })
      toast({ title: "Profile saved" })
      onSaved()
    } catch (err) {
      toast({ title: "Could not save", description: err instanceof Error ? err.message : undefined, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Your details</h1>
        <p className="text-sm text-zinc-400">Engineers use these to contact you once you accept a quote or they unlock the job</p>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="space-y-4">
          <div>
            <Label className="text-zinc-300">Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 border-zinc-700 bg-zinc-900 text-white" />
          </div>
          <div>
            <Label className="text-zinc-300">Email</Label>
            <Input value={user.email} disabled className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-400" />
          </div>
          <div>
            <Label className="text-zinc-300">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07…" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
          </div>
          <div>
            <Label className="text-zinc-300">Postcode</Label>
            <Input value={postcode} onChange={(e) => setPostcode(e.target.value)} className="mt-1 border-zinc-700 bg-zinc-900 text-white" />
          </div>
          <Button onClick={save} disabled={busy} className="bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save
          </Button>
        </div>
      </div>
    </div>
  )
}

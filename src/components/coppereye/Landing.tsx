"use client"

import { Button } from "@/components/ui/button"
import { CopperLogo } from "./ui-bits"
import { CATEGORIES } from "@/lib/coppereye/categories"
import {
  Camera,
  ShieldCheck,
  Siren,
  Fence,
  KeyRound,
  Lock,
  Building2,
  Lightbulb,
  Wrench,
  Sparkles,
  Video,
  ClipboardCheck,
  Coins,
  Star,
  ArrowRight,
  Home,
  User,
} from "lucide-react"

const CATEGORY_ICONS: Record<string, typeof Camera> = {
  CCTV: Camera,
  ALARMS: Siren,
  GATES: Fence,
  ACCESS: KeyRound,
  SMART: Lock,
  COMMERCIAL: Building2,
  LIGHTING: Lightbulb,
  REPAIR: Wrench,
}

export function Landing({ onCustomer, onEngineer }: { onCustomer: () => void; onEngineer: () => void }) {
  return (
    <div className="min-h-screen bg-[#0b0b0d] text-zinc-100">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#0b0b0d]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <CopperLogo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onCustomer} className="hidden text-zinc-300 hover:text-white sm:inline-flex">
              I need an engineer
            </Button>
            <Button onClick={onEngineer} className="bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]">
              For engineers
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-[#c47a4e]/15 blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c47a4e]/40 bg-[#c47a4e]/10 px-4 py-1.5 text-xs font-medium text-[#e09863]">
              <Sparkles className="h-3.5 w-3.5" /> AI walk-round surveys — quote-accurate installs, no call-out
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
              Security jobs, done right{" "}
              <span className="bg-gradient-to-r from-[#e09863] to-[#c47a4e] bg-clip-text text-transparent">first time</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
              CopperEye connects homeowners and businesses with vetted security engineers for CCTV, alarms, gates and every
              kind of protection. Customers walk the property with our AI surveyor — engineers quote from a full survey
              brief without leaving the van.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button onClick={onCustomer} size="lg" className="h-12 bg-[#c47a4e] px-6 text-[#0b0b0d] hover:bg-[#d98a58]">
                <Home className="mr-2 h-5 w-5" /> I&apos;m a customer — post a job
              </Button>
              <Button onClick={onEngineer} size="lg" variant="outline" className="h-12 border-zinc-700 bg-zinc-900/60 px-6 text-white hover:bg-zinc-800">
                <User className="mr-2 h-5 w-5" /> I&apos;m an engineer — find work
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified engineers</span>
              <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-[#e09863]" /> Real customer reviews</span>
              <span className="inline-flex items-center gap-1.5"><Coins className="h-3.5 w-3.5 text-[#e09863]" /> No hidden fees for customers</span>
            </div>
          </div>
        </section>

        {/* How it works — two sides */}
        <section className="grid gap-6 pb-16 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#c47a4e]/15 text-[#e09863]">
              <Home className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">For customers</h2>
            <ol className="mt-4 space-y-4">
              {[
                { icon: ClipboardCheck, t: "Tell us what you need", d: "Pick CCTV, alarms, gates, intercoms or anything security — at home or for business." },
                { icon: Video, d: "Our AI surveyor guides you step by step: what to photograph, where to point the camera and what to look for. It flags mounting spots, cable routes and risks as you go.", t: "Walk round with the AI surveyor" },
                { icon: ClipboardCheck, d: "The AI turns your walk into a full install brief. Engineers quote accurately from it — most jobs never need a quote visit.", t: "Get accurate quotes, fast" },
              ].map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/70">
                    <s.icon className="h-4 w-4 text-[#e09863]" />
                  </span>
                  <div>
                    <div className="font-semibold text-white">
                      <span className="mr-1.5 text-[#e09863]">{i + 1}.</span>
                      {s.t}
                    </div>
                    <p className="mt-0.5 text-sm text-zinc-400">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button onClick={onCustomer} className="mt-6 w-full bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58] sm:w-auto">
              Post a job free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#c47a4e]/15 text-[#e09863]">
              <Wrench className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">For engineers</h2>
            <ol className="mt-4 space-y-4">
              {[
                { icon: Video, t: "Receive surveyed jobs", d: "Every job arrives with photos, notes and an AI install brief — cameras, sensors, cable runs, risks — before you even ring the customer." },
                { icon: ClipboardCheck, t: "Quote in minutes", d: "Send an accurate quote straight from the brief, or unlock the customer's number for one quick call. No more wasted quote trips." },
                { icon: Coins, t: "Grow with your profile", d: "Credits model (start with 20 free), verified badges, reviews and a Checkatrade-style profile that sells your work." },
              ].map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/70">
                    <s.icon className="h-4 w-4 text-[#e09863]" />
                  </span>
                  <div>
                    <div className="font-semibold text-white">
                      <span className="mr-1.5 text-[#e09863]">{i + 1}.</span>
                      {s.t}
                    </div>
                    <p className="mt-0.5 text-sm text-zinc-400">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button onClick={onEngineer} variant="outline" className="mt-6 w-full border-[#c47a4e]/60 bg-transparent text-[#e09863] hover:bg-[#c47a4e]/10 sm:w-auto">
              Join as an engineer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Categories */}
        <section className="pb-16">
          <h2 className="text-center text-2xl font-bold text-white">Every kind of security, homes and business</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-400">
            From a single doorbell to a full commercial perimeter — one platform for it all.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c.id] ?? ShieldCheck
              return (
                <div key={c.id} className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-[#c47a4e]/50">
                  <Icon className="h-5 w-5 text-[#e09863]" />
                  <div className="mt-2 font-semibold text-white">{c.label}</div>
                  <div className="mt-1 text-xs leading-snug text-zinc-500">{c.blurb}</div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Why strip */}
        <section className="grid gap-4 pb-20 sm:grid-cols-3">
          {[
            { title: "No more quote call-outs", body: "The AI survey brief gives engineers everything — positions, heights, cable routes, kit quantities — so the first visit is the install.", icon: Video },
            { title: "Both sides, one platform", body: "Separate customer and engineer dashboards. Customers track quotes and reviews; engineers manage jobs, credits and their profile.", icon: ShieldCheck },
            { title: "Trust built in", body: "Verified badges, transparent reviews on every completed job, and clear quotes you can compare side by side.", icon: Star },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <f.icon className="h-5 w-5 text-[#e09863]" />
              <h3 className="mt-2 font-semibold text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800/80 bg-[#0b0b0d]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-zinc-500 sm:flex-row">
          <CopperLogo size="sm" />
          <span>CCTV · Alarms · Gates · Access · Smart security — homes & business</span>
        </div>
      </footer>
    </div>
  )
}

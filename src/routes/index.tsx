import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine, Camera, BellRing, ShieldCheck, MessageCircle, Star, ArrowRight } from "lucide-react";
import hero from "@/assets/hero-cctv.jpg";
import { AppShell, head } from "@/components/AppShell";
import { useQuery } from "@tanstack/react-query";
import { fetchInstallerCards, initials } from "@/lib/installers";

export const Route = createFileRoute("/")({
  head: () => head("CopperEye – CCTV & alarm quotes without a site visit", "Walk round your home with our AI, get CCTV and alarm quotes from vetted local installers."),
  component: Index,
});

const steps = [
  { icon: Camera, t: "Film outside", d: "AI guides you round every wall, gate and driveway." },
  { icon: ScanLine, t: "Scan inside", d: "Finds the best spot for the recorder, router and alarm panel." },
  { icon: BellRing, t: "Pick your kit", d: "Choose from 100 top systems, camera styles and alarms." },
  { icon: ShieldCheck, t: "Get real quotes", d: "Vetted installers see everything and quote — no visit needed." },
];

function Index() {
  return (
    <AppShell>
      <section className="relative overflow-hidden">
        <img src={hero} alt="Dome CCTV camera on a modern house at night" width={1024} height={1280} className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-fade" />
        <div className="relative px-5 pb-10 pt-40 md:pt-56">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary">AI security survey</p>
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight md:text-6xl">Your CCTV quote, <span className="text-copper">without the visit.</span></h1>
          <p className="mt-4 max-w-md text-muted-foreground">Walk round with your phone. Our AI marks where every camera, recorder and sensor goes, then sends it to local installers.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/survey" className="inline-flex items-center gap-2 rounded-full bg-copper px-6 py-3 font-semibold text-primary-foreground shadow-copper">Start free survey <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/catalogue" className="rounded-full border border-border px-6 py-3 font-semibold">Browse systems</Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 px-5 py-6 text-center">
        {[["100", "systems"], ["2 min", "per room"], ["£0", "to quote"]].map(([a, b]) => (
          <div key={b} className="rounded-2xl border border-border bg-card p-4"><div className="font-display text-2xl font-bold text-copper">{a}</div><div className="text-xs text-muted-foreground">{b}</div></div>
        ))}
      </section>

      <section className="px-5 py-6">
        <h2 className="mb-4 text-2xl font-bold">How it works</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {steps.map((s, i) => (
            <div key={s.t} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-primary"><s.icon className="h-5 w-5" /></div>
              <div><div className="font-semibold">{i + 1}. {s.t}</div><p className="text-sm text-muted-foreground">{s.d}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-6">
        <div className="mb-4 flex items-end justify-between"><h2 className="text-2xl font-bold">Top installers</h2><span className="text-xs text-muted-foreground">Vetted & insured</span></div>
        <div className="space-y-3">
          {(installers ?? []).map((i) => (
            <Link key={i.id} to="/installers/$id" params={{ id: i.slug }} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary">
              {i.avatar ? <img src={i.avatar} alt={i.name} className="h-12 w-12 rounded-full object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-full bg-copper font-bold text-primary-foreground">{initials(i.name)}</div>}
              <div className="flex-1"><div className="font-semibold">{i.company}</div><div className="text-xs text-muted-foreground">{i.area} · {i.years_in_trade} yrs</div></div>
              <div className="flex items-center gap-1 text-sm font-semibold"><Star className="h-4 w-4 fill-primary text-primary" />{i.rating || "New"}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 py-6">
        <div className="rounded-3xl bg-copper p-6 text-primary-foreground">
          <h3 className="text-xl font-bold">Are you an installer?</h3>
          <p className="mt-1 text-sm opacity-80">Get surveyed leads with photos, measurements and AI kit lists. Quote in minutes.</p>
          <Link to="/installer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-foreground">Installer dashboard <MessageCircle className="h-4 w-4" /></Link>
        </div>
      </section>
    </AppShell>
  );
}

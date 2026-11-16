import { createFileRoute, Link } from "@tanstack/react-router";
import { Image, PoundSterling, TrendingUp, Star } from "lucide-react";
import { AppShell, head } from "@/components/AppShell";
import { jobs, installers } from "@/lib/data";

export const Route = createFileRoute("/installer")({
  head: () => head("Installer dashboard – CopperEye", "Surveyed leads, quotes, bookings and your public profile."),
  component: Installer,
});

function Installer() {
  const me = installers[0]!;
  return (
    <AppShell>
      <div className="px-5 py-6">
        <p className="text-sm text-muted-foreground">Installer</p>
        <h1 className="text-3xl font-bold">{me.company}</h1>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[[TrendingUp, "12", "Leads"], [PoundSterling, "£8.4k", "This month"], [Star, String(me.rating), "Rating"]].map(([I, n, l]) => {
            const Icon = I as typeof Star;
            return <div key={l as string} className="rounded-2xl border border-border bg-card p-4 text-center"><Icon className="mx-auto h-5 w-5 text-primary" /><div className="mt-1 font-display text-lg font-bold">{n as string}</div><div className="text-xs text-muted-foreground">{l as string}</div></div>;
          })}
        </div>
        <h2 className="mt-8 text-xl font-bold">Surveyed leads</h2>
        <div className="mt-3 space-y-3">
          {jobs.map((j) => (
            <div key={j.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">{j.id} · {j.postcode}</span><span className="rounded-full bg-accent px-2 py-0.5 text-primary">{j.status}</span></div>
              <div className="mt-1 font-semibold">{j.customer} — {j.system}</div>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Image className="h-3 w-3" />{j.photos} photos + AI plan</span><span>AI estimate {j.value}</span></div>
              <div className="mt-3 grid grid-cols-2 gap-2"><button className="rounded-full bg-copper py-2 text-sm font-semibold text-primary-foreground">Send quote</button><Link to="/chat" className="rounded-full border border-border py-2 text-center text-sm">Message</Link></div>
            </div>
          ))}
        </div>
        <Link to="/installers/$id" params={{ id: me.id }} className="mt-6 block rounded-full border border-primary py-3 text-center font-semibold text-primary">View my public profile</Link>
      </div>
    </AppShell>
  );
}

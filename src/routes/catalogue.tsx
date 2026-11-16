import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { AppShell, head } from "@/components/AppShell";
import { systems, cameraStyles, alarmParts } from "@/lib/data";

export const Route = createFileRoute("/catalogue")({
  head: () => head("Top 100 CCTV & alarm systems – CopperEye", "Compare the top 100 home CCTV and alarm systems, camera styles and alarm parts."),
  component: Catalogue,
});

const tabs = ["Systems", "Camera styles", "Alarm parts"] as const;
const filters = ["All", "Wired NVR", "Wired DVR", "Wireless", "Battery", "Alarm", "Wireless Alarm"] as const;

function Catalogue() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Systems");
  const [f, setF] = useState<(typeof filters)[number]>("All");
  const [q, setQ] = useState("");
  const list = useMemo(() => systems.filter((s) => (f === "All" || s.type === f) && `${s.brand} ${s.name}`.toLowerCase().includes(q.toLowerCase())), [f, q]);
  return (
    <AppShell>
      <div className="px-5 py-6">
        <h1 className="text-3xl font-bold">Choose your <span className="text-copper">kit</span></h1>
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${tab === t ? "bg-copper text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{t}</button>)}
        </div>
        {tab === "Systems" && (
          <>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Hikvision, Ajax, Reolink…" className="mt-4 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {filters.map((x) => <button key={x} onClick={() => setF(x)} className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${f === x ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{x}</button>)}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{list.length} systems</p>
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              {list.map((s) => (
                <div key={s.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div><div className="text-xs text-primary">#{s.id} · {s.brand}</div><div className="font-semibold">{s.name}</div></div>
                    <div className="flex items-center gap-1 text-xs"><Star className="h-3 w-3 fill-primary text-primary" />{s.rating}</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded-md bg-secondary px-2 py-1">{s.type}</span><span className="rounded-md bg-secondary px-2 py-1">{s.res}</span>{!s.type.includes("Alarm") && <span className="rounded-md bg-secondary px-2 py-1">{s.channels} ch</span>}
                  </div>
                  <div className="mt-3 text-sm">From <span className="font-display text-lg font-bold text-copper">£{s.price}</span> <span className="text-xs text-muted-foreground">fitted</span></div>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === "Camera styles" && <div className="mt-5 grid gap-3 md:grid-cols-2">{cameraStyles.map((c) => <div key={c.name} className="rounded-2xl border border-border bg-card p-4"><div className="font-semibold">{c.name}</div><p className="mt-1 text-sm text-muted-foreground">{c.use}</p><p className="mt-2 text-xs text-primary">{c.tip}</p></div>)}</div>}
        {tab === "Alarm parts" && <div className="mt-5 grid gap-3">{alarmParts.map((c) => <div key={c.name} className="rounded-2xl border border-border bg-card p-4"><div className="font-semibold">{c.name}</div><p className="mt-1 text-sm text-muted-foreground">{c.where}</p></div>)}</div>}
      </div>
    </AppShell>
  );
}

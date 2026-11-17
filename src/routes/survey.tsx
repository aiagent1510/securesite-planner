import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Check, Upload, Cpu } from "lucide-react";
import { AppShell, head } from "@/components/AppShell";
import { fileToSmallJpeg } from "@/lib/shrink-image";

export const Route = createFileRoute("/survey")({
  head: () => head("AI walk-round survey – CopperEye", "Film your property and let AI plan your cameras, recorder and alarm sensors."),
  component: Survey,
});

const stages = [
  { key: "front", title: "Front of house", prompt: "Stand at the pavement. Film the whole front, door, windows and driveway.", tip: "AI suggests: turret on the left eave covering drive + door (2.7m high, 25° down)." },
  { key: "sides", title: "Side passages & gates", prompt: "Walk down each side. Show gates, bins and any blind spots.", tip: "AI suggests: bullet camera at gate height facing back along passage." },
  { key: "rear", title: "Rear garden", prompt: "Film from the back door, then from the far end of the garden.", tip: "AI suggests: 4K turret above patio doors, 2nd at garden corner for shed." },
  { key: "recorder", title: "Recorder (DVR/NVR) spot", prompt: "Show the loft hatch, under stairs and where your router is.", tip: "AI suggests: under stairs — near router, mains socket, cool and hidden." },
  { key: "alarm", title: "Alarm: inside rooms", prompt: "Film hallway, lounge, kitchen and each entry door.", tip: "AI suggests: keypad by front door, PIR hallway corner, contacts on rear doors." },
];

function Survey() {
  const [i, setI] = useState(0);
  const [files, setFiles] = useState<Record<string, string[]>>({});
  const [analysing, setAnalysing] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [advice, setAdvice] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const s = stages[i];
  const finished = i >= stages.length;

  const onFiles = async (list: FileList | null) => {
    if (!list?.length || !s) return;
    setError("");
    setAnalysing(true);
    try {
      const image = await fileToSmallJpeg(list[list.length - 1]!);
      setFiles((p) => ({ ...p, [s.key]: [...(p[s.key] ?? []), image] }));
      const res = await fetch("/api/survey-analyse", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ area: `${s.title} – ${s.prompt}`, image }) });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) throw new Error(data.error ?? "The AI couldn't check this photo.");
      setAdvice((a) => ({ ...a, [s.key]: data.text! }));
      setDone((d) => ({ ...d, [s.key]: true }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setAnalysing(false); }
  };

  return (
    <AppShell>
      <div className="px-5 py-6">
        <h1 className="text-3xl font-bold">AI <span className="text-copper">walk-round</span></h1>
        <div className="mt-4 flex gap-1.5">{stages.map((x, n) => <div key={x.key} className={`h-1.5 flex-1 rounded-full ${n < i || done[x.key] ? "bg-copper" : "bg-secondary"}`} />)}</div>

        {!finished && s && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest text-primary">Step {i + 1} of {stages.length}</p>
            <h2 className="mt-1 text-xl font-bold">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.prompt}</p>

            <div className={`relative mt-5 aspect-[3/4] overflow-hidden rounded-3xl border border-border bg-card md:aspect-video ${analysing ? "scan-line" : ""}`}>
              {files[s.key]?.length ? (
                <img src={files[s.key]?.at(-1)} alt="Your upload" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-center text-muted-foreground"><div><Camera className="mx-auto mb-2 h-10 w-10 text-primary" />Point your camera here</div></div>
              )}
              {false && <div className="absolute left-[30%] top-[25%] h-8 w-8 animate-pulse rounded-full border-2 border-primary-glow bg-primary/40" />}
              {analysing && <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-background/80 p-3 text-sm"><Cpu className="h-4 w-4 text-primary" />AI is checking angles, height and cable route…</div>}
            </div>

            {error && <div className="mt-4 rounded-2xl border border-destructive/50 p-4 text-sm text-destructive">{error}</div>}
            {done[s.key] && <div className="mt-4 whitespace-pre-line rounded-2xl border border-primary/40 bg-accent p-4 text-sm"><div className="mb-1 font-semibold text-primary">AI plan for this area</div>{advice[s.key] ?? s.tip}</div>}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-copper py-3 font-semibold text-primary-foreground shadow-copper">
                <Camera className="h-4 w-4" />Film / photo
                <input type="file" accept="image/*,video/*" capture="environment" multiple hidden onChange={(e) => onFiles(e.target.files)} />
              </label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border py-3 font-semibold">
                <Upload className="h-4 w-4" />Upload
                <input type="file" accept="image/*,video/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
              </label>
            </div>
            <button disabled={!done[s.key]} onClick={() => setI(i + 1)} className="mt-3 w-full rounded-full border border-primary py-3 font-semibold text-primary disabled:opacity-30">Next area</button>
          </div>
        )}

        {finished && (
          <div className="mt-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-copper text-primary-foreground"><Check className="h-8 w-8" /></div>
            <h2 className="mt-4 text-2xl font-bold">Survey complete</h2>
            <p className="mt-2 text-sm text-muted-foreground">Suggested: 5 cameras, 8ch NVR under stairs, 6-zone wireless alarm.</p>
            <div className="mt-5 rounded-2xl border border-border bg-card p-4 text-left text-sm">
              {["4 x 4K turret cameras", "1 x 4K bullet (side gate)", "8ch NVR + 2TB drive", "Wireless alarm: panel, keypad, 3 PIR, 2 contacts, siren"].map((l) => <div key={l} className="flex gap-2 py-1"><Check className="h-4 w-4 text-primary" />{l}</div>)}
              <div className="mt-3 border-t border-border pt-3 font-semibold">Estimate: <span className="text-copper">£1,450 – £1,900</span> fitted</div>
            </div>
            <Link to="/customer" className="mt-5 inline-block w-full rounded-full bg-copper py-3 font-semibold text-primary-foreground">Send to 3 local installers</Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}

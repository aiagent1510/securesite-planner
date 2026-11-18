import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Image, Star, Clock, Briefcase, Camera, X, LogOut } from "lucide-react";
import { toast } from "sonner";
import { AppShell, head } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { jobs } from "@/lib/data";
import { PHOTO_BUCKET, RESPONSE_TIMES, initials, ratingOf, signPaths } from "@/lib/installers";

export const Route = createFileRoute("/_authenticated/installer")({
  head: () => head("Installer dashboard – CopperEye", "Your leads, quotes and public installer profile."),
  component: Installer,
});

type Form = { name: string; company: string; area: string; bio: string; phone: string; years_in_trade: number; jobs_done: number; response_time: string; badges: string; avatar_url: string | null; photos: string[] };
const empty: Form = { name: "", company: "", area: "", bio: "", phone: "", years_in_trade: 0, jobs_done: 0, response_time: "within 2 hours", badges: "", avatar_url: null, photos: [] };

function useMyProfile() {
  return useQuery({
    queryKey: ["my-installer-profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      const { data, error } = await supabase.from("installer_profiles").select("*, installer_reviews(rating)").eq("user_id", uid).maybeSingle();
      if (error) throw error;
      return { uid, profile: data };
    },
  });
}

function Installer() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useMyProfile();
  const [f, setF] = useState<Form>(empty);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const p = data?.profile;

  useEffect(() => {
    if (!p) return;
    setF({ name: p.name, company: p.company, area: p.area, bio: p.bio, phone: p.phone, years_in_trade: p.years_in_trade, jobs_done: p.jobs_done, response_time: p.response_time, badges: p.badges.join(", "), avatar_url: p.avatar_url, photos: p.photos });
    signPaths([p.avatar_url ?? "", ...p.photos]).then(setUrls);
  }, [p]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  const upload = async (files: FileList | null, kind: "avatar" | "photo") => {
    if (!files?.length || !data) return;
    setUploading(true);
    try {
      const added: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const path = `${data.uid}/${kind}-${crypto.randomUUID()}.${file.name.split(".").pop() || "jpg"}`;
        const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type });
        if (error) throw error;
        added.push(path);
      }
      setUrls({ ...urls, ...(await signPaths(added)) });
      if (kind === "avatar") set("avatar_url", added[0] ?? f.avatar_url);
      else set("photos", [...f.photos, ...added].slice(0, 24));
      toast.success("Photo added — remember to save");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!data) return;
    if (!f.company.trim() || !f.name.trim()) return toast.error("Add your name and company name");
    setSaving(true);
    const row = { name: f.name.trim(), company: f.company.trim(), area: f.area.trim(), bio: f.bio.trim(), phone: f.phone.replace(/[^\d]/g, ""), years_in_trade: Math.max(0, f.years_in_trade | 0), jobs_done: Math.max(0, f.jobs_done | 0), response_time: f.response_time, badges: f.badges.split(",").map((b) => b.trim()).filter(Boolean), avatar_url: f.avatar_url, photos: f.photos };
    const res = p
      ? await supabase.from("installer_profiles").update(row).eq("id", p.id)
      : await supabase.from("installer_profiles").insert({ ...row, user_id: data.uid, slug: `${row.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${data.uid.slice(0, 6)}` });
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Profile saved");
    qc.invalidateQueries();
  };

  const signOut = async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); navigate({ to: "/auth", search: { redirect: undefined }, replace: true }); };

  if (isLoading) return <AppShell><div className="p-6 text-muted-foreground">Loading…</div></AppShell>;
  const reviews = p?.installer_reviews ?? [];
  const input = "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary";

  return (
    <AppShell>
      <div className="px-5 py-6">
        <div className="flex items-start justify-between">
          <div><p className="text-sm text-muted-foreground">Installer</p><h1 className="text-3xl font-bold">{p?.company || "Set up your profile"}</h1></div>
          <button onClick={signOut} aria-label="Sign out" className="rounded-full border border-border p-2 text-muted-foreground"><LogOut className="h-4 w-4" /></button>
        </div>

        {p && (
          <div className="mt-5 grid grid-cols-4 gap-2">
            {([[Star, reviews.length ? String(ratingOf(reviews)) : "–", `${reviews.length} reviews`], [Briefcase, String(p.jobs_done), "Jobs"], [Clock, `${p.years_in_trade}`, "Years"], [Image, String(p.photos.length), "Photos"]] as const).map(([Icon, n, l]) => (
              <div key={l} className="rounded-2xl border border-border bg-card p-3 text-center"><Icon className="mx-auto h-4 w-4 text-primary" /><div className="mt-1 font-display text-lg font-bold">{n}</div><div className="text-[11px] text-muted-foreground">{l}</div></div>
            ))}
          </div>
        )}

        <h2 className="mt-8 text-xl font-bold">Your public profile</h2>
        <div className="mt-3 space-y-3 rounded-3xl border border-border bg-card/50 p-4">
          <div className="flex items-center gap-4">
            {f.avatar_url && urls[f.avatar_url] ? <img src={urls[f.avatar_url]} alt="Profile" className="h-20 w-20 rounded-full object-cover" /> : <div className="grid h-20 w-20 place-items-center rounded-full bg-copper text-2xl font-bold text-primary-foreground">{initials(f.name)}</div>}
            <label className="cursor-pointer rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary">{uploading ? "Uploading…" : "Change photo"}<input type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files, "avatar")} /></label>
          </div>
          <input className={input} placeholder="Your name" value={f.name} onChange={(e) => set("name", e.target.value)} />
          <input className={input} placeholder="Company name" value={f.company} onChange={(e) => set("company", e.target.value)} />
          <input className={input} placeholder="Areas covered (e.g. Manchester & Stockport)" value={f.area} onChange={(e) => set("area", e.target.value)} />
          <textarea className={input} rows={3} placeholder="About you and your work" value={f.bio} onChange={(e) => set("bio", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-muted-foreground">Years in trade<input type="number" min={0} className={`${input} mt-1`} value={f.years_in_trade} onChange={(e) => set("years_in_trade", +e.target.value)} /></label>
            <label className="text-xs text-muted-foreground">Jobs done<input type="number" min={0} className={`${input} mt-1`} value={f.jobs_done} onChange={(e) => set("jobs_done", +e.target.value)} /></label>
          </div>
          <label className="block text-xs text-muted-foreground">Usually responds<select className={`${input} mt-1`} value={f.response_time} onChange={(e) => set("response_time", e.target.value)}>{RESPONSE_TIMES.map((r) => <option key={r}>{r}</option>)}</select></label>
          <input className={input} placeholder="WhatsApp number (e.g. 447700900111)" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
          <input className={input} placeholder="Accreditations, comma separated (NSI Gold, SSAIB…)" value={f.badges} onChange={(e) => set("badges", e.target.value)} />

          <div>
            <div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold">Work photos</span><label className="flex cursor-pointer items-center gap-1 text-sm text-primary"><Camera className="h-4 w-4" />Add<input type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files, "photo")} /></label></div>
            {f.photos.length ? (
              <div className="grid grid-cols-3 gap-2">{f.photos.map((ph) => (
                <div key={ph} className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
                  {urls[ph] && <img src={urls[ph]} alt="Work" className="h-full w-full object-cover" />}
                  <button onClick={() => set("photos", f.photos.filter((x) => x !== ph))} aria-label="Remove photo" className="absolute right-1 top-1 rounded-full bg-background/80 p-1"><X className="h-3 w-3" /></button>
                </div>))}</div>
            ) : <p className="text-xs text-muted-foreground">Show off tidy installs — customers love seeing your work.</p>}
          </div>
          <button onClick={save} disabled={saving || uploading} className="w-full rounded-full bg-copper py-3 font-semibold text-primary-foreground disabled:opacity-50">{saving ? "Saving…" : "Save profile"}</button>
          {p && <Link to="/installers/$id" params={{ id: p.slug }} className="block rounded-full border border-primary py-3 text-center font-semibold text-primary">View my public profile</Link>}
        </div>

        <h2 className="mt-8 text-xl font-bold">Surveyed leads <span className="text-xs font-normal text-muted-foreground">(sample)</span></h2>
        <div className="mt-3 space-y-3">
          {jobs.map((j) => (
            <div key={j.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">{j.id} · {j.postcode}</span><span className="rounded-full bg-accent px-2 py-0.5 text-primary">{j.status}</span></div>
              <div className="mt-1 font-semibold">{j.customer} — {j.system}</div>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Image className="h-3 w-3" />{j.photos} photos + AI plan</span><span>AI estimate {j.value}</span></div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

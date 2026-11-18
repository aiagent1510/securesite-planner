import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BadgeCheck, Star, Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { fetchInstaller, initials } from "@/lib/installers";

export const Route = createFileRoute("/installers/$id")({
  loader: async ({ params }) => { const i = await fetchInstaller(params.id); if (!i) throw notFound(); return i; },
  head: ({ loaderData }) => { const t = `${loaderData?.company ?? "Installer"} – CopperEye`; const d = loaderData ? `${loaderData.name} · CCTV & alarm installer in ${loaderData.area}` : "CCTV & alarm installer on CopperEye"; return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary" }] }; },
  errorComponent: ({ error }) => <AppShell><div className="p-6 text-sm">Couldn't load this installer: {error.message}</div></AppShell>,
  notFoundComponent: () => <AppShell><div className="p-6">Installer not found. <Link to="/" className="text-primary">Go home</Link></div></AppShell>,
  component: Profile,
});

function Profile() {
  const i = Route.useLoaderData();
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [who, setWho] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviews, setReviews] = useState(i.reviews);
  useEffect(() => { setReviews(i.reviews); }, [i.reviews]);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null)); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!uid || !body.trim() || !who.trim()) return;
    setBusy(true);
    const { data, error } = await supabase.from("installer_reviews").insert({ installer_id: i.id, author_id: uid, author_name: who.trim(), rating, body: body.trim() }).select("id, author_id, author_name, rating, body, created_at").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    setReviews([data, ...reviews]); setBody(""); toast.success("Thanks for your review");
  };
  const avg = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;

  return (
    <AppShell>
      <div className="px-5 py-6">
        <div className="flex items-center gap-4">
          {i.avatar ? <img src={i.avatar} alt={i.name} className="h-20 w-20 rounded-full object-cover" /> : <div className="grid h-20 w-20 place-items-center rounded-full bg-copper text-2xl font-bold text-primary-foreground">{initials(i.name)}</div>}
          <div><h1 className="text-2xl font-bold">{i.company}</h1><p className="text-sm text-muted-foreground">{i.name} · {i.area}</p><div className="mt-1 flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-primary text-primary" />{avg || "New"} ({reviews.length} reviews)</div></div>
        </div>
        {i.badges.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{i.badges.map((b) => <span key={b} className="flex items-center gap-1 rounded-full border border-primary/40 px-3 py-1 text-xs text-primary"><BadgeCheck className="h-3 w-3" />{b}</span>)}</div>}
        {i.bio && <p className="mt-4 text-sm">{i.bio}</p>}
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="rounded-xl bg-card p-3"><div className="font-display text-lg font-bold">{i.years_in_trade}</div>years in trade</div>
          <div className="rounded-xl bg-card p-3"><div className="font-display text-lg font-bold">{i.jobs_done}</div>jobs done</div>
          <div className="rounded-xl bg-card p-3"><Clock className="mx-auto h-4 w-4 text-primary" />responds {i.response_time}</div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {i.phone ? <a href={`https://wa.me/${i.phone}?text=${encodeURIComponent("Hi, I found you on CopperEye and would like a CCTV quote.")}`} target="_blank" rel="noreferrer" className="rounded-full bg-copper py-3 text-center font-semibold text-primary-foreground">WhatsApp</a> : <span />}
          <Link to="/chat" className="flex items-center justify-center gap-2 rounded-full border border-border py-3 font-semibold"><MessageCircle className="h-4 w-4" />Chat</Link>
        </div>

        {i.photoUrls.length > 0 && (<><h2 className="mt-8 text-xl font-bold">Recent work</h2><div className="mt-3 grid grid-cols-3 gap-2">{i.photoUrls.map((u) => <img key={u} src={u} alt="Installation" className="aspect-square w-full rounded-xl object-cover" />)}</div></>)}

        <h2 className="mt-8 text-xl font-bold">Reviews</h2>
        {uid === null && <Link to="/auth" search={{ redirect: `/installers/${i.slug}` }} className="mt-3 block rounded-2xl border border-dashed border-border p-4 text-center text-sm text-primary">Sign in to leave a review</Link>}
        {uid && uid !== i.user_id && (
          <form onSubmit={submit} className="mt-3 space-y-2 rounded-2xl border border-border bg-card p-4">
            <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}><Star className={`h-6 w-6 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} /></button>)}</div>
            <input value={who} onChange={(e) => setWho(e.target.value)} required placeholder="Your name & area (e.g. Jason, Didsbury)" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={3} placeholder="How did the job go?" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <button disabled={busy} className="w-full rounded-full bg-copper py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">Post review</button>
          </form>
        )}
        <div className="mt-3 space-y-3">{reviews.length ? reviews.map((r) => <div key={r.id} className="rounded-2xl border border-border bg-card p-4"><div className="text-primary">{"★".repeat(r.rating)}<span className="text-muted-foreground">{"★".repeat(5 - r.rating)}</span></div><p className="mt-1 text-sm">{r.body}</p><p className="mt-2 text-xs text-muted-foreground">{r.author_name}</p></div>) : <p className="text-sm text-muted-foreground">No reviews yet.</p>}</div>
      </div>
    </AppShell>
  );
}

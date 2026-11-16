import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { BadgeCheck, Star, Clock, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { installers } from "@/lib/data";

export const Route = createFileRoute("/installers/$id")({
  loader: ({ params }) => { const i = installers.find((x) => x.id === params.id); if (!i) throw notFound(); return i; },
  head: ({ loaderData }) => { const t = `${loaderData?.company ?? "Installer"} – CopperEye`; const d = `${loaderData?.name} · CCTV & alarm installer in ${loaderData?.area}`; return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary" }] }; },
  component: Profile,
});

const reviews = [
  { who: "Jason, Didsbury", text: "Cameras up in a day, cables hidden perfectly. Quoted from my phone video — spot on.", stars: 5 },
  { who: "Helen, Sale", text: "Alarm and 4 cameras. Explained the app brilliantly.", stars: 5 },
];

function Profile() {
  const i = Route.useLoaderData();
  return (
    <AppShell>
      <div className="px-5 py-6">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-copper text-2xl font-bold text-primary-foreground">{i.name.split(" ").map((n) => n[0]).join("")}</div>
          <div><h1 className="text-2xl font-bold">{i.company}</h1><p className="text-sm text-muted-foreground">{i.name} · {i.area}</p><div className="mt-1 flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-primary text-primary" />{i.rating} ({i.reviews} reviews)</div></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{i.badges.map((b) => <span key={b} className="flex items-center gap-1 rounded-full border border-primary/40 px-3 py-1 text-xs text-primary"><BadgeCheck className="h-3 w-3" />{b}</span>)}</div>
        <p className="mt-4 text-sm">{i.bio}</p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="rounded-xl bg-card p-3"><div className="font-display text-lg font-bold">{i.years}</div>years</div>
          <div className="rounded-xl bg-card p-3"><div className="font-display text-lg font-bold">{i.jobs}</div>jobs</div>
          <div className="rounded-xl bg-card p-3"><Clock className="mx-auto h-4 w-4 text-primary" />{i.responds}</div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <a href={`https://wa.me/${i.phone}?text=${encodeURIComponent("Hi, I found you on CopperEye and would like a CCTV quote.")}`} target="_blank" rel="noreferrer" className="rounded-full bg-copper py-3 text-center font-semibold text-primary-foreground">WhatsApp</a>
          <Link to="/chat" className="flex items-center justify-center gap-2 rounded-full border border-border py-3 font-semibold"><MessageCircle className="h-4 w-4" />Chat</Link>
        </div>
        <h2 className="mt-8 text-xl font-bold">Reviews</h2>
        <div className="mt-3 space-y-3">{reviews.map((r) => <div key={r.who} className="rounded-2xl border border-border bg-card p-4"><div className="text-primary">{"★".repeat(r.stars)}</div><p className="mt-1 text-sm">{r.text}</p><p className="mt-2 text-xs text-muted-foreground">{r.who}</p></div>)}</div>
      </div>
    </AppShell>
  );
}

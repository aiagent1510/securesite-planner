import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Calendar, ScanLine, MessageCircle } from "lucide-react";
import { AppShell, head } from "@/components/AppShell";
import { installers } from "@/lib/data";

export const Route = createFileRoute("/customer")({
  head: () => head("My account – CopperEye", "Your surveys, quotes, bookings and messages."),
  component: Customer,
});

const quotes = [
  { inst: installers[0]!, price: "£1,520", when: "Fit in 4 days", note: "Includes 2TB, app setup, 12-month warranty" },
  { inst: installers[2]!, price: "£1,690", when: "Fit next week", note: "NSI certificate + police URN option" },
];

function Customer() {
  return (
    <AppShell>
      <div className="px-5 py-6">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="text-3xl font-bold">Emma's home</h1>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          {[[ScanLine, "1", "Survey"], [FileText, "2", "Quotes"], [Calendar, "0", "Booked"]].map(([I, n, l]) => {
            const Icon = I as typeof ScanLine;
            return <div key={l as string} className="rounded-2xl border border-border bg-card p-4"><Icon className="mx-auto h-5 w-5 text-primary" /><div className="mt-1 font-display text-xl font-bold">{n as string}</div><div className="text-xs text-muted-foreground">{l as string}</div></div>;
          })}
        </div>
        <h2 className="mt-8 text-xl font-bold">Your quotes</h2>
        <div className="mt-3 space-y-3">
          {quotes.map((q) => (
            <div key={q.inst.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex justify-between"><Link to="/installers/$id" params={{ id: q.inst.id }} className="font-semibold">{q.inst.company}</Link><span className="font-display text-xl font-bold text-copper">{q.price}</span></div>
              <p className="text-xs text-muted-foreground">★ {q.inst.rating} · {q.when}</p>
              <p className="mt-2 text-sm">{q.note}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="rounded-full bg-copper py-2 text-sm font-semibold text-primary-foreground">Accept & book</button>
                <Link to="/chat" className="flex items-center justify-center gap-1 rounded-full border border-border py-2 text-sm"><MessageCircle className="h-4 w-4" />Chat</Link>
              </div>
            </div>
          ))}
        </div>
        <Link to="/survey" className="mt-6 block rounded-full border border-primary py-3 text-center font-semibold text-primary">Start a new survey</Link>
      </div>
    </AppShell>
  );
}

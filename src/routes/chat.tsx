import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send } from "lucide-react";
import { AppShell, head } from "@/components/AppShell";

export const Route = createFileRoute("/chat")({
  head: () => head("Messages – CopperEye", "Chat with your installer or customer about your CCTV and alarm job."),
  component: Chat,
});

type Msg = { me: boolean; text: string };
function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { me: false, text: "Hi Emma, I've looked at your walk-round. The left eave is perfect for the drive camera." },
    { me: true, text: "Great! Can the recorder go in the loft instead?" },
    { me: false, text: "Loft gets hot in summer — under the stairs by your router is better. Same price." },
  ]);
  const [t, setT] = useState("");
  const send = () => { if (!t.trim()) return; setMsgs((m) => [...m, { me: true, text: t }]); setT(""); };
  return (
    <AppShell>
      <div className="flex h-[calc(100vh-8.5rem)] flex-col px-5 py-4">
        <div className="border-b border-border pb-3"><div className="font-semibold">Copperline Security</div><div className="text-xs text-success">● Online</div></div>
        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {msgs.map((m, i) => <div key={i} className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.me ? "ml-auto bg-copper text-primary-foreground" : "bg-card"}`}>{m.text}</div>)}
        </div>
        <div className="flex gap-2">
          <input value={t} onChange={(e) => setT(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message…" className="flex-1 rounded-full border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
          <button onClick={send} aria-label="Send" className="grid h-12 w-12 place-items-center rounded-full bg-copper text-primary-foreground"><Send className="h-4 w-4" /></button>
        </div>
      </div>
    </AppShell>
  );
}

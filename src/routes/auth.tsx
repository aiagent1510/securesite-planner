import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, head } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" && s.redirect.startsWith("/") && !s.redirect.startsWith("//") ? s.redirect : undefined }),
  head: () => head("Sign in – CopperEye", "Sign in or create your CopperEye installer or customer account."),
  component: AuthPage,
});

function AuthPage() {
  const { redirect: to } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const dest = to ?? "/installer";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: dest, replace: true }); });
    const { data } = supabase.auth.onAuthStateChange((e, s) => { if (e === "SIGNED_IN" && s) navigate({ to: dest, replace: true }); });
    return () => data.subscription.unsubscribe();
  }, [dest, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const res = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}${dest}` } });
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    if (mode === "up" && !res.data.session) setSent(true);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" + (to ? `?redirect=${encodeURIComponent(to)}` : "") });
    if (r.error) toast.error(r.error.message ?? "Google sign-in failed");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-sm px-5 py-10">
        <h1 className="text-3xl font-bold">{mode === "in" ? "Welcome back" : "Create account"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Installers: sign in to manage your profile and leads.</p>
        {sent ? (
          <div className="mt-6 rounded-2xl border border-primary/40 bg-accent p-4 text-sm">Check your email and tap the link to confirm your account.</div>
        ) : (
          <>
            <button onClick={google} className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card py-3 text-sm font-semibold">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
              Continue with Google
            </button>
            <div className="my-5 text-center text-xs text-muted-foreground">or with email</div>
            <form onSubmit={submit} className="space-y-3">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
              <button disabled={busy} className="w-full rounded-full bg-copper py-3 font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</button>
            </form>
            <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-center text-sm text-primary">{mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
          </>
        )}
      </div>
    </AppShell>
  );
}

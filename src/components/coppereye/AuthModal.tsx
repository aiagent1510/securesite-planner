"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "./client"
import type { MeResponse } from "./types"
import { Home, Wrench, Loader2, Sparkles } from "lucide-react"

interface Props {
  open: boolean
  defaultRole: "CUSTOMER" | "ENGINEER"
  onOpenChange: (open: boolean) => void
  onAuthed: (me: MeResponse) => void
}

export function AuthModal({ open, defaultRole, onOpenChange, onAuthed }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-[#121214] text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Welcome to CopperEye</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Sign in or create your free account. Choose your side — customers and engineers get different dashboards.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800/70">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="register">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInForm onAuthed={onAuthed} onOpenChange={onOpenChange} />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm defaultRole={defaultRole} onAuthed={onAuthed} onOpenChange={onOpenChange} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function SignInForm({ onAuthed, onOpenChange }: { onAuthed: (me: MeResponse) => void; onOpenChange: (o: boolean) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const me = await api<MeResponse>("/api/auth/login", { method: "POST", json: { email, password } })
      onAuthed(me)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div>
        <Label htmlFor="si-email" className="text-zinc-300">Email</Label>
        <Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
      </div>
      <div>
        <Label htmlFor="si-pass" className="text-zinc-300">Password</Label>
        <Input id="si-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 border-zinc-700 bg-zinc-900 text-white" />
      </div>
      {error ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
      <Button type="submit" disabled={busy} className="w-full bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]">
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Sign in
      </Button>
      <p className="text-center text-xs text-zinc-500">
        Demo accounts: customer@demo.coppereye.uk · dave.hall@demo.coppereye.uk — password <span className="text-zinc-300">copper123</span>
      </p>
    </form>
  )
}

function RegisterForm({ defaultRole, onAuthed, onOpenChange }: { defaultRole: "CUSTOMER" | "ENGINEER"; onAuthed: (me: MeResponse) => void; onOpenChange: (o: boolean) => void }) {
  const [role, setRole] = useState<"CUSTOMER" | "ENGINEER">(defaultRole)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [postcode, setPostcode] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const me = await api<MeResponse>("/api/auth/register", {
        method: "POST",
        json: { name, email, password, role, phone, postcode },
      })
      onAuthed(me)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("CUSTOMER")}
          className={`rounded-xl border p-3 text-left transition-colors ${
            role === "CUSTOMER" ? "border-[#c47a4e] bg-[#c47a4e]/10" : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
          }`}
        >
          <Home className={`h-5 w-5 ${role === "CUSTOMER" ? "text-[#e09863]" : "text-zinc-500"}`} />
          <div className="mt-1.5 text-sm font-semibold text-white">Customer</div>
          <div className="text-xs text-zinc-500">I need security work done</div>
        </button>
        <button
          type="button"
          onClick={() => setRole("ENGINEER")}
          className={`rounded-xl border p-3 text-left transition-colors ${
            role === "ENGINEER" ? "border-[#c47a4e] bg-[#c47a4e]/10" : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
          }`}
        >
          <Wrench className={`h-5 w-5 ${role === "ENGINEER" ? "text-[#e09863]" : "text-zinc-500"}`} />
          <div className="mt-1.5 text-sm font-semibold text-white">Engineer</div>
          <div className="text-xs text-zinc-500">I install & quote jobs</div>
        </button>
      </div>
      {role === "ENGINEER" ? (
        <p className="flex items-start gap-2 rounded-lg border border-[#c47a4e]/40 bg-[#c47a4e]/10 px-3 py-2 text-xs text-[#e09863]">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Engineers start with 20 free contact-unlock credits.
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="rg-name" className="text-zinc-300">Full name</Label>
          <Input id="rg-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Smith" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
        </div>
        <div>
          <Label htmlFor="rg-phone" className="text-zinc-300">Phone (optional)</Label>
          <Input id="rg-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07…" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
        </div>
      </div>
      <div>
        <Label htmlFor="rg-email" className="text-zinc-300">Email</Label>
        <Input id="rg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="rg-pass" className="text-zinc-300">Password</Label>
          <Input id="rg-pass" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6+ characters" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
        </div>
        <div>
          <Label htmlFor="rg-pc" className="text-zinc-300">Postcode</Label>
          <Input id="rg-pc" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="M1 1AE" className="mt-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600" />
        </div>
      </div>
      {error ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
      <Button type="submit" disabled={busy} className="w-full bg-[#c47a4e] text-[#0b0b0d] hover:bg-[#d98a58]">
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {role === "ENGINEER" ? "Create engineer account" : "Create customer account"}
      </Button>
    </form>
  )
}

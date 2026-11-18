import { supabase } from "@/integrations/supabase/client";

export const PHOTO_BUCKET = "installer-photos";
export const RESPONSE_TIMES = ["within 1 hour", "within 2 hours", "same day", "within 24 hours", "within 2 days"];

export type InstallerCard = {
  id: string; slug: string; name: string; company: string; area: string; years_in_trade: number;
  avatar: string | null; rating: number; reviewCount: number;
};

export async function signPaths(paths: string[]): Promise<Record<string, string>> {
  const clean = paths.filter(Boolean);
  if (!clean.length) return {};
  const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(clean, 60 * 60 * 24);
  const out: Record<string, string> = {};
  data?.forEach((d) => { if (d.path && d.signedUrl) out[d.path] = d.signedUrl; });
  return out;
}

export function ratingOf(reviews: { rating: number }[]) {
  if (!reviews.length) return 0;
  return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
}

export async function fetchInstallerCards(): Promise<InstallerCard[]> {
  const { data, error } = await supabase
    .from("installer_profiles")
    .select("id, slug, name, company, area, years_in_trade, avatar_url, installer_reviews(rating)")
    .neq("company", "")
    .order("jobs_done", { ascending: false })
    .limit(20);
  if (error) throw error;
  const urls = await signPaths(data.map((d) => d.avatar_url ?? ""));
  return data.map((d) => ({
    id: d.id, slug: d.slug, name: d.name, company: d.company, area: d.area, years_in_trade: d.years_in_trade,
    avatar: d.avatar_url ? urls[d.avatar_url] ?? null : null,
    rating: ratingOf(d.installer_reviews), reviewCount: d.installer_reviews.length,
  }));
}

export async function fetchInstaller(slug: string) {
  const { data, error } = await supabase
    .from("installer_profiles")
    .select("*, installer_reviews(id, author_id, author_name, rating, body, created_at)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const urls = await signPaths([data.avatar_url ?? "", ...data.photos]);
  const reviews = [...data.installer_reviews].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return {
    ...data,
    avatar: data.avatar_url ? urls[data.avatar_url] ?? null : null,
    photoUrls: data.photos.map((p) => urls[p]).filter((u): u is string => !!u),
    reviews, rating: ratingOf(reviews),
  };
}

export function initials(name: string) {
  return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

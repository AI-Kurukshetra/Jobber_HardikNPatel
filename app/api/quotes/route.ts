import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit_price: z.number().nonnegative(),
  tax_rate: z.number().nonnegative().default(0)
});

const quoteSchema = z.object({
  customer_id: z.string().uuid(),
  title: z.string().min(2),
  expires_at: z.string().optional(),
  items: z.array(itemSchema).optional()
});

async function getProfile(supabase: ReturnType<typeof getSupabaseServerClient>) {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, company_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!profile) return { error: NextResponse.json({ error: "Profile not found" }, { status: 400 }) };
  return { session, profile };
}

export async function GET() {
  const supabase = getSupabaseServerClient();
  const profileRes = await getProfile(supabase);
  if ("error" in profileRes) return profileRes.error;

  const { data, error } = await supabase
    .from("quotes")
    .select("id, customer_id, title, status, expires_at, subtotal, total, created_at")
    .eq("company_id", profileRes.profile.company_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ quotes: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const profileRes = await getProfile(supabase);
  if ("error" in profileRes) return profileRes.error;

  const body = await req.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid quote payload" }, { status: 400 });

  const expires = parsed.data.expires_at ? new Date(parsed.data.expires_at) : null;

  const items = parsed.data.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const tax = items.reduce((sum, i) => sum + i.quantity * i.unit_price * (i.tax_rate ?? 0) / 100, 0);
  const total = subtotal + tax;

  const { data, error } = await supabase
    .from("quotes")
    .insert({
      company_id: profileRes.profile.company_id,
      customer_id: parsed.data.customer_id,
      title: parsed.data.title,
      status: "draft",
      expires_at: expires,
      subtotal,
      tax,
      total,
      created_by: profileRes.profile.id
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (items.length) {
    const mapped = items.map((i) => ({
      id: crypto.randomUUID(),
      company_id: profileRes.profile.company_id,
      quote_id: data.id,
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
      tax_rate: i.tax_rate ?? 0
    }));
    const { error: itemErr } = await supabase.from("quote_items").insert(mapped);
    if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 400 });
  }

  return NextResponse.json({ quote: data }, { status: 201 });
}

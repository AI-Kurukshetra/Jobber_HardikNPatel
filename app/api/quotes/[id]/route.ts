import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit_price: z.number().nonnegative(),
  tax_rate: z.number().nonnegative().default(0)
});

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  status: z.enum(["draft", "sent", "accepted", "expired", "rejected"]).optional(),
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
  return { profile };
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const profileRes = await getProfile(supabase);
  if ("error" in profileRes) return profileRes.error;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const payload: Record<string, any> = { ...parsed.data };
  if (payload.expires_at) payload.expires_at = new Date(payload.expires_at);

  // If items provided, recompute totals
  if (payload.items) {
    const items = payload.items;
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
    const tax = items.reduce((sum, i) => sum + i.quantity * i.unit_price * (i.tax_rate ?? 0) / 100, 0);
    payload.subtotal = subtotal;
    payload.tax = tax;
    payload.total = subtotal + tax;
  }

  const { data, error } = await supabase
    .from("quotes")
    .update(payload)
    .eq("id", params.id)
    .eq("company_id", profileRes.profile.company_id)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (parsed.data.items) {
    // replace items
    const { error: delErr } = await supabase
      .from("quote_items")
      .delete()
      .eq("quote_id", params.id)
      .eq("company_id", profileRes.profile.company_id);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });

    const mapped = parsed.data.items.map((i) => ({
      id: crypto.randomUUID(),
      company_id: profileRes.profile.company_id,
      quote_id: params.id,
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
      tax_rate: i.tax_rate ?? 0
    }));
    const { error: insErr } = await supabase.from("quote_items").insert(mapped);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });
  }

  return NextResponse.json({ quote: data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const profileRes = await getProfile(supabase);
  if ("error" in profileRes) return profileRes.error;

  const { error } = await supabase
    .from("quotes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("company_id", profileRes.profile.company_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

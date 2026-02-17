import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit_price: z.number().nonnegative(),
  tax_rate: z.number().nonnegative().default(0)
});

const invoiceSchema = z.object({
  customer_id: z.string().uuid(),
  job_id: z.string().uuid().nullable().optional(),
  due_date: z.string().optional(),
  status: z.enum(["draft", "sent", "partial", "paid", "overdue"]).optional(),
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

export async function GET() {
  const supabase = getSupabaseServerClient();
  const profileRes = await getProfile(supabase);
  if ("error" in profileRes) return profileRes.error;

  const { data, error } = await supabase
    .from("invoices")
    .select("id, customer_id, job_id, status, due_date, subtotal, tax, total, balance_due")
    .eq("company_id", profileRes.profile.company_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ invoices: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const profileRes = await getProfile(supabase);
  if ("error" in profileRes) return profileRes.error;

  const body = await req.json().catch(() => null);
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid invoice payload" }, { status: 400 });

  const items = parsed.data.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const tax = items.reduce((sum, i) => sum + i.quantity * i.unit_price * (i.tax_rate ?? 0) / 100, 0);
  const total = subtotal + tax;
  const dueDate = parsed.data.due_date ? new Date(parsed.data.due_date) : null;

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      company_id: profileRes.profile.company_id,
      customer_id: parsed.data.customer_id,
      job_id: parsed.data.job_id ?? null,
      status: parsed.data.status ?? "draft",
      due_date: dueDate,
      subtotal,
      tax,
      total,
      balance_due: total
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (items.length) {
    const mapped = items.map((i) => ({
      id: crypto.randomUUID(),
      company_id: profileRes.profile.company_id,
      invoice_id: data.id,
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
      tax_rate: i.tax_rate ?? 0
    }));
    const { error: itemErr } = await supabase.from("invoice_items").insert(mapped);
    if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 400 });
  }

  return NextResponse.json({ invoice: data }, { status: 201 });
}

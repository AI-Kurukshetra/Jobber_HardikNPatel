import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional()
});

async function getProfileAndCompany(supabase: ReturnType<typeof getSupabaseServerClient>) {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!profile) return { error: NextResponse.json({ error: "Profile not found" }, { status: 400 }) };
  return { companyId: profile.company_id };
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const profileRes = await getProfileAndCompany(supabase);
  if ("error" in profileRes) return profileRes.error;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { data, error } = await supabase
    .from("customers")
    .update(parsed.data)
    .eq("id", params.id)
    .eq("company_id", profileRes.companyId)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ customer: data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const profileRes = await getProfileAndCompany(supabase);
  if ("error" in profileRes) return profileRes.error;

  const { error } = await supabase
    .from("customers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("company_id", profileRes.companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

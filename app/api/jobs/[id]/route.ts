import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
  scheduled_at: z.string().optional(),
  notes: z.string().optional()
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
  if (payload.scheduled_at) payload.scheduled_at = new Date(payload.scheduled_at);

  const { data, error } = await supabase
    .from("jobs")
    .update(payload)
    .eq("id", params.id)
    .eq("company_id", profileRes.profile.company_id)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ job: data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const profileRes = await getProfile(supabase);
  if ("error" in profileRes) return profileRes.error;

  const { error } = await supabase
    .from("jobs")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("company_id", profileRes.profile.company_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

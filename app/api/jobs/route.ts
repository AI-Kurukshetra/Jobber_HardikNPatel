import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const jobSchema = z.object({
  customer_id: z.string().uuid(),
  title: z.string().min(2),
  scheduled_at: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
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

export async function GET() {
  const supabase = getSupabaseServerClient();
  const profileRes = await getProfile(supabase);
  if ("error" in profileRes) return profileRes.error;

  const { data, error } = await supabase
    .from("jobs")
    .select("id, customer_id, title, status, scheduled_at, notes")
    .eq("company_id", profileRes.profile.company_id)
    .is("deleted_at", null)
    .order("scheduled_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ jobs: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const profileRes = await getProfile(supabase);
  if ("error" in profileRes) return profileRes.error;

  const body = await req.json().catch(() => null);
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid job payload" }, { status: 400 });

  const scheduled = parsed.data.scheduled_at ? new Date(parsed.data.scheduled_at) : null;
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      company_id: profileRes.profile.company_id,
      customer_id: parsed.data.customer_id,
      title: parsed.data.title,
      status: parsed.data.status ?? "scheduled",
      scheduled_at: scheduled,
      notes: parsed.data.notes
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ job: data }, { status: 201 });
}

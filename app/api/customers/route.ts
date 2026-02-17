import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid customer payload" }, { status: 400 });
  }

  const slugify = (name: string) =>
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "company";

  // Look up the user's profile to get company context for RLS
  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, company_id")
    .eq("user_id", session.user.id)
    .single();

  if (profileError || !profile) {
    // Attempt to bootstrap a profile for this user (likely signed up via /sign-up)
    // Use the admin client so RLS on companies does not block the lookup for brand-new users
    const admin = getSupabaseAdminClient();

    const desiredSlug = (session.user.user_metadata as Record<string, any> | null)?.company;
    const desiredName = desiredSlug || session.user.email || "Default Company";
    const baseSlug = slugify(desiredSlug || desiredName);

    // Try to find an existing company first
    let { data: company } = desiredSlug
      ? await admin.from("companies").select("id, slug").eq("slug", desiredSlug).maybeSingle()
      : await admin.from("companies").select("id, slug").order("created_at", { ascending: true }).limit(1).single();

    // If none exist, bootstrap one for the user
    if (!company) {
      let slug = baseSlug;
      const { data: slugTaken } = await admin.from("companies").select("id").eq("slug", slug).maybeSingle();
      if (slugTaken) {
        slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      }

      const { data: createdCompany, error: companyErr } = await admin
        .from("companies")
        .insert({ name: desiredName, slug })
        .select("id, slug")
        .single();

      if (companyErr || !createdCompany) {
        return NextResponse.json({ error: "Profile not found and no company available" }, { status: 400 });
      }

      company = createdCompany;
    }

    if (!company) {
      return NextResponse.json({ error: "Profile not found and no company available" }, { status: 400 });
    }

    const { data: newProfile, error: createErr } = await supabase
      .from("profiles")
      .insert({
        user_id: session.user.id,
        company_id: company.id,
        email: session.user.email,
        full_name: (session.user.user_metadata as Record<string, any> | null)?.full_name ?? session.user.email
      })
      .select("id, company_id")
      .single();

    if (createErr || !newProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    profile = newProfile;
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      company_id: profile.company_id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      tags: []
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ customer: data }, { status: 201 });
}

export async function GET() {
  const supabase = getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  const companyId = profile?.company_id ?? null;

  const { data, error } = companyId
    ? await supabase
        .from("customers")
        .select("id, name, email, phone, address, tags")
        .eq("company_id", companyId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
    : await supabase
        .from("customers")
        .select("id, name, email, phone, address, tags")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ customers: data ?? [] }, { status: 200 });
}

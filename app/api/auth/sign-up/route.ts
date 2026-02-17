import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  company: z.string().min(1)
});

function slugifyCompany(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.length ? base : "company";
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid sign-up payload" }, { status: 400 });
  }

  const { email, password, company } = parsed.data;
  const supabase = getSupabaseAdminClient();

  // 1) Create user
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { company }
  });

  if (userError || !userData?.user) {
    return NextResponse.json({ error: userError?.message ?? "Unable to create user" }, { status: 400 });
  }

  // 2) Create company (unique slug)
  const baseSlug = slugifyCompany(company);
  let slug = baseSlug;

  const { data: existingSlug } = await supabase.from("companies").select("id").eq("slug", slug).maybeSingle();
  if (existingSlug) {
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: companyRow, error: companyError } = await supabase
    .from("companies")
    .insert({ name: company, slug })
    .select("id")
    .single();

  if (companyError || !companyRow) {
    return NextResponse.json({ error: companyError?.message ?? "Unable to create company" }, { status: 400 });
  }

  // 3) Create profile tied to new company
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      user_id: userData.user.id,
      company_id: companyRow.id,
      email,
      full_name: userData.user.user_metadata?.full_name ?? email
    })
    .select("id")
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: profileError?.message ?? "Unable to create profile" }, { status: 400 });
  }

  // 4) Grant admin role inside the workspace (best effort; not fatal for sign-up)
  const { data: adminRole } = await supabase.from("roles").select("id").eq("role_name", "admin").maybeSingle();
  if (adminRole?.id) {
    await supabase.from("user_roles").insert({
      profile_id: profile.id,
      company_id: companyRow.id,
      role_id: adminRole.id
    });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

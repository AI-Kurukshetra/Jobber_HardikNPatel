import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { type SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseServerClient(cookieStore = cookies()): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing Supabase env vars");
  return createServerComponentClient({ cookies: () => cookieStore }, { supabaseUrl, supabaseKey: supabaseAnonKey });
}

import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/quotes", label: "Quotes" },
  { href: "/jobs", label: "Jobs" },
  { href: "/invoices", label: "Invoices" },
  { href: "/portal", label: "Client Portal" }
];

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseServerClient(cookies());
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      <aside className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100">
          <Link href="/dashboard" className="text-xl font-semibold text-slate-900">
            Jobber MVP
          </Link>
          <p className="text-xs text-slate-500 mt-1">Multi-tenant</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {nav.map((item) => {
            const hidePortal = item.href === "/portal";

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-hidden={hidePortal}
                className={`block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-neutral-100${hidePortal ? " hidden" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4">
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" className="w-full justify-start">
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">Workspace</p>
            <p className="font-semibold text-slate-900">Company context via RLS</p>
          </div>
          <Link href="/settings" className="text-sm text-slate-600 hover:text-slate-900">
            Settings
          </Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

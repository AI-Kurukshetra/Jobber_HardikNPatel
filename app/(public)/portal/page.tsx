"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PortalLanding() {
  const router = useRouter();
  const [token, setToken] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;
    router.push(`/portal/${trimmed}`);
  };

  return (
    <main className="min-h-screen bg-neutral-100 flex items-center justify-center px-6">
      <Card className="w-full max-w-xl p-8 space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase text-slate-500">Client portal</p>
          <h1 className="text-2xl font-semibold text-slate-900">Access your documents</h1>
          <p className="text-sm text-slate-600">
            Enter the secure access token from your email or SMS to view quotes, jobs, and invoices in one place.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-800">
            Access token
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. 9f2c71f8"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">We never ask for passwords here—just your one-time token.</p>
            <Button type="submit" disabled={!token.trim()}>
              Open portal
            </Button>
          </div>
        </form>

        <div className="rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 p-4 text-sm">
          <p className="font-semibold">Don&apos;t have a token?</p>
          <p>Your service provider can resend the portal link. If you were invited recently, check your spam folder.</p>
        </div>
      </Card>
    </main>
  );
}

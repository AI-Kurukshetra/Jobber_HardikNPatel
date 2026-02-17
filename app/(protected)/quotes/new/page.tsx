"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Customer = { id: string; name: string };

export default function NewQuotePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/customers");
      if (!res.ok) return;
      const body = (await res.json()) as { customers: any[] };
      setCustomers(body.customers ?? []);
      if (body.customers?.length) setCustomerId(body.customers[0].id);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: customerId, title, expires_at: expiresAt || undefined })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to create quote");
      setLoading(false);
      return;
    }
    router.push("/quotes");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Quotes</p>
          <h1 className="text-2xl font-semibold text-slate-900">Create quote</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/quotes")}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 space-y-4 lg:col-span-2">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <select
                  id="customer"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="expires_at">Expires</Label>
                <Input id="expires_at" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Spring HVAC tune-up"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={4} placeholder="Scope of work, terms, etc." />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save draft"}
              </Button>
            </div>
          </form>
        </Card>
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Summary</p>
            <span className="rounded-full bg-amber-50 text-amber-700 text-xs px-2 py-1">Draft</span>
          </div>
          <dl className="space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <dt>Customer</dt>
              <dd className="font-medium text-slate-900">
                {customers.find((c) => c.id === customerId)?.name ?? "Select a customer"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Expires</dt>
              <dd className="text-slate-600">{expiresAt || "Set date"}</dd>
            </div>
          </dl>
          <Button variant="outline" className="w-full" onClick={() => router.push("/quotes")}>
            Preview quote
          </Button>
        </Card>
      </div>
    </div>
  );
}

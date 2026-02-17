"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Quote = {
  id: string;
  customer_id: string;
  title: string;
  status: string;
  expires_at: string | null;
  subtotal: number;
  total: number;
};

type CustomerMap = Record<string, string>;

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-amber-50 text-amber-700",
  accepted: "bg-emerald-50 text-emerald-700",
  expired: "bg-rose-50 text-rose-700",
  rejected: "bg-rose-50 text-rose-700"
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<CustomerMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    const [qRes, cRes] = await Promise.all([fetch("/api/quotes"), fetch("/api/customers")]);
    if (!qRes.ok) {
      const body = await qRes.json().catch(() => ({}));
      setError(body.error ?? "Failed to load quotes");
      setLoading(false);
      return;
    }
    const qBody = (await qRes.json()) as { quotes: Quote[] };
    const cBody = cRes.ok ? ((await cRes.json()) as { customers: any[] }) : { customers: [] };
    const cMap: CustomerMap = {};
    (cBody.customers ?? []).forEach((c) => {
      cMap[c.id] = c.name;
    });
    setCustomers(cMap);
    setQuotes(qBody.quotes ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/quotes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to update status");
      return;
    }
    setMessage("Quote updated");
    await load();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to delete quote");
      return;
    }
    setMessage("Quote deleted");
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div>
          <p className="text-sm text-slate-500">Sales</p>
          <h1 className="text-2xl font-semibold text-slate-900">Quotes</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/quotes/new">New quote</Link>
          </Button>
        </div>
      </div>

      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card className="p-0 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-sm">
            {loading && (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan={6}>
                  Loading quotes...
                </td>
              </tr>
            )}
            {!loading && quotes.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan={6}>
                  No quotes yet.
                </td>
              </tr>
            )}
            {!loading &&
              quotes.map((quote) => (
                <tr key={quote.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{quote.title}</td>
                  <td className="px-4 py-3 text-slate-600">{customers[quote.customer_id] ?? "Unknown"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        statusStyles[quote.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {quote.expires_at ? new Date(quote.expires_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    ${Number(quote.total ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <Button size="sm" variant="ghost" type="button" onClick={() => setStatus(quote.id, "sent")}>
                      Mark sent
                    </Button>
                    <Button size="sm" variant="ghost" type="button" onClick={() => setStatus(quote.id, "accepted")}>
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" type="button" onClick={() => handleDelete(quote.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="flex justify-end px-4 py-3 bg-slate-50 text-sm text-slate-600">Pagination</div>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Invoice = {
  id: string;
  customer_id: string;
  status: string;
  due_date: string | null;
  total: number;
  balance_due: number;
};

type CustomerMap = Record<string, string>;

const tone: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-sky-50 text-sky-700",
  partial: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  overdue: "bg-rose-50 text-rose-700"
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<CustomerMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    const [iRes, cRes] = await Promise.all([fetch("/api/invoices"), fetch("/api/customers")]);
    if (!iRes.ok) {
      const body = await iRes.json().catch(() => ({}));
      setError(body.error ?? "Failed to load invoices");
      setLoading(false);
      return;
    }
    const iBody = (await iRes.json()) as { invoices: Invoice[] };
    const cBody = cRes.ok ? ((await cRes.json()) as { customers: any[] }) : { customers: [] };
    const cMap: CustomerMap = {};
    (cBody.customers ?? []).forEach((c) => {
      cMap[c.id] = c.name;
    });
    setCustomers(cMap);
    setInvoices(iBody.invoices ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to update status");
      return;
    }
    setMessage("Invoice updated");
    await load();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to delete invoice");
      return;
    }
    setMessage("Invoice deleted");
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Billing</p>
          <h1 className="text-2xl font-semibold text-slate-900">Invoices</h1>
        </div>
        <Button asChild>
          <Link href="/invoices/new">New invoice</Link>
        </Button>
      </div>

      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card className="p-0 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-sm">
            {loading && (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan={6}>
                  Loading invoices...
                </td>
              </tr>
            )}
            {!loading && invoices.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan={6}>
                  No invoices yet.
                </td>
              </tr>
            )}
            {!loading &&
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{inv.id}</td>
                  <td className="px-4 py-3 text-slate-600">{customers[inv.customer_id] ?? "Unknown"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${tone[inv.status] ?? tone.draft}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">${Number(inv.total ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 space-x-2">
                    <Button size="sm" variant="ghost" type="button" onClick={() => setStatus(inv.id, "sent")}>
                      Mark sent
                    </Button>
                    <Button size="sm" variant="ghost" type="button" onClick={() => setStatus(inv.id, "paid")}>
                      Mark paid
                    </Button>
                    <Button size="sm" variant="outline" type="button" onClick={() => handleDelete(inv.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

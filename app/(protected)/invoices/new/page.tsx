"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Customer = { id: string; name: string };

type Item = { description: string; quantity: number; unit_price: number; tax_rate: number };

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<Item[]>([
    { description: "Service labor", quantity: 1, unit_price: 150, tax_rate: 8.5 }
  ]);
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

  const addItem = () => setItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0, tax_rate: 0 }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof Item, value: string) =>
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: field === "description" ? value : Number(value) } : item))
    );

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const tax = items.reduce((sum, i) => sum + i.quantity * i.unit_price * (i.tax_rate ?? 0) / 100, 0);
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: customerId,
        due_date: dueDate || undefined,
        items
      })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to create invoice");
      setLoading(false);
      return;
    }
    router.push("/invoices");
    router.refresh();
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Invoices</p>
          <h1 className="text-2xl font-semibold text-slate-900">New invoice</h1>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/invoices">Cancel</Link>
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="due">Due date</Label>
              <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Line items</Label>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit Price</th>
                    <th className="px-4 py-3">Tax %</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(idx, "description", e.target.value)}
                          required
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                          required
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(idx, "unit_price", e.target.value)}
                          required
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.tax_rate}
                          onChange={(e) => updateItem(idx, "tax_rate", e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400">
                        <button type="button" onClick={() => removeItem(idx)}>
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 bg-slate-50 flex justify-between items-center">
                <Button variant="ghost" className="text-sm" type="button" onClick={addItem}>
                  + Add item
                </Button>
                <div className="space-y-1 text-right text-sm">
                  <p className="text-slate-600">Subtotal: ${subtotal.toFixed(2)}</p>
                  <p className="text-slate-600">Tax: ${tax.toFixed(2)}</p>
                  <p className="font-semibold text-slate-900">Total: ${total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => router.push("/invoices")}>
              Discard
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

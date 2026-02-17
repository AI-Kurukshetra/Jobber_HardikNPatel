"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tags: string[];
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/customers");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to load customers");
      setLoading(false);
      return;
    }
    const body = (await res.json()) as { customers: Customer[] };
    setCustomers(body.customers ?? []);
    setFiltered(body.customers ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFilter = () => {
    const term = search.trim().toLowerCase();
    if (!term) {
      setFiltered(customers);
      return;
    }
    setFiltered(
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          (c.email?.toLowerCase().includes(term) ?? false) ||
          c.tags.some((t) => t.toLowerCase().includes(term))
      )
    );
  };

  const handleClear = () => {
    setSearch("");
    setFiltered(customers);
  };

  const handleDelete = async (id: string) => {
    setActionMessage(null);
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to delete");
      return;
    }
    setActionMessage("Customer deleted");
    await load();
  };

  const handleEdit = async (customer: Customer) => {
    const name = prompt("Customer name", customer.name);
    if (!name) return;
    const email = prompt("Email", customer.email ?? "") ?? customer.email ?? "";
    const res = await fetch(`/api/customers/${customer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to update");
      return;
    }
    setActionMessage("Customer updated");
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search customers"
            className="w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleFilter();
              }
            }}
          />
          <Button variant="outline" type="button" onClick={handleFilter}>
            Filter
          </Button>
          <Button variant="ghost" type="button" onClick={handleClear}>
            Clear
          </Button>
          <Link href="/customers/new" className={buttonVariants({ variant: "primary" })}>
            New customer
          </Link>
        </div>
      </div>
      {actionMessage && <p className="text-sm text-emerald-700">{actionMessage}</p>}
      <Card className="p-0 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-sm">
            {error && (
              <tr>
                <td className="px-4 py-3 text-red-600" colSpan={4}>
                  {error}
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan={4}>
                  Loading customers...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan={4}>
                  No customers found.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((cust) => (
                <tr key={cust.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{cust.name}</td>
                  <td className="px-4 py-3 text-slate-600">{cust.email ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{cust.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    {cust.tags?.length ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-1 text-xs">
                        {cust.tags[0]}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">No tag</span>
                    )}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <Button size="sm" variant="ghost" type="button" onClick={() => handleEdit(cust)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" type="button" onClick={() => handleDelete(cust.id)}>
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

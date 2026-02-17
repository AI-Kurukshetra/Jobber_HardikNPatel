"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Job = {
  id: string;
  customer_id: string;
  title: string;
  status: string;
  scheduled_at: string | null;
  notes: string | null;
};

type CustomerMap = Record<string, string>;

const statusTone: Record<string, string> = {
  scheduled: "bg-sky-50 text-sky-700",
  in_progress: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-700"
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<CustomerMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    const [jRes, cRes] = await Promise.all([fetch("/api/jobs"), fetch("/api/customers")]);
    if (!jRes.ok) {
      const body = await jRes.json().catch(() => ({}));
      setError(body.error ?? "Failed to load jobs");
      setLoading(false);
      return;
    }
    const jBody = (await jRes.json()) as { jobs: Job[] };
    const cBody = cRes.ok ? ((await cRes.json()) as { customers: any[] }) : { customers: [] };
    const cMap: CustomerMap = {};
    (cBody.customers ?? []).forEach((c) => {
      cMap[c.id] = c.name;
    });
    setCustomers(cMap);
    setJobs(jBody.jobs ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to update status");
      return;
    }
    setMessage("Job updated");
    await load();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to delete job");
      return;
    }
    setMessage("Job deleted");
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Operations</p>
          <h1 className="text-2xl font-semibold text-slate-900">Jobs</h1>
        </div>
        <Button asChild>
          <Link href="/jobs/new">New job</Link>
        </Button>
      </div>

      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card className="p-0 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Job</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Scheduled</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-sm">
            {loading && (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan={5}>
                  Loading jobs...
                </td>
              </tr>
            )}
            {!loading && jobs.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan={5}>
                  No jobs yet.
                </td>
              </tr>
            )}
            {!loading &&
              jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{job.title}</td>
                  <td className="px-4 py-3 text-slate-600">{customers[job.customer_id] ?? "Unknown"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        statusTone[job.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {job.scheduled_at ? new Date(job.scheduled_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <Button size="sm" variant="ghost" type="button" onClick={() => setStatus(job.id, "in_progress")}>
                      Start
                    </Button>
                    <Button size="sm" variant="ghost" type="button" onClick={() => setStatus(job.id, "completed")}>
                      Complete
                    </Button>
                    <Button size="sm" variant="outline" type="button" onClick={() => handleDelete(job.id)}>
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

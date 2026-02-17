import React from "react";
import { Card } from "@/components/ui/card";
import { RecentActivity } from "@/components/features/recent-activity";
import { UpcomingJobs } from "@/components/features/upcoming-jobs";

type IconProps = React.SVGProps<SVGSVGElement>;

const icons = {
  trend: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 16 10 9l4 4 6-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 6v4h-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  calendar: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" />
    </svg>
  ),
  cash: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M4 10h1a3 3 0 0 0 3-3h8a3 3 0 0 0 3 3h1M12 10.5v3" />
      <circle cx="12" cy="12" r="1.6" />
    </svg>
  ),
  clock: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" strokeLinecap="round" />
    </svg>
  ),
  lightning: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="m13 3-7 9h5l-1 9 7-10h-5l1-8Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

const kpis = [
  { label: "Revenue (MTD)", value: "$32,400", trend: "+8%", icon: "trend", tone: "text-emerald-600 bg-emerald-50" },
  { label: "Jobs scheduled", value: "128", trend: "+3%", icon: "calendar", tone: "text-sky-600 bg-sky-50" },
  { label: "Pending invoices", value: "42", trend: "-5%", icon: "cash", tone: "text-amber-700 bg-amber-50" },
  { label: "Avg. response", value: "12m", trend: "-2m", icon: "clock", tone: "text-indigo-700 bg-indigo-50" }
];

const quickActions = [
  { label: "New customer", href: "/customers/new" },
  { label: "New quote", href: "/quotes/new" },
  { label: "New job", href: "/jobs/new" },
  { label: "New invoice", href: "/invoices/new" }
];

const collections = [
  { title: "Invoices due this week", amount: "$6,840", status: "6 open", accent: "bg-amber-50 text-amber-700" },
  { title: "Collected today", amount: "$2,140", status: "4 payments", accent: "bg-emerald-50 text-emerald-700" }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-sky-500/10 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-emerald-700 font-semibold uppercase tracking-[0.18em]">Today</p>
            <h1 className="text-2xl font-semibold text-slate-900">Dispatch board, ready to roll.</h1>
            <p className="text-sm text-slate-600 mt-1">Live status for crews, invoices, and approvals.</p>
          </div>
          <div className="flex gap-2">
            {quickActions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                {icons.lightning({ className: "h-4 w-4 inline-block mr-2 text-emerald-600" })}
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{kpi.label}</p>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${kpi.tone}`}>
                {kpi.trend}
              </span>
            </div>
            <div className="flex items-end justify-between mt-3">
              <p className="text-2xl font-semibold text-slate-900">{kpi.value}</p>
              <span className="text-slate-400">
                {icons[kpi.icon as keyof typeof icons]({ className: "h-5 w-5" })}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming jobs</h2>
            <button className="text-sm text-emerald-700 hover:text-emerald-600 inline-flex items-center gap-2">
              {icons.calendar({ className: "h-4 w-4" })}
              Open calendar
            </button>
          </div>
          <UpcomingJobs />
        </Card>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Collections</h2>
            <span className="text-xs text-slate-500">Live</span>
          </div>
          {collections.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-100 p-3 bg-slate-50 flex items-start justify-between"
            >
              <div>
                <p className="text-sm text-slate-500">{item.title}</p>
                <p className="text-lg font-semibold text-slate-900">{item.amount}</p>
              </div>
              <span className={`text-xs font-semibold rounded-full px-3 py-1 ${item.accent}`}>{item.status}</span>
            </div>
          ))}
          <div className="rounded-xl border border-slate-100 p-3 bg-white">
            <p className="text-sm text-slate-500">Recent activity</p>
            <div className="mt-3">
              <RecentActivity />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Quick create</h2>
          <div className="flex gap-2 text-sm">
            {quickActions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

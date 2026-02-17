"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type IconProps = React.SVGProps<SVGSVGElement>;

const icons = {
  spark: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 3v5m0 8v5m-7-8h5m4 0h5m-9-4 2-6m0 0 2 6m-2-6L9 9m3 0 3 4m0 0-3 8m0 0-3-8m0 0 3-4" />
    </svg>
  ),
  check: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  shield: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 4 5 6v6c0 4 2.5 7 7 8 4.5-1 7-4 7-8V6l-7-2Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 12.5 11.5 14 15 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  route: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        d="M7 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 6h6a4 4 0 0 1 4 4v1M7 6v5a4 4 0 0 0 4 4h4" strokeLinecap="round" />
    </svg>
  ),
  clock: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" strokeLinecap="round" />
    </svg>
  ),
  coins: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <ellipse cx="12" cy="6" rx="6" ry="2.5" />
      <path d="M6 6v6c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V6M6 12v6c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-6" />
    </svg>
  )
};

const heroShots = [
  {
    title: "Crew on site",
    img: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
    badge: "Live check-in"
  },
  {
    title: "Job wrap-up",
    img: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1200&q=80",
    badge: "Photos + signature"
  },
  {
    title: "Invoice sent",
    img: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    badge: "Paid online"
  }
];

const featureGroups = [
  {
    title: "Scheduling that adapts",
    copy: "Drag-and-drop calendar, travel-aware routing, and at-a-glance crew load.",
    icon: "route"
  },
  {
    title: "Payments that just work",
    copy: "Quote → job → invoice stays linked. Stripe-ready out of the box.",
    icon: "coins"
  },
  {
    title: "Controls that scale",
    copy: "Role-based access, tenant isolation with RLS, and detailed audit trail.",
    icon: "shield"
  }
];

const steps = [
  { title: "Capture request", detail: "Leads, calls, or portal requests instantly become customer + job drafts." },
  { title: "Send polished quotes", detail: "Use branded templates, upsell options, and expiration timers." },
  { title: "Schedule & dispatch", detail: "Real-time crew status, drive-time aware routing, SMS updates." },
  { title: "Finish & collect", detail: "Photos, signatures, and one-click payment links close the loop." }
];

export default function LandingPage() {
  return (
    <main className="bg-slate-950 text-slate-50">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.25),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(251,191,36,0.18),transparent_40%)]" />
        <div className="max-w-6xl mx-auto px-6 pb-12 pt-14 relative">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-200/80">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 px-3 py-1 border border-slate-800">
              {icons.spark({ className: "h-4 w-4 text-emerald-300" })}
              New: Workspace provisioning in under 2 minutes
            </span>
            <div className="flex gap-3 flex-wrap text-[11px]">
              {["SOC2-ready", "Multi-tenant", "Stripe-ready", "Client portal"].map((pill) => (
                <span key={pill} className="rounded-full bg-white/5 border border-slate-800 px-3 py-1">
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.05fr,0.95fr] gap-12 mt-10 items-center">
            <div className="space-y-7">
              <p className="text-emerald-200 text-sm font-semibold uppercase tracking-[0.22em]">
                Field service, without the friction
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-white">
                Launch a Jobber-grade platform fast — with an opinionated starter that feels production.
              </h1>
              <p className="text-lg text-slate-200/80 max-w-2xl">
                Auth, scheduling, invoices, routing, and a client portal are already wired. Ship a pilot in days and
                scale it with guardrails baked in.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-emerald-400 hover:bg-emerald-300 text-slate-950">
                  <Link href="/sign-up">Create workspace</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-slate-600 text-slate-100 hover:bg-slate-900"
                >
                  <Link href="/sign-in">I already have access</Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="text-emerald-200 hover:bg-slate-900/60">
                  <Link href="#demo">See live screens</Link>
                </Button>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                {[
                  { label: "Teams onboarded", value: "140+", accent: "bg-emerald-500/10 text-emerald-200" },
                  { label: "Weekly hours saved", value: "6.2h", accent: "bg-amber-500/10 text-amber-200" },
                  { label: "Invoices paid online", value: "72%", accent: "bg-sky-500/10 text-sky-200" }
                ].map((stat) => (
                  <Card key={stat.label} className="p-4 border-slate-800 bg-slate-900/60">
                    <p className="text-xs text-slate-400">{stat.label}</p>
                    <p className={`text-xl font-semibold mt-1 ${stat.accent}`}>{stat.value}</p>
                  </Card>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-200/80">
                {[
                  "SOC2-friendly Supabase RLS",
                  "Stripe + customer portal baked in",
                  "Mobile-friendly scheduling UI"
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 rounded-[32px] bg-slate-800/50 blur-3xl" />
              <Card className="relative overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
                  {heroShots.map((shot) => (
                    <div key={shot.title} className="relative group rounded-2xl overflow-hidden border border-slate-800">
                      <img
                        src={shot.img}
                        alt={shot.title}
                        className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/90 text-slate-950 text-xs font-semibold px-3 py-1">
                          {shot.badge}
                        </span>
                        <p className="mt-2 text-sm font-semibold text-white">{shot.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-800 bg-slate-900/70 px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Today&apos;s route</p>
                    <p className="text-sm text-slate-200">Roof inspection · HVAC tune-up · Gutter cleaning</p>
                  </div>
                  <span className="text-xs text-emerald-300 inline-flex items-center gap-2">
                    {icons.route({ className: "h-4 w-4" })}
                    Drive-time optimized
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="bg-white text-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
          <div className="flex flex-col gap-3 max-w-3xl">
            <p className="text-sm font-semibold text-emerald-700">Everything wired from day one</p>
            <h2 className="text-3xl sm:text-4xl font-semibold">Opinionated building blocks that feel premium.</h2>
            <p className="text-lg text-slate-600">
              Scheduling, quoting, invoicing, and RLS-backed data model come pre-integrated. Tweak copy, extend schemas,
              and ship pilots without rebuilding the basics.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featureGroups.map((group) => (
              <Card key={group.title} className="p-6 h-full shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    {icons[group.icon as keyof typeof icons]({ className: "h-5 w-5" })}
                  </span>
                  <p className="text-lg font-semibold text-slate-900">{group.title}</p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{group.copy}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid lg:grid-cols-[0.9fr,1.1fr] gap-12 items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-emerald-300">How it flows</p>
            <h3 className="text-3xl font-semibold">Lead to paid without brittle glue code.</h3>
            <p className="text-slate-200/80">
              Each step is already connected. Replace our copy with yours, extend line items, and keep the routing +
              billing logic intact.
            </p>
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div key={step.title} className="flex gap-3">
                  <div className="flex-none h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-200 flex items-center justify-center font-semibold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{step.title}</p>
                    <p className="text-sm text-slate-300">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="p-6 bg-slate-950/70 border-slate-800 shadow-xl">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">Quote #1193</p>
                  <span className="text-emerald-300 text-xs font-semibold inline-flex items-center gap-1">
                    {icons.check({ className: "h-3.5 w-3.5" })}
                    Accepted
                  </span>
                </div>
                <p className="text-lg font-semibold text-white mt-1">Window cleaning</p>
                <p className="text-sm text-slate-400 mt-1">Converted to job · Fri 10:30a</p>
              </div>
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
                <p className="text-xs text-slate-400">Invoice #827</p>
                <p className="text-lg font-semibold text-white">$420.00</p>
                <p className="text-sm text-slate-400">Auto-reminder in 3 days</p>
                <Button size="sm" className="mt-3 w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950">
                  Collect payment
                </Button>
              </div>
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:col-span-2">
                <p className="text-xs text-slate-400">Customer portal</p>
                <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm text-slate-200">
                  <div className="rounded-lg bg-emerald-500/10 text-emerald-200 px-3 py-2">2 quotes awaiting approval</div>
                  <div className="rounded-lg bg-amber-500/10 text-amber-200 px-3 py-2">5 invoices open</div>
                  <div className="rounded-lg bg-slate-800 text-slate-100 px-3 py-2">Upcoming visit Friday</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-slate-50 text-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
          <div className="flex flex-col gap-3 max-w-3xl">
            <p className="text-sm font-semibold text-emerald-700">Operations cockpit</p>
            <h4 className="text-3xl sm:text-4xl font-semibold">A home page your team actually wants to live in.</h4>
            <p className="text-lg text-slate-600">
              Calendar, routes, quick actions, and live status live together. The layout is ready for your data, not a
              lorem ipsum mock.
            </p>
          </div>

          <Card className="overflow-hidden border-slate-200 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1529429617124-aee5f4ae7890?auto=format&fit=crop&w=1400&q=80"
              alt="Team planning board"
              className="w-full h-[360px] object-cover"
              loading="lazy"
            />
            <div className="grid md:grid-cols-3 gap-4 p-6 bg-white">
              {[
                { title: "Crew load", detail: "See who is free, overbooked, or in transit.", icon: "clock" },
                { title: "Route health", detail: "Drive-time aware schedules keep customers happy.", icon: "route" },
                { title: "Cash clarity", detail: "Quotes, jobs, and invoices stay linked for audit-ready reporting.", icon: "coins" }
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    {icons[item.icon as keyof typeof icons]({ className: "h-5 w-5" })}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-600">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid lg:grid-cols-[1fr,1fr] gap-10 items-center">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-emerald-300">Credibility</p>
            <h4 className="text-3xl font-semibold">Built on proven foundations.</h4>
            <p className="text-slate-200/80">
              Next.js App Router, Supabase Auth + RLS, Stripe-ready billing, and a componentized UI so you can extend fast.
            </p>
            <div className="flex gap-3 flex-wrap text-sm text-slate-200">
              {["Next.js 14", "Supabase", "Tailwind", "Stripe-ready", "TypeScript"].map((tag) => (
                <span key={tag} className="rounded-full border border-slate-700 px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <Card className="p-6 bg-slate-950/70 border-slate-800 shadow-xl">
            <div className="flex flex-col gap-4">
              <blockquote className="text-lg leading-relaxed text-slate-100">
                “We stood up a customer-ready pilot in under a week. The scheduling, RLS, and portal were already there — we
                only added our niche workflow.”
              </blockquote>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-white">Jordan Lee</p>
                  <p className="text-sm text-slate-300">Founder, BlueSky Maintenance</p>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold">
                  Early adopter
                </span>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}

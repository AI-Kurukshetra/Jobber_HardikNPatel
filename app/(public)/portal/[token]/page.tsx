import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ClientPortalPage({ params }: { params: { token: string } }) {
  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">Client portal</p>
            <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-600">Secure access via token {params.token.slice(0, 6)}...</p>
          </div>
          <Button>Contact us</Button>
        </Card>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Quotes</h2>
              <span className="text-xs text-slate-500">Approve online</span>
            </div>
            <div className="divide-y divide-slate-100 text-sm">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Quote #1042</p>
                  <p className="text-slate-600">HVAC tune-up</p>
                </div>
                <Button size="sm">Approve</Button>
              </div>
            </div>
          </Card>
          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Invoices</h2>
              <span className="text-xs text-slate-500">Pay securely</span>
            </div>
            <div className="divide-y divide-slate-100 text-sm">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Invoice #882</p>
                  <p className="text-slate-600">Due Mar 20, 2026</p>
                </div>
                <Button size="sm" variant="outline">
                  Pay $351.25
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

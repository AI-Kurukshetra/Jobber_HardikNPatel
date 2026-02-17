import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InvoicePage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Invoice #{params.id}</p>
          <h1 className="text-2xl font-semibold text-slate-900">Customer: Northwind Homes</h1>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs">Sent</span>
          <Button variant="outline">Mark paid</Button>
          <Button>Send</Button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Line items</h2>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3">Tax %</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3">HVAC tune-up labor</td>
                <td className="px-4 py-3">1</td>
                <td className="px-4 py-3">$250.00</td>
                <td className="px-4 py-3">8.5%</td>
                <td className="px-4 py-3">$271.25</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Filters & materials</td>
                <td className="px-4 py-3">1</td>
                <td className="px-4 py-3">$80.00</td>
                <td className="px-4 py-3">0%</td>
                <td className="px-4 py-3">$80.00</td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900 font-medium">$330.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax</span>
                <span className="text-slate-900 font-medium">$21.25</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>$351.25</span>
              </div>
              <div className="flex justify-between text-sm text-slate-700">
                <span>Balance due</span>
                <span>$351.25</span>
              </div>
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Customer</h2>
            <p className="text-sm text-slate-700">Northwind Homes</p>
            <p className="text-sm text-slate-600">billing@northwind.com</p>
            <p className="text-sm text-slate-600">+1-555-120-3040</p>
          </Card>
          <Card className="p-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Payments</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700">No payments yet</span>
              <Button variant="outline" size="sm">
                Record payment
              </Button>
            </div>
          </Card>
          <Card className="p-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Due date</h2>
            <p className="text-sm text-slate-700">Mar 20, 2026</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

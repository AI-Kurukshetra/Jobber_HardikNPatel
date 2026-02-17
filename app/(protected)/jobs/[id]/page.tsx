import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const checklist = ["Arrive on site", "Perform service", "Capture photos", "Obtain sign-off"];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Job #{params.id}</p>
          <h1 className="text-2xl font-semibold text-slate-900">HVAC Tune-up</h1>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs">Scheduled</span>
          <Button variant="outline">Edit</Button>
          <Button>Start job</Button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Work order</h2>
          <ul className="space-y-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Internal notes</h3>
            <p className="text-sm text-slate-600">Customer prefers afternoon visits. Access code 4920.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Attachments</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="aspect-video rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                Photo placeholder
              </div>
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Assignment</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Jane Smith</p>
              <p className="text-slate-600">Lead Technician</p>
              <Button variant="outline" size="sm">
                Reassign
              </Button>
            </div>
          </Card>
          <Card className="p-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>Scheduled for Mar 05, 2026 10:00 AM</li>
              <li>Duration: 2 hours</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

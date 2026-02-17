import { Card } from "@/components/ui/card";

const items = [
  { action: "Invoice #882 sent", time: "2h ago" },
  { action: "Quote #1042 approved", time: "4h ago" },
  { action: "Job #220 scheduled", time: "1d ago" }
];

export function RecentActivity() {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <Card key={idx} className="p-3 flex items-center justify-between">
          <p className="text-sm text-slate-800">{item.action}</p>
          <span className="text-xs text-slate-500">{item.time}</span>
        </Card>
      ))}
    </div>
  );
}

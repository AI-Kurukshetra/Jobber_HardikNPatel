const jobs = [
  { title: "HVAC Tune-up", date: "Mar 05, 10:00 AM", staff: "Jane Smith", status: "Scheduled" },
  { title: "Lawn Care", date: "Mar 06, 9:00 AM", staff: "Tim Lee", status: "Scheduled" },
  { title: "Roof Inspection", date: "Mar 06, 1:00 PM", staff: "Alex Carter", status: "In Progress" }
];

export function UpcomingJobs() {
  return (
    <div className="divide-y divide-slate-100 text-sm">
      {jobs.map((job) => (
        <div key={job.title} className="py-3 flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900">{job.title}</p>
            <p className="text-slate-600">{job.date} · {job.staff}</p>
          </div>
          <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-1 text-xs">{job.status}</span>
        </div>
      ))}
    </div>
  );
}

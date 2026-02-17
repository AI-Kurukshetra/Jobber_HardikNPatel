import { cn } from "@/lib/utils";

export function Card({
  className,
  children
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border border-slate-100 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

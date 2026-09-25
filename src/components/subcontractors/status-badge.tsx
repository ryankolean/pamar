import type { OpportunityStatus } from "@/lib/opportunities";
import { cn } from "@/lib/cn";

const styles: Record<OpportunityStatus, string> = {
  Open: "bg-emerald-100 text-emerald-900",
  Closed: "bg-ink-100 text-ink-700",
  Awarded: "bg-sky-100 text-sky-900",
};

export function StatusBadge({
  status,
  className,
}: {
  status: OpportunityStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-sm px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-wider",
        styles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

import { cn } from "@/lib/cn";

type PlaceholderImageProps = {
  /** Describes the photo that belongs here; also used as the accessible label. */
  label: string;
  className?: string;
};

/**
 * Stand-in for project photography until real assets are supplied (SUMMIT-228).
 * Renders a neutral hatched panel that keeps layout and aspect ratio intact.
 */
export function PlaceholderImage({ label, className }: PlaceholderImageProps) {
  return (
    <div
      role="img"
      aria-label={`Placeholder image: ${label}`}
      className={cn(
        "bg-hatch relative flex items-end overflow-hidden bg-ink-800 p-4 text-ink-300",
        className,
      )}
    >
      <span className="font-display text-xs uppercase tracking-widest">Photo: {label}</span>
    </div>
  );
}

import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  /** Render on a dark background. */
  inverse?: boolean;
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  inverse = false,
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p
          className={cn(
            "mb-3 font-display text-sm font-semibold uppercase tracking-[0.2em]",
            inverse ? "text-brand-400" : "text-brand-700",
          )}
        >
          {eyebrow}
        </p>
      )}
      <Heading
        className={cn(
          "text-3xl font-bold uppercase sm:text-4xl",
          inverse ? "text-white" : "text-ink-950",
        )}
      >
        {title}
      </Heading>
      {intro && (
        <p className={cn("mt-4 text-lg", inverse ? "text-ink-200" : "text-ink-600")}>{intro}</p>
      )}
    </div>
  );
}

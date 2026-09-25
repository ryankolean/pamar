import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-page flex flex-col items-start gap-6 py-24">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
        404
      </p>
      <h1 className="text-4xl font-bold uppercase">Page not found</h1>
      <p className="max-w-xl text-lg text-ink-600">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <ButtonLink href="/" variant="dark">
        Back to home
      </ButtonLink>
    </section>
  );
}

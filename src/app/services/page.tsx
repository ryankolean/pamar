import type { Metadata } from "next";
import { ServiceCard } from "@/components/services/service-card";
import { PageHero } from "@/components/ui/page-hero";
import { revealDelay } from "@/lib/motion";
import { getServices } from "@/content/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "The capabilities Pamar Enterprises self-performs, from underground utilities to site development.",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHero
        eyebrow="Capabilities"
        title="What we build"
        intro="Experienced crews and the right equipment for every phase of heavy civil work."
      />
      <section className="py-20">
        <ul className="container-page grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <li key={service.slug} data-reveal style={revealDelay(index)}>
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

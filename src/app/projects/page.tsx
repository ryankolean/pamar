import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectListing } from "@/components/projects/project-listing";
import { PageHero } from "@/components/ui/page-hero";
import { getProjects } from "@/content/projects";
import { getServices } from "@/content/services";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Completed projects by Pamar Enterprises across municipal, commercial, and industrial work.",
  // Filtered views (?service=…) share one canonical URL.
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const [projects, services] = await Promise.all([getProjects(), getServices()]);

  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title="Projects"
        intro="A look at the infrastructure we’ve built for public and private owners."
      />
      <section className="bg-ink-50 py-12 sm:py-16">
        <div className="container-page space-y-10">
          {/* Filters come from the URL on the client so the page itself stays static. */}
          <Suspense fallback={null}>
            <ProjectListing
              projects={projects}
              services={services.map((s) => ({ slug: s.slug, name: s.name }))}
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}

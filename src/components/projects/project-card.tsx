import Link from "next/link";
import type { Project } from "@/content/projects";
import { ProjectPhoto } from "./project-photo";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex h-full flex-col bg-white">
      <ProjectPhoto
        image={project.images[0]}
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="aspect-[4/3] w-full transition-opacity group-hover:opacity-90"
      />
      <div className="flex flex-1 flex-col border-x border-b border-ink-100 p-6">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
          {project.market} · {project.year}
        </p>
        <h3 className="mt-2 text-xl font-bold uppercase">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-ink-600">{project.summary}</p>
      </div>
    </article>
  );
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <li key={project.slug}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}

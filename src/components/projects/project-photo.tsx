import Image from "next/image";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import type { ProjectImage } from "@/content/projects";
import { cn } from "@/lib/cn";

type ProjectPhotoProps = {
  image: ProjectImage;
  sizes: string;
  className?: string;
  priority?: boolean;
};

/** Renders a project photo, or a placeholder until real photography is supplied. */
export function ProjectPhoto({ image, sizes, className, priority }: ProjectPhotoProps) {
  if (!image.src) return <PlaceholderImage label={image.alt} className={className} />;

  return (
    <div className={cn("relative overflow-hidden bg-ink-800", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}

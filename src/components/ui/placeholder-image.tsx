import { cn } from "@/lib/cn";
import { type Scene, SceneArt, sceneForLabel } from "./scene-art";

type PlaceholderImageProps = {
  /** Describes the photo that belongs here; also used as the accessible label. */
  label: string;
  /** Illustration to show; picked from the label when omitted. */
  scene?: Scene;
  className?: string;
};

/**
 * Stand-in for photography until real assets are supplied (SUMMIT-228): an on-brand
 * illustration that keeps the layout and aspect ratio of the photo that will replace it.
 */
export function PlaceholderImage({ label, scene, className }: PlaceholderImageProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("relative overflow-hidden bg-ink-900", className)}
    >
      <SceneArt scene={scene ?? sceneForLabel(label)} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

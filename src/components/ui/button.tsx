import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "dark" | "outline" | "outline-light";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider transition-[background-color,color,border-color,translate,box-shadow] duration-200 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-500 text-ink-950 hover:bg-brand-600",
  dark: "bg-ink-950 text-white hover:bg-ink-800",
  outline: "border-2 border-ink-950 text-ink-950 hover:bg-ink-950 hover:text-white",
  "outline-light": "border-2 border-white text-white hover:bg-white hover:text-ink-950",
};

export function buttonClasses(variant: ButtonVariant = "primary", className?: string) {
  return cn(base, variants[variant], className);
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant };

export function ButtonLink({ variant = "primary", className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, className)} {...props} />;
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant };

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}

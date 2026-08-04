import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-destructive text-destructive-foreground",
  card: "bg-card text-card-foreground",
  muted: "bg-muted text-muted-foreground",
} as const;

export type ClayTone = keyof typeof tones;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ClayTone;
  size?: "sm" | "md" | "lg";
  block?: boolean;
};

export const ClayButton = forwardRef<HTMLButtonElement, ButtonProps>(function ClayButton(
  { tone = "primary", size = "md", block, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "clay font-display font-bold rounded-2xl transition-transform duration-150 select-none",
        "active:translate-y-1 active:scale-[0.97] disabled:opacity-50 disabled:active:translate-y-0",
        tones[tone],
        size === "sm" && "px-4 py-2 text-sm",
        size === "md" && "px-5 py-3 text-base",
        size === "lg" && "px-6 py-4 text-lg",
        block && "w-full",
        className,
      )}
      {...props}
    />
  );
});

type CardProps = HTMLAttributes<HTMLDivElement> & { tone?: ClayTone; inset?: boolean };

export function ClayCard({ tone = "card", inset, className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-3xl", inset ? "clay-inset" : "clay", tones[tone], className)}
      {...props}
    />
  );
}

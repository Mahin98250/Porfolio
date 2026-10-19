import type { HTMLAttributes, ReactNode } from "react";

export interface GlassPanelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "section" | "article" | "div";
  interactive?: boolean;
}

export function GlassPanel({
  as = "section",
  children,
  className = "",
  interactive = false,
  ...props
}: GlassPanelProps) {
  const Element = as;
  const classes = ["glass", "glass-panel", interactive ? "glass-panel-interactive" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Element className={classes} {...props}>
      {children}
    </Element>
  );
}

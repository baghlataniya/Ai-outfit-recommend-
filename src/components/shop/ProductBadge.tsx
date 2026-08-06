import { cn } from "@/lib/utils";

export function ProductBadge({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label-xs px-3 py-1 backdrop-blur-sm",
        tone === "light" ? "bg-background/85 text-foreground" : "bg-ink/80 text-background",
        className,
      )}
    >
      {children}
    </span>
  );
}

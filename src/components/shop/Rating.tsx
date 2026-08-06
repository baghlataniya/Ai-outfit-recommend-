import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value, reviews, className }: { value: number; reviews?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span className="flex items-center gap-0.5" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={cn("h-3 w-3", i < Math.round(value) ? "fill-foreground text-foreground" : "text-border")}
            strokeWidth={1}
          />
        ))}
      </span>
      <span className="tabular-nums">{value.toFixed(1)}</span>
      {reviews !== undefined && <span className="opacity-60">({reviews})</span>}
      <span className="sr-only">{value} out of 5</span>
    </div>
  );
}

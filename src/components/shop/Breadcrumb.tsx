import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <motion.nav
      aria-label="Breadcrumb"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={cn("label-xs flex flex-wrap items-center gap-3", className)}
    >
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-3">
          {i > 0 && <span aria-hidden className="opacity-40">/</span>}
          {item.to ? (
            <Link to={item.to} params={item.params as never} className="link-underline opacity-70 hover:opacity-100">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="opacity-100">{item.label}</span>
          )}
        </span>
      ))}
    </motion.nav>
  );
}

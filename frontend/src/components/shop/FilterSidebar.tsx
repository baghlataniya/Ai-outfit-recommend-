import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { FILTER_GROUPS, PRICE_MAX, emptyFilters, type Filters, type FilterKey } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

type Props = {
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
  /** mobile drawer state */
  open?: boolean;
  onClose?: () => void;
};

function Group({
  label,
  options,
  selected,
  onToggle,
  defaultOpen,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div className="border-b border-border py-5">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="label-xs">{label}</span>
        <span className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground">{selected.length}</span>
          )}
          {open ? (
            <Minus className="h-3.5 w-3.5" strokeWidth={1.2} />
          ) : (
            <Plus className="h-3.5 w-3.5" strokeWidth={1.2} />
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <ul className="mt-4 space-y-2.5">
              {options.map((opt) => {
                const active = selected.includes(opt);
                return (
                  <li key={opt}>
                    <button
                      onClick={() => onToggle(opt)}
                      className="group flex w-full items-center gap-3 text-left"
                    >
                      <span
                        className={cn(
                          "flex h-3.5 w-3.5 shrink-0 items-center justify-center border transition-colors duration-300",
                          active ? "border-foreground bg-foreground" : "border-border",
                        )}
                      >
                        {active && <span className="h-1 w-1 bg-background" />}
                      </span>
                      <span
                        className={cn(
                          "text-sm transition-colors",
                          active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                        )}
                      >
                        {opt}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Panel({ filters, onChange, resultCount }: Omit<Props, "open" | "onClose">) {
  const toggle = (key: FilterKey, value: string) => {
    const current = filters[key];
    onChange({
      ...filters,
      [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-foreground pb-4">
        <p className="label-xs">Filter</p>
        <button
          onClick={() => onChange(emptyFilters())}
          className="label-xs link-underline text-muted-foreground"
        >
          Clear
        </button>
      </div>

      {FILTER_GROUPS.map((g, i) => (
        <Group
          key={g.key}
          label={g.label}
          options={g.options}
          selected={filters[g.key]}
          onToggle={(v) => toggle(g.key, v)}
          defaultOpen={i < 2}
        />
      ))}

      <div className="border-b border-border py-6">
        <div className="flex items-center justify-between">
          <span className="label-xs">Price</span>
          <span className="text-xs tabular-nums text-muted-foreground">
            Up to ${filters.maxPrice.toLocaleString("en-US")}
          </span>
        </div>
        <Slider
          value={[filters.maxPrice]}
          min={100}
          max={PRICE_MAX}
          step={10}
          onValueChange={([value]) => onChange({ ...filters, maxPrice: value })}
          aria-label="Maximum price"
          className="mt-4"
        />
      </div>

      <div className="py-6">
        <button
          onClick={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          className="flex w-full items-center gap-3"
        >
          <span
            className={cn(
              "flex h-3.5 w-3.5 items-center justify-center border transition-colors duration-300",
              filters.inStockOnly ? "border-foreground bg-foreground" : "border-border",
            )}
          >
            {filters.inStockOnly && <span className="h-1 w-1 bg-background" />}
          </span>
          <span className="text-sm text-muted-foreground">Available only</span>
        </button>
      </div>

      <p className="eyebrow">{resultCount} pieces</p>
    </div>
  );
}

export function FilterSidebar({ filters, onChange, resultCount, open, onClose }: Props) {
  return (
    <>
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-28">
          <Panel filters={filters} onChange={onChange} resultCount={resultCount} />
        </div>
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={onClose}
              className="fixed inset-0 z-[960] bg-ink/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
              className="fixed inset-y-0 left-0 z-[961] w-[86vw] max-w-sm overflow-y-auto bg-background px-6 py-7 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="label-xs tracking-[0.3em]">Filters</span>
                <button onClick={onClose} aria-label="Close filters">
                  <X className="h-4 w-4" strokeWidth={1.2} />
                </button>
              </div>
              <Panel filters={filters} onChange={onChange} resultCount={resultCount} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

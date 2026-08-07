import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Upload, Sparkles } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { RevealText } from "@/components/site/RevealText";
import { cn } from "@/lib/utils";

const GENDERS = ["Male", "Female", "Unisex"];
const OCCASIONS = ["Casual", "Office", "Party", "Wedding", "Date Night", "Vacation", "Gym", "Festival", "Business"];
const WEATHER = ["Sunny", "Cold", "Rainy", "Snow", "Windy", "Indoor"];
const STYLES = ["Minimal", "Luxury", "Streetwear", "Old Money", "Business Casual", "Vintage", "Modern", "Sporty", "Elegant", "Oversized"];
const COLORS = [
  { name: "Black", value: "#0B0B0B" },
  { name: "Charcoal", value: "#171717" },
  { name: "Soft White", value: "#F7F7F5" },
  { name: "Light Gray", value: "#D8D8D8" },
];
const BRANDS = ["Maison Noir", "Atelier 07", "Noir Studio", "Objet Blanc", "Ligne 12", "Reserve Atelier"];
const BODY_TYPES = ["Petite", "Slim", "Regular", "Athletic", "Plus Size"];

type ChoiceProps = {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
};

const choiceSectionStyle = { contentVisibility: "auto", containIntrinsicSize: "1px 900px" } as const;

const ChoiceGrid = memo(function ChoiceGrid({ label, options, value, onChange }: ChoiceProps) {
  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{label}</p>
          <p className="text-sm text-muted-foreground">Tap one card to set this part of the stylist brief.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option, index) => {
          const active = value === option;
          return (
            <motion.button
              key={option}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(option)}
              className={cn(
                "group flex min-h-24 items-end justify-between border px-5 py-4 text-left transition-colors duration-200 ease-out",
                active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
              )}
            >
              <span className="label-xs opacity-60">0{index + 1}</span>
              <span className="text-sm font-medium tracking-tight">{option}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});

const MultiChoiceGrid = memo(function MultiChoiceGrid({
  label,
  options,
  values,
  onToggle,
}: {
  label: string;
  options: string[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-5">
        <p className="eyebrow mb-2">{label}</p>
        <p className="text-sm text-muted-foreground">Select one or more to shape the recommendation palette.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = values.includes(option);
          return (
            <motion.button
              key={option}
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggle(option)}
              className={cn(
                "label-xs border px-4 py-3 transition-colors duration-200 ease-out",
                active ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});

const ColorSelector = memo(function ColorSelector({ values, onToggle }: { values: string[]; onToggle: (value: string) => void }) {
  return (
    <div>
      <div className="mb-5">
        <p className="eyebrow mb-2">Favorite Colors</p>
        <p className="text-sm text-muted-foreground">Choose multiple tones. The palette remains monochrome.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {COLORS.map((color) => {
          const active = values.includes(color.name);
          return (
            <button
              key={color.name}
              onClick={() => onToggle(color.name)}
              className={cn(
                "flex flex-col items-center gap-2 transition-transform duration-200 ease-out",
                active && "scale-[1.02]",
              )}
            >
              <span
                className={cn(
                  "h-10 w-10 rounded-full border transition-colors duration-200 ease-out",
                  active ? "border-foreground ring-1 ring-foreground/20" : "border-border",
                )}
                style={{ backgroundColor: color.value }}
              />
              <span className="label-xs text-muted-foreground">{color.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

const UploadDropzone = memo(function UploadDropzone({
  preview,
  progress,
  onFile,
}: {
  preview: string | null;
  progress: number;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div className="mb-5">
        <p className="eyebrow mb-2">Upload Your Photo</p>
        <p className="text-sm text-muted-foreground">Drag and drop or browse. The styling system only uses this preview in the UI.</p>
      </div>
      <motion.button
        type="button"
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => inputRef.current?.click()}
        className="group relative flex w-full flex-col items-center justify-center overflow-hidden border border-dashed border-border bg-muted px-6 py-12 text-center transition-colors duration-200 ease-out hover:border-foreground"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
        <Upload className="relative z-10 h-6 w-6" strokeWidth={1.4} />
        <p className="relative z-10 mt-4 text-sm font-medium tracking-tight">Drop your image here</p>
        <p className="relative z-10 mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP</p>
      </motion.button>

      <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
        {preview ? (
          <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="aspect-4/5 overflow-hidden bg-muted">
            <img src={preview} alt="Uploaded preview" loading="lazy" className="h-full w-full object-cover" />
          </motion.div>
        ) : (
          <div className="aspect-4/5 border border-border bg-ink/5" />
        )}

        <div className="flex flex-col justify-end border border-border p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Preview readiness</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-3 h-px w-full bg-border">
            <div className="h-px bg-foreground transition-transform duration-200 ease-out" style={{ transform: `translate3d(0,0,0) scaleX(${progress / 100})`, transformOrigin: "left" }} />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            The preview improves the AI edit without changing the monochrome design language.
          </p>
        </div>
      </div>
    </div>
  );
});

export const Route = createFileRoute("/stylist/")({
  component: StylistPage,
});

function StylistPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);

  const [gender, setGender] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [weather, setWeather] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [budget, setBudget] = useState(18000);
  const [brands, setBrands] = useState<string[]>([]);
  const [bodyType, setBodyType] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onGenderChange = useCallback((value: string) => setGender(value), []);
  const onOccasionChange = useCallback((value: string) => setOccasion(value), []);
  const onWeatherChange = useCallback((value: string) => setWeather(value), []);
  const onStyleChange = useCallback((value: string) => setStyle(value), []);
  const onBrandToggle = useCallback(
    (value: string) => setBrands((current) => (current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value])),
    [],
  );
  const onColorToggle = useCallback(
    (value: string) => setColors((current) => (current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value])),
    [],
  );
  const onBodyTypeChange = useCallback((value: string) => setBodyType(value), []);
  const onFile = useCallback((file: File) => {
    const next = URL.createObjectURL(file);
    setUploadPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return next;
    });
  }, []);

  const completed = [gender, occasion, weather, style, colors.length, budget, brands.length, bodyType, uploadPreview].filter(Boolean).length;
  const progress = Math.round((completed / 9) * 100);

  useEffect(() => {
    if (!uploadPreview) {
      setUploadProgress(0);
      return;
    }
    setUploadProgress(100);
  }, [uploadPreview]);

  const saveSelections = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "maison-noir-stylist-brief",
        JSON.stringify({ gender, occasion, weather, style, colors, budget, brands, bodyType, uploadPreview }),
      );
    }
    navigate({ to: "/stylist/results" });
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-background"
    >
      <section ref={heroRef} className="grain relative overflow-hidden bg-ink text-background">
        <div className="absolute inset-0">
          <div className="absolute top-12 left-8 h-48 w-48 rounded-full bg-background/5 opacity-70" />
          <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-background/5 opacity-70" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-ink/20 to-ink/80" />
        </div>

        <div className="edge relative grid min-h-[72svh] gap-10 py-28 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="eyebrow mb-8 text-background/50">AI Styling / Premium Brief</p>
            <RevealText as="h1" className="display-lg max-w-2xl">
              Meet Your
              <br />
              Personal AI Stylist
            </RevealText>
            <p className="mt-8 max-w-xl text-sm leading-relaxed text-background/70">
              Discover outfits tailored to your personality, occasion, budget, weather, and style.
            </p>
          </div>

          <div className="border border-background/10 bg-background/5 p-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-background/50">
              <span>Selection Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-4 h-px w-full bg-background/10">
              <div className="h-px bg-background transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-background/65">
              Nine brief points shape the edit before the results page composes the final look.
            </p>
          </div>
        </div>
      </section>

      <section className="edge py-14 md:py-18" style={choiceSectionStyle}>
        <div className="grid gap-12">
          <ChoiceGrid label="Step 1 — Choose Gender" options={GENDERS} value={gender} onChange={onGenderChange} />
          <ChoiceGrid label="Step 2 — Choose Occasion" options={OCCASIONS} value={occasion} onChange={onOccasionChange} />
          <ChoiceGrid label="Step 3 — Weather" options={WEATHER} value={weather} onChange={onWeatherChange} />
          <ChoiceGrid label="Step 4 — Style Preference" options={STYLES} value={style} onChange={onStyleChange} />
          <ColorSelector values={colors} onToggle={onColorToggle} />

          <div>
            <div className="mb-5">
              <p className="eyebrow mb-2">Step 6 — Budget Slider</p>
              <p className="text-sm text-muted-foreground">Set a price window between ₹1,000 and ₹50,000.</p>
            </div>
            <div className="border border-border p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Budget</span>
                <span className="tabular-nums">₹{budget.toLocaleString("en-IN")}</span>
              </div>
              <Slider
                value={[budget]}
                min={1000}
                max={50000}
                step={500}
                onValueChange={([value]) => setBudget(value)}
                className="mt-5"
              />
            </div>
          </div>

          <MultiChoiceGrid label="Step 7 — Preferred Brands" options={BRANDS} values={brands} onToggle={onBrandToggle} />

          <ChoiceGrid label="Step 8 — Body Type" options={BODY_TYPES} value={bodyType} onChange={onBodyTypeChange} />

          <UploadDropzone preview={uploadPreview} progress={uploadProgress} onFile={onFile} />

          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={saveSelections}
              className="label-xs flex w-full items-center justify-center gap-3 border border-background/10 bg-foreground px-9 py-4 text-background transition-colors duration-200 ease-out hover:bg-charcoal"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.4} />
              Generate Outfit
            </motion.button>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
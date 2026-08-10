import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, Sparkles } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { RevealText } from "@/components/site/RevealText";

import editorial1 from "@/assets/editorial-1.jpg";
import editorial2 from "@/assets/editorial-2.jpg";
import editorial3 from "@/assets/editorial-3.jpg";
import editorial4 from "@/assets/editorial-4.jpg";
import catOuterwear from "@/assets/cat-outerwear.jpg";
import catKnitwear from "@/assets/cat-knitwear.jpg";

const TITLE = "Journal | Maison Noir";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: TITLE },
      {
        name: "description",
        content: "Maison Noir Journal — Perspectives on fashion, monochrome styling, materials, and artificial intelligence.",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: "Perspectives on fashion, monochrome styling, materials, and artificial intelligence." },
    ],
  }),
  component: JournalPage,
});

type ArticleCategory = "All" | "Fashion" | "Styling" | "Materials" | "AI & Fashion" | "Maison Noir Stories";

interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  date: string;
  readTime: string;
  excerpt: string;
  image: string;
  author: string;
  featured?: boolean;
}

const ARTICLES: Article[] = [
  {
    id: "permanence-of-monochrome",
    title: "The Architecture of Permanence: Why Monochrome Survives the Trend Cycle",
    category: "Fashion",
    date: "Autumn / Winter 2026",
    readTime: "6 min read",
    excerpt: "Stripping color from a garment strips away nostalgia. In monochrome, form, weight, and silhouette achieve their purest state.",
    image: editorial1,
    author: "Elena Vance — Head of Atelier",
    featured: true,
  },
  {
    id: "ai-in-haute-couture",
    title: "Algorithmic Precision in Silhouette Curation: The AI Stylist Paradigm",
    category: "AI & Fashion",
    date: "Late 2026 Edition",
    readTime: "5 min read",
    excerpt: "How vector embeddings and color harmony models analyze personal proportion to recommend timeless monochrome wardrobes.",
    image: editorial2,
    author: "Dr. Julian Thorne — Lead AI Architect",
    featured: true,
  },
  {
    id: "mongolian-cashmere-origins",
    title: "Grade-A Cashmere: The Journey from High-Altitude Steppes to Unbroken Lines",
    category: "Materials",
    date: "Winter 2026",
    readTime: "8 min read",
    excerpt: "Double-brushed for a weightless hand, Mongolian raw cashmere defines our quiet luxury philosophy.",
    image: catKnitwear,
    author: "Kaito Tanaka — Material Specialist",
  },
  {
    id: "layering-heavy-outerwear",
    title: "Proportion, Tension, and Movement: Layering Heavy Virgin Wool",
    category: "Styling",
    date: "Autumn 2026",
    readTime: "4 min read",
    excerpt: "Mastering the interplay between structured shoulders, long belted lines, and draped silk trousers.",
    image: catOuterwear,
    author: "Marcella Rossi — Senior Stylist",
  },
  {
    id: "atelier-07-manifesto",
    title: "Maison Noir Stories: Inside the Secret Atelier 07 Prototype Vault",
    category: "Maison Noir Stories",
    date: "Archive Release",
    readTime: "7 min read",
    excerpt: "A rare glance behind closed doors at our experimental zero-waste tailoring and hand-stitched seams.",
    image: editorial3,
    author: "Editorial Desk",
  },
  {
    id: "tactile-restraint",
    title: "Tactile Restraint: The Art of Subtle Weave Texture in Dark Palette",
    category: "Materials",
    date: "Winter 2026",
    readTime: "5 min read",
    excerpt: "When color is constant, texture becomes the voice. Tropical wool, heavy twill, and brushed mohair.",
    image: editorial4,
    author: "Elena Vance",
  },
];

const CATEGORIES: ArticleCategory[] = [
  "All",
  "Fashion",
  "Styling",
  "Materials",
  "AI & Fashion",
  "Maison Noir Stories",
];

function JournalPage() {
  const [activeCategory, setActiveCategory] = useState<ArticleCategory>("All");

  const filteredArticles = activeCategory === "All" 
    ? ARTICLES 
    : ARTICLES.filter(a => a.category === activeCategory);

  const featuredArticles = ARTICLES.filter(a => a.featured);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SmoothScroll />
      <CustomCursor />
      <Nav solid />

      <main className="pt-28 pb-24">
        {/* Editorial Header */}
        <section className="edge py-12 md:py-20 border-b border-border">
          <div className="max-w-4xl">
            <p className="eyebrow mb-4">Maison Noir Archive Journal</p>
            <RevealText
              text="PERSPECTIVES ON FORM, MATERIAL & ALGORITHMIC BEAUTY."
              className="display-xl tracking-tighter font-light leading-[0.95]"
            />
            <p className="mt-8 text-base md:text-lg text-muted-foreground font-light max-w-2xl leading-relaxed">
              Curated essays on monochrome minimalism, haute couture craftsmanship, tactile materials, and the intersection of artificial intelligence and personal style.
            </p>
          </div>
        </section>

        {/* Featured Editorial Hero Grid */}
        <section className="edge py-16 border-b border-border">
          <p className="eyebrow mb-8">Featured Editorial</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {featuredArticles.map((article) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group cursor-pointer flex flex-col justify-between"
              >
                <div className="overflow-hidden bg-muted aspect-16/10 mb-6">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 label-xs text-muted-foreground mb-3">
                    <span className="uppercase tracking-widest text-foreground font-medium">{article.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-light tracking-tight group-hover:underline underline-offset-4 decoration-foreground/40 leading-snug">
                    {article.title}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2 font-light leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="mt-5 flex items-center gap-2 label-xs tracking-wider text-foreground">
                    <span>Read Article</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Category Filters */}
        <section className="edge py-8 sticky top-[72px] z-40 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`label-xs px-5 py-2.5 whitespace-nowrap transition-colors border ${
                  activeCategory === cat
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Article Catalog Grid */}
        <section className="edge py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredArticles.map((article) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="group flex flex-col justify-between border border-border/60 hover:border-foreground/40 transition-colors p-5"
              >
                <div>
                  <div className="overflow-hidden bg-muted aspect-4/3 mb-5">
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center justify-between label-xs text-muted-foreground mb-3">
                    <span className="uppercase tracking-widest text-foreground/80 font-medium">{article.category}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="text-lg font-light tracking-tight leading-snug group-hover:underline underline-offset-4 decoration-foreground/30">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-3 font-light leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between label-xs text-muted-foreground">
                  <span>{article.author}</span>
                  <span>{article.date}</span>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* AI Stylist Editorial Banner */}
        <section className="edge py-16">
          <div className="bg-ink text-background p-10 md:p-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 border border-foreground/20">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 label-xs text-background/60 mb-3">
                <Sparkles className="w-4 h-4 text-background" />
                <span>AI Personal Curation</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extralight tracking-tight text-background">
                Experience Bespoke Monochrome Styling
              </h2>
              <p className="mt-4 text-sm text-background/70 font-light leading-relaxed">
                Allow our proprietary neural engine to synthesize your proportions, occasion, and aesthetic preferences into a cohesive, high-fashion wardrobe.
              </p>
            </div>
            <Link
              to="/stylist"
              className="label-xs bg-background text-foreground px-8 py-4 tracking-widest uppercase hover:bg-background/90 transition-colors flex items-center gap-3 shrink-0"
            >
              <span>Consult AI Stylist</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

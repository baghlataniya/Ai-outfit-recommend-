import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { Preloader } from "@/components/site/Preloader";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { FeaturedCollection } from "@/components/site/FeaturedCollection";
import { AIStylist } from "@/components/site/AIStylist";
import { TrendingCategories } from "@/components/site/TrendingCategories";
import { BestSellers } from "@/components/site/BestSellers";
import { EditorialScroll } from "@/components/site/EditorialScroll";
import { Philosophy } from "@/components/site/Philosophy";
import { Gallery } from "@/components/site/Gallery";
import { Newsletter } from "@/components/site/Newsletter";
import { Footer } from "@/components/site/Footer";

const TITLE = "Maison Noir — AI-Styled Monochrome Fashion";
const DESCRIPTION =
  "A monochrome wardrobe cut for permanence. Explore the AW26 collection and compose your look with a personal AI stylist.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-background"
    >
      <Preloader />
      <SmoothScroll />
      <CustomCursor />
      <Nav />
      <Hero />
      <FeaturedCollection />
      <AIStylist />
      <TrendingCategories />
      <BestSellers />
      <EditorialScroll />
      <Philosophy />
      <Gallery />
      <Newsletter />
      <Footer />
    </motion.main>
  );
}

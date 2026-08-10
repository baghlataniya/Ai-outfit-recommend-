import { motion } from "framer-motion";
import editorialVideo from "@/assets/editorial.mp4.asset.json";
import { MagneticButton } from "./MagneticButton";
import { RevealText } from "./RevealText";

const STEPS = [
  { n: "01", t: "Read your silhouette", d: "Proportion, fit preference and the pieces you already own." },
  { n: "02", t: "Compose the look", d: "Layered combinations built from a single monochrome palette." },
  { n: "03", t: "Refine endlessly", d: "Ask for a colder cut, a heavier weight, a longer line." },
];

export function AIStylist() {
  return (
    <section id="stylist" className="grain relative overflow-hidden bg-ink text-background">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-25 grayscale"
        src={editorialVideo.url}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-ink/55" />

      <div className="edge relative grid gap-16 py-28 md:py-40 lg:grid-cols-2 lg:items-end">
        <div>
          <p className="eyebrow mb-8 text-background/50">02 — Intelligence</p>
          <RevealText as="h2" className="display-lg">
            Your Personal
            <br />
            AI Stylist
          </RevealText>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-background/70">
            A quiet intelligence trained on decades of tailoring. It studies proportion the way an
            atelier does — then dresses you accordingly.
          </p>
          <MagneticButton className="mt-10 bg-background text-ink hover:bg-background/85">
            Begin a consultation
          </MagneticButton>
        </div>

        <ul className="space-y-px">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ x: 8 }}
              className="border-t border-background/15 py-7 last:border-b"
            >
              <div className="flex gap-8">
                <span className="label-xs pt-1 text-background/40">{s.n}</span>
                <div>
                  <h3 className="text-lg font-light tracking-tight">{s.t}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-background/60">{s.d}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
const COLUMNS = [
  { title: "Shop", links: ["Outerwear", "Knitwear", "Tailoring", "Accessories"] },
  { title: "Maison", links: ["Philosophy", "Ateliers", "Sustainability", "Careers"] },
  { title: "Client care", links: ["Shipping", "Returns", "Repairs", "Contact"] },
];

export function Footer() {
  return (
    <footer className="grain bg-ink text-background">
      <div className="edge py-20 md:py-24">
        <div className="grid gap-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="label-xs tracking-[0.4em]">MAISON&nbsp;NOIR</p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-background/55">
              A monochrome wardrobe, cut for permanence.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="label-xs mb-5 text-background/45">{col.title}</h2>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#top"
                      className="link-underline text-sm text-background/80 hover:text-background"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-background/12 pt-8">
          <p className="label-xs text-background/40">© {new Date().getFullYear()} Maison Noir</p>
          <p className="label-xs text-background/40">Paris — Milan — Tokyo</p>
        </div>
      </div>
    </footer>
  );
}
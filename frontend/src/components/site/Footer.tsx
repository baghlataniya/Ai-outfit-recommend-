import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="grain bg-ink text-background">
      <div className="edge py-20 md:py-24">
        <div className="grid gap-14 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <p className="label-xs tracking-[0.4em]">MAISON&nbsp;NOIR</p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-background/55">
              A monochrome wardrobe, cut for permanence.
            </p>
            <p className="mt-4 text-xs text-background/40 font-mono">
              PARIS — MILAN — TOKYO — NEW YORK
            </p>
          </div>

          <nav aria-label="Shop">
            <h2 className="label-xs mb-5 text-background/45 uppercase tracking-widest">Shop</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="link-underline text-sm text-background/80 hover:text-background">
                  All Collections
                </Link>
              </li>
              <li>
                <Link to="/category/$slug" params={{ slug: "outerwear" }} className="link-underline text-sm text-background/80 hover:text-background">
                  Outerwear
                </Link>
              </li>
              <li>
                <Link to="/category/$slug" params={{ slug: "knitwear" }} className="link-underline text-sm text-background/80 hover:text-background">
                  Knitwear
                </Link>
              </li>
              <li>
                <Link to="/category/$slug" params={{ slug: "tailoring" }} className="link-underline text-sm text-background/80 hover:text-background">
                  Tailoring
                </Link>
              </li>
              <li>
                <Link to="/category/$slug" params={{ slug: "shoes" }} className="link-underline text-sm text-background/80 hover:text-background">
                  Shoes & Footwear
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Experience & Editorial">
            <h2 className="label-xs mb-5 text-background/45 uppercase tracking-widest">Editorial & AI</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/stylist" className="link-underline text-sm text-background/80 hover:text-background">
                  AI Stylist
                </Link>
              </li>
              <li>
                <Link to="/journal" className="link-underline text-sm text-background/80 hover:text-background">
                  Journal
                </Link>
              </li>
              <li>
                <Link to="/search" className="link-underline text-sm text-background/80 hover:text-background">
                  Archive Search
                </Link>
              </li>
              <li>
                <Link to="/journal" className="link-underline text-sm text-background/80 hover:text-background">
                  About Maison Noir
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Client Services">
            <h2 className="label-xs mb-5 text-background/45 uppercase tracking-widest">Client Services</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/profile" className="link-underline text-sm text-background/80 hover:text-background">
                  Member Profile
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="link-underline text-sm text-background/80 hover:text-background">
                  Concierge Alerts
                </Link>
              </li>
              <li>
                <Link to="/cart" className="link-underline text-sm text-background/80 hover:text-background">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="link-underline text-sm text-background/80 hover:text-background">
                  Wishlist Archive
                </Link>
              </li>
              <li>
                <a href="mailto:concierge@maisonnoir.com" className="link-underline text-sm text-background/80 hover:text-background">
                  Contact Client Care
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Social & Legal">
            <h2 className="label-xs mb-5 text-background/45 uppercase tracking-widest">Social & Legal</h2>
            <ul className="space-y-3">
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="link-underline text-sm text-background/80 hover:text-background">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="link-underline text-sm text-background/80 hover:text-background">
                  Pinterest
                </a>
              </li>
              <li>
                <Link to="/journal" className="link-underline text-sm text-background/80 hover:text-background">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/journal" className="link-underline text-sm text-background/80 hover:text-background">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-background/12 pt-8">
          <p className="label-xs text-background/40">© {new Date().getFullYear()} Maison Noir Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 label-xs text-background/40">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Cookies</span>
            <span>EUR (€)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
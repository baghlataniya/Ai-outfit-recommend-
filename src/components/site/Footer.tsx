import { Link } from "@tanstack/react-router";

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

          <nav aria-label="Shop">
            <h2 className="label-xs mb-5 text-background/45">Shop Archive</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="link-underline text-sm text-background/80 hover:text-background">
                  All Products
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

          <nav aria-label="Account">
            <h2 className="label-xs mb-5 text-background/45">Client Care</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/profile" className="link-underline text-sm text-background/80 hover:text-background">
                  Member Profile
                </Link>
              </li>
              <li>
                <Link to="/profile" className="link-underline text-sm text-background/80 hover:text-background">
                  Order Tracking
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
                  Saved Archive
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Experience">
            <h2 className="label-xs mb-5 text-background/45">Experience</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/stylist" className="link-underline text-sm text-background/80 hover:text-background">
                  AI Stylist Curation
                </Link>
              </li>
              <li>
                <Link to="/stylist/results" className="link-underline text-sm text-background/80 hover:text-background">
                  Bespoke Recommendations
                </Link>
              </li>
              <li>
                <Link to="/search" className="link-underline text-sm text-background/80 hover:text-background">
                  Archive Search
                </Link>
              </li>
              <li>
                <Link to="/login" className="link-underline text-sm text-background/80 hover:text-background">
                  Member Sign In
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-background/12 pt-8">
          <p className="label-xs text-background/40">© {new Date().getFullYear()} Maison Noir</p>
          <p className="label-xs text-background/40">Paris — Milan — Tokyo</p>
        </div>
      </div>
    </footer>
  );
}
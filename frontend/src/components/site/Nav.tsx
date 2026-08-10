import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { User, LogOut, Package, Sparkles, Settings, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "@/components/shop/SearchOverlay";
import { useCartStore, useWishlistStore } from "@/hooks/useCommerce";
import { useUserStore } from "@/hooks/useUserStore";
import { useNotificationStore } from "@/hooks/useNotificationStore";

type NavLink = { label: string; to?: string; params?: Record<string, string>; href?: string };

const LINKS: NavLink[] = [
  { label: "Shop", to: "/shop" },
  { label: "AI Stylist", to: "/stylist" },
  { label: "Journal", to: "/journal" },
  { label: "Women", to: "/category/$slug", params: { slug: "women" } },
  { label: "Men", to: "/category/$slug", params: { slug: "men" } },
  { label: "Shoes", to: "/category/$slug", params: { slug: "shoes" } },
  { label: "Accessories", to: "/category/$slug", params: { slug: "accessories" } },
];

function NavItem({ link, onClick, className }: { link: NavLink; onClick?: () => void; className?: string }) {
  if (link.to) {
    return (
      <Link to={link.to} params={link.params as never} onClick={onClick} className={className}>
        {link.label}
      </Link>
    );
  }
  return (
    <a href={link.href} onClick={onClick} className={className}>
      {link.label}
    </a>
  );
}

export function Nav({ solid = false }: { solid?: boolean }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const { cartCount } = useCartStore();
  const { wishlistCount } = useWishlistStore();
  const { isAuthenticated, user, logout, openAuthModal } = useUserStore();
  const { unreadCount } = useNotificationStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close account dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProtectedClick = (e: React.MouseEvent, path: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openAuthModal({ redirectUrl: path });
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "edge fixed inset-x-0 top-0 z-900 transition-[background-color,backdrop-filter,border-color,padding] duration-700",
          scrolled || solid
            ? "border-b border-foreground/10 bg-background/70 py-4 backdrop-blur-xl"
            : "border-b border-transparent py-7",
        )}
      >
        <nav
          className={cn(
            "flex items-center justify-between transition-colors duration-700",
            scrolled || solid ? "text-foreground" : "text-background",
          )}
          aria-label="Primary"
        >
          <Link to="/" className="label-xs tracking-[0.4em]">
            MAISON&nbsp;NOIR
          </Link>

          <ul className="hidden items-center gap-10 lg:flex">
            {LINKS.map((l) => (
              <li key={l.label}>
                <NavItem link={l} className="label-xs link-underline opacity-80 hover:opacity-100" />
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setSearchOpen(true)}
              className="label-xs link-underline cursor-pointer bg-transparent border-none text-current"
              aria-label="Open search"
            >
              Search
            </button>

            <Link
              to="/notifications"
              onClick={(e) => handleProtectedClick(e, "/notifications")}
              className="label-xs link-underline relative"
            >
              Alerts {unreadCount > 0 && <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground ml-0.5" />}
            </Link>

            <Link
              to="/wishlist"
              onClick={(e) => handleProtectedClick(e, "/wishlist")}
              className="label-xs link-underline"
            >
              Wishlist ({wishlistCount})
            </Link>

            <Link
              to="/cart"
              onClick={(e) => handleProtectedClick(e, "/cart")}
              className="label-xs link-underline"
            >
              Bag ({cartCount})
            </Link>

            {/* Account / Sign In */}
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="label-xs border border-current px-3 py-1.5 hover:bg-foreground hover:text-background transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{user?.firstName ?? "Account"}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                <AnimatePresence>
                  {accountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-background border border-border text-foreground shadow-xl p-2 z-50 space-y-1"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                      >
                        <User className="h-3.5 w-3.5" />
                        <span>Member Profile</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                      >
                        <Package className="h-3.5 w-3.5" />
                        <span>Order History</span>
                      </Link>

                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-muted transition-colors font-semibold"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        search={{ tab: "outfits" }}
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Saved AI Outfits</span>
                      </Link>

                      <Link
                        to="/profile"
                        search={{ tab: "settings" }}
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        <span>Settings</span>
                      </Link>

                      <div className="border-t border-border my-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setAccountMenuOpen(false);
                            navigate({ to: "/" });
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="label-xs border border-current px-3.5 py-1.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="flex h-4 w-6 flex-col justify-between md:hidden"
            >
              <span className="h-px w-full bg-current" />
              <span className="h-px w-full bg-current" />
              <span className="h-px w-full bg-current" />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="edge fixed inset-0 z-950 flex flex-col justify-between bg-ink py-7 text-background"
          >
            <div className="flex items-center justify-between">
              <span className="label-xs tracking-[0.4em]">MAISON&nbsp;NOIR</span>
              <button onClick={() => setOpen(false)} className="label-xs bg-transparent border-none text-current cursor-pointer">
                Close
              </button>
            </div>

            <ul className="space-y-6">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <NavItem
                    link={l}
                    onClick={() => setOpen(false)}
                    className="display-md block hover:opacity-70"
                  />
                </li>
              ))}
              {!isAuthenticated && (
                <li>
                  <button
                    onClick={() => {
                      setOpen(false);
                      openAuthModal();
                    }}
                    className="display-md block hover:opacity-70 text-left cursor-pointer"
                  >
                    Sign In / Join
                  </button>
                </li>
              )}
            </ul>

            <div className="flex items-center justify-between border-t border-background/15 pt-6 text-xs text-background/60">
              <span>Paris — Milan — Tokyo</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
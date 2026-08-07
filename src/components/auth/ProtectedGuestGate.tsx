import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useUserStore } from "@/hooks/useUserStore";

interface ProtectedGuestGateProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  redirectPath: string;
}

export function ProtectedGuestGate({
  children,
  title,
  subtitle,
  redirectPath,
}: ProtectedGuestGateProps) {
  const { isAuthenticated, openAuthModal } = useUserStore();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="edge py-28 md:py-36 min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full border border-border bg-background p-10 text-center space-y-6 shadow-xl"
      >
        <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center mx-auto text-foreground">
          <Lock className="h-5 w-5" strokeWidth={1.4} />
        </div>

        <div>
          <p className="eyebrow mb-2">Member Archive Access</p>
          <h1 className="display-sm">{title}</h1>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">{subtitle}</p>
        </div>

        <div className="pt-4 space-y-3">
          <button
            onClick={() => openAuthModal({ redirectUrl: redirectPath })}
            className="label-xs w-full h-12 bg-foreground text-background flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <span>Sign In or Join Maison Noir</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <Link
            to="/shop"
            className="label-xs w-full h-11 border border-border flex items-center justify-center text-foreground hover:border-foreground transition-colors"
          >
            Browse Public Catalog
          </Link>
        </div>

        <p className="text-[11px] text-muted-foreground/70 border-t border-border pt-4">
          All your saved items, bag, and preferences sync seamlessly after authentication.
        </p>
      </motion.div>
    </div>
  );
}

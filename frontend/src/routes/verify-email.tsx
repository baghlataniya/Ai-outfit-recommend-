import { useEffect, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, RefreshCcw, Mail } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { commerceApi } from "@/lib/api";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || "",
    };
  },
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = useSearch({ from: "/verify-email" });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "expired" | "invalid">("invalid");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setStatus("invalid");
      setMessage("No verification token was provided in the URL.");
      return;
    }

    let isMounted = true;

    async function doVerify() {
      try {
        const res = await commerceApi.verifyEmail(token);
        if (!isMounted) return;
        setLoading(false);
        setStatus("success");
        setMessage(res.message || "Your email address has been verified.");
        toast.success("Email verified!");
      } catch (err: any) {
        if (!isMounted) return;
        setLoading(false);
        if (err.error === "TOKEN_EXPIRED") {
          setStatus("expired");
          setMessage("Your email verification link has expired. Please request a new verification link.");
        } else {
          setStatus("invalid");
          setMessage(err.message || "Invalid or already used verification token.");
        }
      }
    }

    doVerify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    setResending(true);
    try {
      const res = await commerceApi.resendVerification(resendEmail);
      setResending(false);
      setResendSent(true);
      toast.success("Verification link dispatched.");
    } catch (err: any) {
      setResending(false);
      toast.error(err.message || "Failed to resend verification email.");
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-background min-h-screen flex flex-col justify-between"
    >
      <SmoothScroll />
      <CustomCursor />
      <Nav solid />

      <section className="edge flex-1 flex items-center justify-center py-28 md:py-36">
        <div className="w-full max-w-md">
          {loading ? (
            <div className="border border-border bg-background p-12 text-center">
              <div className="mx-auto mb-6 h-10 w-10 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
              <p className="eyebrow mb-2">Verification In Progress</p>
              <h2 className="display-sm tracking-tight">Verifying Email...</h2>
            </div>
          ) : status === "success" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border bg-background p-8 text-center"
            >
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-foreground/5 text-foreground">
                <CheckCircle2 className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <p className="eyebrow mb-2">Account Authenticated</p>
              <h2 className="display-sm tracking-tight mb-4">Email Verified</h2>
              <p className="text-xs leading-relaxed text-muted-foreground mb-8">
                {message}
              </p>
              <div className="space-y-3">
                <Link
                  to="/profile"
                  className="label-xs block w-full bg-foreground text-background py-3.5 text-center"
                >
                  My Account Profile
                </Link>
                <Link
                  to="/shop"
                  className="label-xs block w-full border border-border py-3 text-center hover:border-foreground"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border bg-background p-8 text-center"
            >
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <AlertCircle className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <p className="eyebrow mb-2 text-amber-500">
                {status === "expired" ? "Link Expired" : "Verification Error"}
              </p>
              <h2 className="display-sm tracking-tight mb-4">
                {status === "expired" ? "Link Expired" : "Invalid Token"}
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground mb-8">
                {message}
              </p>

              {resendSent ? (
                <div className="p-4 border border-foreground/20 bg-foreground/5 text-xs text-foreground mb-6">
                  If an unverified account exists for <strong>{resendEmail}</strong>, a new link has been dispatched to your inbox.
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-4 mb-6 text-left">
                  <label htmlFor="resendEmail" className="label-xs text-foreground block">
                    Resend Verification Email
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="resendEmail"
                      type="email"
                      required
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 h-11 border border-border bg-background px-3 text-xs tracking-wide text-foreground focus:border-foreground focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={resending}
                      className="label-xs px-4 h-11 bg-foreground text-background whitespace-nowrap cursor-pointer hover:bg-foreground/90 disabled:opacity-50"
                    >
                      {resending ? "Sending..." : "Resend Link"}
                    </button>
                  </div>
                </form>
              )}

              <Link
                to="/login"
                className="label-xs block w-full text-muted-foreground hover:text-foreground py-2 text-center"
              >
                Return to Sign In
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </motion.main>
  );
}

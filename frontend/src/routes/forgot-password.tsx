import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { commerceApi } from "@/lib/api";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await commerceApi.forgotPassword(email);
      setLoading(false);
      setSent(true);
      setMessage(res.message || "If an account with that email exists, we have sent instructions to your inbox.");
      toast.success("Request processed.");
    } catch (err: any) {
      setLoading(false);
      const errorMsg = err.message || "Failed to request password reset.";
      toast.error(errorMsg);
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
          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border bg-background p-8 text-center"
            >
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-foreground/5 text-foreground">
                <CheckCircle2 className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <p className="eyebrow mb-2">Instructions Dispatched</p>
              <h2 className="display-sm tracking-tight mb-4">Check Your Inbox</h2>
              <p className="text-xs leading-relaxed text-muted-foreground mb-8">
                {message}
              </p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="label-xs block w-full bg-foreground text-background py-3.5 text-center"
                >
                  Return to Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="label-xs block w-full text-muted-foreground hover:text-foreground py-2 text-center"
                >
                  Try another email address
                </button>
              </div>
            </motion.div>
          ) : (
            <div>
              {/* Header */}
              <div className="text-center mb-10">
                <p className="eyebrow mb-3">Account Security</p>
                <h1 className="display-md tracking-tight">Recover Access</h1>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Enter your registered email address below. We will send a secure link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="label-xs text-foreground block">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@maisonnoir.com"
                    className="w-full h-12 border border-border bg-background px-4 text-sm tracking-wide text-foreground placeholder:text-muted-foreground/50 transition-colors duration-300 focus:border-foreground focus:outline-none"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  type="submit"
                  className="label-xs w-full h-13 bg-foreground text-background flex items-center justify-center gap-3 cursor-pointer transition-opacity disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-background border-t-transparent animate-spin" />
                      <span>Sending reset link...</span>
                    </div>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </motion.button>
              </form>

              <div className="mt-8 text-center">
                <Link to="/login" className="label-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </motion.main>
  );
}

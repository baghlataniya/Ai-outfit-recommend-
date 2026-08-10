import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { useUserStore } from "@/hooks/useUserStore";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useUserStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Specific Error Banner States
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [googleAccountOnly, setGoogleAccountOnly] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountNotFound(false);
    setGoogleAccountOnly(false);
    setErrorMessage("");

    if (!email || !password) {
      toast.error("Please provide both email and password.");
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toast.success("Welcome back to Maison Noir.");
      navigate({ to: "/profile" });
    } else {
      if (res.code === "GOOGLE_ACCOUNT_ONLY" || res.message?.includes("Google Sign-In")) {
        setGoogleAccountOnly(true);
      } else if (res.code === "ACCOUNT_NOT_FOUND" || res.message?.includes("Account not found")) {
        setAccountNotFound(true);
      } else {
        setErrorMessage(res.message || "Incorrect email or password.");
        toast.error(res.message || "Incorrect email or password.");
      }
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
          {/* Header */}
          <div className="text-center mb-10">
            <p className="eyebrow mb-3">Maison Noir</p>
            <h1 className="display-md tracking-tight">SIGN IN</h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Access your personal wardrobe, order dispatch history, and AI styling recommendations.
            </p>
          </div>

          {/* Google-Only Account Card Banner */}
          <AnimatePresence>
            {googleAccountOnly && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-6 border border-foreground bg-foreground/5 text-foreground space-y-4"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                  <div>
                    <h3 className="label-xs font-semibold tracking-wider uppercase">GOOGLE AUTHENTICATION REQUIRED</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      This account uses Google Sign-In. Please continue with Google.
                    </p>
                  </div>
                </div>

                <GoogleAuthButton text="CONTINUE WITH GOOGLE" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Account Not Found Card Banner */}
          <AnimatePresence>
            {accountNotFound && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-6 border border-foreground bg-foreground/5 text-foreground space-y-4"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                  <div>
                    <h3 className="label-xs font-semibold tracking-wider uppercase">ACCOUNT NOT FOUND</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      We couldn't find a Maison Noir account associated with <span className="text-foreground underline">{email}</span>.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Account not found. Would you like to create one?
                </p>

                <button
                  onClick={() => navigate({ to: "/register" })}
                  type="button"
                  className="label-xs w-full h-11 bg-foreground text-background flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>CREATE ACCOUNT</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generic Inline Error */}
          {errorMessage && !accountNotFound && !googleAccountOnly && (
            <div className="mb-6 p-4 border border-border bg-muted/40 text-xs text-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="label-xs text-foreground block">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (accountNotFound) setAccountNotFound(false);
                    if (googleAccountOnly) setGoogleAccountOnly(false);
                  }}
                  placeholder="name@maisonnoir.com"
                  className="w-full h-12 border border-border bg-background px-4 text-sm tracking-wide text-foreground placeholder:text-muted-foreground/50 transition-colors duration-300 focus:border-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="pass" className="label-xs text-foreground block">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors link-underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="pass"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 border border-border bg-background px-4 pr-12 text-sm tracking-wide text-foreground placeholder:text-muted-foreground/50 transition-colors duration-300 focus:border-foreground focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-none border-border accent-foreground cursor-pointer"
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  Remember this device
                </span>
              </label>
            </div>

            {/* Submit CTA */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="label-xs w-full h-13 bg-foreground text-background flex items-center justify-center gap-3 cursor-pointer transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-background border-t-transparent animate-spin" />
                  <span>Verifying credentials...</span>
                </div>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative bg-background px-4 label-xs text-muted-foreground uppercase">
              or
            </span>
          </div>

          {/* Google Authentication */}
          <GoogleAuthButton text="Continue with Google" />

          {/* Footer Link */}
          <div className="text-center pt-8 border-t border-border mt-8">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-foreground font-semibold tracking-wider link-underline uppercase">
                CREATE ACCOUNT
              </Link>
            </p>
          </div>
        </div>
      </section>
    </motion.main>
  );
}

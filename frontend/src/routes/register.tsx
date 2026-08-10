import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { useUserStore } from "@/hooks/useUserStore";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useUserStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("United States");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      toast.error("Please accept the Maison Noir Terms of Service.");
      return;
    }

    setLoading(true);
    const res = await register({ firstName, lastName, email, phone, country, password });
    setLoading(false);

    if (res.success) {
      toast.success("Welcome to Maison Noir. Account created.");
      navigate({ to: "/profile" });
    } else {
      toast.error(res.message || "Failed to create account.");
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
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="eyebrow mb-3">Maison Noir</p>
            <h1 className="display-md tracking-tight">Create your account</h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Join Noir Circle to access private archive drops, AI outfit curation, and personalized styling services.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="fname" className="label-xs text-foreground block">
                  Name (First) *
                </label>
                <input
                  id="fname"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Elena"
                  className="w-full h-12 border border-border bg-background px-4 text-sm tracking-wide text-foreground placeholder:text-muted-foreground/50 transition-colors duration-300 focus:border-foreground focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lname" className="label-xs text-foreground block">
                  Name (Last) *
                </label>
                <input
                  id="lname"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Vance"
                  className="w-full h-12 border border-border bg-background px-4 text-sm tracking-wide text-foreground placeholder:text-muted-foreground/50 transition-colors duration-300 focus:border-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="label-xs text-foreground block">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena.vance@maisonnoir.com"
                className="w-full h-12 border border-border bg-background px-4 text-sm tracking-wide text-foreground placeholder:text-muted-foreground/50 transition-colors duration-300 focus:border-foreground focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="pass" className="label-xs text-foreground block">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-12 border border-border bg-background px-4 pr-10 text-sm tracking-wide text-foreground placeholder:text-muted-foreground/50 transition-colors duration-300 focus:border-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="cpass" className="label-xs text-foreground block">
                  Confirm Password *
                </label>
                <input
                  id="cpass"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 border border-border bg-background px-4 text-sm tracking-wide text-foreground placeholder:text-muted-foreground/50 transition-colors duration-300 focus:border-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-none border-border accent-foreground cursor-pointer"
                />
                <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                  I agree to the <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>, and consent to receive tailored Maison Noir communications.
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
                  <span>Creating Member Profile...</span>
                </div>
              ) : (
                <>
                  <span>CREATE ACCOUNT</span>
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

          {/* Footer link */}
          <div className="text-center pt-8 border-t border-border mt-8">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-foreground font-semibold tracking-wider link-underline uppercase">
                SIGN IN
              </Link>
            </p>
          </div>
        </div>
      </section>
    </motion.main>
  );
}

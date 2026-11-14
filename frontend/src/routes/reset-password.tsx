import { useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { commerceApi } from "@/lib/api";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || "",
    };
  },
  component: ResetPasswordPage,
});

function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 33, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { score: 66, label: "Medium", color: "bg-amber-500" };
  return { score: 100, label: "Strong", color: "bg-emerald-500" };
}

function ResetPasswordPage() {
  const { token } = useSearch({ from: "/reset-password" });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing from the URL. Please request a new password reset link.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await commerceApi.resetPassword(token, newPassword);
      setLoading(false);
      setSuccess(true);
      toast.success("Password reset successfully.");
    } catch (err: any) {
      setLoading(false);
      const errorMsg = err.message || "Failed to reset password. The link may have expired or already been used.";
      setError(errorMsg);
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
          {!token ? (
            <div className="border border-border bg-background p-8 text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <AlertCircle className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <p className="eyebrow mb-2 text-red-500">Invalid Request</p>
              <h2 className="display-sm tracking-tight mb-4">Missing Token</h2>
              <p className="text-xs leading-relaxed text-muted-foreground mb-8">
                No password reset token was provided in the URL. Please request a new reset link.
              </p>
              <Link
                to="/forgot-password"
                className="label-xs block w-full bg-foreground text-background py-3.5 text-center"
              >
                Request Reset Link
              </Link>
            </div>
          ) : success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border bg-background p-8 text-center"
            >
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-foreground/5 text-foreground">
                <CheckCircle2 className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <p className="eyebrow mb-2">Security Updated</p>
              <h2 className="display-sm tracking-tight mb-4">Password Reset Successfully</h2>
              <p className="text-xs leading-relaxed text-muted-foreground mb-8">
                Your password has been updated. You can now sign in using your new credentials.
              </p>
              <Link
                to="/login"
                className="label-xs block w-full bg-foreground text-background py-3.5 text-center"
              >
                Return to Sign In
              </Link>
            </motion.div>
          ) : (
            <div>
              {/* Header */}
              <div className="text-center mb-10">
                <p className="eyebrow mb-3">Account Security</p>
                <h1 className="display-md tracking-tight">Set New Password</h1>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Enter your new password below to secure your Maison Noir account.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 border border-red-500/30 bg-red-500/5 text-red-500 text-xs leading-relaxed flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{error}</p>
                    <Link to="/forgot-password" className="underline mt-1 block">
                      Request a new password reset link
                    </Link>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="label-xs text-foreground block">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full h-12 border border-border bg-background px-4 pr-12 text-sm tracking-wide text-foreground placeholder:text-muted-foreground/50 transition-colors duration-300 focus:border-foreground focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1 w-full bg-muted overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color}`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground text-right">
                        Strength: {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="label-xs text-foreground block">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
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
                      <span>Updating password...</span>
                    </div>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </motion.button>
              </form>

              <div className="mt-8 text-center">
                <Link to="/login" className="label-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </motion.main>
  );
}

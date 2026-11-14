import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { X, Eye, EyeOff, ArrowRight, AlertCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "@/hooks/useUserStore";
import { GoogleAuthButton } from "./GoogleAuthButton";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register,
  } = useUserStore();

  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error States
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [googleAccountOnly, setGoogleAccountOnly] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAuthModalOpen) return;
    setAccountNotFound(false);
    setGoogleAccountOnly(false);
    setErrorMessage("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeAuthModal();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountNotFound(false);
    setGoogleAccountOnly(false);
    setErrorMessage("");

    if (!signInEmail || !signInPassword) {
      toast.error("Please provide your email and password.");
      return;
    }
    setLoading(true);
    const res = await login(signInEmail, signInPassword);
    setLoading(false);

    if (res.success) {
      toast.success("Welcome back to Maison Noir.");
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountNotFound(false);
    setGoogleAccountOnly(false);
    setErrorMessage("");

    if (!firstName || !lastName || !signUpEmail || !signUpPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (signUpPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      toast.error("Please agree to the Terms & Privacy Policy.");
      return;
    }

    setLoading(true);
    const res = await register({
      firstName,
      lastName,
      email: signUpEmail,
      password: signUpPassword,
    });
    setLoading(false);

    if (res.success) {
      toast.success("Welcome to Maison Noir. Account created.");
    } else {
      setErrorMessage(res.message || "Failed to create account.");
      toast.error(res.message || "Failed to create account.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[990] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-ink/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-md bg-background border border-border p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" strokeWidth={1.4} />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <p className="eyebrow mb-2">Maison Noir Access</p>
            <h2 className="display-sm tracking-tight">
              {mode === "signin" ? "SIGN IN" : "Create your account"}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Create an account or sign in to save your wishlist, shopping bag, AI recommendations, and order history.
            </p>
          </div>

          {/* Google Account Required Banner */}
          {googleAccountOnly && mode === "signin" && (
            <div className="mb-6 p-4 border border-foreground bg-foreground/5 text-foreground space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-foreground" />
                <span className="label-xs font-bold tracking-wider uppercase">GOOGLE AUTHENTICATION REQUIRED</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This account uses Google Sign-In. Please continue with Google.
              </p>
              <GoogleAuthButton text="CONTINUE WITH GOOGLE" onSuccess={closeAuthModal} />
            </div>
          )}

          {/* Account Not Found Banner */}
          {accountNotFound && mode === "signin" && (
            <div className="mb-6 p-4 border border-foreground bg-foreground/5 text-foreground space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-foreground" />
                <span className="label-xs font-bold tracking-wider uppercase">ACCOUNT NOT FOUND</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Account not found. Would you like to create one?
              </p>
              <button
                onClick={() => {
                  setSignUpEmail(signInEmail);
                  setMode("signup");
                  setAccountNotFound(false);
                }}
                type="button"
                className="label-xs w-full h-10 bg-foreground text-background flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>CREATE ACCOUNT</span>
              </button>
            </div>
          )}

          {errorMessage && !accountNotFound && !googleAccountOnly && (
            <div className="mb-4 p-3 border border-border bg-muted/40 text-xs text-foreground flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setAccountNotFound(false);
                setGoogleAccountOnly(false);
                setErrorMessage("");
              }}
              className={`flex-1 py-3 text-xs font-medium tracking-wide transition-colors cursor-pointer border-b-2 ${
                mode === "signin"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setAccountNotFound(false);
                setGoogleAccountOnly(false);
                setErrorMessage("");
              }}
              className={`flex-1 py-3 text-xs font-medium tracking-wide transition-colors cursor-pointer border-b-2 ${
                mode === "signup"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form Content */}
          {mode === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="label-xs text-muted-foreground block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => {
                    setSignInEmail(e.target.value);
                    if (accountNotFound) setAccountNotFound(false);
                    if (googleAccountOnly) setGoogleAccountOnly(false);
                  }}
                  placeholder="name@maisonnoir.com"
                  className="w-full h-11 border border-border bg-background px-3.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-foreground focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="label-xs text-muted-foreground">Password</label>
                  <Link
                    to="/forgot-password"
                    onClick={() => closeAuthModal()}
                    className="text-[11px] text-muted-foreground hover:text-foreground link-underline cursor-pointer"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 border border-border bg-background px-3.5 pr-10 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 accent-foreground cursor-pointer"
                  />
                  <span className="text-[11px] text-muted-foreground">Remember me</span>
                </label>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="label-xs w-full h-12 bg-foreground text-background flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <div className="h-3.5 w-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </motion.button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <span className="relative bg-background px-3 label-xs text-muted-foreground uppercase">
                  or
                </span>
              </div>

              <GoogleAuthButton text="Continue with Google" onSuccess={closeAuthModal} />
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="label-xs text-muted-foreground block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Elena"
                    className="w-full h-11 border border-border bg-background px-3.5 text-xs focus:border-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="label-xs text-muted-foreground block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Vance"
                    className="w-full h-11 border border-border bg-background px-3.5 text-xs focus:border-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="label-xs text-muted-foreground block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="elena.vance@maisonnoir.com"
                  className="w-full h-11 border border-border bg-background px-3.5 text-xs focus:border-foreground focus:outline-none"
                />
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="label-xs text-muted-foreground block mb-1">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 border border-border bg-background px-3.5 text-xs focus:border-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="label-xs text-muted-foreground block mb-1">Confirm</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 border border-border bg-background px-3.5 text-xs focus:border-foreground focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 accent-foreground cursor-pointer"
                />
                <span className="text-[11px] text-muted-foreground leading-tight">
                  I agree to the Terms & Privacy Policy
                </span>
              </label>

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="label-xs w-full h-12 bg-foreground text-background flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <div className="h-3.5 w-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>CREATE ACCOUNT</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </motion.button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <span className="relative bg-background px-3 label-xs text-muted-foreground uppercase">
                  or
                </span>
              </div>

              <GoogleAuthButton text="Continue with Google" onSuccess={closeAuthModal} />
            </form>
          )}

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-[11px] text-muted-foreground">
              Your saved items and preferences will sync across all your devices.
            </p>
            <button
              onClick={closeAuthModal}
              className="label-xs text-muted-foreground hover:text-foreground mt-3 link-underline cursor-pointer"
            >
              Continue Browsing as Guest
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

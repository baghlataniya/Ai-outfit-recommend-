import { useState, useEffect, useCallback, useRef } from "react";
import { useUserStore } from "@/hooks/useUserStore";
import { toast } from "sonner";

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  className?: string;
  text?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

/**
 * Production Google OAuth 2.0 Authorization Code Flow.
 *
 * Click → backend returns Google consent URL → popup opens →
 * Google account chooser → callback → JWT via postMessage → logged in.
 */
export function GoogleAuthButton({
  onSuccess,
  onError,
  className = "",
  text = "Continue with Google",
}: GoogleAuthButtonProps) {
  const { loginWithOAuthToken } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  // Clear error state after a few seconds
  useEffect(() => {
    if (errorState) {
      const timer = setTimeout(() => setErrorState(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorState]);

  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      if (!event.data || event.data.type !== "MAISON_NOIR_GOOGLE_AUTH") return;

      const { success, token, error } = event.data;

      if (success && token) {
        const result = await loginWithOAuthToken(token);
        setLoading(false);

        if (result.success) {
          toast.success("Welcome to Maison Noir.");
          onSuccess?.();
        } else {
          setErrorState(true);
          toast.error(result.message || "Authentication failed. Please try again.");
          onError?.(result.message || "Authentication failed.");
        }
      } else {
        setLoading(false);
        setErrorState(true);
        console.error("[Maison Noir] Google OAuth error:", error);
        toast.error("Google Sign-In is temporarily unavailable. Please try again later.");
        onError?.("Google Sign-In unavailable");
      }
    },
    [loginWithOAuthToken, onSuccess, onError]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [handleMessage]);

  const handleClick = async () => {
    if (loading) return;
    setErrorState(false);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/google/url`);
      const data = await response.json();

      if (!data.success || !data.data?.url) {
        setLoading(false);
        setErrorState(true);
        console.error("[Maison Noir] Google OAuth not configured:", data.message);
        toast.error("Google Sign-In is temporarily unavailable. Please try again later.");
        onError?.("Google Sign-In unavailable");
        return;
      }

      // Open Google's account chooser in a centered popup
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.data.url,
        "maison-noir-google-auth",
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes`
      );

      if (!popup || popup.closed) {
        setLoading(false);
        setErrorState(true);
        toast.error("Please allow popups for this site to sign in with Google.");
        onError?.("Popup blocked");
        return;
      }

      popupRef.current = popup;

      // Detect if user closes the popup without completing authentication
      pollTimerRef.current = window.setInterval(() => {
        if (!popupRef.current || popupRef.current.closed) {
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
          popupRef.current = null;
          setLoading(false);
        }
      }, 500);
    } catch (err) {
      setLoading(false);
      setErrorState(true);
      console.error("[Maison Noir] Google OAuth request failed:", err);
      toast.error("Google Sign-In is temporarily unavailable. Please try again later.");
      onError?.("Google Sign-In unavailable");
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`label-xs w-full h-12 border bg-background text-foreground flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
          errorState
            ? "border-red-400/60 hover:border-red-400"
            : "border-border hover:border-foreground hover:bg-muted/30"
        } ${className}`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
            <span>Connecting to Google...</span>
          </div>
        ) : (
          <>
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
            </svg>
            <span>{text}</span>
          </>
        )}
      </button>

      {/* Brief customer-friendly error — no developer details */}
      {errorState && (
        <p className="text-xs text-red-400 text-center animate-pulse">
          Google Sign-In is temporarily unavailable. Please try again later.
        </p>
      )}
    </div>
  );
}

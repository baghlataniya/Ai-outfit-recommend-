import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { api, getAuthToken, setAuthToken } from "@/lib/api";

export type Address = {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

export type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  memberSince: string;
  points: number;
  tier: string;
  avatar?: string;
  role?: "user" | "admin";
  authProvider?: "local" | "google";
};

const mapBackendUser = (u: any): UserProfile => ({
  id: u._id || u.id || "usr_maison",
  firstName: u.firstName || "",
  lastName: u.lastName || "",
  email: u.email || "",
  phone: u.phone || "",
  country: u.country || "United States",
  memberSince: u.createdAt
    ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Member",
  points: u.points || 500,
  tier: u.role === "admin" ? "Maison Admin" : "Noir Circle",
  avatar: u.avatar || "",
  role: u.role || "user",
  authProvider: u.authProvider || "local",
});

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: "addr_1",
    name: "Elena Vance",
    street: "740 Park Avenue, Apt 14B",
    city: "New York",
    state: "NY",
    zip: "10021",
    country: "United States",
    isDefault: true,
  },
];

const DEFAULT_PAYMENTS: PaymentMethod[] = [
  {
    id: "pay_1",
    brand: "American Express",
    last4: "8902",
    expMonth: "12",
    expYear: "28",
    isDefault: true,
  },
];

const ADDR_KEY = "maison-noir-addresses";
const PAY_KEY = "maison-noir-payments";

export type AuthIntent = {
  redirectUrl?: string;
  action?: () => void;
} | null;

export interface AuthResult {
  success: boolean;
  message?: string;
  code?: string;
}

interface UserContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  isAuthModalOpen: boolean;
  authModalIntent: AuthIntent;
  openAuthModal: (intent?: AuthIntent) => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<AuthResult>;
  loginWithGoogle: (credential: string) => Promise<AuthResult>;
  loginWithOAuthToken: (token: string) => Promise<AuthResult>;
  register: (data: Partial<UserProfile> & { password?: string }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<AuthResult>;
  addAddress: (addr: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  addPaymentMethod: (pm: Omit<PaymentMethod, "id">) => void;
  removePaymentMethod: (id: string) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENTS);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalIntent, setAuthModalIntent] = useState<AuthIntent>(null);

  // Restore session from token on page load
  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get<{ user: any }>("/auth/me");
      if (res.success && res.data?.user) {
        setUser(mapBackendUser(res.data.user));
        setIsAuthenticated(true);
      } else {
        // Token is invalid or expired
        setAuthToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    if (typeof window !== "undefined") {
      try {
        const storedAddr = window.localStorage.getItem(ADDR_KEY);
        const storedPay = window.localStorage.getItem(PAY_KEY);
        if (storedAddr) setAddresses(JSON.parse(storedAddr));
        if (storedPay) setPaymentMethods(JSON.parse(storedPay));
      } catch (e) {
        console.error("Error loading stored addresses/payments:", e);
      }
    }
  }, [refreshUser]);

  const openAuthModal = (intent?: AuthIntent) => {
    setAuthModalIntent(intent ?? null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalIntent(null);
  };

  const handlePostAuth = () => {
    if (authModalIntent) {
      if (authModalIntent.action) {
        authModalIntent.action();
      }
      if (authModalIntent.redirectUrl && typeof window !== "undefined") {
        window.location.href = authModalIntent.redirectUrl;
      }
    } else if (typeof window !== "undefined") {
      if (window.location.pathname === "/login" || window.location.pathname === "/register") {
        window.location.href = "/profile";
      }
    }
    closeAuthModal();
  };

  const login = async (email: string, pass: string): Promise<AuthResult> => {
    try {
      const res = await api.post<{ user: any; token: string }>("/auth/login", {
        email,
        password: pass,
      });

      if (res.success && res.data?.token && res.data?.user) {
        setAuthToken(res.data.token);
        setUser(mapBackendUser(res.data.user));
        setIsAuthenticated(true);

        window.dispatchEvent(new Event("user-auth-changed"));
        handlePostAuth();
        return { success: true, message: res.message || "Login successful" };
      }

      return {
        success: false,
        message: res.message || "Invalid email or password.",
        code: res.error || (res.message === "ACCOUNT NOT FOUND" ? "ACCOUNT_NOT_FOUND" : undefined),
      };
    } catch (err) {
      return { success: false, message: (err as Error).message || "An error occurred during login." };
    }
  };

  const loginWithGoogle = async (credential: string): Promise<AuthResult> => {
    try {
      const res = await api.post<{ user: any; token: string }>("/auth/google", { credential });

      if (res.success && res.data?.token && res.data?.user) {
        setAuthToken(res.data.token);
        setUser(mapBackendUser(res.data.user));
        setIsAuthenticated(true);

        window.dispatchEvent(new Event("user-auth-changed"));
        handlePostAuth();
        return { success: true, message: "Google authentication successful" };
      }

      return { success: false, message: res.message || "Google authentication failed." };
    } catch (err) {
      return { success: false, message: (err as Error).message || "An error occurred during Google authentication." };
    }
  };

  const loginWithOAuthToken = async (token: string): Promise<AuthResult> => {
    try {
      setAuthToken(token);
      const res = await api.get<{ user: any }>("/auth/me");

      if (res.success && res.data?.user) {
        setUser(mapBackendUser(res.data.user));
        setIsAuthenticated(true);
        window.dispatchEvent(new Event("user-auth-changed"));
        handlePostAuth();
        return { success: true, message: "Google authentication successful" };
      }

      // Token was invalid
      setAuthToken(null);
      return { success: false, message: "Authentication failed. Please try again." };
    } catch (err) {
      setAuthToken(null);
      return { success: false, message: (err as Error).message || "An error occurred during authentication." };
    }
  };

  const register = async (data: Partial<UserProfile> & { password?: string }): Promise<AuthResult> => {
    try {
      const res = await api.post<{ user: any; token: string }>("/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        avatar: data.avatar,
      });

      if (res.success && res.data?.token && res.data?.user) {
        setAuthToken(res.data.token);
        setUser(mapBackendUser(res.data.user));
        setIsAuthenticated(true);

        window.dispatchEvent(new Event("user-auth-changed"));
        handlePostAuth();
        return { success: true, message: res.message || "Account created successfully" };
      }

      return { success: false, message: res.message || "Failed to create account." };
    } catch (err) {
      return { success: false, message: (err as Error).message || "An error occurred during registration." };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout backend network errors
    } finally {
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
      window.dispatchEvent(new Event("user-auth-changed"));
    }
  };

  const updateProfile = async (patch: Partial<UserProfile>): Promise<AuthResult> => {
    try {
      const res = await api.patch<{ user: any }>("/auth/profile", patch);

      if (res.success && res.data?.user) {
        setUser(mapBackendUser(res.data.user));
        return { success: true, message: "Profile updated successfully" };
      }

      return { success: false, message: res.message || "Failed to update profile." };
    } catch (err) {
      return { success: false, message: (err as Error).message || "An error occurred while updating profile." };
    }
  };

  const addAddress = (addr: Omit<Address, "id">) => {
    const next: Address = { ...addr, id: `addr_${Date.now().toString(36)}` };
    const list = next.isDefault
      ? addresses.map((a) => ({ ...a, isDefault: false }))
      : [...addresses];
    const updated = [next, ...list];
    setAddresses(updated);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ADDR_KEY, JSON.stringify(updated));
    }
  };

  const removeAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ADDR_KEY, JSON.stringify(updated));
    }
  };

  const addPaymentMethod = (pm: Omit<PaymentMethod, "id">) => {
    const next: PaymentMethod = { ...pm, id: `pay_${Date.now().toString(36)}` };
    const list = next.isDefault
      ? paymentMethods.map((p) => ({ ...p, isDefault: false }))
      : [...paymentMethods];
    const updated = [next, ...list];
    setPaymentMethods(updated);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PAY_KEY, JSON.stringify(updated));
    }
  };

  const removePaymentMethod = (id: string) => {
    const updated = paymentMethods.filter((p) => p.id !== id);
    setPaymentMethods(updated);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PAY_KEY, JSON.stringify(updated));
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      addresses,
      paymentMethods,
      isAuthModalOpen,
      authModalIntent,
      openAuthModal,
      closeAuthModal,
      login,
      loginWithGoogle,
      loginWithOAuthToken,
      register,
      logout,
      updateProfile,
      addAddress,
      removeAddress,
      addPaymentMethod,
      removePaymentMethod,
      refreshUser,
    }),
    [user, isAuthenticated, loading, addresses, paymentMethods, isAuthModalOpen, authModalIntent, refreshUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserStore() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserStore must be used within a UserProvider");
  }
  return context;
}

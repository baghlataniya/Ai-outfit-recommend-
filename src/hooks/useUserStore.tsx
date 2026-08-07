import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

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
};

const DEFAULT_USER: UserProfile = {
  id: "usr_maison_01",
  firstName: "Elena",
  lastName: "Vance",
  email: "elena.vance@maisonnoir.com",
  phone: "+1 (555) 234-8901",
  country: "United States",
  memberSince: "November 2024",
  points: 1240,
  tier: "Noir Circle",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
};

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
  {
    id: "addr_2",
    name: "Elena Vance",
    street: "Via Montenapoleone 8",
    city: "Milan",
    state: "MI",
    zip: "20121",
    country: "Italy",
    isDefault: false,
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
  {
    id: "pay_2",
    brand: "Visa Black Card",
    last4: "4111",
    expMonth: "09",
    expYear: "27",
    isDefault: false,
  },
];

const USER_KEY = "maison-noir-user";
const AUTH_KEY = "maison-noir-auth";
const ADDR_KEY = "maison-noir-addresses";
const PAY_KEY = "maison-noir-payments";

export type AuthIntent = {
  redirectUrl?: string;
  action?: () => void;
} | null;

interface UserContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  isAuthModalOpen: boolean;
  authModalIntent: AuthIntent;
  openAuthModal: (intent?: AuthIntent) => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => boolean;
  register: (data: Partial<UserProfile> & { password?: string }) => boolean;
  logout: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  addAddress: (addr: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  addPaymentMethod: (pm: Omit<PaymentMethod, "id">) => void;
  removePaymentMethod: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENTS);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalIntent, setAuthModalIntent] = useState<AuthIntent>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = window.localStorage.getItem(USER_KEY);
        const storedAuth = window.localStorage.getItem(AUTH_KEY);
        const storedAddr = window.localStorage.getItem(ADDR_KEY);
        const storedPay = window.localStorage.getItem(PAY_KEY);

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedAuth !== null) {
          setIsAuthenticated(storedAuth === "true");
        } else {
          // Default to authenticated with demo user for easy exploration, but allow logout
          setIsAuthenticated(true);
        }
        if (storedAddr) setAddresses(JSON.parse(storedAddr));
        if (storedPay) setPaymentMethods(JSON.parse(storedPay));
      } catch (e) {
        console.error("Error loading user store:", e);
      }
    }
  }, []);

  const saveUser = (u: UserProfile | null, auth: boolean) => {
    setUser(u);
    setIsAuthenticated(auth);
    if (typeof window !== "undefined") {
      if (u) window.localStorage.setItem(USER_KEY, JSON.stringify(u));
      else window.localStorage.removeItem(USER_KEY);
      window.localStorage.setItem(AUTH_KEY, String(auth));
    }
  };

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
    }
    closeAuthModal();
  };

  const login = (email: string) => {
    const namePart = email.split("@")[0] || "Member";
    const loggedInUser: UserProfile = {
      ...DEFAULT_USER,
      email,
      firstName: namePart.charAt(0).toUpperCase() + namePart.slice(1),
    };
    saveUser(loggedInUser, true);
    handlePostAuth();
    return true;
  };

  const register = (data: Partial<UserProfile> & { password?: string }) => {
    const newUser: UserProfile = {
      id: `usr_${Date.now().toString(36)}`,
      firstName: data.firstName || "New",
      lastName: data.lastName || "Member",
      email: data.email || "user@maisonnoir.com",
      phone: data.phone || "+1 (555) 000-0000",
      country: data.country || "United States",
      memberSince: "Today",
      points: 200, // Welcome bonus
      tier: "Noir Circle",
    };
    saveUser(newUser, true);
    handlePostAuth();
    return true;
  };

  const logout = () => {
    saveUser(null, false);
  };

  const updateProfile = (patch: Partial<UserProfile>) => {
    if (!user) return;
    const next = { ...user, ...patch };
    saveUser(next, isAuthenticated);
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
      addresses,
      paymentMethods,
      isAuthModalOpen,
      authModalIntent,
      openAuthModal,
      closeAuthModal,
      login,
      register,
      logout,
      updateProfile,
      addAddress,
      removeAddress,
      addPaymentMethod,
      removePaymentMethod,
    }),
    [user, isAuthenticated, addresses, paymentMethods, isAuthModalOpen, authModalIntent]
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

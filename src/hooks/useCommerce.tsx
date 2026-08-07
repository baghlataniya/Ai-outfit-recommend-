import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { products as catalogProducts, type Product } from "@/lib/catalog";

const genLineId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export type CartItem = {
  lineId: string; // stable UUID for React keys
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  outfitId?: string;
};

// ==========================================
// 1. PRODUCT STORE
// ==========================================
interface ProductContextType {
  products: Product[];
  recentlyViewed: Product[];
  addToRecentlyViewed: (productId: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const RECENTLY_VIEWED_KEY = "maison-noir-recently-viewed";

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const viewedIds = JSON.parse(window.localStorage.getItem(RECENTLY_VIEWED_KEY) ?? "[]") as string[];
        const mapped = viewedIds.map(id => catalogProducts.find(p => p.id === id)).filter(Boolean) as Product[];
        setRecentlyViewed(mapped);
      } catch (e) {
        console.error("Error loading recently viewed products:", e);
      }
    }
  }, []);

  const addToRecentlyViewed = (productId: string) => {
    setRecentlyViewed((current) => {
      const filtered = current.filter(p => p.id !== productId);
      const target = catalogProducts.find(p => p.id === productId);
      if (!target) return current;
      const next = [target, ...filtered].slice(0, 8); // Keep last 8
      if (typeof window !== "undefined") {
        window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next.map(p => p.id)));
      }
      return next;
    });
  };

  const value = useMemo(() => ({
    products: catalogProducts,
    recentlyViewed,
    addToRecentlyViewed,
  }), [recentlyViewed]);

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProductStore() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProductStore must be used within a ProductProvider");
  }
  return context;
}


// ==========================================
// 2. WISHLIST STORE
// ==========================================
interface WishlistContextType {
  wishlist: string[];
  wishlistProducts: Product[];
  wishlistCount: number;
  toggleWishlist: (productId: string) => void;
  isWished: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_KEY = "maison-noir-wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(WISHLIST_KEY);
        if (raw) {
          setWishlist(JSON.parse(raw));
        }
      } catch (e) {
        console.error("Error loading wishlist state:", e);
      }
    }
  }, []);

  const toggleWishlist = (productId: string) => {
    const next = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    setWishlist(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("wishlist-updated"));
    }
  };

  const isWished = (productId: string) => {
    return wishlist.includes(productId);
  };

  const wishlistProducts = useMemo(() => {
    return catalogProducts.filter(p => wishlist.includes(p.id));
  }, [wishlist]);

  const wishlistCount = useMemo(() => wishlist.length, [wishlist]);

  const value = useMemo(() => ({
    wishlist,
    wishlistProducts,
    wishlistCount,
    toggleWishlist,
    isWished,
  }), [wishlist, wishlistProducts, wishlistCount]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlistStore() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlistStore must be used within a WishlistProvider");
  }
  return context;
}


// ==========================================
// 3. CART STORE
// ==========================================
interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  savedLater: Product[];
  addToCart: (productId: string, quantity?: number, size?: string, color?: string, outfitId?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string, outfitId?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string, outfitId?: string) => void;
  updateCartItem: (
    lineId: string,
    patch: { size?: string; color?: string; quantity?: number }
  ) => void;
  saveForLater: (productId: string, size?: string, color?: string, outfitId?: string) => void;
  moveToCart: (productId: string, size?: string, color?: string) => void;
  removeSavedLater: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "maison-noir-cart";
const LATER_KEY = "maison-noir-save-later";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedLater, setSavedLater] = useState<Product[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const rawCart = window.localStorage.getItem(CART_KEY);
        if (rawCart) {
          // Migrate older items that lack a lineId
          const parsed: CartItem[] = JSON.parse(rawCart);
          const migrated = parsed.map((item) =>
            item.lineId ? item : { ...item, lineId: genLineId() }
          );
          setCart(migrated);
        }
        const rawLater = window.localStorage.getItem(LATER_KEY);
        if (rawLater) {
          const ids = JSON.parse(rawLater) as string[];
          const mapped = ids.map(id => catalogProducts.find(p => p.id === id)).filter(Boolean) as Product[];
          setSavedLater(mapped);
        }
      } catch (e) {
        console.error("Error loading cart/saved later state:", e);
      }
    }
  }, []);

  const saveCartState = (nextCart: CartItem[]) => {
    setCart(nextCart);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CART_KEY, JSON.stringify(nextCart));
      window.dispatchEvent(new Event("cart-updated"));
    }
  };

  const saveLaterState = (nextLater: Product[]) => {
    setSavedLater(nextLater);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LATER_KEY, JSON.stringify(nextLater.map(p => p.id)));
    }
  };

  const addToCart = (productId: string, quantity = 1, size?: string, color?: string, outfitId?: string) => {
    const next = [...cart];
    const existing = next.findIndex(
      (item) =>
        item.productId === productId &&
        item.size === size &&
        item.color === color &&
        item.outfitId === outfitId
    );

    if (existing >= 0) {
      next[existing] = {
        ...next[existing],
        quantity: next[existing].quantity + quantity,
      };
    } else {
      next.push({ lineId: genLineId(), productId, quantity, size, color, outfitId });
    }
    saveCartState(next);
  };

  const removeFromCart = (productId: string, size?: string, color?: string, outfitId?: string) => {
    const next = cart.filter(
      (item) =>
        !(
          item.productId === productId &&
          item.size === size &&
          item.color === color &&
          item.outfitId === outfitId
        )
    );
    saveCartState(next);
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
    outfitId?: string
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color, outfitId);
      return;
    }
    const next = cart.map((item) =>
      item.productId === productId &&
      item.size === size &&
      item.color === color &&
      item.outfitId === outfitId
        ? { ...item, quantity }
        : item
    );
    saveCartState(next);
  };

  /**
   * Atomically update size, color, and/or quantity of a specific cart line.
   * Identified by lineId so the update is always unambiguous.
   * If size+color change creates a duplicate line, quantities are merged.
   */
  const updateCartItem = (
    lineId: string,
    patch: { size?: string; color?: string; quantity?: number }
  ) => {
    const next = [...cart];
    const oldIdx = next.findIndex((item) => item.lineId === lineId);
    if (oldIdx < 0) return;

    const oldItem = next[oldIdx];
    const newSize = patch.size ?? oldItem.size;
    const newColor = patch.color ?? oldItem.color;
    const newQuantity = Math.max(1, patch.quantity ?? oldItem.quantity);

    // Check if another line already has the same product+size+color combo
    const mergeIdx = next.findIndex(
      (item, i) =>
        i !== oldIdx &&
        item.productId === oldItem.productId &&
        item.size === newSize &&
        item.color === newColor &&
        item.outfitId === oldItem.outfitId
    );

    if (mergeIdx >= 0) {
      // Merge: absorb old quantity into the existing line, remove old line
      next[mergeIdx] = { ...next[mergeIdx], quantity: next[mergeIdx].quantity + newQuantity };
      next.splice(oldIdx, 1);
    } else {
      // Update in place — keep same lineId for stable React key
      next[oldIdx] = { ...oldItem, size: newSize, color: newColor, quantity: newQuantity };
    }

    saveCartState(next);
  };

  const saveForLater = (productId: string, size?: string, color?: string, outfitId?: string) => {
    // Add to saved later list
    const target = catalogProducts.find(p => p.id === productId);
    if (target && !savedLater.some(p => p.id === productId)) {
      saveLaterState([target, ...savedLater]);
    }
    // Remove from cart
    removeFromCart(productId, size, color, outfitId);
  };

  const moveToCart = (productId: string, size?: string, color?: string) => {
    // Remove from saved later list
    saveLaterState(savedLater.filter(p => p.id !== productId));
    // Add to cart
    addToCart(productId, 1, size || "M", color || "Black");
  };

  const removeSavedLater = (productId: string) => {
    saveLaterState(savedLater.filter(p => p.id !== productId));
  };

  const clearCart = () => {
    saveCartState([]);
  };

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const value = useMemo(() => ({
    cart,
    cartCount,
    savedLater,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateCartItem,
    saveForLater,
    moveToCart,
    removeSavedLater,
    clearCart,
  }), [cart, cartCount, savedLater]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartStore() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartStore must be used within a CartProvider");
  }
  return context;
}


import { UserProvider } from "./useUserStore";
import { OrderProvider } from "./useOrderStore";
import { NotificationProvider } from "./useNotificationStore";
import { SavedOutfitsProvider } from "./useSavedOutfitsStore";

// ==========================================
// UNIFIED WRAPPER PROVIDER FOR ROOT COMPONENT
// ==========================================
export function CommerceProvider({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ProductProvider>
        <WishlistProvider>
          <CartProvider>
            <OrderProvider>
              <NotificationProvider>
                <SavedOutfitsProvider>
                  {children}
                </SavedOutfitsProvider>
              </NotificationProvider>
            </OrderProvider>
          </CartProvider>
        </WishlistProvider>
      </ProductProvider>
    </UserProvider>
  );
}

// Deprecated unified hook, but kept for compatibility or fallback
export function useCommerce() {
  const product = useProductStore();
  const wishlist = useWishlistStore();
  const cart = useCartStore();

  return useMemo(() => ({
    ...product,
    ...wishlist,
    ...cart,
  }), [product, wishlist, cart]);
}

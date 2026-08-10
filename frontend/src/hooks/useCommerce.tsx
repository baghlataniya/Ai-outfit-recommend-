import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { products as catalogProducts, type Product } from "@/lib/catalog";
import { commerceApi, getAuthToken } from "@/lib/api";

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

export type CartSummary = {
  subtotal: number;
  delivery: number;
  tax: number;
  total: number;
  itemCount: number;
};

const mapBackendProduct = (p: any): Product => {
  const matchInCatalog = catalogProducts.find(
    (c) => c.id === p.slug || c.id === p._id || c.name?.toLowerCase() === p.name?.toLowerCase()
  );

  const priceVal = typeof p.price === "number" ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 100;
  const image = matchInCatalog?.image || p.images?.[0] || p.thumbnail || "/assets/product-1.jpg";
  const hoverImage = matchInCatalog?.hoverImage || p.images?.[1] || image;
  const gallery = matchInCatalog?.gallery || (p.images?.length > 0 ? p.images : [image, hoverImage]);
  const sizeList = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : (matchInCatalog?.sizes || ["One Size"]);
  const colorList = Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : (matchInCatalog?.colors || ["Black"]);

  return {
    id: p._id ? p._id.toString() : p.slug || p.id,
    name: p.name || matchInCatalog?.name || "Maison Product",
    category: p.category || matchInCatalog?.category || "Outerwear",
    price: `$${priceVal.toLocaleString("en-US")}`,
    priceValue: priceVal,
    image,
    hoverImage,
    gallery,
    tag: p.isNew ? "New" : p.isFeatured ? "Featured" : matchInCatalog?.tag,
    gender: p.gender || matchInCatalog?.gender || "Unisex",
    occasion: p.occasion || matchInCatalog?.occasion || "Casual",
    style: p.style || matchInCatalog?.style || "Minimal",
    season: p.season || matchInCatalog?.season || "All Season",
    color: colorList[0],
    brand: p.brand || matchInCatalog?.brand || "Maison Noir",
    sizes: sizeList,
    sizeVariants: sizeList.map((value: string, idx: number) => ({
      value,
      stock: p.stock ? Math.max(1, Math.floor(p.stock / sizeList.length)) : 5,
    })),
    colors: colorList,
    rating: p.rating || matchInCatalog?.rating || 4.8,
    reviews: p.reviewCount || matchInCatalog?.reviews || 45,
    aiMatch: p.aiMatch || matchInCatalog?.aiMatch || 90,
    isNew: !!p.isNew,
    inStock: p.stock > 0,
    bestSeller: !!p.isFeatured,
    description: p.description || matchInCatalog?.description || "",
    addedIndex: 1,
  };
};

// ==========================================
// 1. PRODUCT STORE
// ==========================================
interface ProductContextType {
  products: Product[];
  recentlyViewed: Product[];
  addToRecentlyViewed: (productId: string) => void;
  getProductByIdOrSlug: (idOrSlug: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const RECENTLY_VIEWED_KEY = "maison-noir-recently-viewed";

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [productList, setProductList] = useState<Product[]>(catalogProducts);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch real MongoDB products on mount
    commerceApi
      .getProducts({ limit: 100 })
      .then((res) => {
        if (res.success && res.data?.products && res.data.products.length > 0) {
          const mapped = res.data.products.map(mapBackendProduct);
          setProductList(mapped);
        }
      })
      .catch((err) => {
        console.error("Failed to load products from API, using catalog fallback:", err);
      });

    if (typeof window !== "undefined") {
      try {
        const viewedIds = JSON.parse(window.localStorage.getItem(RECENTLY_VIEWED_KEY) ?? "[]") as string[];
        const mapped = viewedIds
          .map((id) => catalogProducts.find((p) => p.id === id))
          .filter(Boolean) as Product[];
        setRecentlyViewed(mapped);
      } catch (e) {
        console.error("Error loading recently viewed products:", e);
      }
    }
  }, []);

  const addToRecentlyViewed = (productId: string) => {
    setRecentlyViewed((current) => {
      const filtered = current.filter((p) => p.id !== productId);
      const target = productList.find((p) => p.id === productId) || catalogProducts.find((p) => p.id === productId);
      if (!target) return current;
      const next = [target, ...filtered].slice(0, 8);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next.map((p) => p.id)));
      }
      return next;
    });
  };

  const getProductByIdOrSlug = useCallback(
    (idOrSlug: string): Product | undefined => {
      if (!idOrSlug) return undefined;
      const raw = decodeURIComponent(idOrSlug).trim().toLowerCase();
      return productList.find(
        (p) => p.id.toLowerCase() === raw || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === raw
      ) || catalogProducts.find(
        (p) => p.id.toLowerCase() === raw || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === raw
      );
    },
    [productList]
  );

  const value = useMemo(
    () => ({
      products: productList,
      recentlyViewed,
      addToRecentlyViewed,
      getProductByIdOrSlug,
    }),
    [productList, recentlyViewed, getProductByIdOrSlug]
  );

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
  const { products } = useProductStore();

  const syncWithBackend = useCallback(async (currentLocal: string[]) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await commerceApi.syncWishlist(currentLocal);

      if (res.success && res.data?.productIds) {
        setWishlist(res.data.productIds);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(res.data.productIds));
        }
      }
    } catch (err) {
      console.error("Failed to sync wishlist with backend:", err);
    }
  }, []);

  useEffect(() => {
    let initialList: string[] = [];
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(WISHLIST_KEY);
        if (raw) {
          initialList = JSON.parse(raw);
          setWishlist(initialList);
        }
      } catch (e) {
        console.error("Error loading wishlist state:", e);
      }
    }

    if (getAuthToken()) {
      syncWithBackend(initialList);
    }

    const handleAuthChange = () => {
      const token = getAuthToken();
      if (token) {
        syncWithBackend(wishlist);
      } else {
        setWishlist([]);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(WISHLIST_KEY);
        }
      }
    };

    window.addEventListener("user-auth-changed", handleAuthChange);
    return () => window.removeEventListener("user-auth-changed", handleAuthChange);
  }, [syncWithBackend]);

  const toggleWishlist = async (productId: string) => {
    const next = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    setWishlist(next);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("wishlist-updated"));
    }

    if (getAuthToken()) {
      try {
        const res = await commerceApi.toggleWishlist(productId);
        if (res.success && res.data?.productIds) {
          setWishlist(res.data.productIds);
          window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(res.data.productIds));
        }
      } catch (err) {
        console.error("Failed to toggle wishlist item on backend:", err);
      }
    }
  };

  const isWished = (productId: string) => {
    return wishlist.includes(productId);
  };

  const wishlistProducts = useMemo(() => {
    return products.filter((p) => wishlist.includes(p.id));
  }, [products, wishlist]);

  const wishlistCount = useMemo(() => wishlist.length, [wishlist]);

  const value = useMemo(
    () => ({
      wishlist,
      wishlistProducts,
      wishlistCount,
      toggleWishlist,
      isWished,
    }),
    [wishlist, wishlistProducts, wishlistCount]
  );

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
  summary: CartSummary;
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
  const { products } = useProductStore();

  const syncCartWithBackend = useCallback(async (currentLocal: CartItem[]) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const formattedItems = currentLocal.map((item) => {
        const prod = products.find((p) => p.id === item.productId) || catalogProducts.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          selectedSize: item.size || "M",
          selectedColor: item.color || "Black",
          price: prod?.priceValue || 100,
          image: prod?.image || "",
        };
      });

      const res = await commerceApi.syncCart(formattedItems);
      if (res.success && res.data?.items) {
        const syncedCart: CartItem[] = res.data.items.map((bItem: any) => ({
          lineId: bItem._id || genLineId(),
          productId: bItem.productId ? bItem.productId.toString() : bItem.slug,
          quantity: bItem.quantity,
          size: bItem.selectedSize,
          color: bItem.selectedColor,
        }));

        setCart(syncedCart);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(CART_KEY, JSON.stringify(syncedCart));
        }
      }
    } catch (err) {
      console.error("Failed to sync cart with backend:", err);
    }
  }, [products]);

  useEffect(() => {
    let initialCart: CartItem[] = [];
    if (typeof window !== "undefined") {
      try {
        const rawCart = window.localStorage.getItem(CART_KEY);
        if (rawCart) {
          const parsed: CartItem[] = JSON.parse(rawCart);
          initialCart = parsed.map((item) =>
            item.lineId ? item : { ...item, lineId: genLineId() }
          );
          setCart(initialCart);
        }
        const rawLater = window.localStorage.getItem(LATER_KEY);
        if (rawLater) {
          const ids = JSON.parse(rawLater) as string[];
          const mapped = ids.map(id => products.find(p => p.id === id) || catalogProducts.find(p => p.id === id)).filter(Boolean) as Product[];
          setSavedLater(mapped);
        }
      } catch (e) {
        console.error("Error loading cart/saved later state:", e);
      }
    }

    if (getAuthToken()) {
      syncCartWithBackend(initialCart);
    }

    const handleAuthChange = () => {
      const token = getAuthToken();
      if (token) {
        syncCartWithBackend(cart);
      } else {
        setCart([]);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(CART_KEY);
        }
      }
    };

    window.addEventListener("user-auth-changed", handleAuthChange);
    return () => window.removeEventListener("user-auth-changed", handleAuthChange);
  }, [syncCartWithBackend]);

  const saveCartState = (nextCart: CartItem[]) => {
    setCart(nextCart);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CART_KEY, JSON.stringify(nextCart));
      window.dispatchEvent(new Event("cart-updated"));
    }

    if (getAuthToken()) {
      const formattedItems = nextCart.map((item) => {
        const prod = products.find((p) => p.id === item.productId) || catalogProducts.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          selectedSize: item.size || "M",
          selectedColor: item.color || "Black",
          price: prod?.priceValue || 100,
          image: prod?.image || "",
        };
      });
      commerceApi.updateCart(formattedItems).catch((e) => console.error("Error updating backend cart:", e));
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

    const mergeIdx = next.findIndex(
      (item, i) =>
        i !== oldIdx &&
        item.productId === oldItem.productId &&
        item.size === newSize &&
        item.color === newColor &&
        item.outfitId === oldItem.outfitId
    );

    if (mergeIdx >= 0) {
      next[mergeIdx] = { ...next[mergeIdx], quantity: next[mergeIdx].quantity + newQuantity };
      next.splice(oldIdx, 1);
    } else {
      next[oldIdx] = { ...oldItem, size: newSize, color: newColor, quantity: newQuantity };
    }

    saveCartState(next);
  };

  const saveForLater = (productId: string, size?: string, color?: string, outfitId?: string) => {
    const target = products.find(p => p.id === productId) || catalogProducts.find(p => p.id === productId);
    if (target && !savedLater.some(p => p.id === productId)) {
      saveLaterState([target, ...savedLater]);
    }
    removeFromCart(productId, size, color, outfitId);
  };

  const moveToCart = (productId: string, size?: string, color?: string) => {
    saveLaterState(savedLater.filter(p => p.id !== productId));
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

  const summary = useMemo(() => {
    let subtotal = 0;
    for (const item of cart) {
      const prod = products.find((p) => p.id === item.productId) || catalogProducts.find((p) => p.id === item.productId);
      const itemPrice = prod ? prod.priceValue : 100;
      subtotal += itemPrice * item.quantity;
    }

    const delivery = subtotal > 500 || subtotal === 0 ? 0 : 25;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + delivery + tax;

    return {
      subtotal,
      delivery,
      tax,
      total,
      itemCount: cartCount,
    };
  }, [cart, products, cartCount]);

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      savedLater,
      summary,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateCartItem,
      saveForLater,
      moveToCart,
      removeSavedLater,
      clearCart,
    }),
    [cart, cartCount, savedLater, summary]
  );

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

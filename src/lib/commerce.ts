import { products, type Product } from "@/lib/catalog";

export const WISHLIST_KEY = "maison-noir-wishlist";
export const CART_KEY = "maison-noir-cart";
export const ORDER_KEY = "maison-noir-last-order";
export const SAVED_OUTFITS_KEY = "maison-noir-saved-outfits";

export type CartItem = {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  outfitId?: string;
};

export type OrderRecord = {
  orderNumber: string;
  eta: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getWishlistIds() {
  return readJson<string[]>(WISHLIST_KEY, []);
}

export function setWishlistIds(ids: string[]) {
  writeJson(WISHLIST_KEY, Array.from(new Set(ids)));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("wishlist-updated"));
  }
}

export function toggleWishlistId(id: string) {
  const next = getWishlistIds().includes(id)
    ? getWishlistIds().filter((item) => item !== id)
    : [...getWishlistIds(), id];
  setWishlistIds(next);
  return next;
}

export function getWishlistProducts() {
  const ids = getWishlistIds();
  return ids.map((id) => products.find((product) => product.id === id)).filter(Boolean) as Product[];
}

export function getCartItems() {
  return readJson<CartItem[]>(CART_KEY, []);
}

export function setCartItems(items: CartItem[]) {
  writeJson(CART_KEY, items.filter((item) => item.quantity > 0));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-updated"));
  }
}

export function upsertCartItem(item: CartItem) {
  const items = getCartItems();
  const existing = items.findIndex((entry) => entry.productId === item.productId && entry.size === item.size && entry.color === item.color && entry.outfitId === item.outfitId);
  const next = [...items];
  if (existing >= 0) {
    next[existing] = { ...next[existing], quantity: next[existing].quantity + item.quantity };
  } else {
    next.push(item);
  }
  setCartItems(next);
  return next;
}

export function addProductToCart(productId: string, quantity = 1, size?: string, color?: string, outfitId?: string) {
  return upsertCartItem({ productId, quantity, size, color, outfitId });
}

export function updateCartQuantity(target: CartItem, quantity: number) {
  const next = getCartItems().map((item) =>
    item.productId === target.productId && item.size === target.size && item.color === target.color && item.outfitId === target.outfitId
      ? { ...item, quantity }
      : item,
  );
  setCartItems(next);
  return next;
}

export function removeCartItem(target: CartItem) {
  const next = getCartItems().filter(
    (item) => !(item.productId === target.productId && item.size === target.size && item.color === target.color && item.outfitId === target.outfitId),
  );
  setCartItems(next);
  return next;
}

export function clearCart() {
  setCartItems([]);
}

export function getCartProducts() {
  return getCartItems()
    .map((item) => ({ item, product: products.find((product) => product.id === item.productId) }))
    .filter((entry): entry is { item: CartItem; product: Product } => Boolean(entry.product));
}

export function saveOrder(order: OrderRecord) {
  writeJson(ORDER_KEY, order);
}

export function getOrder() {
  return readJson<OrderRecord | null>(ORDER_KEY, null);
}

export function createOrderNumber() {
  return `MN-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function getSavedOutfitIds() {
  return readJson<string[]>(SAVED_OUTFITS_KEY, []);
}

export function toggleSavedOutfitId(id: string) {
  const next = getSavedOutfitIds().includes(id)
    ? getSavedOutfitIds().filter((item) => item !== id)
    : [...getSavedOutfitIds(), id];
  writeJson(SAVED_OUTFITS_KEY, Array.from(new Set(next)));
  return next;
}
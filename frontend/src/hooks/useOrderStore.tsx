import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { commerceApi, getAuthToken } from "@/lib/api";

export type OrderItem = {
  productId: string;
  productName: string;
  image: string;
  priceAtPurchase: number;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
};

export type OrderTrackingStep = {
  label: string;
  date?: string;
  completed: boolean;
};

export type Order = {
  id: string; // Mongo _id
  orderNumber: string; // MN-2026-000001
  date: string;
  createdAt: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  status: string; // Capitalized or standard status for UI compatibility
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  paymentMethod: string;
  trackingSteps: OrderTrackingStep[];
};

export const mapBackendOrder = (o: any): Order => {
  const status = o.orderStatus || "confirmed";

  const isPending = status === "pending";
  const isConfirmed = ["confirmed", "processing", "shipped", "delivered"].includes(status);
  const isProcessing = ["processing", "shipped", "delivered"].includes(status);
  const isShipped = ["shipped", "delivered"].includes(status);
  const isDelivered = status === "delivered";

  const dateStr = o.createdAt
    ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "Recently";

  return {
    id: o._id ? o._id.toString() : o.id || o.orderNumber,
    orderNumber: o.orderNumber || o._id || "MN-2026-000001",
    date: dateStr,
    createdAt: o.createdAt || new Date().toISOString(),
    paymentStatus: o.paymentStatus || "paid",
    orderStatus: status,
    status: status.charAt(0).toUpperCase() + status.slice(1),
    subtotal: o.subtotal || 0,
    shipping: o.shipping || 0,
    tax: o.tax || 0,
    total: o.total || 0,
    items: (o.items || []).map((item: any) => ({
      productId: item.productId ? (item.productId._id ? item.productId._id.toString() : item.productId.toString()) : "",
      productName: item.productName || item.name || "Maison Product",
      image: item.image || "/assets/product-1.jpg",
      priceAtPurchase: typeof item.priceAtPurchase === "number" ? item.priceAtPurchase : item.price || 0,
      selectedSize: item.selectedSize || item.size || "M",
      selectedColor: item.selectedColor || item.color || "Black",
      quantity: item.quantity || 1,
    })),
    shippingAddress: {
      firstName: o.shippingAddress?.firstName || "",
      lastName: o.shippingAddress?.lastName || "",
      email: o.shippingAddress?.email || "",
      phone: o.shippingAddress?.phone || "",
      address: o.shippingAddress?.address || "",
      city: o.shippingAddress?.city || "",
      state: o.shippingAddress?.state || "",
      postalCode: o.shippingAddress?.postalCode || "",
      country: o.shippingAddress?.country || "India",
    },
    paymentMethod: o.paymentMethod || "Credit Card",
    trackingSteps: [
      { label: "Order Placed", date: dateStr, completed: true },
      { label: "Confirmed", completed: isConfirmed && !isPending },
      { label: "Processing", completed: isProcessing },
      { label: "Shipped", completed: isShipped },
      { label: "Delivered", completed: isDelivered },
    ],
  };
};

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  getOrder: (idOrOrderNumber: string) => Promise<Order | undefined>;
  addOrder: (orderPayload: {
    items: Array<{ productId: string; quantity: number; selectedSize?: string; selectedColor?: string }>;
    shippingAddress: any;
    paymentMethod?: string;
  }) => Promise<{ success: boolean; order?: Order; message?: string }>;
  fetchOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await commerceApi.getOrders();
      if (res.success && res.data?.orders) {
        const mapped = res.data.orders.map(mapBackendOrder);
        setOrders(mapped);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load orders from API:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const handleAuthChange = () => {
      fetchOrders();
    };

    window.addEventListener("user-auth-changed", handleAuthChange);
    return () => window.removeEventListener("user-auth-changed", handleAuthChange);
  }, [fetchOrders]);

  const getOrder = useCallback(
    async (idOrOrderNumber: string): Promise<Order | undefined> => {
      if (!idOrOrderNumber) return undefined;
      const target = orders.find(
        (o) =>
          o.id.toLowerCase() === idOrOrderNumber.toLowerCase() ||
          o.orderNumber.toLowerCase() === idOrOrderNumber.toLowerCase()
      );
      if (target) return target;

      // If not in state, fetch directly from API
      try {
        const res = await commerceApi.getOrder(idOrOrderNumber);
        if (res.success && res.data?.order) {
          const mapped = mapBackendOrder(res.data.order);
          return mapped;
        }
      } catch (err) {
        console.error("Error fetching order detail from API:", err);
      }
      return undefined;
    },
    [orders]
  );

  const addOrder = async (orderPayload: {
    items: Array<{ productId: string; quantity: number; selectedSize?: string; selectedColor?: string }>;
    shippingAddress: any;
    paymentMethod?: string;
  }): Promise<{ success: boolean; order?: Order; message?: string }> => {
    try {
      const res = await commerceApi.createOrder(orderPayload);
      if (res.success && res.data?.order) {
        const mapped = mapBackendOrder(res.data.order);
        setOrders((prev) => [mapped, ...prev]);
        return { success: true, order: mapped, message: res.message };
      }
      return { success: false, message: res.message || "Failed to create order." };
    } catch (err) {
      return { success: false, message: (err as Error).message || "Error connecting to server." };
    }
  };

  const value = useMemo(
    () => ({
      orders,
      loading,
      error,
      getOrder,
      addOrder,
      fetchOrders,
    }),
    [orders, loading, error, getOrder, fetchOrders]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrderStore() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrderStore must be used within an OrderProvider");
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { products, type Product } from "@/lib/catalog";

export type OrderItem = {
  productId: string;
  productName: string;
  image: string;
  price: string;
  priceValue: number;
  size: string;
  color: string;
  quantity: number;
};

export type OrderTrackingStep = {
  label: string;
  date: string;
  completed: boolean;
};

export type Order = {
  id: string;
  date: string;
  status: "Delivered" | "In Transit" | "Processing" | "Returned";
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state?: string;
    zip: string;
    country: string;
  };
  paymentMethod: {
    brand: string;
    last4: string;
  };
  trackingSteps: OrderTrackingStep[];
  deliveredDate?: string;
  trackingNumber?: string;
};

const DEFAULT_ORDERS: Order[] = [
  {
    id: "MN-89241",
    date: "October 14, 2025",
    status: "Delivered",
    subtotal: 1770,
    tax: 141,
    shipping: 0,
    total: 1911,
    deliveredDate: "October 18, 2025",
    trackingNumber: "EXP-908234-US",
    items: [
      {
        productId: "atelier-coat",
        productName: "Atelier Belted Coat",
        image: products[0]?.image ?? "",
        price: "$1,290",
        priceValue: 1290,
        size: "M",
        color: "Black",
        quantity: 1,
      },
      {
        productId: "cloud-knit",
        productName: "Cloud Cashmere Knit",
        image: products[1]?.image ?? "",
        price: "$480",
        priceValue: 480,
        size: "S",
        color: "Soft White",
        quantity: 1,
      },
    ],
    shippingAddress: {
      name: "Elena Vance",
      street: "740 Park Avenue, Apt 14B",
      city: "New York",
      state: "NY",
      zip: "10021",
      country: "United States",
    },
    paymentMethod: {
      brand: "American Express",
      last4: "8902",
    },
    trackingSteps: [
      { label: "Order Placed", date: "Oct 14, 2025 • 10:24 AM", completed: true },
      { label: "Quality Inspection & Atelier Packaging", date: "Oct 14, 2025 • 02:15 PM", completed: true },
      { label: "Dispatched from Paris Dispatch", date: "Oct 15, 2025 • 09:00 AM", completed: true },
      { label: "Customs Clearance Verified", date: "Oct 16, 2025 • 11:30 AM", completed: true },
      { label: "Delivered to Residence", date: "Oct 18, 2025 • 03:45 PM", completed: true },
    ],
  },
  {
    id: "MN-74120",
    date: "January 22, 2026",
    status: "In Transit",
    subtotal: 1540,
    tax: 123,
    shipping: 0,
    total: 1663,
    trackingNumber: "EXP-881290-US",
    items: [
      {
        productId: "monolith-trench",
        productName: "Monolith Trench",
        image: products[3]?.image ?? "",
        price: "$1,540",
        priceValue: 1540,
        size: "L",
        color: "Black",
        quantity: 1,
      },
    ],
    shippingAddress: {
      name: "Elena Vance",
      street: "740 Park Avenue, Apt 14B",
      city: "New York",
      state: "NY",
      zip: "10021",
      country: "United States",
    },
    paymentMethod: {
      brand: "Visa Black Card",
      last4: "4111",
    },
    trackingSteps: [
      { label: "Order Placed", date: "Jan 22, 2026 • 04:12 PM", completed: true },
      { label: "Atelier Packaging Complete", date: "Jan 23, 2026 • 11:00 AM", completed: true },
      { label: "In Transit via Express Courier", date: "Jan 24, 2026 • 08:30 AM", completed: true },
      { label: "Out for Delivery", date: "Estimated Today", completed: false },
      { label: "Delivered", date: "Pending", completed: false },
    ],
  },
];

const ORDERS_KEY = "maison-noir-orders";

interface OrderContextType {
  orders: Order[];
  getOrder: (id: string) => Order | undefined;
  addOrder: (order: Omit<Order, "id">) => Order;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(DEFAULT_ORDERS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(ORDERS_KEY);
        if (raw) {
          setOrders(JSON.parse(raw));
        }
      } catch (e) {
        console.error("Error loading order store:", e);
      }
    }
  }, []);

  const saveOrders = (list: Order[]) => {
    setOrders(list);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
    }
  };

  const getOrder = (id: string) => {
    return orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
  };

  const addOrder = (newOrderData: Omit<Order, "id">) => {
    const id = `MN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      ...newOrderData,
      id,
    };
    const next = [newOrder, ...orders];
    saveOrders(next);
    return newOrder;
  };

  const value = useMemo(
    () => ({
      orders,
      getOrder,
      addOrder,
    }),
    [orders]
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

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  date: string;
  type: "order" | "stock" | "ai" | "promo";
  read: boolean;
  link?: string;
};

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    title: "Order MN-74120 Shipped",
    message: "Your Monolith Trench has been dispatched via Express Courier and is currently in transit.",
    date: "2 hours ago",
    type: "order",
    read: false,
    link: "/profile",
  },
  {
    id: "notif_2",
    title: "AI Outfit Ready",
    message: "Your personalized Autumn Minimalist Capsule collection is curated and ready for review.",
    date: "1 day ago",
    type: "ai",
    read: false,
    link: "/stylist/results",
  },
  {
    id: "notif_3",
    title: "Wishlist Item Back In Stock",
    message: "Cloud Cashmere Knit in Soft White is back in stock in your preferred size S.",
    date: "3 days ago",
    type: "stock",
    read: true,
    link: "/product/cloud-knit",
  },
  {
    id: "notif_4",
    title: "Private Archive Access Unlocked",
    message: "As a Noir Circle member, you have early access to the upcoming High-Summer Atelier drop.",
    date: "5 days ago",
    type: "promo",
    read: true,
    link: "/shop",
  },
];

const NOTIF_KEY = "maison-noir-notifications";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(NOTIF_KEY);
        if (raw) {
          setNotifications(JSON.parse(raw));
        }
      } catch (e) {
        console.error("Error loading notification store:", e);
      }
    }
  }, []);

  const saveNotifications = (list: NotificationItem[]) => {
    setNotifications(list);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAsRead = (id: string) => {
    const next = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(next);
  };

  const markAllAsRead = () => {
    const next = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(next);
  };

  const deleteNotification = (id: string) => {
    const next = notifications.filter((n) => n.id !== id);
    saveNotifications(next);
  };

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    }),
    [notifications, unreadCount]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotificationStore() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotificationStore must be used within a NotificationProvider");
  }
  return context;
}

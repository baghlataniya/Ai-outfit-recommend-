import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trash2, ArrowRight, Sparkles, Package, Tag, Heart } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { useNotificationStore } from "@/hooks/useNotificationStore";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-4 w-4" strokeWidth={1.4} />;
      case "ai":
        return <Sparkles className="h-4 w-4" strokeWidth={1.4} />;
      case "stock":
        return <Heart className="h-4 w-4" strokeWidth={1.4} />;
      case "promo":
        return <Tag className="h-4 w-4" strokeWidth={1.4} />;
      default:
        return <Bell className="h-4 w-4" strokeWidth={1.4} />;
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-background min-h-screen"
    >
      <SmoothScroll />
      <CustomCursor />
      <Nav solid />

      <section className="edge py-28 md:py-36">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-border">
            <div>
              <p className="eyebrow mb-2">Concierge Updates</p>
              <h1 className="display-md">Notifications ({unreadCount} unread)</h1>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  markAllAsRead();
                  toast.success("All notifications marked as read.");
                }}
                className="label-xs link-underline text-muted-foreground cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="border border-border bg-background p-16 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-4" strokeWidth={1.2} />
              <h2 className="display-xs">No Notifications</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-2">
                Your concierge notification center is up to date. Check back for order tracking, back-in-stock alerts, and AI curation updates.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border border border-border bg-background">
              <AnimatePresence initial={false}>
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.25 }}
                    className={`p-6 flex gap-4 transition-colors ${
                      !notif.read ? "bg-muted/30" : "bg-background"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border ${
                        !notif.read ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"
                      }`}
                    >
                      {getIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-medium tracking-tight flex items-center gap-2">
                            {notif.title}
                            {!notif.read && <span className="h-1.5 w-1.5 rounded-full bg-foreground" />}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-1">{notif.message}</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-2">{notif.date}</p>
                        </div>
                        <span className="label-xs text-muted-foreground uppercase">{notif.type}</span>
                      </div>

                      <div className="mt-4 flex items-center gap-6">
                        {notif.link && (
                          <Link
                            to={notif.link as any}
                            onClick={() => markAsRead(notif.id)}
                            className="label-xs link-underline text-foreground inline-flex items-center gap-1.5"
                          >
                            <span>View Details</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="label-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="label-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.2} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </motion.main>
  );
}

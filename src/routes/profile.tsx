import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShoppingBag,
  Heart,
  Sparkles,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  FileText,
  Trash2,
  Plus,
  ArrowRight,
  RefreshCw,
  Bell,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { useUserStore } from "@/hooks/useUserStore";
import { useOrderStore, type Order } from "@/hooks/useOrderStore";
import { useSavedOutfitsStore } from "@/hooks/useSavedOutfitsStore";
import { ProtectedGuestGate } from "@/components/auth/ProtectedGuestGate";
import { useWishlistStore, useCartStore } from "@/hooks/useCommerce";

export const Route = createFileRoute("/profile")({
  component: ProfileDashboardPage,
});

type TabType =
  | "profile"
  | "orders"
  | "saved-outfits"
  | "wishlist"
  | "addresses"
  | "payments"
  | "settings";

function ProfileDashboardPage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, addresses, addAddress, removeAddress, paymentMethods, addPaymentMethod, removePaymentMethod } = useUserStore();
  const { orders, getOrder } = useOrderStore();
  const { savedOutfits, deleteOutfit } = useSavedOutfitsStore();
  const { wishlistProducts } = useWishlistStore();
  const { addToCart } = useCartStore();

  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState(user?.firstName ?? "");
  const [editLastName, setEditLastName] = useState(user?.lastName ?? "");
  const [editPhone, setEditPhone] = useState(user?.phone ?? "");
  const [editCountry, setEditCountry] = useState(user?.country ?? "United States");

  // New Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddrStreet, setNewAddrStreet] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("");
  const [newAddrZip, setNewAddrZip] = useState("");
  const [newAddrCountry, setNewAddrCountry] = useState("United States");

  // Settings state
  const [currency, setCurrency] = useState("USD ($)");
  const [language, setLanguage] = useState("English (US)");
  const [emailNotifs, setEmailNotifs] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success("Signed out safely.");
    navigate({ to: "/" });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      firstName: editFirstName,
      lastName: editLastName,
      phone: editPhone,
      country: editCountry,
    });
    setIsEditingProfile(false);
    toast.success("Profile updated successfully.");
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet || !newAddrCity || !newAddrZip) {
      toast.error("Please fill in all address fields.");
      return;
    }
    addAddress({
      name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`,
      street: newAddrStreet,
      city: newAddrCity,
      state: "NY",
      zip: newAddrZip,
      country: newAddrCountry,
      isDefault: addresses.length === 0,
    });
    setShowAddressModal(false);
    setNewAddrStreet("");
    setNewAddrCity("");
    setNewAddrZip("");
    toast.success("New address added to your profile.");
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(item.productId, item.quantity, item.size, item.color);
    });
    toast.success(`Items from Order #${order.id} added to shopping bag.`);
  };

  const handleAddOutfitToCart = (items: any[]) => {
    items.forEach((item) => {
      addToCart(item.id, 1, item.sizes?.[0] ?? "M", item.colors?.[0] ?? "Black");
    });
    toast.success("Entire AI outfit added to your shopping bag.");
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

      <ProtectedGuestGate
        title="Client Profile & Dashboard"
        subtitle="Sign in to view your member profile, track active orders, view saved AI looks, and update settings."
        redirectPath="/profile"
      >

      <section className="edge py-28 md:py-36">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:items-start">
          {/* Side Navigation Sidebar */}
          <aside className="border border-border bg-background p-6 space-y-8 lg:sticky lg:top-28">
            {/* User Glance Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-border">
              <div className="h-14 w-14 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.firstName} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center font-serif text-lg">
                    {user?.firstName?.charAt(0) ?? "M"}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium tracking-tight truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-foreground" />
                  <span className="label-xs text-muted-foreground">{user?.tier ?? "Noir Circle"}</span>
                </div>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1" aria-label="Profile navigation">
              {[
                { id: "profile" as TabType, label: "Profile Overview", icon: User },
                { id: "orders" as TabType, label: "Order History", icon: ShoppingBag, badge: orders.length },
                { id: "saved-outfits" as TabType, label: "Saved AI Outfits", icon: Sparkles, badge: savedOutfits.length },
                { id: "wishlist" as TabType, label: "Saved Archive", icon: Heart, badge: wishlistProducts.length },
                { id: "addresses" as TabType, label: "Addresses", icon: MapPin },
                { id: "payments" as TabType, label: "Payment Methods", icon: CreditCard },
                { id: "settings" as TabType, label: "Account Settings", icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSelectedOrder(null);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-medium tracking-wide transition-colors cursor-pointer ${
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.4} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          active ? "bg-background text-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-4 border-t border-border mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-3 text-xs font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.4} />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content View */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {/* TAB 1: PROFILE OVERVIEW */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Hero Card */}
                  <div className="border border-border bg-muted/20 p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <p className="eyebrow mb-2">Member Profile</p>
                      <h2 className="display-sm">
                        {user?.firstName} {user?.lastName}
                      </h2>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Member since {user?.memberSince} • {user?.country}
                      </p>
                    </div>
                    <div className="border border-border bg-background p-4 text-center sm:text-right shrink-0">
                      <p className="eyebrow">Maison Loyalty Points</p>
                      <p className="text-2xl font-light tabular-nums mt-1">{user?.points} pts</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{user?.tier} Tier</p>
                    </div>
                  </div>

                  {/* Information Details */}
                  <div className="border border-border bg-background p-8">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                      <h3 className="text-sm font-medium tracking-tight">Personal Details</h3>
                      <button
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="label-xs link-underline text-muted-foreground cursor-pointer"
                      >
                        {isEditingProfile ? "Cancel" : "Edit Profile"}
                      </button>
                    </div>

                    {isEditingProfile ? (
                      <form onSubmit={handleSaveProfile} className="space-y-6 max-w-lg">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="label-xs text-muted-foreground block mb-2">First Name</label>
                            <input
                              type="text"
                              value={editFirstName}
                              onChange={(e) => setEditFirstName(e.target.value)}
                              className="w-full h-11 border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="label-xs text-muted-foreground block mb-2">Last Name</label>
                            <input
                              type="text"
                              value={editLastName}
                              onChange={(e) => setEditLastName(e.target.value)}
                              className="w-full h-11 border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="label-xs text-muted-foreground block mb-2">Phone</label>
                          <input
                            type="tel"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full h-11 border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="label-xs text-muted-foreground block mb-2">Country</label>
                          <input
                            type="text"
                            value={editCountry}
                            onChange={(e) => setEditCountry(e.target.value)}
                            className="w-full h-11 border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="label-xs bg-foreground text-background px-6 py-3 cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </form>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2 text-xs">
                        <div>
                          <p className="label-xs text-muted-foreground">Email Address</p>
                          <p className="mt-1 font-medium">{user?.email}</p>
                        </div>
                        <div>
                          <p className="label-xs text-muted-foreground">Phone</p>
                          <p className="mt-1 font-medium">{user?.phone}</p>
                        </div>
                        <div>
                          <p className="label-xs text-muted-foreground">Country</p>
                          <p className="mt-1 font-medium">{user?.country}</p>
                        </div>
                        <div>
                          <p className="label-xs text-muted-foreground">Membership Status</p>
                          <p className="mt-1 font-medium text-foreground">{user?.tier} (Verified)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: ORDER HISTORY */}
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="eyebrow mb-1">Archive History</p>
                      <h2 className="display-sm">Orders ({orders.length})</h2>
                    </div>
                  </div>

                  {selectedOrder ? (
                    // ORDER DETAILS VIEW
                    <div className="border border-border bg-background p-8 space-y-8">
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="label-xs link-underline text-muted-foreground cursor-pointer inline-flex items-center gap-2 mb-4"
                      >
                        ← Back to Order History
                      </button>

                      <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-border">
                        <div>
                          <p className="eyebrow">Order Summary</p>
                          <h3 className="display-xs mt-1">Order #{selectedOrder.id}</h3>
                          <p className="text-xs text-muted-foreground mt-1">Placed on {selectedOrder.date}</p>
                        </div>
                        <div className="text-right">
                          <span className="label-xs inline-block bg-foreground text-background px-3 py-1">
                            {selectedOrder.status}
                          </span>
                          <p className="text-lg font-light tabular-nums mt-2">${selectedOrder.total.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Tracking Timeline */}
                      <div>
                        <p className="label-xs mb-4">Delivery Timeline</p>
                        <div className="space-y-4 border border-border p-6 bg-muted/20">
                          {selectedOrder.trackingSteps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                              <div
                                className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                                  step.completed
                                    ? "bg-foreground text-background"
                                    : "border border-border text-muted-foreground"
                                }`}
                              >
                                {step.completed ? "✓" : idx + 1}
                              </div>
                              <div>
                                <p className={`text-xs font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                                  {step.label}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{step.date}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <p className="label-xs mb-4">Purchased Pieces</p>
                        <div className="divide-y divide-border border border-border">
                          {selectedOrder.items.map((item, i) => (
                            <div key={i} className="p-4 flex items-center gap-4">
                              <img src={item.image} alt={item.productName} className="h-16 w-12 object-cover bg-muted shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-medium tracking-tight truncate">{item.productName}</h4>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                                </p>
                              </div>
                              <span className="text-xs font-medium tabular-nums">{item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                        <button
                          onClick={() => handleReorder(selectedOrder)}
                          className="label-xs bg-foreground text-background px-6 py-3.5 cursor-pointer"
                        >
                          Buy Entire Order Again
                        </button>
                        <button
                          onClick={() => toast.success(`Downloading official tax invoice for Order #${selectedOrder.id}`)}
                          className="label-xs border border-border px-6 py-3.5 hover:border-foreground transition-colors cursor-pointer"
                        >
                          Download Invoice (PDF)
                        </button>
                      </div>
                    </div>
                  ) : (
                    // ORDER LIST VIEW
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-border bg-background p-6 hover:border-foreground/40 transition-colors"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                            <div>
                              <p className="label-xs text-muted-foreground">Order #{order.id}</p>
                              <p className="text-xs text-muted-foreground mt-1">{order.date}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="label-xs bg-muted px-3 py-1">{order.status}</span>
                              <span className="text-sm font-medium tabular-nums">${order.total.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="py-4 flex flex-wrap gap-4 items-center">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <img src={item.image} alt="" className="h-12 w-10 object-cover bg-muted" />
                                <div className="text-xs">
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-[10px] text-muted-foreground">{item.size} / {item.color}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-4 border-t border-border flex items-center justify-between">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="label-xs link-underline text-foreground cursor-pointer"
                            >
                              Track & View Order Details
                            </button>
                            <button
                              onClick={() => handleReorder(order)}
                              className="label-xs border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                            >
                              Buy Again
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 3: SAVED AI OUTFITS */}
              {activeTab === "saved-outfits" && (
                <motion.div
                  key="saved-outfits"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="eyebrow mb-1">AI Wardrobe Curation</p>
                      <h2 className="display-sm">Saved Outfits ({savedOutfits.length})</h2>
                    </div>
                    <Link to="/stylist" className="label-xs bg-foreground text-background px-5 py-3">
                      + Generate New Look
                    </Link>
                  </div>

                  {savedOutfits.length === 0 ? (
                    <div className="border border-border bg-background p-12 text-center">
                      <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-4" strokeWidth={1.2} />
                      <h3 className="display-xs">No Saved AI Outfits</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-2">
                        You haven't saved any AI outfit recommendations yet. Use the AI Stylist to compose bespoke looks.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {savedOutfits.map((outfit) => (
                        <div key={outfit.id} className="border border-border bg-background p-5 space-y-4">
                          <div className="aspect-4/3 overflow-hidden bg-muted relative">
                            <img src={outfit.heroImage} alt={outfit.name} className="h-full w-full object-cover" />
                            <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 label-xs">
                              {outfit.aiMatch}% AI Match
                            </div>
                          </div>
                          <div>
                            <p className="label-xs text-muted-foreground">{outfit.occasion} • {outfit.weather}</p>
                            <h3 className="text-sm font-medium tracking-tight mt-1">{outfit.name}</h3>
                            <p className="text-[11px] text-muted-foreground mt-1">{outfit.style}</p>
                          </div>

                          <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                            <button
                              onClick={() => handleAddOutfitToCart(outfit.items)}
                              className="label-xs flex-1 bg-foreground text-background py-2.5 text-center cursor-pointer"
                            >
                              Add Entire Look to Bag
                            </button>
                            <button
                              onClick={() => deleteOutfit(outfit.id)}
                              className="p-2 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Delete Outfit"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.4} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 4: WISHLIST */}
              {activeTab === "wishlist" && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="eyebrow mb-1">Archive Collection</p>
                      <h2 className="display-sm">Saved Pieces ({wishlistProducts.length})</h2>
                    </div>
                    <Link to="/wishlist" className="label-xs link-underline">
                      View Full Wishlist Page →
                    </Link>
                  </div>

                  {wishlistProducts.length === 0 ? (
                    <div className="border border-border bg-background p-12 text-center">
                      <Heart className="h-8 w-8 mx-auto text-muted-foreground mb-4" strokeWidth={1.2} />
                      <h3 className="display-xs">No Saved Items</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-2">
                        Explore the shop and tap the heart icon on any piece to save it to your archive.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-3">
                      {wishlistProducts.map((p) => (
                        <div key={p.id} className="border border-border bg-background p-4 flex flex-col justify-between">
                          <div>
                            <img src={p.image} alt={p.name} className="aspect-3/4 object-cover w-full bg-muted mb-3" />
                            <p className="label-xs text-muted-foreground">{p.category}</p>
                            <h4 className="text-xs font-medium tracking-tight mt-1">{p.name}</h4>
                            <p className="text-xs font-light tabular-nums mt-1">{p.price}</p>
                          </div>
                          <Link
                            to="/product/$id"
                            params={{ id: p.id }}
                            className="label-xs block w-full border border-border text-center py-2 mt-4 hover:bg-foreground hover:text-background transition-colors"
                          >
                            View Piece
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 5: ADDRESSES */}
              {activeTab === "addresses" && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="eyebrow mb-1">Dispatch Destinations</p>
                      <h2 className="display-sm">Address Book ({addresses.length})</h2>
                    </div>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="label-xs bg-foreground text-background px-5 py-3 cursor-pointer"
                    >
                      + Add New Address
                    </button>
                  </div>

                  {/* Add address form inline */}
                  {showAddressModal && (
                    <form onSubmit={handleAddAddressSubmit} className="border border-border bg-muted/20 p-6 space-y-4 max-w-lg">
                      <h3 className="text-xs font-medium tracking-tight">New Shipping Address</h3>
                      <div>
                        <label className="label-xs text-muted-foreground block mb-1">Street Address</label>
                        <input
                          type="text"
                          required
                          value={newAddrStreet}
                          onChange={(e) => setNewAddrStreet(e.target.value)}
                          placeholder="e.g. 740 Park Ave"
                          className="w-full h-10 border border-border bg-background px-3 text-xs"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="label-xs text-muted-foreground block mb-1">City</label>
                          <input
                            type="text"
                            required
                            value={newAddrCity}
                            onChange={(e) => setNewAddrCity(e.target.value)}
                            placeholder="New York"
                            className="w-full h-10 border border-border bg-background px-3 text-xs"
                          />
                        </div>
                        <div>
                          <label className="label-xs text-muted-foreground block mb-1">ZIP / Postal Code</label>
                          <input
                            type="text"
                            required
                            value={newAddrZip}
                            onChange={(e) => setNewAddrZip(e.target.value)}
                            placeholder="10021"
                            className="w-full h-10 border border-border bg-background px-3 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="label-xs bg-foreground text-background px-5 py-2.5 cursor-pointer">
                          Save Address
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddressModal(false)}
                          className="label-xs border border-border px-5 py-2.5 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border border-border bg-background p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium">{addr.name}</p>
                          {addr.isDefault && <span className="label-xs bg-foreground text-background px-2 py-0.5">Default</span>}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{addr.street}</p>
                          <p>{addr.city}, {addr.state} {addr.zip}</p>
                          <p>{addr.country}</p>
                        </div>
                        <div className="pt-3 border-t border-border flex justify-end">
                          <button
                            onClick={() => removeAddress(addr.id)}
                            className="label-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            Remove Address
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 6: PAYMENTS */}
              {activeTab === "payments" && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="eyebrow mb-1">Financial Profiles</p>
                      <h2 className="display-sm">Payment Methods ({paymentMethods.length})</h2>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {paymentMethods.map((pm) => (
                      <div key={pm.id} className="border border-border bg-background p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium">{pm.brand}</p>
                          {pm.isDefault && <span className="label-xs bg-foreground text-background px-2 py-0.5">Primary</span>}
                        </div>
                        <p className="text-sm font-mono tracking-widest text-foreground">•••• •••• •••• {pm.last4}</p>
                        <p className="text-xs text-muted-foreground">Expires {pm.expMonth}/{pm.expYear}</p>
                        <div className="pt-3 border-t border-border flex justify-end">
                          <button
                            onClick={() => removePaymentMethod(pm.id)}
                            className="label-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            Remove Card
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 7: SETTINGS */}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="border border-border bg-background p-8 space-y-8 max-w-xl"
                >
                  <div>
                    <p className="eyebrow mb-1">Preferences</p>
                    <h2 className="display-sm">Account Settings</h2>
                  </div>

                  <div className="space-y-6 text-xs">
                    <div>
                      <label className="label-xs text-muted-foreground block mb-2">Preferred Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full h-11 border border-border bg-background px-3 text-xs focus:border-foreground focus:outline-none cursor-pointer"
                      >
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="GBP (£)">GBP (£)</option>
                        <option value="JPY (¥)">JPY (¥)</option>
                      </select>
                    </div>

                    <div>
                      <label className="label-xs text-muted-foreground block mb-2">Preferred Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full h-11 border border-border bg-background px-3 text-xs focus:border-foreground focus:outline-none cursor-pointer"
                      >
                        <option value="English (US)">English (US)</option>
                        <option value="Français">Français</option>
                        <option value="Italiano">Italiano</option>
                        <option value="Japanese">日本語</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Email Dispatch Notifications</p>
                        <p className="text-muted-foreground mt-0.5">Receive notifications for order tracking and AI looks</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailNotifs}
                        onChange={(e) => setEmailNotifs(e.target.checked)}
                        className="h-4 w-4 accent-foreground cursor-pointer"
                      />
                    </div>

                    <div className="pt-6 border-t border-border">
                      <button
                        onClick={() => toast.error("Account deletion requires confirmation via concierge.")}
                        className="label-xs text-red-600 hover:underline cursor-pointer"
                      >
                        Delete Member Account
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
      </ProtectedGuestGate>
    </motion.main>
  );
}

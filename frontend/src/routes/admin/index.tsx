import { useEffect, useState, useMemo } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ShoppingBag,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  CheckCircle2,
  X,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Layers,
  Sparkles,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";
import { useUserStore } from "@/hooks/useUserStore";
import { commerceApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

type AdminTab = "orders" | "products";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useUserStore();

  const [activeTab, setActiveTab] = useState<AdminTab>("orders");

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Outerwear",
    price: 500,
    stock: 10,
    sizes: "S, M, L, XL",
    colors: "Black, Soft White",
    description: "",
    images: "/assets/product-1.jpg",
    isFeatured: false,
    isNew: true,
    isActive: true,
  });

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const params: Record<string, any> = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (orderSearch.trim()) params.search = orderSearch.trim();

      const res = await commerceApi.adminGetOrders(params);
      if (res.success && res.data?.orders) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      toast.error("Failed to fetch admin orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await commerceApi.getProducts({ includeInactive: true, limit: 100 });
      if (res.success && res.data?.products) {
        setProducts(res.data.products);
      }
    } catch (err) {
      toast.error("Failed to fetch admin products.");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      if (activeTab === "orders") fetchOrders();
      if (activeTab === "products") fetchProducts();
    }
  }, [user, activeTab, statusFilter]);

  const handleSearchOrders = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: string, newOrderStatus: string) => {
    try {
      const res = await commerceApi.adminUpdateOrderStatus(orderId, { orderStatus: newOrderStatus });
      if (res.success && res.data?.order) {
        toast.success(`Order #${res.data.order.orderNumber} status updated to ${newOrderStatus}`);
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data.order);
        }
        fetchOrders();
      } else {
        toast.error(res.message || "Failed to update status.");
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      category: "Outerwear",
      price: 500,
      stock: 10,
      sizes: "S, M, L, XL",
      colors: "Black, Soft White",
      description: "Crafted in Milan from Italian virgin wool with double-breasted closure.",
      images: "/assets/product-1.jpg",
      isFeatured: false,
      isNew: true,
      isActive: true,
    });
    setShowProductModal(true);
  };

  const openEditProductModal = (prod: any) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || "",
      category: prod.category || "Outerwear",
      price: prod.price || 100,
      stock: prod.stock ?? 10,
      sizes: Array.isArray(prod.sizes) ? prod.sizes.join(", ") : "S, M, L",
      colors: Array.isArray(prod.colors) ? prod.colors.join(", ") : "Black",
      description: prod.description || "",
      images: Array.isArray(prod.images) ? prod.images.join(", ") : prod.thumbnail || "/assets/product-1.jpg",
      isFeatured: !!prod.isFeatured,
      isNew: !!prod.isNew,
      isActive: prod.isActive ?? true,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      category: productForm.category,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      sizes: productForm.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: productForm.colors.split(",").map((c) => c.trim()).filter(Boolean),
      description: productForm.description.trim(),
      images: productForm.images.split(",").map((i) => i.trim()).filter(Boolean),
      thumbnail: productForm.images.split(",")[0]?.trim() || "/assets/product-1.jpg",
      isFeatured: productForm.isFeatured,
      isNew: productForm.isNew,
      isActive: productForm.isActive,
    };

    try {
      if (editingProduct) {
        const res = await commerceApi.adminUpdateProduct(editingProduct._id, payload);
        if (res.success) {
          toast.success("Product updated successfully.");
          setShowProductModal(false);
          fetchProducts();
        } else {
          toast.error(res.message || "Failed to update product.");
        }
      } else {
        const res = await commerceApi.adminCreateProduct(payload);
        if (res.success) {
          toast.success("Product created successfully.");
          setShowProductModal(false);
          fetchProducts();
        } else {
          toast.error(res.message || "Failed to create product.");
        }
      }
    } catch (err) {
      toast.error("Error saving product.");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await commerceApi.adminDeleteProduct(id);
      if (res.success) {
        toast.success(`Product "${name}" deleted.`);
        fetchProducts();
      } else {
        toast.error(res.message || "Failed to delete product.");
      }
    } catch (err) {
      toast.error("Error deleting product.");
    }
  };

  if (authLoading) {
    return (
      <main className="bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </main>
    );
  }

  // Security Check: Restrict Access to Admin Users Only
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <main className="bg-background min-h-screen">
        <Nav solid />
        <section className="edge py-32 text-center">
          <div className="max-w-md mx-auto space-y-4 border border-red-500/20 bg-red-500/5 p-8">
            <ShieldAlert className="h-10 w-10 text-red-500 mx-auto" />
            <p className="eyebrow text-red-500">Access Restricted</p>
            <h1 className="display-sm">403 — Admin Required</h1>
            <p className="text-xs text-muted-foreground">
              You must be logged in as a Maison Noir administrator to access management endpoints.
            </p>
            <Link to="/profile" className="label-xs link-underline inline-block pt-2">
              Return to Client Profile
            </Link>
          </div>
        </section>
      </main>
    );
  }

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

      <section className="edge py-28 md:py-32">
        <div className="space-y-8">
          {/* Header & Tabs */}
          <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Maison Noir Atelier Portal</p>
              <h1 className="display-lg">Admin Management</h1>
            </div>
            <div className="flex items-center gap-2 border border-border p-1 bg-muted/20">
              <button
                onClick={() => setActiveTab("orders")}
                className={cn(
                  "label-xs px-4 py-2 transition-colors cursor-pointer flex items-center gap-2",
                  activeTab === "orders" ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Package className="h-3.5 w-3.5" />
                <span>Orders</span>
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={cn(
                  "label-xs px-4 py-2 transition-colors cursor-pointer flex items-center gap-2",
                  activeTab === "products" ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Products & Stock</span>
              </button>
            </div>
          </div>

          {/* TAB 1: ORDERS MANAGEMENT */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-border p-4 bg-background">
                <form onSubmit={handleSearchOrders} className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search order # or email..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
                    />
                  </div>
                  <button type="submit" className="label-xs border border-border px-3 py-2 hover:bg-muted cursor-pointer">
                    Search
                  </button>
                </form>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="label-xs text-muted-foreground">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button onClick={fetchOrders} className="p-2 border border-border hover:bg-muted cursor-pointer" title="Refresh">
                    <RefreshCw className={cn("h-3.5 w-3.5", ordersLoading && "animate-spin")} />
                  </button>
                </div>
              </div>

              {/* Orders Table */}
              {ordersLoading ? (
                <div className="py-16 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-foreground" />
                  <p className="eyebrow">Fetching client orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="border border-border p-12 text-center text-muted-foreground">
                  <p className="eyebrow">No Orders Found</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border text-muted-foreground eyebrow uppercase text-[9px]">
                      <tr>
                        <th className="p-4">Order #</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Items</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Order Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-4 font-mono font-semibold text-foreground">{ord.orderNumber}</td>
                          <td className="p-4">
                            <p className="font-medium text-foreground">{ord.shippingAddress?.firstName} {ord.shippingAddress?.lastName}</p>
                            <p className="text-muted-foreground text-[11px]">{ord.shippingAddress?.email}</p>
                          </td>
                          <td className="p-4">{ord.items?.length || 0} pcs</td>
                          <td className="p-4 font-medium tabular-nums">₹{ord.total?.toLocaleString("en-IN")}</td>
                          <td className="p-4">
                            <select
                              value={ord.orderStatus}
                              onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                              className="border border-border bg-background px-2 py-1 text-xs outline-none capitalize focus:border-foreground cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="label-xs border border-border px-3 py-1.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Header & Add Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-border p-4 bg-background">
                <p className="text-xs text-muted-foreground">
                  {products.length} products listed in database catalog.
                </p>
                <button
                  onClick={openNewProductModal}
                  className="label-xs border border-border bg-foreground px-5 py-2.5 text-background hover:bg-charcoal transition-transform hover:scale-[1.02] cursor-pointer flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>ADD NEW PRODUCT</span>
                </button>
              </div>

              {/* Products Table */}
              {productsLoading ? (
                <div className="py-16 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-foreground" />
                  <p className="eyebrow">Fetching product catalog...</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border text-muted-foreground eyebrow uppercase text-[9px]">
                      <tr>
                        <th className="p-4">Product</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Badges</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {products.map((prod) => (
                        <tr key={prod._id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={prod.images?.[0] || prod.thumbnail || "/assets/product-1.jpg"}
                              alt={prod.name}
                              className="h-10 w-8 object-cover border border-border bg-muted"
                            />
                            <div>
                              <p className="font-medium text-foreground">{prod.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{prod.slug}</p>
                            </div>
                          </td>
                          <td className="p-4">{prod.category}</td>
                          <td className="p-4 font-medium tabular-nums">₹{prod.price?.toLocaleString("en-IN")}</td>
                          <td className="p-4">
                            {prod.stock === 0 ? (
                              <span className="text-red-500 font-bold uppercase text-[10px] tracking-wider">SOLD OUT</span>
                            ) : prod.stock <= 3 ? (
                              <span className="text-amber-600 font-semibold text-[11px]">Only {prod.stock} left</span>
                            ) : (
                              <span className="text-foreground">{prod.stock} units</span>
                            )}
                          </td>
                          <td className="p-4 space-x-1">
                            {prod.isFeatured && <span className="bg-foreground text-background text-[9px] px-1.5 py-0.5 uppercase">Featured</span>}
                            {prod.isNew && <span className="border border-foreground text-[9px] px-1.5 py-0.5 uppercase">New</span>}
                          </td>
                          <td className="p-4 space-x-2">
                            <button
                              onClick={() => openEditProductModal(prod)}
                              className="p-1.5 border border-border hover:bg-muted cursor-pointer"
                              title="Edit product"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id, prod.name)}
                              className="p-1.5 border border-border text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-950 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-border p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 p-2 hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <p className="eyebrow mb-1">Order Details</p>
                <h2 className="display-sm font-mono">{selectedOrder.orderNumber}</h2>
              </div>

              <div className="border border-border p-4 space-y-2 text-xs">
                <p className="font-medium text-foreground">Customer: {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</p>
                <p className="text-muted-foreground">{selectedOrder.shippingAddress?.email} | {selectedOrder.shippingAddress?.phone}</p>
                <p className="text-muted-foreground">Address: {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}</p>
              </div>

              <div className="space-y-3">
                <p className="eyebrow">Items Purchased</p>
                <div className="divide-y divide-border border border-border">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 text-xs">
                      <div>
                        <p className="font-medium text-foreground">{item.productName}</p>
                        <p className="text-muted-foreground">Size: {item.selectedSize} | Color: {item.selectedColor} | Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">₹{(item.priceAtPurchase * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between border-t border-border pt-4 text-sm font-semibold">
                <span>Total Amount:</span>
                <span>₹{selectedOrder.total?.toLocaleString("en-IN")}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Add / Edit Modal */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-950 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-border p-6 md:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowProductModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <p className="eyebrow mb-1">{editingProduct ? "Edit Product" : "New Collection Piece"}</p>
                <h2 className="display-sm">{editingProduct ? editingProduct.name : "Add Product"}</h2>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div>
                  <label className="label-xs block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full border border-border p-2.5 bg-background outline-none focus:border-foreground"
                    placeholder="E.g. Column Wool Trouser"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-xs block mb-1">Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full border border-border p-2.5 bg-background outline-none focus:border-foreground cursor-pointer"
                    >
                      <option value="Outerwear">Outerwear</option>
                      <option value="Tailoring">Tailoring</option>
                      <option value="Knitwear">Knitwear</option>
                      <option value="Trousers">Trousers</option>
                      <option value="Shirts">Shirts</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="label-xs block mb-1">Price (₹ / $) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full border border-border p-2.5 bg-background outline-none focus:border-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-xs block mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full border border-border p-2.5 bg-background outline-none focus:border-foreground"
                    />
                  </div>

                  <div>
                    <label className="label-xs block mb-1">Available Sizes (comma separated)</label>
                    <input
                      type="text"
                      value={productForm.sizes}
                      onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                      className="w-full border border-border p-2.5 bg-background outline-none focus:border-foreground"
                      placeholder="S, M, L, XL"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-xs block mb-1">Available Colors (comma separated)</label>
                  <input
                    type="text"
                    value={productForm.colors}
                    onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                    className="w-full border border-border p-2.5 bg-background outline-none focus:border-foreground"
                    placeholder="Black, Soft White, Charcoal"
                  />
                </div>

                <div>
                  <label className="label-xs block mb-1">Image URLs (comma separated)</label>
                  <input
                    type="text"
                    value={productForm.images}
                    onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                    className="w-full border border-border p-2.5 bg-background outline-none focus:border-foreground"
                    placeholder="/assets/product-1.jpg"
                  />
                </div>

                <div>
                  <label className="label-xs block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full border border-border p-2.5 bg-background outline-none focus:border-foreground resize-none"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    />
                    <span>Mark as Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isNew}
                      onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                    />
                    <span>Mark as New Arrival</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="label-xs border border-border px-4 py-2 hover:bg-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="label-xs border border-border bg-foreground px-6 py-2 text-background hover:bg-charcoal cursor-pointer"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

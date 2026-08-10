const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const TOKEN_KEY = "maison_noir_token";

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string | null): void => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${response.status}`,
        error: data.error,
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      message: (err as Error).message || "Network error. Please check backend connection.",
    };
  }
}

export const api = {
  get: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: "GET", headers }),

  post: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    request<T>(endpoint, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    request<T>(endpoint, {
      method: "PATCH",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    request<T>(endpoint, {
      method: "PUT",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: "DELETE", headers }),
};

// Helper for building query strings
const buildQueryString = (params?: Record<string, any>) => {
  if (!params) return "";
  const filtered = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return filtered.length > 0 ? `?${filtered.join("&")}` : "";
};

// Specialized Commerce API Helpers
export const commerceApi = {
  getProducts: (params?: Record<string, any>) =>
    api.get<{ products: any[]; pagination: any }>(`/products${buildQueryString(params)}`),

  getProduct: (idOrSlug: string) => api.get<{ product: any }>(`/products/${idOrSlug}`),

  getCart: () => api.get<{ items: any[]; summary: any }>("/cart"),

  syncCart: (items: any[]) => api.post<{ items: any[]; summary: any }>("/cart/sync", { items }),

  updateCart: (items: any[]) => api.put<{ items: any[]; summary: any }>("/cart", { items }),

  clearCart: () => api.delete<{ items: any[]; summary: any }>("/cart"),

  getWishlist: () => api.get<{ productIds: string[]; products: any[] }>("/wishlist"),

  syncWishlist: (productIds: string[]) =>
    api.post<{ productIds: string[]; products: any[] }>("/wishlist/sync", { productIds }),

  toggleWishlist: (productId: string) =>
    api.post<{ productIds: string[]; products: any[] }>("/wishlist/toggle", { productId }),

  // Order Endpoints
  createOrder: (orderData: {
    items: Array<{ productId: string; quantity: number; selectedSize?: string; selectedColor?: string }>;
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
    paymentMethod?: string;
  }) => api.post<{ order: any }>("/orders", orderData),

  getOrders: () => api.get<{ orders: any[] }>("/orders"),

  getOrder: (id: string) => api.get<{ order: any }>(`/orders/${id}`),

  // Admin Endpoints
  adminGetOrders: (params?: Record<string, any>) =>
    api.get<{ orders: any[]; pagination: any }>(`/admin/orders${buildQueryString(params)}`),

  adminUpdateOrderStatus: (
    id: string,
    status: { orderStatus?: string; paymentStatus?: string }
  ) => api.patch<{ order: any }>(`/admin/orders/${id}/status`, status),

  adminCreateProduct: (productData: any) => api.post<{ product: any }>("/products", productData),

  adminUpdateProduct: (id: string, productData: any) =>
    api.patch<{ product: any }>(`/products/${id}`, productData),

  adminDeleteProduct: (id: string) => api.delete<{ message: string }>(`/products/${id}`),

  loginGoogle: (credential: string) =>
    api.post<{ user: any; token: string }>("/auth/google", { credential }),
};

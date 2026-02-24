// ─── User Types ────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'customer' | 'seller' | 'admin';
  status?: 'active' | 'suspended' | 'banned';
  joinedAt: string;
  address?: Address;
}

// ─── Address ────────────────────────────────────────────────────────────────────
export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

// ─── Product Types ──────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  seller: string;
  sellerId: string;
  featured?: boolean;
  badge?: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

// ─── Cart Types ─────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// ─── Order Types ─────────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

// ─── Review Types ───────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ─── Auth Types ─────────────────────────────────────────────────────────────────
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ─── Dashboard Types ────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface SalesData {
  month: string;
  revenue: number;
  orders: number;
}

// ─── Seller Types ───────────────────────────────────────────────────────────────
export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  storeDescription: string;
  logo?: string;
  banner?: string;
  category: string;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  joinedAt: string;
  isVerified: boolean;
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
  };
  salesData: SalesData[];
}

export interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  averageRating: number;
  revenueGrowth: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  images: string[];
  tags: string[];
  featured: boolean;
  badge?: string;
}

// ─── Notification Types ─────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// ─── Admin Types ─────────────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingReports: number;
  newUsersThisMonth: number;
  revenueGrowth: number;
  platformFee: number;
  monthlyRevenue: SalesData[];
}

export interface ActivityLog {
  id: string;
  type: 'user_registered' | 'seller_verified' | 'product_flagged' | 'order_placed' | 'report_resolved' | 'seller_suspended' | 'admin_action';
  message: string;
  metadata?: Record<string, string>;
  timestamp: string;
}

export interface Report {
  id: string;
  type: 'product' | 'user' | 'seller' | 'review';
  targetId: string;
  targetName: string;
  reason: string;
  description: string;
  reportedBy: string;
  reportedByName: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
}

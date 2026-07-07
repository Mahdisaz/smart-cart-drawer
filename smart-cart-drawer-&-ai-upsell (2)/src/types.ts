export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface UserSettings {
  storeName: string;
  storeUrl: string;
  themeColor: string;
  buttonColor: string;
  buttonTextColor: string;
  backgroundColor: string;
  borderRadius: string;
  drawerTitle: string;
  drawerSubTitle: string;
  autoOpen: boolean;
  glowEffect: boolean;
  glassmorphism: boolean;
}

export interface User {
  id: string;
  email: string;
  store_url: string;
  subscription_status: 'free' | 'premium';
  monthly_orders_count: number;
  created_at: string;
  settings: UserSettings;
}

export interface CryptoInvoice {
  id: string;
  user_id: string;
  amount_usdt: number;
  payment_reference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  created_at: string;
  validated_at?: string;
  error_message?: string;
}

export interface Metrics {
  totalRevenueGeneratedByAI: number;
  conversionRateBoost: number;
  totalImpressions: number;
  totalClicks: number;
}

export interface DbState {
  users: User[];
  crypto_invoices: CryptoInvoice[];
  inventory: Product[];
  cart_items: CartItem[];
  metrics: Metrics;
}

export interface AppSettings {
  notice: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  themeColor: string;
  whatsappNumber: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  role: 'user' | 'admin';
  balance: number;
  totalSpent: number;
  totalOrders: number;
  supportPin: string;
  supportId: number;
  createdAt: string;
}

export interface ProductPackage {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  packages: ProductPackage[];
  rules: string[];
  isActive: boolean;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  packageId: string;
  packageName: string;
  playerID: string;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export interface Voucher {
  id: string;
  userId: string;
  packageName: string;
  price: number;
  status: 'pending' | 'completed';
  codes: string[];
  createdAt: string;
}

export interface Banner {
  id: string;
  image: string;
  link: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  method: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

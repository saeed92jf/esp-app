export type OrderType = 'DineIn' | 'Takeaway' | 'Delivery' | 'SnappFood';

export type OrderStatus = 'Pending' | 'InKitchen' | 'Ready' | 'Delivered' | 'Cancelled';

export type PaymentStatus = 'Unpaid' | 'Paid' | 'Refunded';

export type PaymentMethod = 'Cash' | 'CardPOS' | 'SnappPay' | 'Wallet';

export interface MenuItem {
  id: string;
  name: string;
  category: 'coffee' | 'chocolate' | 'cold' | 'dessert' | 'snack';
  categoryLabel: string;
  price: number;
  costPrice: number;
  image?: string;
  description: string;
  available: boolean;
  preparationTimeMinutes: number;
  tags?: string[];
  isSignature?: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  tableNumber?: string | null;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  elapsedMinutes?: number;
}

export interface TableItem {
  id: string;
  number: string;
  name: string;
  section: 'main_hall' | 'vip_lounge' | 'terrace';
  sectionLabel: string;
  capacity: number;
  status: 'Free' | 'Occupied' | 'Reserved';
  currentOrderId?: string;
  activeMinutes?: number;
}

export interface RawMaterial {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: 'g' | 'ml' | 'kg' | 'lit' | 'pcs';
  currentStock: number;
  minStock: number;
  unitCost: number; // in Tomans
  supplier: string;
  lastRestocked: string;
}

export interface BomIngredient {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface BomRecipe {
  id: string;
  menuItemId: string;
  menuItemName: string;
  ingredients: BomIngredient[];
  totalCost: number;
  suggestedSellingPrice: number;
  marginPercent: number;
}

export interface PurchaseInvoiceItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  date: string;
  items: PurchaseInvoiceItem[];
  totalAmount: number;
  notes?: string;
}

export interface WasteRecord {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  costImpact: number;
  reason: 'spoilage' | 'expired' | 'damaged' | 'testing' | 'other';
  reasonLabel: string;
  date: string;
  registeredBy: string;
}

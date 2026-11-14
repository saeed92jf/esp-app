/**
 * ZHEEN Café Management ERP - Core TypeScript Definitions
 * System: Euroslot Pars CORE Architecture
 * Bilingual RTL / Persian Digits Standard
 */

// ==========================================
// 1. ROLES & PERMISSIONS
// ==========================================
export type UserRole =
  | 'Admin'
  | 'Manager'
  | 'InventoryStaff'
  | 'KitchenStaff'
  | 'Barista'
  | 'Accountant';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitleFa: string;
  avatar?: string;
  permissions: Record<string, PermissionAction[]>;
}

// ==========================================
// 2. INVENTORY & UNITS
// ==========================================
export type InventoryCategoryType = 'RawMaterial' | 'SemiFinished' | 'PackagingConsumable';

export type UnitType = 'g' | 'kg' | 'ml' | 'l' | 'piece' | 'box' | 'cup' | 'tbsp' | 'tsp' | 'package';

export interface InventoryItem {
  id: string;
  itemCode: string; // e.g., RAW-001, SEMI-002, PKG-003
  name: string;
  categoryType: InventoryCategoryType;
  categoryName: string; // e.g. لبنیات، آرد و غلات، سس‌ها، جعبه و بسته‌بندی
  baseUnit: UnitType; // unit for consumption/recipes (g, ml, piece)
  purchaseUnit: UnitType; // unit for buying (kg, l, box)
  unitConversionFactor: number; // e.g., 1000 for kg to g, 1000 for l to ml
  purchasePrice: number; // cost per purchase unit in Tomans
  currentStock: number; // in baseUnit
  minStockLevel: number; // in baseUnit
  storageLocation: string; // سردخانه، انبار خشک، استیشن بار گرم، بار سرد
  supplierName: string;
  expiryDate?: string; // Jalali or ISO format
  purchaseDate?: string;
  batchNumber?: string;
  allowNegativeStock?: boolean;
  notes?: string;
}

export type StockTransactionType =
  | 'Purchase'
  | 'Consumption'
  | 'ProductionOutput'
  | 'ProductionInput'
  | 'Waste'
  | 'Return'
  | 'Adjustment'
  | 'Transfer';

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  transactionType: StockTransactionType;
  quantity: number; // positive for additions, negative for deductions
  unit: UnitType;
  unitCost: number; // in Tomans
  totalCost: number;
  batchNumber?: string;
  referenceNumber?: string;
  reason: string;
  registeredBy: string;
  createdAt: string;
}

export interface UnitConversionRule {
  fromUnit: UnitType;
  toUnit: UnitType;
  multiplier: number;
  label: string;
}

// ==========================================
// 3. RECIPES & MULTI-LEVEL PRODUCTION
// ==========================================
export type RecipeType = 'SemiFinished' | 'FinishedProduct';

export interface RecipeIngredient {
  id: string;
  inventoryItemId: string; // raw material or semi-finished
  inventoryItemName: string;
  quantity: number; // in baseUnit
  unit: UnitType;
  unitCost: number; // snapshot cost per baseUnit
  wastagePercent: number; // expected preparation waste
  totalCost: number;
}

export interface Recipe {
  id: string;
  recipeCode: string;
  name: string;
  type: RecipeType;
  category: string; // قنادی و کیک، بار گرم، بار سرد، سس و چاشنی
  instructions: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  expectedYieldQuantity: number; // e.g., 1 cake or 1000g ganache
  yieldUnit: string; // قالب، اسلایس، گرم، شات
  portionCount: number; // e.g., 12 slices per cake
  expectedWastePercent: number;
  finalWeightGrams: number;
  storageConditions: string;
  shelfLifeDays: number;
  ingredients: RecipeIngredient[];
  totalRawMaterialCost: number;
  suggestedSellingPrice?: number;
}

export type ProductionOrderStatus =
  | 'Draft'
  | 'IngredientsChecked'
  | 'Confirmed'
  | 'InProduction'
  | 'Completed'
  | 'Cancelled';

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  recipeId: string;
  recipeName: string;
  plannedQuantity: number;
  actualYieldQuantity: number; // e.g., planned 12 slices, actual 10
  yieldUnit: string;
  portionCount: number;
  totalRawMaterialCost: number;
  allocatedLaborCost: number;
  allocatedOverheadCost: number;
  totalActualCost: number;
  actualCostPerPortion: number; // dynamically recalculated based on actual yield
  wasteQuantity: number;
  wasteReason?: string;
  wasteCostImpact: number;
  status: ProductionOrderStatus;
  operatorName: string;
  productionDate: string;
  createdAt: string;
  notes?: string;
}

// ==========================================
// 4. PRODUCT COSTING & PACKAGING MANAGEMENT
// ==========================================
export type SalesConfiguration = 'DineIn' | 'Takeaway' | 'Delivery';

export interface PackagingItemConfig {
  packagingItemId: string;
  packagingItemName: string;
  quantity: number;
  unit: UnitType;
  unitCost: number;
  totalCost: number;
}

export interface ProductPackagingConfig {
  id: string;
  menuItemId: string;
  productName: string;
  dineInItems: PackagingItemConfig[];
  takeawayItems: PackagingItemConfig[];
  deliveryItems: PackagingItemConfig[];
}

export interface ProductCostAnalysis {
  menuItemId: string;
  productName: string;
  category: string;
  recipeId?: string;
  baseProductionCost: number; // raw materials + labor + overhead
  portionCost: number;
  dineInPackagingCost: number;
  takeawayPackagingCost: number;
  deliveryPackagingCost: number;
  sellingPrice: number;
  // Margins per configuration
  dineInProfit: number;
  dineInMarginPercent: number;
  takeawayProfit: number;
  takeawayMarginPercent: number;
  deliveryProfit: number;
  deliveryMarginPercent: number;
  monthlySalesVolume: number;
  breakEvenPortions: number;
}

// ==========================================
// 5. MONTHLY EXPENSES & MAINTENANCE
// ==========================================
export type ExpenseCategory =
  | 'Rent'
  | 'Electricity'
  | 'Water'
  | 'Gas'
  | 'Internet'
  | 'Cleaning'
  | 'Software'
  | 'Advertising'
  | 'Tax'
  | 'Other';

export type RecurrenceType = 'OneTime' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';

export type PaymentStatus = 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';

export interface OperatingExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  categoryTitleFa: string;
  amount: number; // in Tomans
  dueDate: string;
  paymentDate?: string;
  paymentStatus: PaymentStatus;
  recurrence: RecurrenceType;
  notes?: string;
  attachmentName?: string;
}

export interface EquipmentMaintenance {
  id: string;
  equipmentName: string; // e.g. دستگاه اسپرسوساز لامارزوکو Strada
  serviceDescription: string;
  serviceProvider: string;
  servicePhone: string;
  serviceDate: string;
  cost: number;
  nextScheduledDate?: string;
  warrantyUntilDate?: string;
  invoiceAttachment?: string;
  status: 'Scheduled' | 'Completed';
  notes?: string;
}

// ==========================================
// 6. HR, SALARY, CONTRACTS & INSTALLMENTS
// ==========================================
export interface Employee {
  id: string;
  fullName: string;
  employeeCode: string;
  position: string;
  phone: string;
  hireDate: string;
  status: 'Active' | 'OnLeave' | 'Terminated';
  baseSalaryMonthly: number;
  hourlyRate: number;
  workingSchedule: string;
  notes?: string;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string; // e.g. 1404/08
  baseAmount: number;
  overtimeHours: number;
  overtimePay: number;
  bonusAmount: number;
  deductions: number;
  advancesDeducted: number;
  netPayable: number;
  status: 'Draft' | 'Approved' | 'Paid';
  paymentDate?: string;
}

export interface FinancialInstallment {
  id: string;
  title: string;
  targetType: 'Equipment' | 'Loan' | 'Supplier' | 'Advance';
  totalAmount: number;
  installmentCount: number;
  installmentAmount: number;
  frequency: 'Monthly' | 'Weekly';
  startDate: string;
  nextDueDate: string;
  paidInstallments: number;
  remainingInstallments: number;
  outstandingBalance: number;
  status: 'Active' | 'Settled' | 'Overdue';
  reminderNotes?: string;
}

export interface EmployeeContract {
  id: string;
  employeeId: string;
  employeeName: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  salaryTerms: string;
  weeklyHours: number;
  status: 'Active' | 'ExpiringSoon' | 'Expired' | 'Renewed';
  attachmentName?: string;
  renewalNotes?: string;
}

// ==========================================
// 7. OPERATIONS & CHECKLISTS
// ==========================================
export type TaskCategory =
  | 'Opening'
  | 'Closing'
  | 'DailyCleaning'
  | 'WeeklyCleaning'
  | 'MonthlyMaintenance'
  | 'Kitchen'
  | 'Barista'
  | 'Inventory'
  | 'Management';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Overdue';

export interface CafeTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  categoryTitleFa: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  dueDate: string;
  dueTime: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Once';
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: string;
  managerVerified: boolean;
  managerName?: string;
  notes?: string;
}

// ==========================================
// 8. PLANT CARE MANAGEMENT
// ==========================================
export interface CafePlant {
  id: string;
  name: string; // e.g. فیکوس لیراتا سالن اصلی
  location: string; // سالن اصلی کنار شومینه، کانتر بار، ورودی
  wateringIntervalDays: number; // e.g. 4
  lastWateredDate: string; // 1404/08/20
  nextWateredDate: string; // 1404/08/24
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  sunlightRequirement: string; // نور فیلترشده غیرمستقیم
  specialInstructions: string; // غبارپاشی روزانه، کود ۳ بیست هر دو هفته
  status: 'Optimal' | 'DueToday' | 'Overdue';
  photoEmoji: string;
}

export interface PlantWateringLog {
  id: string;
  plantId: string;
  plantName: string;
  wateredAt: string;
  employeeName: string;
  notes?: string;
}

// ==========================================
// 9. CENTRALIZED NOTIFICATION HUB
// ==========================================
export type NotificationType =
  | 'low_stock'
  | 'expiring'
  | 'installment_due'
  | 'contract_expiring'
  | 'maintenance_due'
  | 'task_overdue'
  | 'plant_watering';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'destructive';
  linkTab: string;
  timestamp: string;
  isRead: boolean;
}

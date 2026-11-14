"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  UserProfile,
  InventoryItem,
  StockTransaction,
  Recipe,
  ProductionOrder,
  ProductPackagingConfig,
  ProductCostAnalysis,
  OperatingExpense,
  EquipmentMaintenance,
  Employee,
  SalaryPayment,
  FinancialInstallment,
  EmployeeContract,
  CafeTask,
  CafePlant,
  PlantWateringLog,
  AppNotification,
  StockTransactionType,
} from "../types/zheen-types";

import {
  INITIAL_USER_PROFILES,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_RECIPES,
  INITIAL_PACKAGING_CONFIGS,
  INITIAL_PRODUCTION_ORDERS,
  INITIAL_OPERATING_EXPENSES,
  INITIAL_EQUIPMENT_MAINTENANCE,
  INITIAL_EMPLOYEES,
  INITIAL_INSTALLMENTS,
  INITIAL_CONTRACTS,
  INITIAL_CAFE_TASKS,
  INITIAL_CAFE_PLANTS,
} from "../mock-data/zheen-initial-data";

interface ZheenStoreContextType {
  // User & Roles
  currentUser: UserProfile;
  allUsers: UserProfile[];
  switchUser: (userId: string) => void;

  // Active ERP Tab
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Inventory
  inventoryItems: InventoryItem[];
  stockTransactions: StockTransaction[];
  addInventoryItem: (item: Omit<InventoryItem, "id">) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  adjustStock: (
    itemId: string,
    quantity: number,
    type: StockTransactionType,
    reason: string,
    unitCost?: number
  ) => boolean;

  // Recipes & Production
  recipes: Recipe[];
  productionOrders: ProductionOrder[];
  addRecipe: (recipe: Omit<Recipe, "id">) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  executeProductionOrder: (params: {
    recipeId: string;
    plannedQuantity: number;
    actualYieldQuantity: number;
    allocatedLaborCost: number;
    allocatedOverheadCost: number;
    operatorName: string;
    wasteReason?: string;
    notes?: string;
  }) => { success: boolean; error?: string };

  // Costing & Packaging
  packagingConfigs: ProductPackagingConfig[];
  productCostAnalyses: ProductCostAnalysis[];
  updatePackagingConfig: (configId: string, updates: Partial<ProductPackagingConfig>) => void;

  // Expenses & Maintenance
  operatingExpenses: OperatingExpense[];
  equipmentMaintenance: EquipmentMaintenance[];
  addOperatingExpense: (exp: Omit<OperatingExpense, "id">) => void;
  payExpense: (id: string) => void;
  addMaintenanceRecord: (maint: Omit<EquipmentMaintenance, "id">) => void;
  completeMaintenance: (id: string) => void;

  // HR, Payroll, Contracts & Installments
  employees: Employee[];
  salaryPayments: SalaryPayment[];
  installments: FinancialInstallment[];
  contracts: EmployeeContract[];
  addEmployee: (emp: Omit<Employee, "id">) => void;
  payInstallment: (id: string) => void;
  renewContract: (id: string, newEndDate: string, notes?: string) => void;

  // Tasks & Checklists
  tasks: CafeTask[];
  toggleTaskStatus: (id: string) => void;
  verifyTask: (id: string, managerName: string) => void;
  addTask: (task: Omit<CafeTask, "id">) => void;

  // Plant Care
  plants: CafePlant[];
  wateringLogs: PlantWateringLog[];
  waterPlant: (plantId: string, employeeName: string, notes?: string) => void;
  addPlant: (plant: Omit<CafePlant, "id">) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const ZheenStoreContext = createContext<ZheenStoreContextType | null>(null);

export function ZheenStoreProvider({ children }: { children: React.ReactNode }) {
  // 1. User Profile State
  const [allUsers] = useState<UserProfile[]>(INITIAL_USER_PROFILES);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER_PROFILES[0]);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // 2. Inventory State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY_ITEMS);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([
    {
      id: "tx-init-1",
      itemId: "inv-flour",
      itemName: "آرد قنادی نول",
      transactionType: "Purchase",
      quantity: 50000,
      unit: "g",
      unitCost: 42,
      totalCost: 2100000,
      reason: "فاکتور خرید دوره جدید قنادی",
      registeredBy: "امیر راد",
      createdAt: "1404/08/15 10:30",
    },
  ]);

  // 3. Recipes & Production State
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(INITIAL_PRODUCTION_ORDERS);

  // 4. Packaging State
  const [packagingConfigs, setPackagingConfigs] = useState<ProductPackagingConfig[]>(INITIAL_PACKAGING_CONFIGS);

  // 5. Expenses & Maintenance State
  const [operatingExpenses, setOperatingExpenses] = useState<OperatingExpense[]>(INITIAL_OPERATING_EXPENSES);
  const [equipmentMaintenance, setEquipmentMaintenance] = useState<EquipmentMaintenance[]>(INITIAL_EQUIPMENT_MAINTENANCE);

  // 6. HR, Installments & Contracts State
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [installments, setInstallments] = useState<FinancialInstallment[]>(INITIAL_INSTALLMENTS);
  const [contracts, setContracts] = useState<EmployeeContract[]>(INITIAL_CONTRACTS);

  // 7. Tasks & Operations State
  const [tasks, setTasks] = useState<CafeTask[]>(INITIAL_CAFE_TASKS);

  // 8. Plant Care State
  const [plants, setPlants] = useState<CafePlant[]>(INITIAL_CAFE_PLANTS);
  const [wateringLogs, setWateringLogs] = useState<PlantWateringLog[]>([
    {
      id: "log-1",
      plantId: "plt-ficus",
      plantName: "فیکوس لیراتا سالن اصلی",
      wateredAt: "1404/08/20 09:15",
      employeeName: "نوید سلطانی",
      notes: "آبیاری ۲ لیتر آب بدون کلر هم‌دما با محیط",
    },
  ]);

  // Read notification IDs
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  // ==========================================
  // ACTIONS: USER SWITCH
  // ==========================================
  const switchUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      toast.info(`نقش کاربری به «${user.name} (${user.roleTitleFa})» تغییر یافت.`);
    }
  };

  // ==========================================
  // ACTIONS: INVENTORY
  // ==========================================
  const addInventoryItem = (itemData: Omit<InventoryItem, "id">) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-custom-${Date.now().toString().slice(-4)}`,
    };
    setInventoryItems((prev) => [newItem, ...prev]);

    // Record initial purchase transaction
    if (newItem.currentStock > 0) {
      const tx: StockTransaction = {
        id: `tx-${Date.now()}`,
        itemId: newItem.id,
        itemName: newItem.name,
        transactionType: "Purchase",
        quantity: newItem.currentStock,
        unit: newItem.baseUnit,
        unitCost: Math.round(newItem.purchasePrice / (newItem.unitConversionFactor || 1)),
        totalCost: newItem.purchasePrice,
        reason: "موجودی اولیه هنگام ثبت کالا",
        registeredBy: currentUser.name,
        createdAt: new Date().toLocaleTimeString("fa-IR"),
      };
      setStockTransactions((prev) => [tx, ...prev]);
    }
    toast.success(`کالای «${newItem.name}» با کد ${newItem.itemCode} به انبار افزوده شد.`);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventoryItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    toast.success("تغییرات کالا با موفقیت ذخیره شد.");
  };

  const deleteInventoryItem = (id: string) => {
    setInventoryItems((prev) => prev.filter((item) => item.id !== id));
    toast.warning("کالای مورد نظر از انبار حذف گردید.");
  };

  const adjustStock = (
    itemId: string,
    quantity: number,
    type: StockTransactionType,
    reason: string,
    customUnitCost?: number
  ): boolean => {
    const item = inventoryItems.find((i) => i.id === itemId);
    if (!item) {
      toast.error("کالای مورد نظر یافت نشد.");
      return false;
    }

    const newStock = item.currentStock + quantity;
    if (newStock < 0 && !item.allowNegativeStock) {
      toast.error(`کسری موجودی! موجودی فعلی ${item.name} (${item.currentStock} ${item.baseUnit}) کمتر از مقدار مصرف است.`);
      return false;
    }

    const calculatedUnitCost =
      customUnitCost !== undefined
        ? customUnitCost
        : Math.round(item.purchasePrice / (item.unitConversionFactor || 1));

    const tx: StockTransaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemId: item.id,
      itemName: item.name,
      transactionType: type,
      quantity,
      unit: item.baseUnit,
      unitCost: calculatedUnitCost,
      totalCost: Math.abs(quantity * calculatedUnitCost),
      reason,
      registeredBy: currentUser.name,
      createdAt: new Date().toLocaleDateString("fa-IR") + " " + new Date().toLocaleTimeString("fa-IR"),
    };

    setInventoryItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, currentStock: newStock } : i))
    );
    setStockTransactions((prev) => [tx, ...prev]);
    return true;
  };

  // ==========================================
  // ACTIONS: RECIPES & PRODUCTION
  // ==========================================
  const addRecipe = (recipeData: Omit<Recipe, "id">) => {
    const newRecipe: Recipe = {
      ...recipeData,
      id: `rec-${Date.now().toString().slice(-4)}`,
    };
    setRecipes((prev) => [newRecipe, ...prev]);
    toast.success(`فرمول ساخت BOM برای «${newRecipe.name}» ثبت گردید.`);
  };

  const updateRecipe = (id: string, updates: Partial<Recipe>) => {
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    toast.success("فرمول ساخت به‌روزرسانی شد.");
  };

  const executeProductionOrder = ({
    recipeId,
    plannedQuantity,
    actualYieldQuantity,
    allocatedLaborCost,
    allocatedOverheadCost,
    operatorName,
    wasteReason,
    notes,
  }: {
    recipeId: string;
    plannedQuantity: number;
    actualYieldQuantity: number;
    allocatedLaborCost: number;
    allocatedOverheadCost: number;
    operatorName: string;
    wasteReason?: string;
    notes?: string;
  }) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) {
      return { success: false, error: "فرمول ساخت یافت نشد." };
    }

    // 1. Check stock of all ingredients
    const shortages: string[] = [];
    recipe.ingredients.forEach((ing) => {
      const invItem = inventoryItems.find((i) => i.id === ing.inventoryItemId);
      const requiredQty = ing.quantity * (plannedQuantity / (recipe.portionCount || 1));
      if (!invItem || invItem.currentStock < requiredQty) {
        shortages.push(
          `${ing.inventoryItemName} (موجود: ${invItem?.currentStock || 0} ${ing.unit} | نیاز: ${requiredQty} ${ing.unit})`
        );
      }
    });

    if (shortages.length > 0) {
      const errorMsg = `کسری موجودی در انبار مواد اولیه:\n${shortages.join("\n")}`;
      toast.error("امکان تولید به دلیل کسری مواد اولیه وجود ندارد!", { description: errorMsg });
      return { success: false, error: errorMsg };
    }

    // 2. Deduct consumed materials from inventory
    let totalRawCost = 0;
    recipe.ingredients.forEach((ing) => {
      const deductQty = ing.quantity * (plannedQuantity / (recipe.portionCount || 1));
      adjustStock(
        ing.inventoryItemId,
        -deductQty,
        "ProductionInput",
        `مصرف در خط تولید بچ ${recipe.name}`,
        ing.unitCost
      );
      totalRawCost += deductQty * ing.unitCost;
    });

    // 3. Calculate actual costs and cost per portion
    const totalActualCost = totalRawCost + allocatedLaborCost + allocatedOverheadCost;
    const actualCostPerPortion =
      actualYieldQuantity > 0 ? Math.round(totalActualCost / actualYieldQuantity) : 0;

    const wasteQuantity = Math.max(0, plannedQuantity - actualYieldQuantity);
    const wasteCostImpact = wasteQuantity * actualCostPerPortion;

    // 4. Create Production Order Record
    const newOrder: ProductionOrder = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      orderNumber: `PRD-${Math.floor(100 + Math.random() * 900)}`,
      recipeId: recipe.id,
      recipeName: recipe.name,
      plannedQuantity,
      actualYieldQuantity,
      yieldUnit: recipe.yieldUnit,
      portionCount: actualYieldQuantity,
      totalRawMaterialCost: totalRawCost,
      allocatedLaborCost,
      allocatedOverheadCost,
      totalActualCost,
      actualCostPerPortion,
      wasteQuantity,
      wasteReason: wasteQuantity > 0 ? wasteReason || "ضایعات حین پخت یا برش" : undefined,
      wasteCostImpact,
      status: "Completed",
      operatorName,
      productionDate: new Date().toLocaleDateString("fa-IR"),
      createdAt: new Date().toLocaleTimeString("fa-IR"),
      notes,
    };

    setProductionOrders((prev) => [newOrder, ...prev]);

    // 5. Add produced finished or semi-finished product to inventory if matching
    const matchingSemiFinished = inventoryItems.find(
      (item) => item.categoryType === "SemiFinished" && item.name.includes(recipe.name)
    );
    if (matchingSemiFinished) {
      adjustStock(
        matchingSemiFinished.id,
        actualYieldQuantity,
        "ProductionOutput",
        `خروجی بچ تولید ${newOrder.orderNumber}`,
        actualCostPerPortion
      );
    }

    toast.success(
      `تولید «${recipe.name}» با موفقیت پایان یافت. بهای هر واحد خروجی: ${actualCostPerPortion.toLocaleString(
        "fa-IR"
      )} تومان`
    );
    return { success: true };
  };

  // ==========================================
  // ACTIONS: PACKAGING & COSTING
  // ==========================================
  const updatePackagingConfig = (configId: string, updates: Partial<ProductPackagingConfig>) => {
    setPackagingConfigs((prev) => prev.map((cfg) => (cfg.id === configId ? { ...cfg, ...updates } : cfg)));
    toast.success("پیکربندی ملزومات بسته‌بندی به‌روزرسانی شد.");
  };

  // Dynamic Product Cost Analyses
  const productCostAnalyses = useMemo<ProductCostAnalysis[]>(() => {
    return recipes.map((recipe) => {
      const baseCost = recipe.totalRawMaterialCost + 30000 + 15000; // adding labor and overhead
      const portionCost = Math.round(baseCost / (recipe.portionCount || 1));

      const pkgConfig = packagingConfigs.find((p) => p.menuItemId === recipe.id);
      const dineInPkg =
        pkgConfig?.dineInItems.reduce((acc, item) => acc + item.totalCost, 0) || 400;
      const takeawayPkg =
        pkgConfig?.takeawayItems.reduce((acc, item) => acc + item.totalCost, 0) || 12850;
      const deliveryPkg =
        pkgConfig?.deliveryItems.reduce((acc, item) => acc + item.totalCost, 0) || 16900;

      const sellingPrice = recipe.suggestedSellingPrice || 85000;

      const dineInTotalCost = portionCost + dineInPkg;
      const takeawayTotalCost = portionCost + takeawayPkg;
      const deliveryTotalCost = portionCost + deliveryPkg;

      const dineInProfit = sellingPrice - dineInTotalCost;
      const takeawayProfit = sellingPrice - takeawayTotalCost;
      const deliveryProfit = sellingPrice - deliveryTotalCost;

      return {
        menuItemId: recipe.id,
        productName: recipe.name,
        category: recipe.category,
        recipeId: recipe.id,
        baseProductionCost: baseCost,
        portionCost,
        dineInPackagingCost: dineInPkg,
        takeawayPackagingCost: takeawayPkg,
        deliveryPackagingCost: deliveryPkg,
        sellingPrice,
        dineInProfit,
        dineInMarginPercent: Math.round((dineInProfit / sellingPrice) * 100),
        takeawayProfit,
        takeawayMarginPercent: Math.round((takeawayProfit / sellingPrice) * 100),
        deliveryProfit,
        deliveryMarginPercent: Math.round((deliveryProfit / sellingPrice) * 100),
        monthlySalesVolume: 420,
        breakEvenPortions: Math.ceil(85000000 / Math.max(1, dineInProfit)), // based on rent
      };
    });
  }, [recipes, packagingConfigs]);

  // ==========================================
  // ACTIONS: EXPENSES & MAINTENANCE
  // ==========================================
  const addOperatingExpense = (exp: Omit<OperatingExpense, "id">) => {
    const newExp: OperatingExpense = {
      ...exp,
      id: `exp-${Date.now().toString().slice(-4)}`,
    };
    setOperatingExpenses((prev) => [newExp, ...prev]);
    toast.success(`هزینه «${newExp.title}» ثبت گردید.`);
  };

  const payExpense = (id: string) => {
    setOperatingExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              paymentStatus: "Paid",
              paymentDate: new Date().toLocaleDateString("fa-IR"),
            }
          : e
      )
    );
    toast.success("هزینه با موفقیت تسویه و در اسناد مالی ثبت شد.");
  };

  const addMaintenanceRecord = (maint: Omit<EquipmentMaintenance, "id">) => {
    const newM: EquipmentMaintenance = {
      ...maint,
      id: `maint-${Date.now().toString().slice(-4)}`,
    };
    setEquipmentMaintenance((prev) => [newM, ...prev]);
    toast.success(`ثبت سابقه تعمیرات برای «${newM.equipmentName}» انجام شد.`);
  };

  const completeMaintenance = (id: string) => {
    setEquipmentMaintenance((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "Completed" } : m))
    );
    toast.success("وضعیت سرویس دستگاه به «تکمیل شده» تغییر یافت.");
  };

  // ==========================================
  // ACTIONS: HR, SALARIES & INSTALLMENTS
  // ==========================================
  const addEmployee = (empData: Omit<Employee, "id">) => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now().toString().slice(-4)}`,
    };
    setEmployees((prev) => [newEmp, ...prev]);
    toast.success(`پرسنل جدید «${newEmp.fullName}» با موفقیت اضافه شد.`);
  };

  const payInstallment = (id: string) => {
    setInstallments((prev) =>
      prev.map((inst) => {
        if (inst.id !== id) return inst;
        const newPaid = inst.paidInstallments + 1;
        const newRem = Math.max(0, inst.installmentCount - newPaid);
        const newBalance = newRem * inst.installmentAmount;
        return {
          ...inst,
          paidInstallments: newPaid,
          remainingInstallments: newRem,
          outstandingBalance: newBalance,
          status: newRem === 0 ? "Settled" : "Active",
        };
      })
    );
    toast.success("قسط با موفقیت پرداخت و کاردکس تعهدات به‌روز شد.");
  };

  const renewContract = (id: string, newEndDate: string, notes?: string) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              endDate: newEndDate,
              status: "Renewed",
              renewalNotes: notes || "تمدید قرارداد برای دوره کاری جدید",
            }
          : c
      )
    );
    toast.success("تمدید قرارداد پرسنل با موفقیت ثبت شد.");
  };

  // ==========================================
  // ACTIONS: TASKS & CHECKLISTS
  // ==========================================
  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextStatus = t.status === "Completed" ? "Pending" : "Completed";
        return {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === "Completed" ? new Date().toLocaleTimeString("fa-IR") : undefined,
        };
      })
    );
  };

  const verifyTask = (id: string, managerName: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, managerVerified: true, managerName } : t
      )
    );
    toast.success(`چک‌لیست توسط ${managerName} تایید و مهر گردید.`);
  };

  const addTask = (taskData: Omit<CafeTask, "id">) => {
    const newTask: CafeTask = {
      ...taskData,
      id: `task-${Date.now().toString().slice(-4)}`,
    };
    setTasks((prev) => [newTask, ...prev]);
    toast.success("تسک عملیاتی با موفقیت ایجاد شد.");
  };

  // ==========================================
  // ACTIONS: PLANT CARE
  // ==========================================
  const waterPlant = (plantId: string, employeeName: string, notes?: string) => {
    const todayStr = "1404/08/24"; // current simulated Persian date

    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== plantId) return p;
        // Calculate next date (e.g., + p.wateringIntervalDays)
        const nextDayNum = 24 + p.wateringIntervalDays;
        const nextWateredDate = `1404/08/${nextDayNum.toString().padStart(2, "0")}`;
        return {
          ...p,
          lastWateredDate: todayStr,
          nextWateredDate,
          status: "Optimal",
        };
      })
    );

    const plant = plants.find((p) => p.id === plantId);
    if (plant) {
      const log: PlantWateringLog = {
        id: `plog-${Date.now()}`,
        plantId: plant.id,
        plantName: plant.name,
        wateredAt: `${todayStr} ${new Date().toLocaleTimeString("fa-IR")}`,
        employeeName,
        notes: notes || "آبیاری منظم طبق پروتکل نگهداری کافه",
      };
      setWateringLogs((prev) => [log, ...prev]);
      toast.success(`آبیاری «${plant.name}» ثبت شد. موعد بعدی: هر ${plant.wateringIntervalDays} روز یک‌بار`);
    }
  };

  const addPlant = (plantData: Omit<CafePlant, "id">) => {
    const newPlant: CafePlant = {
      ...plantData,
      id: `plt-${Date.now().toString().slice(-4)}`,
    };
    setPlants((prev) => [newPlant, ...prev]);
    toast.success(`گیاه «${newPlant.name}» به فضای سبز کافه افزوده شد.`);
  };

  // ==========================================
  // DYNAMIC NOTIFICATIONS HUB
  // ==========================================
  const notifications = useMemo<AppNotification[]>(() => {
    const list: AppNotification[] = [];

    // 1. Low stock alerts
    inventoryItems.forEach((item) => {
      if (item.currentStock <= item.minStockLevel) {
        list.push({
          id: `notif-stock-${item.id}`,
          type: "low_stock",
          title: `هشدار کسری انبار: ${item.name}`,
          description: `موجودی فعلی (${item.currentStock} ${item.baseUnit}) به کمتر از حداقل بحرانی (${item.minStockLevel}) رسیده است.`,
          severity: "warning",
          linkTab: "inventory",
          timestamp: "امروز",
          isRead: readNotificationIds.includes(`notif-stock-${item.id}`),
        });
      }
    });

    // 2. Installments due
    installments.forEach((inst) => {
      if (inst.status === "Active") {
        list.push({
          id: `notif-inst-${inst.id}`,
          type: "installment_due",
          title: `سررسید قسط مالی: ${inst.title}`,
          description: `مبلغ قسط: ${inst.installmentAmount.toLocaleString("fa-IR")} تومان - سررسید: ${inst.nextDueDate}`,
          severity: "destructive",
          linkTab: "expenses",
          timestamp: "پیش‌رو",
          isRead: readNotificationIds.includes(`notif-inst-${inst.id}`),
        });
      }
    });

    // 3. Contracts expiring soon
    contracts.forEach((cont) => {
      if (cont.status === "ExpiringSoon") {
        list.push({
          id: `notif-cont-${cont.id}`,
          type: "contract_expiring",
          title: `انقضای قرارداد پرسنل: ${cont.employeeName}`,
          description: `قرارداد کاری در تاریخ ${cont.endDate} خاتمه می‌یابد. نیاز به هماهنگی تمدید.`,
          severity: "warning",
          linkTab: "hr",
          timestamp: "این ماه",
          isRead: readNotificationIds.includes(`notif-cont-${cont.id}`),
        });
      }
    });

    // 4. Overdue tasks
    tasks.forEach((task) => {
      if (task.status === "Overdue" || (task.status === "Pending" && task.priority === "Urgent")) {
        list.push({
          id: `notif-task-${task.id}`,
          type: "task_overdue",
          title: `چک‌لیست فوری معوق: ${task.title}`,
          description: `مسئول: ${task.assignedEmployeeName} (دسته‌بندی: ${task.categoryTitleFa})`,
          severity: "destructive",
          linkTab: "operations",
          timestamp: "فوری",
          isRead: readNotificationIds.includes(`notif-task-${task.id}`),
        });
      }
    });

    // 5. Plants needing water
    plants.forEach((plant) => {
      if (plant.status === "DueToday" || plant.status === "Overdue") {
        list.push({
          id: `notif-plt-${plant.id}`,
          type: "plant_watering",
          title: `یادآور آبیاری گلدان: ${plant.name}`,
          description: `موقعیت: ${plant.location} | مسئول: ${plant.assignedEmployeeName} (${plant.status === "Overdue" ? "۲ روز تاخیر!" : "موعد امروز"})`,
          severity: plant.status === "Overdue" ? "destructive" : "info",
          linkTab: "plants",
          timestamp: "امروز",
          isRead: readNotificationIds.includes(`notif-plt-${plant.id}`),
        });
      }
    });

    return list;
  }, [inventoryItems, installments, contracts, tasks, plants, readNotificationIds]);

  const markNotificationRead = (id: string) => {
    setReadNotificationIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const clearAllNotifications = () => {
    setReadNotificationIds(notifications.map((n) => n.id));
    toast.success("کلیه اعلان‌ها خوانده‌شده علامت‌گذاری شدند.");
  };

  const value = {
    currentUser,
    allUsers,
    switchUser,
    activeTab,
    setActiveTab,
    inventoryItems,
    stockTransactions,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,
    recipes,
    productionOrders,
    addRecipe,
    updateRecipe,
    executeProductionOrder,
    packagingConfigs,
    productCostAnalyses,
    updatePackagingConfig,
    operatingExpenses,
    equipmentMaintenance,
    addOperatingExpense,
    payExpense,
    addMaintenanceRecord,
    completeMaintenance,
    employees,
    salaryPayments,
    installments,
    contracts,
    addEmployee,
    payInstallment,
    renewContract,
    tasks,
    toggleTaskStatus,
    verifyTask,
    addTask,
    plants,
    wateringLogs,
    waterPlant,
    addPlant,
    notifications,
    markNotificationRead,
    clearAllNotifications,
  };

  return <ZheenStoreContext.Provider value={value}>{children}</ZheenStoreContext.Provider>;
}

export function useZheenStore() {
  const context = useContext(ZheenStoreContext);
  if (!context) {
    throw new Error("useZheenStore must be used within a ZheenStoreProvider");
  }
  return context;
}

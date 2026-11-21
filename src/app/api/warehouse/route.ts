// src/app/api/warehouse/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// In-memory cache for fast search and pagination over 18,470 items
let cachedItems: any[] | null = null;
let lastLoadedTime = 0;

function getWarehouseData(): any[] {
  const now = Date.now();
  if (cachedItems && now - lastLoadedTime < 60000) {
    return cachedItems;
  }

  const candidatePaths = [
    "C:\\ESP_DATA\\live\\data\\warehouse_items.json",
    path.join(process.cwd(), "src", "data", "mock", "warehouse_items.json"),
    "C:\\Users\\s.jalili\\Repositories\\ESP-Web-Backend\\app\\data\\warehouse_items.json",
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedItems = parsed;
          lastLoadedTime = now;
          return cachedItems;
        }
      }
    } catch (e) {
      console.error("Error reading warehouse json from", p, e);
    }
  }

  return [];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const category = searchParams.get("category")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(10, parseInt(searchParams.get("pageSize") || "25", 10)));

    const allItems = getWarehouseData();
    const totalAll = allItems.length;

    // Filter
    let filtered = allItems;

    if (category && category !== "all") {
      filtered = filtered.filter(
        (it) =>
          it.categoryEn?.toLowerCase() === category.toLowerCase() ||
          it.categoryFa === category ||
          it.sheet?.toLowerCase() === category.toLowerCase()
      );
    }

    if (status && status !== "all") {
      filtered = filtered.filter((it) => it.status === status);
    }

    if (location && location !== "all") {
      filtered = filtered.filter((it) => it.location?.includes(location));
    }

    if (search) {
      filtered = filtered.filter((it) => {
        return (
          it.sku?.toLowerCase().includes(search) ||
          it.nameFa?.toLowerCase().includes(search) ||
          it.nameEn?.toLowerCase().includes(search) ||
          it.materialGrade?.toLowerCase().includes(search) ||
          it.dimensions?.toLowerCase().includes(search) ||
          it.location?.toLowerCase().includes(search) ||
          it.client?.toLowerCase().includes(search) ||
          it.jobNo?.toLowerCase().includes(search) ||
          it.packingList?.toLowerCase().includes(search) ||
          it.remarks?.toLowerCase().includes(search)
        );
      });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    // Compute metrics
    const inStockCount = allItems.filter((i) => i.status === "in_stock").length;
    const inProgressCount = allItems.filter((i) => i.status === "in_progress").length;
    const bookedCount = allItems.filter((i) => i.status === "booked").length;
    const lowStockCount = allItems.filter((i) => i.status === "low_stock").length;

    return NextResponse.json({
      items: paginatedItems,
      total,
      page,
      pageSize,
      totalPages,
      metrics: {
        totalSkus: totalAll,
        inStockCount,
        inProgressCount,
        bookedCount,
        lowStockCount,
      },
    });
  } catch (error: any) {
    console.error("GET /api/warehouse error:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouse items", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const newItem = await req.json();
    const allItems = getWarehouseData();

    if (!newItem.id) {
      newItem.id = `wh-${allItems.length + 1}`;
    }
    if (!newItem.lastUpdated) {
      newItem.lastUpdated = new Date().toISOString().slice(0, 10);
    }

    allItems.unshift(newItem);
    cachedItems = allItems;

    // Save to file
    const targetPath = "C:\\ESP_DATA\\live\\data\\warehouse_items.json";
    const localMockPath = path.join(process.cwd(), "src", "data", "mock", "warehouse_items.json");

    try {
      fs.writeFileSync(localMockPath, JSON.stringify(allItems, null, 2), "utf-8");
      if (fs.existsSync(path.dirname(targetPath))) {
        fs.writeFileSync(targetPath, JSON.stringify(allItems, null, 2), "utf-8");
      }
    } catch (writeErr) {
      console.warn("Failed to write to persistent path", writeErr);
    }

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create warehouse item", details: error?.message },
      { status: 500 }
    );
  }
}

// src/app/api/esp-coding/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EspCodingStore } from "@/lib/server/esp-coding-store";
import { CodingExcelProvider } from "@/lib/server/coding-excel-provider";
import { RegisteredProduct, ProductCodeReservation } from "@/modules/esp-coding/types";

export async function GET(req: NextRequest) {
  try {
    EspCodingStore.ensureInitialized();
    const { searchParams } = new URL(req.url);
    const source = searchParams.get("source") || "both"; // "registered" | "catalog" | "both"
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const registered = EspCodingStore.getRegisteredProducts();
    const reservations = EspCodingStore.getReservations();

    let catalogItems: any[] = [];
    let catalogTotal = 0;

    if (source === "catalog" || source === "both") {
      const catRes = CodingExcelProvider.getProductionTree({
        search,
        productionCategory: category,
        limit,
        offset,
      });
      catalogItems = catRes.items;
      catalogTotal = catRes.total;
    }

    return NextResponse.json({
      registered,
      reservations,
      catalog: {
        items: catalogItems,
        total: catalogTotal,
        offset,
        limit,
      },
    });
  } catch (err: any) {
    console.error("GET /api/esp-coding/products error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    EspCodingStore.ensureInitialized();
    const body = await req.json();
    const {
      productCode,
      nameEn,
      nameFa,
      productionCategory,
      internalProduct,
      productType,
      shape,
      type,
      liftHoleSize,
      thk,
      attributes,
      primaryMaterialId,
      materialIds,
      formulaProfileId,
      formulaVersionId,
      formulaVersionNumber,
      userId,
      userName,
      userRole,
      action, // "register" | "reserve"
    } = body;

    if (!productCode) {
      return NextResponse.json(
        { error: "ProductCode is required" },
        { status: 400 }
      );
    }

    const registered = EspCodingStore.getRegisteredProducts();
    const now = new Date().toISOString();

    // Check duplicate in registered database
    const existing = registered.find((p) => p.productCode === productCode);
    if (existing) {
      return NextResponse.json(
        {
          error: `ProductCode '${productCode}' is already permanently registered with ID ${existing.productId}.`,
        },
        { status: 409 }
      );
    }

    if (action === "reserve") {
      const reservations = EspCodingStore.getReservations();
      // Check reservation conflict
      const activeRes = reservations.find(
        (r) =>
          r.productCode === productCode &&
          r.status === "reserved" &&
          new Date(r.expiresAt).getTime() > Date.now()
      );
      if (activeRes) {
        return NextResponse.json(
          {
            error: `ProductCode '${productCode}' is currently reserved by ${activeRes.reservedBy}.`,
          },
          { status: 409 }
        );
      }

      const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString(); // 48-hour reservation
      const newReservation: ProductCodeReservation = {
        reservationId: `res_${Date.now()}`,
        productCode,
        status: "reserved",
        profileId: formulaProfileId || "prof_general_production",
        formulaVersionId: formulaVersionId || "ver_prod_1_0",
        formulaVersionNumber: formulaVersionNumber || "1.0",
        reservedBy: userName || userId || "User",
        reservedAt: now,
        expiresAt,
        attributes: attributes || {},
        productDescriptionEn: nameEn || productCode,
        productDescriptionFa: nameFa || productCode,
        primaryMaterialId,
      };

      reservations.push(newReservation);
      EspCodingStore.saveReservations(reservations);

      EspCodingStore.logAudit({
        id: `audit_${Date.now()}`,
        action: "product_reserved",
        entityType: "product",
        entityId: newReservation.reservationId,
        userId: userId || "SYSTEM",
        userName: userName || "User",
        userRole: userRole || "user",
        timestamp: now,
        detailsEn: `Reserved ProductCode: ${productCode}`,
        detailsFa: `کد محصول ${productCode} به مدت ۴۸ ساعت رزرو شد.`,
      });

      return NextResponse.json({
        success: true,
        reservation: newReservation,
      });
    }

    // Default: Permanent Registration
    const newProduct: RegisteredProduct = {
      productId: `prod_${Date.now()}`,
      productCode,
      nameEn: nameEn || `${productionCategory} - ${productType}`,
      nameFa: nameFa || `${productionCategory} - ${productType}`,
      productionCategory: productionCategory || "",
      internalProduct: internalProduct || "",
      productType: productType || "",
      shape: shape || "",
      type: type || "",
      liftHoleSize: liftHoleSize || "",
      thk: thk || "",
      attributes: attributes || {},
      primaryMaterialId,
      materialIds,
      formulaProfileId: formulaProfileId || "prof_general_production",
      formulaVersionId: formulaVersionId || "ver_prod_1_0",
      formulaVersionNumber: formulaVersionNumber || "1.0",
      registeredBy: userName || userId || "User",
      registeredAt: now,
      status: "active",
    };

    registered.push(newProduct);
    EspCodingStore.saveRegisteredProducts(registered);

    // Release any existing reservation for this code
    const reservations = EspCodingStore.getReservations();
    const updatedReservations = reservations.map((r) =>
      r.productCode === productCode ? { ...r, status: "registered" as const } : r
    );
    EspCodingStore.saveReservations(updatedReservations);

    EspCodingStore.logAudit({
      id: `audit_${Date.now()}`,
      action: "product_registered",
      entityType: "product",
      entityId: newProduct.productId,
      userId: userId || "SYSTEM",
      userName: userName || "User",
      userRole: userRole || "user",
      timestamp: now,
      detailsEn: `Permanently registered ProductCode: ${productCode} (${newProduct.nameEn})`,
      detailsFa: `کد محصول ${productCode} (${newProduct.nameFa}) به صورت رسمی ثبت قطعی گردید.`,
    });

    return NextResponse.json({
      success: true,
      product: newProduct,
    });
  } catch (err: any) {
    console.error("POST /api/esp-coding/products error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to register product" },
      { status: 500 }
    );
  }
}

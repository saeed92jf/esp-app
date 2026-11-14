// src/modules/customers/utils/petro-unifier.ts

import { IRANIAN_PLANTS } from "../data/plants.data";
import { IRANIAN_HOLDINGS } from "../data/holdings.data";
import type { PlantFacility, PlantProcessType } from "../types/plants.types";
import type { Holding } from "../types/holdings.types";
import type { Customer } from "../types/customers.types";

const CUSTOM_PLANTS_STORAGE_KEY = "esp_custom_petro_plants_v1";

/**
 * Normalizes a Persian text for robust matching by stripping common legal prefixes
 * and unifying Arabic/Persian characters.
 */
export function normalizeTitle(text?: string | null): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[آأإ]/g, "ا")
    .replace(/[\u200c\u200b\s]+/g, " ")
    .replace(/شرکت/g, "")
    .replace(/سهامی عام/g, "")
    .replace(/سهامی خاص/g, "")
    .replace(/صنایع/g, "")
    .replace(/پتروشیمی/g, "")
    .replace(/مجتمع/g, "")
    .trim();
}

/**
 * Checks if a Customer entity represents a Petrochemical plant or petrochemical company.
 */
export function isPetrochemicalCustomer(customer?: Customer | null): boolean {
  if (!customer) return false;
  if (customer.is_petrochemical) return true;
  if (customer.process_type) return true;
  if (customer.plant_code) return true;

  const industry = (customer.industry || "").toLowerCase();
  if (industry.includes("petrochemical") || industry.includes("پتروشیمی")) return true;

  const titleFa = customer.persian_title_fa || "";
  if (titleFa.includes("پتروشیمی")) return true;

  const norm = normalizeTitle(titleFa);
  if (!norm) return false;

  return IRANIAN_PLANTS.some(
    (p) => normalizeTitle(p.nameFa) === norm || normalizeTitle(p.complexNameFa) === norm
  );
}

/**
 * Loads custom plants added in the client session or local storage.
 */
export function getStoredCustomPlants(): PlantFacility[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PLANTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persists a newly created custom petrochemical plant into local storage so it instantly
 * shows in Plants and Holdings views.
 */
export function storeCustomPlant(plant: PlantFacility): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredCustomPlants();
    const filtered = existing.filter((p) => p.id !== plant.id);
    filtered.unshift(plant);
    localStorage.setItem(CUSTOM_PLANTS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to store custom plant locally:", err);
  }
}

/**
 * Converts a Customer with petrochemical attributes into a valid PlantFacility object.
 */
export function customerToPlantFacility(customer: Customer): PlantFacility {
  const normTitle = normalizeTitle(customer.persian_title_fa);
  const matchedHolding =
    customer.holding_id
      ? IRANIAN_HOLDINGS.find((h) => h.id === customer.holding_id)
      : IRANIAN_HOLDINGS.find(
          (h) =>
            h.subsidiaries.some((s) => normalizeTitle(s.nameFa) === normTitle) ||
            normalizeTitle(h.nameFa) === normTitle
        );

  const processType: PlantProcessType = (customer.process_type as PlantProcessType) || "chemicals";

  return {
    id: customer.id,
    nameFa: customer.persian_title_fa,
    nameEn: customer.company_name_en || customer.persian_title_fa,
    code: customer.plant_code || `PLANT-${customer.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6)}`,
    processType,
    complexNameFa: customer.complex_name_fa || customer.persian_title_fa,
    complexNameEn: customer.company_name_en,
    phaseFa: customer.phase_fa || undefined,
    unitTypeFa: customer.unit_type_fa || undefined,
    holdingId: matchedHolding?.id || customer.holding_id || "private",
    holdingNameFa: matchedHolding?.nameFa || customer.holding_name_fa || "بخش خصوصی",
    holdingNameEn: matchedHolding?.nameEn,
    owner1Fa: customer.owner1_fa || matchedHolding?.nameFa || undefined,
    owner2Fa: customer.owner2_fa || undefined,
    logoUrl: customer.logo_url || matchedHolding?.logoUrl || undefined,
    locationZone:
      (customer.location_zone as "assaluyeh" | "mahshahr" | "other_provinces") ||
      (customer.city?.includes("عسلویه")
        ? "assaluyeh"
        : customer.city?.includes("ماهشهر")
        ? "mahshahr"
        : "other_provinces"),
    locationFa: customer.plant_address_fa || customer.office_address_fa || customer.city || "ایران",
    cityFa: customer.city || "تهران",
    provinceFa: customer.city || "تهران",
    feedstockFa: customer.feedstock_fa || "خوراک هیدروکربوری / گازی",
    feedstockSourceFa: customer.feedstock_source_fa || undefined,
    nominalCapacityFa: customer.nominal_capacity_fa || "ظرفیت نامی استاندارد",
    capacityTonsPerYear: customer.capacity_tons_per_year ?? undefined,
    licensors: customer.licensors && customer.licensors.length > 0 ? customer.licensors : ["Technip / Linde"],
    engineeringCompanies: customer.engineering_companies || undefined,
    mainProductsFa: customer.main_products_fa && customer.main_products_fa.length > 0 ? customer.main_products_fa : ["فرآورده‌های پتروشیمی"],
    commissionedYear: customer.commissioned_year || undefined,
    tseSymbol: customer.tse_symbol || undefined,
    status: (customer.status as "operational" | "expansion" | "under_construction") || "operational",
    descriptionFa: `مجتمع و واحد فرآیندی ${customer.persian_title_fa} فعال در صنعت پتروشیمی.`,
    reactorOrFurnaceInfoFa: customer.reactor_or_furnace_info_fa || undefined,
    espInstalledBase: customer.esp_installed_base || undefined,
    website: customer.website || undefined,
    codalUrl: customer.codal_url || undefined,
    customerDirectoryId: customer.id,
  };
}

/**
 * Finds or builds the unified PlantFacility details for any given Customer.
 */
export function getUnifiedPlantInfo(customer?: Customer | null): PlantFacility | null {
  if (!customer) return null;

  // 1. Direct match with static plant dataset by customer id
  const directMatch = IRANIAN_PLANTS.find(
    (p) => p.customerDirectoryId === customer.id || p.id === customer.id
  );
  if (directMatch) return directMatch;

  // 2. If customer has explicit petrochemical attributes, synthesize directly
  if (customer.is_petrochemical || customer.process_type || customer.plant_code) {
    return customerToPlantFacility(customer);
  }

  // 3. Match by TSE symbol
  if (customer.tse_symbol) {
    const tseMatch = IRANIAN_PLANTS.find(
      (p) => p.tseSymbol && p.tseSymbol.trim() === customer.tse_symbol?.trim()
    );
    if (tseMatch) return tseMatch;
  }

  // 4. Fuzzy match by Persian title
  const normTitle = normalizeTitle(customer.persian_title_fa);
  if (normTitle) {
    const fuzzyMatch = IRANIAN_PLANTS.find((p) => {
      const pNorm = normalizeTitle(p.nameFa);
      const cNorm = normalizeTitle(p.complexNameFa);
      return (
        pNorm === normTitle ||
        cNorm === normTitle ||
        (normTitle.length >= 3 && (pNorm.includes(normTitle) || normTitle.includes(pNorm)))
      );
    });
    if (fuzzyMatch) return fuzzyMatch;
  }

  // 5. If it contains "پتروشیمی", generate a facility record
  if (customer.persian_title_fa?.includes("پتروشیمی")) {
    return customerToPlantFacility(customer);
  }

  return null;
}

/**
 * Finds the parent Holding entity for a given customer or plant.
 */
export function getUnifiedHoldingInfo(
  item?: Customer | PlantFacility | null
): Holding | null {
  if (!item) return null;

  // Direct holdingId
  const holdingId = "holdingId" in item ? item.holdingId : (item as Customer).holding_id;
  if (holdingId && holdingId !== "private" && holdingId !== "governmental") {
    const found = IRANIAN_HOLDINGS.find((h) => h.id === holdingId);
    if (found) return found;
  }

  // Matching by name
  const name = "nameFa" in item ? item.nameFa : (item as Customer).persian_title_fa;
  const norm = normalizeTitle(name);

  for (const h of IRANIAN_HOLDINGS) {
    if (normalizeTitle(h.nameFa) === norm) return h;
    for (const sub of h.subsidiaries) {
      if (normalizeTitle(sub.nameFa) === norm) return h;
    }
  }

  return null;
}

/**
 * Merges curated IRANIAN_PLANTS with custom added petrochemical plants from database and local storage.
 */
export function getAllUnifiedPlants(apiCustomers: Customer[] = []): PlantFacility[] {
  const customStored = getStoredCustomPlants();
  const apiPetroPlants: PlantFacility[] = [];

  for (const c of apiCustomers) {
    if (c.is_petrochemical || c.process_type || (c.is_custom && c.persian_title_fa.includes("پتروشیمی"))) {
      const facility = customerToPlantFacility(c);
      // Ensure not duplicating static plants
      const existsInStatic = IRANIAN_PLANTS.some(
        (p) => normalizeTitle(p.nameFa) === normalizeTitle(facility.nameFa)
      );
      if (!existsInStatic) {
        apiPetroPlants.push(facility);
      }
    }
  }

  // Merge order: Custom Stored -> API Petro -> Curated IRANIAN_PLANTS
  const combined = [...customStored, ...apiPetroPlants, ...IRANIAN_PLANTS];
  const seen = new Set<string>();
  const result: PlantFacility[] = [];

  for (const item of combined) {
    const key = item.id || normalizeTitle(item.nameFa);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

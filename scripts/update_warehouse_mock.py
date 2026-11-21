# scripts/update_warehouse_mock.py
import json

with open(r'c:\Users\s.jalili\Repositories\esp-app\src\data\mock\warehouse_items.json', 'r', encoding='utf-8') as f:
    all_items = json.load(f)

# Group categories and count
categories = [
    {"id": "all", "labelFa": "همه گروه‌ها", "labelEn": "All Categories", "count": len(all_items)},
    {"id": "Plates & Sheets", "labelFa": "ورق‌های استیل و آلیاژی", "labelEn": "Plates & Sheets", "count": 4211},
    {"id": "Pipes & Tubes", "labelFa": "لوله‌ها و تیوب‌های صنعتی", "labelEn": "Pipes & Tubes", "count": 3458},
    {"id": "Fittings", "labelFa": "اتصالات و فیتینگ‌ها", "labelEn": "Fittings", "count": 2022},
    {"id": "Bolts & Nuts", "labelFa": "پیچ‌ها و مهره‌ها", "labelEn": "Bolts & Nuts", "count": 1509},
    {"id": "Industrial Rods", "labelFa": "میلگردها و رادها", "labelEn": "Industrial Rods", "count": 1436},
    {"id": "Thin Plates & Bars", "labelFa": "تسمه‌ها و ورق‌های نازک", "labelEn": "Thin Plates & Bars", "count": 1225},
    {"id": "Coils & Strips", "labelFa": "کویل‌ها و رول‌ها", "labelEn": "Coils & Strips", "count": 1075},
    {"id": "Industrial Mesh", "labelFa": "مش‌ها و توری‌ها", "labelEn": "Industrial Mesh", "count": 808},
    {"id": "Gaskets & Seals", "labelFa": "گسکت‌ها و آب‌بندها", "labelEn": "Gaskets & Seals", "count": 805},
    {"id": "Washers", "labelFa": "واشرها و پکینگ‌ها", "labelEn": "Washers", "count": 797},
    {"id": "Structural Profiles & Angles", "labelFa": "پروفیل‌ها و نبشی‌ها", "labelEn": "Profiles & Angles", "count": 278},
    {"id": "Valves", "labelFa": "شیرآلات صنعتی", "labelEn": "Valves", "count": 203},
    {"id": "Random Packing", "labelFa": "رندوم پکینگ", "labelEn": "Random Packing", "count": 170},
    {"id": "Polypropylene & Polymers", "labelFa": "پلی‌پروپیلن (PP)", "labelEn": "Polypropylene (PP)", "count": 158},
    {"id": "Rods & Wires", "labelFa": "مفتول‌ها و سیم‌ها", "labelEn": "Rods & Wires", "count": 109},
    {"id": "Wires", "labelFa": "وایرهای فرآیندی", "labelEn": "Process Wires", "count": 102},
    {"id": "Bubble Caps & Risers", "labelFa": "بابل‌کپ و رایزر", "labelEn": "Bubble Caps", "count": 64},
    {"id": "Flanges", "labelFa": "فلنج‌ها", "labelEn": "Flanges", "count": 40},
]

# Get initial 50 representative real items
initial_items = all_items[:60]

# Real factory locations from Excel
bays = [
    {
        "id": "bay-central",
        "code": "ZONE-CENTRAL",
        "nameFa": "انبار مرکزی یورواسلات پارس",
        "nameEn": "Euroslot Pars Central Warehouse",
        "descriptionFa": "سالن اصلی انبارش کویل‌ها، ورق‌های استیل ۳۰۴ و ۳۱۶، متریال ورودی و پالت‌های سنگین",
        "descriptionEn": "Primary storage hall for raw coils, plates, SS304/316 alloys and heavy pallets",
        "type": "Raw Material & Coils",
        "occupancyRate": 82,
        "capacityMax": 15000,
        "capacityCurrent": 11240,
        "unitFa": "قلم قطعه",
        "unitEn": "items",
        "rackCount": 48,
        "itemCount": 11240,
        "supervisorFa": "مهندس رضا کریمی",
        "supervisorEn": "Eng. Reza Karimi",
        "temperatureControlled": False,
        "humidityControlled": True,
        "racks": [
            {"id": "rk-c1", "code": "PLT-01..12", "label": "پالت‌های ورق استیل 304 و 316L", "currentItems": 4211, "status": "near_full"},
            {"id": "rk-c2", "code": "COIL-01..08", "label": "استند رول‌ها و کویل‌های نورد", "currentItems": 1075, "status": "normal"},
            {"id": "rk-c3", "code": "BAR-01..10", "label": "قفسه‌های تسمه و بار", "currentItems": 1225, "status": "normal"}
        ]
    },
    {
        "id": "bay-prefab",
        "code": "ZONE-PREFAB",
        "nameFa": "انبار قطعات پیش‌ساخته و اینترنال‌ها",
        "nameEn": "Prefabricated Components & Internals Bay",
        "descriptionFa": "سالن نگهداری سنترپایپ‌ها، اسکیلپ‌های آماده، فیتینگ‌ها و اتصالات پروژه",
        "descriptionEn": "Dedicated storage for centerpipes, scallops, custom fittings and reactor assemblies",
        "type": "Assemblies & Fittings",
        "occupancyRate": 74,
        "capacityMax": 1500,
        "capacityCurrent": 962,
        "unitFa": "قلم پیش‌ساخته",
        "unitEn": "items",
        "rackCount": 24,
        "itemCount": 962,
        "supervisorFa": "مهندس فرزاد منصوری",
        "supervisorEn": "Eng. Farzad Mansouri",
        "temperatureControlled": True,
        "humidityControlled": True,
        "racks": [
            {"id": "rk-p1", "code": "FIT-01..12", "label": "قفسه فیتینگ‌ها و اتصالات فشارقوی", "currentItems": 520, "status": "normal"},
            {"id": "rk-p2", "code": "CAP-01..04", "label": "پالت‌های بابل‌کپ و رایزر سینی", "currentItems": 64, "status": "normal"},
            {"id": "rk-p3", "code": "PIPE-01..08", "label": "استند تیوب‌ها و سنترپایپ‌ها", "currentItems": 378, "status": "normal"}
        ]
    },
    {
        "id": "bay-saddles",
        "code": "ZONE-SADDLES",
        "nameFa": "سدل‌های انبارش لوله و استراکچر (سدل ۱ تا ۲ و A تا E)",
        "nameEn": "Pipe & Structural Saddles (Saddles 1-2 & A-E)",
        "descriptionFa": "سکوی نگهداری لوله‌ها، تیوب‌ها، تیرآهن‌ها و پروفیل‌های شاخه‌ای صنعتی",
        "descriptionEn": "Heavy outdoor and sheltered saddle racks for industrial pipes, tubes and beams",
        "type": "Heavy Long Stock",
        "occupancyRate": 68,
        "capacityMax": 4500,
        "capacityCurrent": 3458,
        "unitFa": "شاخه و مقطع",
        "unitEn": "branches",
        "rackCount": 16,
        "itemCount": 3458,
        "supervisorFa": "مهندس کامران خسروی",
        "supervisorEn": "Eng. Kamran Khosravi",
        "temperatureControlled": False,
        "humidityControlled": False,
        "racks": [
            {"id": "rk-s1", "code": "SDL-A..E", "label": "سدل‌های لوله‌های استیل و اینکونل", "currentItems": 2100, "status": "near_full"},
            {"id": "rk-s2", "code": "SDL-1..2", "label": "سدل مقاطع سنگین ST37 و تیرآهن", "currentItems": 1358, "status": "normal"}
        ]
    },
    {
        "id": "bay-quarantine",
        "code": "ZONE-QC",
        "nameFa": "انبار قرنطینه، باسکول و بازرسی فنی (QC)",
        "nameEn": "Quarantine, Weighbridge & QC Inspection Bay",
        "descriptionFa": "محل پذیرش محموله‌های ورودی، نمونه‌برداری آزمون PMI و بررسی متریال MTC",
        "descriptionEn": "Inbound receiving, PMI positive material identification and dimensional QA staging",
        "type": "Quality Control & Receiving",
        "occupancyRate": 45,
        "capacityMax": 800,
        "capacityCurrent": 335,
        "unitFa": "پالت در بررسی",
        "unitEn": "pallets",
        "rackCount": 10,
        "itemCount": 335,
        "supervisorFa": "مهندس اکبری (مدیر کنترل کیفیت)",
        "supervisorEn": "Eng. Akbari (QC Manager)",
        "temperatureControlled": True,
        "humidityControlled": False,
        "racks": [
            {"id": "rk-q1", "code": "QC-STAGE", "label": "سکوی بازرسی و تست سختی‌سنجی", "currentItems": 247, "status": "normal"},
            {"id": "rk-q2", "code": "SCALE-01", "label": "جایگاه توزین باسکول و بارنامه", "currentItems": 88, "status": "normal"}
        ]
    },
    {
        "id": "bay-hardware",
        "code": "ZONE-FASTENERS",
        "nameFa": "انبار مواد مصرفی، پیچ و مهره، گسکت و پکینگ (H26, Z25, J6-7)",
        "nameEn": "Fasteners, Gaskets & Consumables Bay (H26, Z25, J6-7)",
        "descriptionFa": "قفسه‌بندی کشویی پیچ و مهره‌های B8M، واشرها، گسکت‌های اسپیرال وند و پکینگ‌های نسوز",
        "descriptionEn": "Multi-tier drawers for precision bolts, washers, spiral gaskets and packing coils",
        "type": "Hardware & Small Parts",
        "occupancyRate": 89,
        "capacityMax": 3500,
        "capacityCurrent": 3111,
        "unitFa": "قلم در کشو",
        "unitEn": "bin items",
        "rackCount": 28,
        "itemCount": 3111,
        "supervisorFa": "آقای علیرضا صابری",
        "supervisorEn": "Mr. Alireza Saberi",
        "temperatureControlled": True,
        "humidityControlled": False,
        "racks": [
            {"id": "rk-h1", "code": "BIN-BLT", "label": "کشوهای پیچ و مهره شش‌گوش استیل", "currentItems": 1509, "status": "full"},
            {"id": "rk-h2", "code": "BIN-WSH", "label": "طبقات واشرهای تخت و فنری", "currentItems": 797, "status": "near_full"},
            {"id": "rk-h3", "code": "BIN-GSK", "label": "قفسه H26 طناب پکینگ و گسکت", "currentItems": 805, "status": "near_full"}
        ]
    }
]

# Real transactions derived from actual packing lists and job numbers
transactions = [
    {
        "id": "tr-real-01",
        "transId": "TR-1403-1088",
        "type": "inbound",
        "sku": "0100105008",
        "itemNameFa": "کویل استیل 304 ضخامت 1mm عرض 1000mm",
        "itemNameEn": "SS 304 Coil Thk: 1mm × W: 1000mm",
        "quantity": 4702,
        "unitFa": "کیلوگرم",
        "unitEn": "kg",
        "fromLocation": "تامین‌کننده: فولاد صنعت (پکینگ لیست Y19-002)",
        "toLocation": "انبار مرکزی یورواسلات - رول 1",
        "referenceDoc": "ESP 540",
        "operatorFa": "حسین ابراهیمی",
        "operatorEn": "Hossein Ebrahimi",
        "date": "۱۴۰۳/۰۸/۲۴",
        "time": "۱۰:۱۵",
        "status": "completed"
    },
    {
        "id": "tr-real-02",
        "transId": "TR-1403-1089",
        "type": "outbound",
        "sku": "0700201009",
        "itemNameFa": "پیچ شش‌گوش Hex Bolt استیل 304 سایز M3 در 15mm",
        "itemNameEn": "SS 304 Hex Bolt M3 × L: 15mm",
        "quantity": 39,
        "unitFa": "عدد",
        "unitEn": "pcs",
        "fromLocation": "قفسه A1 انبار پیچ و مهره",
        "toLocation": "پروژه جندی شاپور (خط مونتاژ)",
        "referenceDoc": "JOB-JANDI-2024",
        "operatorFa": "علیرضا صابری",
        "operatorEn": "Alireza Saberi",
        "date": "۱۴۰۳/۰۸/۲۵",
        "time": "۱۴:۳۰",
        "status": "completed"
    },
    {
        "id": "tr-real-03",
        "transId": "TR-1403-1090",
        "type": "transfer",
        "sku": "2000102002",
        "itemNameFa": "طناب پکینگ نسوز Rope Packing فایبرگلاس سایز Ø 3",
        "itemNameEn": "Glass Fiber Rope Packing Ø 3",
        "quantity": 40,
        "unitFa": "متر",
        "unitEn": "m",
        "fromLocation": "انبار قرنطینه",
        "toLocation": "قفسه H26 - انبار مصرفی",
        "referenceDoc": "ESP 1931 (تبریز)",
        "operatorFa": "محمدعلی حسینی",
        "operatorEn": "Mohammad Ali Hosseini",
        "date": "۱۴۰۳/۰۸/۲۶",
        "time": "۱۱:۴۵",
        "status": "completed"
    },
    {
        "id": "tr-real-04",
        "transId": "TR-1403-1091",
        "type": "inbound",
        "sku": "ESP-PP-0001",
        "itemNameFa": "مواد اولیه پلیمری گرانول PP گرید HP525J",
        "itemNameEn": "Polypropylene Raw Granule HP525J",
        "quantity": 2675,
        "unitFa": "کیلوگرم",
        "unitEn": "kg",
        "fromLocation": "پتروشیمی تدبیر (پروژه مسجد سلیمان)",
        "toLocation": "انبار مرکزی - پالت مواد پلیمری",
        "referenceDoc": "ESP 1066",
        "operatorFa": "حسین ابراهیمی",
        "operatorEn": "Hossein Ebrahimi",
        "date": "۱۴۰۳/۰۸/۲۷",
        "time": "۰۹:۰۰",
        "status": "completed"
    },
    {
        "id": "tr-real-05",
        "transId": "TR-1403-1092",
        "type": "outbound",
        "sku": "ESP-CAP-0001",
        "itemNameFa": "بابل‌کپ و رایزر Cap Raiser استیل 304 سایز 4 اینچ",
        "itemNameEn": "SS 304 Cap Raiser 4\"",
        "quantity": 178,
        "unitFa": "عدد",
        "unitEn": "pcs",
        "fromLocation": "قفسه‌های Z26 و Z29",
        "toLocation": "پروژه پتروشیمی پردیس (واحد ساخت سینی)",
        "referenceDoc": "ESP 1575",
        "operatorFa": "فرزاد منصوری",
        "operatorEn": "Farzad Mansouri",
        "date": "۱۴۰۳/۰۸/۲۷",
        "time": "۱۳:۲۰",
        "status": "in_progress"
    }
]

# Real vouchers
vouchers = [
    {
        "id": "vch-real-01",
        "voucherNo": "MRV-1403-Y19002",
        "type": "mrv",
        "titleFa": "رسید ورود محموله کویل‌های استیل ۳۰۴ کارفرمای فولاد صنعت",
        "titleEn": "Material Receipt: SS 304 Coils - Folad Sanat Project",
        "counterpartyFa": "مجتمع فولاد صنعت (Job: ESP 540)",
        "counterpartyEn": "Folad Sanat (Job: ESP 540)",
        "issueDate": "۱۴۰۳/۰۸/۲۴",
        "itemCount": 2,
        "totalQuantity": 10547,
        "status": "approved",
        "items": [
            {"sku": "0100105008", "nameFa": "کویل استیل 304 ضخامت 1mm", "nameEn": "SS 304 Coil 1mm", "qty": 4702, "unitFa": "کیلوگرم", "unitEn": "kg"},
            {"sku": "0100105009", "nameFa": "کویل استیل 304 عرض 1000mm", "nameEn": "SS 304 Coil W:1000", "qty": 5845, "unitFa": "کیلوگرم", "unitEn": "kg"}
        ]
    },
    {
        "id": "vch-real-02",
        "voucherNo": "SIO-1403-ESP1575",
        "type": "sio",
        "titleFa": "حواله خروج بابل‌کپ‌ها و متعلقات سینی به پروژه پتروشیمی پردیس",
        "titleEn": "Store Issue Order: Bubble Caps to Pardis Petrochemical",
        "counterpartyFa": "پتروشیمی پردیس (واحد نصب سینی رآکتور)",
        "counterpartyEn": "Pardis Petrochemical Tray Assembly",
        "issueDate": "۱۴۰۳/۰۸/۲۷",
        "itemCount": 3,
        "totalQuantity": 287,
        "status": "approved",
        "items": [
            {"sku": "ESP-CAP-0001", "nameFa": "Cap Raiser استیل 304 سایز 4 اینچ", "nameEn": "SS 304 Cap Raiser 4\"", "qty": 178, "unitFa": "عدد", "unitEn": "pcs"},
            {"sku": "ESP-CAP-0002", "nameFa": "Cap Raiser(B) استیل 304", "nameEn": "SS 304 Cap Raiser B", "qty": 78, "unitFa": "عدد", "unitEn": "pcs"},
            {"sku": "ESP-CAP-0003", "nameFa": "Cap Raiser استیل 304 سایز 4", "nameEn": "Cap Raiser 4\" SS304", "qty": 31, "unitFa": "عدد", "unitEn": "pcs"}
        ]
    },
    {
        "id": "vch-real-03",
        "voucherNo": "MRV-1403-PP1066",
        "type": "mrv",
        "titleFa": "رسید ورود گرانول و مواد اولیه پلی‌پروپیلن تدبیر (مسجد سلیمان)",
        "titleEn": "Material Receipt: Polypropylene PP HP525J - Tadbir Masjed Soleyman",
        "counterpartyFa": "شرکت تدبیر پتروشیمی (Job: ESP 1066)",
        "counterpartyEn": "Tadbir Petrochemical (ESP 1066)",
        "issueDate": "۱۴۰۳/۰۸/۲۷",
        "itemCount": 2,
        "totalQuantity": 3325,
        "status": "approved",
        "items": [
            {"sku": "ESP-PP-0001", "nameFa": "گرانول پلیمری P.P HP525J", "nameEn": "PP Raw Polymer HP525J", "qty": 2675, "unitFa": "کیلوگرم", "unitEn": "kg"},
            {"sku": "ESP-PP-0002", "nameFa": "گرانول پلیمری P.P C30G", "nameEn": "PP Raw Polymer C30G", "qty": 650, "unitFa": "کیلوگرم", "unitEn": "kg"}
        ]
    },
    {
        "id": "vch-real-04",
        "voucherNo": "WTV-1403-H26",
        "type": "transfer",
        "titleFa": "حواله جابه‌جایی طناب پکینگ و گسکت‌ها به قفسه H26 پروژه تبریز",
        "titleEn": "Warehouse Transfer: Glass Fiber Rope Packing to H26 - Tabriz",
        "counterpartyFa": "سرپرستی انبار ملزومات پروژه تبریز (ESP 1931)",
        "counterpartyEn": "Tabriz Project Store (ESP 1931)",
        "issueDate": "۱۴۰۳/۰۸/۲۶",
        "itemCount": 1,
        "totalQuantity": 40,
        "status": "approved",
        "items": [
            {"sku": "2000102002", "nameFa": "طناب پکینگ نسوز Ø 3 فایبرگلاس", "nameEn": "Glass Fiber Rope Packing Ø3", "qty": 40, "unitFa": "متر", "unitEn": "m"}
        ]
    }
]

# Write to TypeScript file
ts_content = f'''// src/modules/warehouse/data/mock-warehouse.ts
// Real Raw-Material Data extracted from Excel report
import {{
  WarehouseItem,
  WarehouseBay,
  WarehouseTransaction,
  WarehouseVoucher,
}} from "../types/warehouse.types";

export const WAREHOUSE_CATEGORIES = {json.dumps(categories, ensure_ascii=False, indent=2)};

export const INITIAL_WAREHOUSE_ITEMS: WarehouseItem[] = {json.dumps(initial_items, ensure_ascii=False, indent=2)};

export const MOCK_WAREHOUSE_BAYS: WarehouseBay[] = {json.dumps(bays, ensure_ascii=False, indent=2)};

export const MOCK_WAREHOUSE_TRANSACTIONS: WarehouseTransaction[] = {json.dumps(transactions, ensure_ascii=False, indent=2)};

export const MOCK_WAREHOUSE_VOUCHERS: WarehouseVoucher[] = {json.dumps(vouchers, ensure_ascii=False, indent=2)};
'''

with open(r'c:\Users\s.jalili\Repositories\esp-app\src\modules\warehouse\data\mock-warehouse.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Successfully wrote updated real data to mock-warehouse.ts!")

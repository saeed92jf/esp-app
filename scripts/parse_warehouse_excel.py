# scripts/parse_warehouse_excel.py
import openpyxl
import json
import os
import re

excel_path = r"C:\Users\s.jalili\Desktop\Resource\Raw-Material report.xlsx"

CATEGORY_MAP = {
    "Plate ": {"fa": "ورق‌های استیل و آلیاژی", "en": "Plates & Sheets", "code": "PLT"},
    "Coil": {"fa": "کویل‌ها و رول‌های صنعتی", "en": "Coils & Strips", "code": "COIL"},
    "Coil (2)": {"fa": "کویل‌ها و رول‌های صنعتی", "en": "Coils & Strips", "code": "COIL"},
    "Pipe ": {"fa": "لوله‌ها و تیوب‌های صنعتی", "en": "Pipes & Tubes", "code": "PIPE"},
    "Thin plate & Bar ": {"fa": "تسمه‌ها و ورق‌های نازک", "en": "Thin Plates & Bars", "code": "BAR"},
    "Mesh ": {"fa": "مش‌ها و توری‌های صنعتی", "en": "Industrial Mesh", "code": "MESH"},
    "Rod & wire": {"fa": "مفتول‌ها و سیم‌های آلیاژی", "en": "Rods & Wires", "code": "WIRE"},
    "Rod ": {"fa": "میلگردها و رادهای صنعتی", "en": "Industrial Rods", "code": "ROD"},
    "Random Packing": {"fa": "رندوم پکینگ و پرکننده‌ها", "en": "Random Packing", "code": "PCK"},
    "Bolt & Nut": {"fa": "پیچ‌ها و مهره‌ها", "en": "Bolts & Nuts", "code": "BLT"},
    "Washer": {"fa": "واشرها و پکینگ‌های تخت", "en": "Washers", "code": "WSH"},
    "Valve": {"fa": "شیرآلات و سیت‌ها", "en": "Valves", "code": "VLV"},
    "Wire": {"fa": "سیم‌ها و وایرهای فرآیندی", "en": "Wires", "code": "WIRE"},
    "Flange -shiraz": {"fa": "فلنج‌ها", "en": "Flanges", "code": "FLG"},
    "Fitting": {"fa": "اتصالات و فیتینگ‌ها", "en": "Fittings", "code": "FIT"},
    "Gasket": {"fa": "گسکت‌ها و آب‌بندها", "en": "Gaskets & Seals", "code": "GSK"},
    "Bubble cap": {"fa": "بابل‌کپ‌ها و رایزرها", "en": "Bubble Caps & Risers", "code": "CAP"},
    "P.P": {"fa": "مواد پلیمری و گرانول (PP)", "en": "Polypropylene & Polymers", "code": "PP"},
    "ANGLE&UNP&HEA": {"fa": "پروفیل‌ها، نبشی و ناودانی", "en": "Structural Profiles & Angles", "code": "PRF"},
}

def clean_val(v):
    if v is None:
        return None
    s = str(v).strip()
    if s == "" or s == "-" or s == "None":
        return None
    return s

def clean_num(v, default=0.0):
    if v is None:
        return default
    if isinstance(v, (int, float)):
        return float(v)
    try:
        s = str(v).replace(",", "").strip()
        s = re.sub(r"[^\d.]", "", s)
        return float(s) if s else default
    except Exception:
        return default

def normalize_status(raw_status):
    if not raw_status:
        return "in_stock"
    s = str(raw_status).lower().strip()
    if any(w in s for w in ["available", "موجود", "stock"]):
        return "in_stock"
    if any(w in s for w in ["manufacture", "تولید", "کارگاه"]):
        return "in_progress"
    if any(w in s for w in ["booked", "رزرو", "تخصیص"]):
        return "booked"
    if any(w in s for w in ["critical", "کسری", "low"]):
        return "low_stock"
    return "in_stock"

print("Opening workbook in streaming mode...")
wb = openpyxl.load_workbook(excel_path, read_only=True, data_only=True)

all_items = []
category_stats = {}
global_index = 0

for sheet_name in wb.sheetnames:
    sheet = wb[sheet_name]
    cat_info = CATEGORY_MAP.get(sheet_name, {
        "fa": sheet_name.strip(),
        "en": sheet_name.strip(),
        "code": "RAW"
    })
    
    consecutive_empty = 0
    header_found = False
    
    for r_idx, row in enumerate(sheet.iter_rows(values_only=True), start=1):
        vals = [c for c in row[:25]]
        if not any(v is not None and str(v).strip() != "" for v in vals):
            consecutive_empty += 1
            if consecutive_empty > 25 and r_idx > 30:
                break
            continue
        consecutive_empty = 0
        
        if r_idx == 5:
            continue
        if r_idx == 6:
            header_found = True
            continue
            
        if not header_found or r_idx <= 6:
            continue
            
        coding = clean_val(vals[1]) if len(vals) > 1 else None
        desc = clean_val(vals[2]) if len(vals) > 2 else None
        material = clean_val(vals[3]) if len(vals) > 3 else None
        
        if not desc and not material and not coding:
            continue
            
        global_index += 1
        sku = coding if coding else f"ESP-{cat_info['code']}-{global_index:05d}"
        
        dim_parts = []
        qty = 1.0
        unit = "Pcs"
        weight = 0.0
        raw_status = None
        client = None
        job_no = None
        location = "انبار مرکزی یورواسلات"
        remarks = None
        packing_list = None
        date_given = None
        
        if "Plate" in sheet_name or "Coil" in sheet_name or "Thin" in sheet_name:
            thk = clean_val(vals[4]) if len(vals) > 4 else None
            w = clean_val(vals[5]) if len(vals) > 5 else None
            l = clean_val(vals[6]) if len(vals) > 6 else None
            if thk: dim_parts.append(f"Thk: {thk}mm")
            if w: dim_parts.append(f"W: {w}mm")
            if l and str(l) != "-": dim_parts.append(f"L: {l}mm")
            
            qty = clean_num(vals[7] if len(vals) > 7 else 1)
            unit = clean_val(vals[8] if len(vals) > 8 else None) or ("Sheet" if "Plate" in sheet_name else "Coil")
            weight = clean_num(vals[9] if len(vals) > 9 else 0)
            raw_status = clean_val(vals[10] if len(vals) > 10 else None)
            client = clean_val(vals[11] if len(vals) > 11 else None)
            job_no = clean_val(vals[12] if len(vals) > 12 else None)
            remarks = clean_val(vals[14] if len(vals) > 14 else None)
            packing_list = clean_val(vals[15] if len(vals) > 15 else None)
            date_given = clean_val(vals[16] if len(vals) > 16 else None)
            
        elif "Pipe" in sheet_name:
            size = clean_val(vals[4]) if len(vals) > 4 else None
            sch = clean_val(vals[5]) if len(vals) > 5 else None
            l = clean_val(vals[6]) if len(vals) > 6 else None
            if size: dim_parts.append(f"Size: {size}")
            if sch: dim_parts.append(f"Sch: {sch}")
            if l: dim_parts.append(f"L: {l}mm")
            
            qty = clean_num(vals[7] if len(vals) > 7 else 1)
            unit = clean_val(vals[8] if len(vals) > 8 else None) or "Branch"
            raw_status = clean_val(vals[9] if len(vals) > 9 else None)
            client = clean_val(vals[10] if len(vals) > 10 else None)
            job_no = clean_val(vals[11] if len(vals) > 11 else None)
            location = clean_val(vals[13] if len(vals) > 13 else None) or location
            remarks = clean_val(vals[14] if len(vals) > 14 else None)
            date_given = clean_val(vals[15] if len(vals) > 15 else None)
            packing_list = clean_val(vals[16] if len(vals) > 16 else None)
            
        elif "Bolt" in sheet_name:
            size = clean_val(vals[4]) if len(vals) > 4 else None
            l = clean_val(vals[5]) if len(vals) > 5 else None
            if size: dim_parts.append(f"Size: {size}")
            if l: dim_parts.append(f"L: {l}mm")
            
            qty = clean_num(vals[6] if len(vals) > 6 else 1)
            unit = clean_val(vals[7] if len(vals) > 7 else None) or "Pcs"
            raw_status = clean_val(vals[8] if len(vals) > 8 else None)
            client = clean_val(vals[9] if len(vals) > 9 else None)
            job_no = clean_val(vals[10] if len(vals) > 10 else None)
            remarks = clean_val(vals[12] if len(vals) > 12 else None)
            date_given = clean_val(vals[13] if len(vals) > 13 else None)
            packing_list = clean_val(vals[14] if len(vals) > 14 else None)
            location = clean_val(vals[15] if len(vals) > 15 else None) or location
            
        elif "Washer" in sheet_name:
            od = clean_val(vals[4]) if len(vals) > 4 else None
            id_ = clean_val(vals[5]) if len(vals) > 5 else None
            thk = clean_val(vals[6]) if len(vals) > 6 else None
            if od: dim_parts.append(f"OD: {od}")
            if id_: dim_parts.append(f"ID: {id_}")
            if thk: dim_parts.append(f"Thk: {thk}mm")
            
            qty = clean_num(vals[7] if len(vals) > 7 else 1)
            unit = clean_val(vals[8] if len(vals) > 8 else None) or "Pcs"
            raw_status = clean_val(vals[9] if len(vals) > 9 else None)
            client = clean_val(vals[10] if len(vals) > 10 else None)
            job_no = clean_val(vals[11] if len(vals) > 11 else None)
            remarks = clean_val(vals[13] if len(vals) > 13 else None)
            date_given = clean_val(vals[14] if len(vals) > 14 else None)
            packing_list = clean_val(vals[15] if len(vals) > 15 else None)
            
        else:
            dim_val = clean_val(vals[4]) if len(vals) > 4 else None
            if dim_val: dim_parts.append(str(dim_val))
            qty = clean_num(vals[5] if len(vals) > 5 else (vals[6] if len(vals) > 6 else 1))
            unit = clean_val(vals[6] if len(vals) > 6 else None) or "Pcs"
            raw_status = clean_val(vals[7] if len(vals) > 7 else (vals[8] if len(vals) > 8 else None))
            client = clean_val(vals[8] if len(vals) > 8 else None)
            job_no = clean_val(vals[9] if len(vals) > 9 else None)
            location = clean_val(vals[14] if len(vals) > 14 else (vals[13] if len(vals) > 13 else None)) or location
            remarks = clean_val(vals[11] if len(vals) > 11 else None)
            packing_list = clean_val(vals[12] if len(vals) > 12 else None)
            date_given = clean_val(vals[13] if len(vals) > 13 else None)

        dim_str = " × ".join(dim_parts) if dim_parts else None
        
        mat_str = f" {material}" if material else ""
        dim_str_desc = f" ({dim_str})" if dim_str else ""
        item_title_en = f"{desc or cat_info['en']}{mat_str}{dim_str_desc}".strip()
        item_title_fa = f"{cat_info['fa']} - {desc or ''} {mat_str}{dim_str_desc}".strip()
        
        unit_str = str(unit).strip()
        unit_fa = unit_str
        unit_en = unit_str
        if any(w in unit_str.lower() for w in ["kg", "کیلو"]):
            unit_fa, unit_en = "کیلوگرم", "kg"
        elif any(w in unit_str.lower() for w in ["sheet", "ورق"]):
            unit_fa, unit_en = "ورق", "sheet"
        elif any(w in unit_str.lower() for w in ["coil", "کویل", "رول"]):
            unit_fa, unit_en = "کویل", "coil"
        elif any(w in unit_str.lower() for w in ["branch", "شاخه"]):
            unit_fa, unit_en = "شاخه", "branch"
        elif any(w in unit_str.lower() for w in ["m", "متر"]):
            unit_fa, unit_en = "متر", "m"
        elif any(w in unit_str.lower() for w in ["bag", "کیسه"]):
            unit_fa, unit_en = "کیسه", "bag"
        elif any(w in unit_str.lower() for w in ["pcs", "عدد", "تعداد"]):
            unit_fa, unit_en = "عدد", "pcs"
            
        norm_status = normalize_status(raw_status)
        min_level = max(1, int(qty * 0.15))
        
        item_obj = {
            "id": f"wh-{global_index}",
            "sku": str(sku).strip(),
            "nameFa": item_title_fa,
            "nameEn": item_title_en,
            "categoryFa": cat_info["fa"],
            "categoryEn": cat_info["en"],
            "sheet": sheet_name.strip(),
            "materialGrade": str(material).strip() if material else None,
            "dimensions": dim_str,
            "location": str(location).strip(),
            "quantity": qty,
            "unitFa": unit_fa,
            "unitEn": unit_en,
            "weightKg": weight if weight > 0 else None,
            "minLevel": min_level,
            "status": norm_status,
            "client": client,
            "jobNo": job_no,
            "remarks": remarks,
            "packingList": packing_list,
            "lastUpdated": date_given or "۱۴۰۳/۰۸/۲۸",
        }
        all_items.append(item_obj)
        category_stats[cat_info["en"]] = category_stats.get(cat_info["en"], 0) + 1

print(f"Total extracted items: {len(all_items)}")
print("Categories count:")
for c, cnt in category_stats.items():
    print(f"  {c}: {cnt}")

output_paths = [
    r"C:\ESP_DATA\live\data\warehouse_items.json",
    r"c:\Users\s.jalili\Repositories\ESP-Web-Backend\app\data\warehouse_items.json",
    r"c:\Users\s.jalili\Repositories\esp-app\src\data\mock\warehouse_items.json",
]

for out_path in output_paths:
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_items, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(all_items)} items to {out_path}")

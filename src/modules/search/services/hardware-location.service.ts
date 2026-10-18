// src/modules/search/services/hardware-location.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hardware & Intranet IP Location Registry Database
// ─────────────────────────────────────────────────────────────────────────────

export interface HardwareDeviceEntry {
  ip: string;
  mac?: string;
  nameFa: string;
  nameEn: string;
  departmentFa?: string;
  departmentEn?: string;
  locationKey: "headOffice" | "factory" | "custom";
  notes?: string;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * HARDWARE IP DATABASE
 * بانک اطلاعاتی نشانی‌های سخت‌افزاری و آی‌پی‌های سیستم‌های سازمانی یورو اسلات پارس.
 * آی‌پی کامپیوترها و دیوایس‌های مد نظر را می‌توانید در این آبجکت اضافه یا ویرایش کنید.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const HARDWARE_IP_DATABASE: Record<string, HardwareDeviceEntry> = {
  // دفتر مرکزی - کلاینت‌های واحد مهندسی و محاسبات
  "192.168.10.45": {
    ip: "192.168.10.45",
    nameFa: "دفتر مرکزی (تهران)",
    nameEn: "Head Office (Tehran)",
    departmentFa: "واحد محاسبات و طراحی مخازن",
    departmentEn: "Pressure Vessel Design & Calculations",
    locationKey: "headOffice",
    notes: "ایستگاه کاری ارشد مهندسی مکانیک",
  },
  "192.168.10.1": {
    ip: "192.168.10.1",
    nameFa: "دفتر مرکزی (تهران)",
    nameEn: "Head Office (Tehran)",
    departmentFa: "زیرساخت و فناوری اطلاعات",
    departmentEn: "IT Infrastructure",
    locationKey: "headOffice",
  },
  "192.168.10.12": {
    ip: "192.168.10.12",
    nameFa: "دفتر مرکزی (تهران)",
    nameEn: "Head Office (Tehran)",
    departmentFa: "واحد تحقیق و توسعه (R&D)",
    departmentEn: "R&D Department",
    locationKey: "headOffice",
  },

  // کارخانه و سایت تولید گرمسار - کلاینت‌های کارگاهی و کنترل کیفیت
  "192.168.20.100": {
    ip: "192.168.20.100",
    nameFa: "کارخانه و سایت تولید (گرمسار)",
    nameEn: "Factory & Production Site",
    departmentFa: "کنترل کیفیت و بازرسی (QC/NDT)",
    departmentEn: "Quality Control & Inspection (QC/NDT)",
    locationKey: "factory",
    notes: "ایستگاه کاری سالن تست هیدرواستاتیک",
  },
  "192.168.20.1": {
    ip: "192.168.20.1",
    nameFa: "کارخانه و سایت تولید (گرمسار)",
    nameEn: "Factory & Production Site",
    departmentFa: "مدیریت کارخانه و سالن تولید",
    departmentEn: "Plant Management & Shop Floor",
    locationKey: "factory",
  },
  "192.168.20.50": {
    ip: "192.168.20.50",
    nameFa: "کارخانه و سایت تولید (گرمسار)",
    nameEn: "Factory & Production Site",
    departmentFa: "انبار متریال و ورق‌ها",
    departmentEn: "Material & Plate Storage",
    locationKey: "factory",
  },

  // الگوهای ساب‌نت (Subnet Wildcard Fallbacks)
  "192.168.10.*": {
    ip: "192.168.10.*",
    nameFa: "دفتر مرکزی (تهران)",
    nameEn: "Head Office (Tehran)",
    departmentFa: "شبکه داخلی دفتر مرکزی",
    departmentEn: "Head Office Internal LAN",
    locationKey: "headOffice",
  },
  "192.168.20.*": {
    ip: "192.168.20.*",
    nameFa: "کارخانه و سایت تولید (گرمسار)",
    nameEn: "Factory & Production Site",
    departmentFa: "شبکه داخلی کارخانه",
    departmentEn: "Factory Internal LAN",
    locationKey: "factory",
  },
};

export interface ResolvedLocationResult {
  locationName: string;
  department?: string;
  locationKey: "headOffice" | "factory" | "custom";
  isMatched: boolean;
}

/**
 * موقعیت مکانی و دپارتمان را بر اساس آی‌پی سخت‌افزاری کامپیوتر از بانک اطلاعاتی استخراج می‌کند.
 */
export function resolveLocationFromIp(
  ip: string,
  locale: string = "fa"
): ResolvedLocationResult {
  const cleanIp = ip.trim();

  // ۱. انطباق دقیق با آی‌پی
  if (HARDWARE_IP_DATABASE[cleanIp]) {
    const item = HARDWARE_IP_DATABASE[cleanIp];
    return {
      locationName: locale === "fa" ? item.nameFa : item.nameEn,
      department: locale === "fa" ? item.departmentFa : item.departmentEn,
      locationKey: item.locationKey,
      isMatched: true,
    };
  }

  // ۲. انطباق با رنج ساب‌نت (مثلاً 192.168.10.*)
  const ipParts = cleanIp.split(".");
  if (ipParts.length === 4) {
    const subnetKey = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.*`;
    if (HARDWARE_IP_DATABASE[subnetKey]) {
      const item = HARDWARE_IP_DATABASE[subnetKey];
      return {
        locationName: locale === "fa" ? item.nameFa : item.nameEn,
        department: locale === "fa" ? item.departmentFa : item.departmentEn,
        locationKey: item.locationKey,
        isMatched: true,
      };
    }
  }

  // ۳. حالت پیش‌فرض در صورت عدم تطابق با بانک
  return {
    locationName:
      locale === "fa" ? "دفتر مرکزی (تهران)" : "Head Office (Tehran)",
    department:
      locale === "fa" ? "شبکه سازمانی" : "Enterprise Network",
    locationKey: "headOffice",
    isMatched: false,
  };
}

/**
 * تلاش برای خواندن آی‌پی کلاینت (شبکه داخلی یا بیرونی)
 */
export async function detectClientIp(): Promise<string> {
  // ۱. تلاش برای خواندن آی‌پی محلی از طریق WebRTC (در اینترانت و شبکه داخلی)
  try {
    const localIp = await new Promise<string>((resolve) => {
      const timer = setTimeout(() => resolve(""), 1200);
      try {
        const RTCPC =
          window.RTCPeerConnection ||
          (window as unknown as { webkitRTCPeerConnection: typeof RTCPeerConnection }).webkitRTCPeerConnection;
        if (!RTCPC) {
          clearTimeout(timer);
          return resolve("");
        }

        const pc = new RTCPC({ iceServers: [] });
        pc.createDataChannel("");
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .catch(() => {});

        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) return;
          const candidate = ice.candidate.candidate;
          const match = candidate.match(
            /([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/
          );
          if (match && match[1] && !match[1].startsWith("127.")) {
            clearTimeout(timer);
            pc.close();
            resolve(match[1]);
          }
        };
      } catch {
        clearTimeout(timer);
        resolve("");
      }
    });

    if (localIp) {
      return localIp;
    }
  } catch {
    // Continue to external check
  }

  // ۲. در صورت در دسترس بودن اینترنت، استفاده از سرویس عمومی IP
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(1500),
    });
    const data = await res.json();
    if (data?.ip) {
      return data.ip;
    }
  } catch {
    // Intranet or offline fallback
  }

  // ۳. نشانی پیش‌فرض کلاینت اینترانت
  return "192.168.10.45";
}

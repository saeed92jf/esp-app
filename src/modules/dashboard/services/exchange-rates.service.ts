// src/modules/dashboard/services/exchange-rates.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// این سرویس همیشه در حالت 'real' اجرا می‌شود (در services/index.ts تنظیم شده)
// چون داده‌ها از یک منبع خارجی (TGJU) می‌آیند و fake بودن آن‌ها بی‌معناست.
// ─────────────────────────────────────────────────────────────────────────────

export interface ExchangeRates {
  /** نرخ رسمی بانک مرکزی — ثابت و اعلام‌شده */
  cbi: number;
  /** نرخ سامانه نیما / سنا — برای معاملات تجاری */
  sana: number;
  /** نرخ بازار آزاد — live از TGJU */
  free: number;
  /** منبع داده */
  source?: string;
  /** زمان آخرین به‌روزرسانی */
  updatedAt?: string;
}

export interface IExchangeRatesService {
  getRates(): Promise<ExchangeRates>;
}

// ─── Fake ─────────────────────────────────────────────────────────────────────
// داده ثابت برای محیط توسعه (اگر به‌هر دلیلی نمی‌خواهید API واقعی بزنید)
export class FakeExchangeRatesService implements IExchangeRatesService {
  async getRates(): Promise<ExchangeRates> {
    return {
      cbi: 42000,
      sana: 450000,
      free: 1869000, // مقدار نزدیک به واقعیت برای توسعه
      source: 'fake',
    };
  }
}

// ─── Real ─────────────────────────────────────────────────────────────────────
// داده زنده از TGJU از طریق Next.js API route
export class RealExchangeRatesService implements IExchangeRatesService {
  async getRates(): Promise<ExchangeRates> {
    const res = await fetch('/api/exchange-rates');
    if (!res.ok) throw new Error('Failed to fetch exchange rates');
    return res.json();
  }
}

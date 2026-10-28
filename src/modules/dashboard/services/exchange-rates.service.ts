import exchangeRatesMock from "@/data/mock/exchange-rates.json";
// src/modules/dashboard/services/exchange-rates.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// این سرویس همیشه در حالت 'real' اجرا می‌شود (در services/index.ts تنظیم شده)
// ─────────────────────────────────────────────────────────────────────────────

export interface ExchangeRates {
  /** نرخ رسمی بانک مرکزی — ثابت و اعلام‌شده */
  cbi: number;
  /** نرخ سامانه نیما / سنا — برای معاملات تجاری */
  sana: number;
  /** نرخ بازار آزاد — live از Tetherland */
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
export class FakeExchangeRatesService implements IExchangeRatesService {
  async getRates(): Promise<ExchangeRates> {
    return exchangeRatesMock as unknown as ExchangeRates;
  }
}

// ─── Real ─────────────────────────────────────────────────────────────────────
// از طریق Next.js API route که سمت سرور Tetherland را proxy می‌کند
export class RealExchangeRatesService implements IExchangeRatesService {
  async getRates(): Promise<ExchangeRates> {
    // timestamp برای جلوگیری از هرگونه کش مرورگر یا CDN
    const url = `/api/exchange-rates?t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch exchange rates');
    return res.json();
  }
}

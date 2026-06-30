// src/services/navigation.service.ts
import type { HttpClient } from './core/http';
import type { LucideIcon } from 'lucide-react';
import { NAVIGATION, type NavGroup, type NavItem } from '@/config/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavigationResult {
  groups: NavGroup[];
  /** آیتم‌های قابل نمایش در صفحه Welcome (بدون لاگین) */
  publicItems: NavItem[];
  /** آیتم‌های quick access پیش‌فرض */
  defaultQuickAccess: string[]; // hrefs
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface INavigationService {
  /**
   * دریافت ساختار منو.
   * @param locale - زبان فعلی برای منوهای CMS-driven (در آینده)
   */
  getNavigation(locale?: string): Promise<NavigationResult>;
}

// ─── Fake ─────────────────────────────────────────────────────────────────────

export class FakeNavigationService implements INavigationService {
  async getNavigation(): Promise<NavigationResult> {
    // منو از config استاتیک می‌آید — در real server از CMS یا DB می‌آید
    const publicItems = NAVIGATION.flatMap((g) => g.items.filter((i) => i.public));
    const defaultQuickAccess = NAVIGATION.flatMap((g) => g.items.slice(0, 1))
      .slice(0, 5)
      .map((i) => i.href);

    return { groups: NAVIGATION, publicItems, defaultQuickAccess };
  }
}

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealNavigationService implements INavigationService {
  constructor(private http: HttpClient) {}

  async getNavigation(locale = 'fa'): Promise<NavigationResult> {
    // سرور می‌تواند منوهای پویا، badge، و اطلاعات دسترسی را برگرداند
    return this.http.get<NavigationResult>('/navigation', {
      params: { locale },
      revalidate: 3600, // ۱ ساعت — منو به‌ندرت عوض می‌شود
    });
  }
}

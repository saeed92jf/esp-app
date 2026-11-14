// src/modules/customers/services/contacts.service.ts

import { INITIAL_COMPANY_CONTACTS } from "../data/contacts.data";
import { normalizeTitle } from "../utils/petro-unifier";
import type { CompanyContact, ContactCreateInput, ContactIndustry } from "../types/contacts.types";

const CONTACTS_STORAGE_KEY = "esp_petro_company_contacts_v1";

export function inferContactIndustry(c: CompanyContact): ContactIndustry {
  if (c.industry) return c.industry;
  const name = (c.companyNameFa || "").toLowerCase();
  if (
    name.includes("پتروشیمی") ||
    name.includes("پلیمر") ||
    name.includes("pgpic") ||
    name.includes("تاپیکو") ||
    name.includes("آریاساسول")
  ) {
    return "petrochemical";
  }
  if (
    name.includes("فولاد") ||
    name.includes("ذوب") ||
    name.includes("مس") ||
    name.includes("آلیاژ") ||
    name.includes("نورد")
  ) {
    return "steel";
  }
  if (
    name.includes("پالایشگاه نفت") ||
    name.includes("پالایش نفت") ||
    name.includes("نفت") ||
    name.includes("ستاره خلیج فارس")
  ) {
    return "refinery";
  }
  if (
    name.includes("گاز") ||
    name.includes("بیدبلند") ||
    name.includes("انرژی") ||
    name.includes("پارس جنوبی") ||
    name.includes("spgc")
  ) {
    return "gas";
  }
  return "other";
}

class ContactsService {
  private contacts: CompanyContact[] = [];
  private isLoaded = false;

  private load(): void {
    if (this.isLoaded) return;
    if (typeof window === "undefined") {
      this.contacts = [...INITIAL_COMPANY_CONTACTS];
      this.isLoaded = true;
      return;
    }

    try {
      const stored = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge custom stored contacts with any initial contacts not yet stored
          const seen = new Set(parsed.map((c: CompanyContact) => c.id));
          const additions = INITIAL_COMPANY_CONTACTS.filter((c) => !seen.has(c.id));
          this.contacts = [...parsed, ...additions];
          this.isLoaded = true;
          return;
        }
      }
    } catch (err) {
      console.error("Failed to load contacts from localStorage:", err);
    }

    this.contacts = [...INITIAL_COMPANY_CONTACTS];
    this.save();
    this.isLoaded = true;
  }

  private save(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(this.contacts));
    } catch (err) {
      console.error("Failed to save contacts to localStorage:", err);
    }
  }

  public getContacts(filters?: {
    search?: string;
    company?: string;
    department?: string;
    industry?: string;
  }): CompanyContact[] {
    this.load();
    let list = [...this.contacts];

    if (filters?.industry && filters.industry !== "all") {
      list = list.filter((c) => inferContactIndustry(c) === filters.industry);
    }

    if (filters?.company && filters.company !== "all") {
      const targetNorm = normalizeTitle(filters.company);
      list = list.filter((c) => {
        const cNorm = normalizeTitle(c.companyNameFa);
        return (
          cNorm === targetNorm ||
          cNorm.includes(targetNorm) ||
          targetNorm.includes(cNorm)
        );
      });
    }

    if (filters?.department && filters.department !== "all") {
      list = list.filter((c) => c.department === filters.department);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.fullNameFa.toLowerCase().includes(q) ||
          (c.fullNameEn && c.fullNameEn.toLowerCase().includes(q)) ||
          c.companyNameFa.toLowerCase().includes(q) ||
          c.jobTitleFa.toLowerCase().includes(q) ||
          (c.phoneDirect && c.phoneDirect.includes(q)) ||
          (c.phoneExtension && c.phoneExtension.includes(q)) ||
          (c.mobilePhone && c.mobilePhone.includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.locationFa && c.locationFa.toLowerCase().includes(q))
      );
    }

    return list;
  }

  public getContactsForCompany(companyNameOrId: string): CompanyContact[] {
    if (!companyNameOrId) return [];
    this.load();
    const targetNorm = normalizeTitle(companyNameOrId);
    return this.contacts.filter((c) => {
      if (c.companyId === companyNameOrId) return true;
      const cNorm = normalizeTitle(c.companyNameFa);
      return (
        cNorm === targetNorm ||
        cNorm.includes(targetNorm) ||
        targetNorm.includes(cNorm)
      );
    });
  }

  public addContact(input: ContactCreateInput): CompanyContact {
    this.load();
    const newContact: CompanyContact = {
      id: `cnt-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...input,
      createdAt: new Date().toISOString(),
    };

    this.contacts.unshift(newContact);
    this.save();
    return newContact;
  }

  public deleteContact(id: string): boolean {
    this.load();
    const beforeLen = this.contacts.length;
    this.contacts = this.contacts.filter((c) => c.id !== id);
    if (this.contacts.length !== beforeLen) {
      this.save();
      return true;
    }
    return false;
  }

  public toggleKeyContact(id: string): boolean {
    this.load();
    const contact = this.contacts.find((c) => c.id === id);
    if (contact) {
      contact.isKeyContact = !contact.isKeyContact;
      this.save();
      return contact.isKeyContact;
    }
    return false;
  }

  public updateContact(id: string, updates: Partial<CompanyContact>): CompanyContact | null {
    this.load();
    const index = this.contacts.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.contacts[index] = {
        ...this.contacts[index],
        ...updates,
      };
      this.save();
      return this.contacts[index];
    }
    return null;
  }

  public getCompaniesWithContacts(): { nameFa: string; count: number }[] {
    this.load();
    const map = new Map<string, number>();
    for (const c of this.contacts) {
      const name = c.companyNameFa;
      map.set(name, (map.get(name) || 0) + 1);
    }
    return Array.from(map.entries()).map(([nameFa, count]) => ({
      nameFa,
      count,
    }));
  }
}

export const contactsService = new ContactsService();


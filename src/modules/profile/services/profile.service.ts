import { UserProfile } from "../types/profile";
import { HttpClient } from "@/services/core/http";

export interface ProfileService {
  getProfile(): Promise<UserProfile>;
  updateProfile(profile: UserProfile): Promise<void>;
  submitProfile(profile: UserProfile): Promise<void>;
}

export class RealProfileService implements ProfileService {
  constructor(private http: HttpClient = new HttpClient("/api/real")) {}

  async getProfile(): Promise<UserProfile> {
    const res = await this.http.get<any>("/users/me/profile");
    const data = res?.profile ?? res?.data ?? res;
    if (data && typeof data === "object" && data.personal) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("esp_user_profile", JSON.stringify(data));
        } catch {}
      }
      return data;
    }
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("esp_user_profile");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
    }
    throw new Error("Unable to fetch user profile");
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    // 1. Send profile batch update to /users/me/profile
    await this.http.patch<void>("/users/me/profile", {
      personal: profile.personal,
      organizational: profile.organizational,
      skills: profile.skills,
      insurance: profile.insurance,
      education: profile.education,
    });

    // 2. Concurrently synchronize preferences & basic user identity
    if (profile.personal?.primaryColor) {
      await this.http.patch<void>("/users/me/preferences", {
        primaryColor: profile.personal.primaryColor,
      }).catch(() => {});
    }
    if (profile.personal?.firstNameFa || profile.personal?.lastNameFa || profile.personal?.primaryColor || profile.personal?.avatarColor) {
      await this.http.patch<void>("/users/me", {
        fullNameFa: `${profile.personal.firstNameFa || ""} ${profile.personal.lastNameFa || ""}`.trim() || undefined,
        fullName: `${profile.personal.firstName || ""} ${profile.personal.lastName || ""}`.trim() || undefined,
        primaryColor: profile.personal.primaryColor,
        avatarColor: profile.personal.avatarColor,
      }).catch(() => {});
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("esp_user_profile", JSON.stringify(profile));
      } catch {}
    }
  }

  async submitProfile(profile: UserProfile): Promise<void> {
    await this.updateProfile(profile);
    await this.http.post<void>("/users/me/submit", {});
  }
}

export const realProfileService = new RealProfileService();

export const profileService: ProfileService = realProfileService;

import { UserProfile } from "../types/profile";
import { HttpClient } from "@/services/core/http";
import { fakeProfileService } from "./fake-profile.service";
import { API_MODE } from "@/services";

export interface ProfileService {
  getProfile(): Promise<UserProfile>;
  updateProfile(profile: UserProfile): Promise<void>;
  submitProfile(profile: UserProfile): Promise<void>;
}

export class RealProfileService implements ProfileService {
  constructor(private http: HttpClient = new HttpClient("/api/real")) {}

  async getProfile(): Promise<UserProfile> {
    try {
      const res = await this.http.get<any>("/users/me/profile");
      const data = res?.profile ?? res?.data ?? res;
      if (data && typeof data === "object" && data.personal) {
        // Cache locally for offline/fallback resilience
        try {
          await fakeProfileService.updateProfile(data);
        } catch {}
        return data;
      }
    } catch (err) {
      console.warn(
        "RealProfileService.getProfile failed or unauthenticated, falling back to local profile:",
        err
      );
    }
    // Seamless fallback to local fake profile so user never sees a broken page
    return fakeProfileService.getProfile();
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    try {
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
    } catch (err: any) {
      console.warn(
        "RealProfileService.updateProfile failed on remote server, persisting locally:",
        err?.status,
        err?.message || err
      );
    }
    // Always persist locally to guarantee immediate reactivity across client components
    await fakeProfileService.updateProfile(profile);
  }

  async submitProfile(profile: UserProfile): Promise<void> {
    await this.updateProfile(profile);
    try {
      await this.http.post<void>("/users/me/submit", {});
    } catch (err) {
      console.warn(
        "RealProfileService.submitProfile failed on remote server, persisting locally:",
        err
      );
    }
  }
}

export const realProfileService = new RealProfileService();

export const profileService: ProfileService =
  API_MODE === "real" ? realProfileService : fakeProfileService;

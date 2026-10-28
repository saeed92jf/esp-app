import { ProfileService } from "./profile.service";
import { UserProfile } from "../types/profile";
import profileMockData from "@/data/mock/profile.json";

const MOCK_PROFILE: UserProfile = profileMockData as unknown as UserProfile;

export class FakeProfileService implements ProfileService {
  private profile = { ...MOCK_PROFILE };

  async getProfile(): Promise<UserProfile> {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("esp_user_profile");
        if (stored) {
          this.profile = JSON.parse(stored);
        }
        const rawAuth = localStorage.getItem("esp_auth_user") || localStorage.getItem("esp-auth-user");
        if (rawAuth) {
          const authUser = JSON.parse(rawAuth);
          if (authUser.avatarColor) {
            this.profile.personal.avatarColor = authUser.avatarColor;
          }
          if (authUser.primaryColor && !this.profile.personal.primaryColor) {
            this.profile.personal.primaryColor = authUser.primaryColor;
          }
        }
      } catch {
        // ignore
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.profile), 300);
    });
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    this.profile = { ...profile };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("esp_user_profile", JSON.stringify(this.profile));

        // Update auth user session if present
        const rawAuth = localStorage.getItem("esp_auth_user") || localStorage.getItem("esp-auth-user");
        if (rawAuth) {
          const authUser = JSON.parse(rawAuth);
          authUser.isProfileCompleted = true;
          if (profile.personal?.primaryColor) {
            authUser.primaryColor = profile.personal.primaryColor;
          }
          if (profile.personal?.avatarColor) {
            authUser.avatarColor = profile.personal.avatarColor;
          }
          if (authUser.accountStatus === "pending_profile") {
            authUser.accountStatus = "pending_approval";
          }
          localStorage.setItem("esp_auth_user", JSON.stringify(authUser));
          localStorage.setItem("esp-auth-user", JSON.stringify(authUser));

          // Also update mock database override
          try {
            const stored = localStorage.getItem("esp_demo_users_override");
            if (stored) {
              const users = JSON.parse(stored);
              const u = users.find((item: any) => item.user.id === authUser.id);
              if (u) {
                if (profile.personal?.primaryColor) {
                  u.user.primaryColor = profile.personal.primaryColor;
                }
                if (profile.personal?.avatarColor) {
                  u.user.avatarColor = profile.personal.avatarColor;
                }
                localStorage.setItem("esp_demo_users_override", JSON.stringify(users));
              }
            }
          } catch {}
        }

        // Update corresponding request in esp_account_requests
        const rawReqs = localStorage.getItem("esp_account_requests");
        if (rawReqs) {
          const reqs = JSON.parse(rawReqs);
          const userEmail = profile.personal?.email?.toLowerCase();
          if (userEmail) {
            const found = reqs.find((r: any) => r.email?.toLowerCase() === userEmail);
            if (found) {
              found.isProfileCompleted = true;
              localStorage.setItem("esp_account_requests", JSON.stringify(reqs));
            }
          }
        }
      } catch {
        // ignore
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 400);
    });
  }
}

export const fakeProfileService = new FakeProfileService();
export const profileService = fakeProfileService;

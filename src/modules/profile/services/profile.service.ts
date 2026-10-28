import { UserProfile } from "../types/profile";
import { HttpClient } from "@/services/core/http";
import { fakeProfileService } from "./fake-profile.service";
import { API_MODE } from "@/services";

export interface ProfileService {
  getProfile(): Promise<UserProfile>;
  updateProfile(profile: UserProfile): Promise<void>;
}

export class RealProfileService implements ProfileService {
  constructor(private http: HttpClient = new HttpClient("/api/real")) {}

  async getProfile(): Promise<UserProfile> {
    const res = await this.http.get<any>("/users/me/profile");
    return res?.profile ?? res?.data ?? res;
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    await this.http.patch<void>("/users/me/profile", profile);
  }
}

export const realProfileService = new RealProfileService();

export const profileService: ProfileService =
  API_MODE === "real" ? realProfileService : fakeProfileService;

import { UserProfile } from "../types/profile";
import { HttpClient } from "@/services/core/http";

export interface ProfileService {
  getProfile(): Promise<UserProfile>;
  updateProfile(profile: UserProfile): Promise<void>;
}

export class RealProfileService implements ProfileService {
  constructor(private http: HttpClient = new HttpClient("/api/real")) {}

  async getProfile(): Promise<UserProfile> {
    return this.http.get<UserProfile>("/users/me/profile");
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    await this.http.patch<void>("/users/me/profile", profile);
  }
}

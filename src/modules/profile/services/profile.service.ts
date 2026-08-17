import { UserProfile } from "../types/profile";

export interface ProfileService {
  getProfile(): Promise<UserProfile>;
  updateProfile(profile: UserProfile): Promise<void>;
}

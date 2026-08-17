import { ProfileService } from "./profile.service";
import { UserProfile } from "../types/profile";

const MOCK_PROFILE: UserProfile = {
  personal: {
    firstName: "سعید",
    lastName: "جلیلی",
    nationalId: "0123456789",
    phone: "09123456789",
    email: "saeed@example.com",
    address: "تهران، خیابان ولیعصر، برج سپهر",
    birthDate: "1370/05/12",
  },
  organizational: {
    department: "فناوری اطلاعات",
    role: "مدیر فنی",
    employeeId: "ESP-9801",
    joinDate: "1398/02/01",
    manager: "علی احمدی",
  },
  skills: [
    { id: "1", name: "React", level: 5 },
    { id: "2", name: "TypeScript", level: 4 },
    { id: "3", name: "Node.js", level: 4 },
  ],
  insurance: {
    insuranceCode: "12345678",
    provider: "تامین اجتماعی",
    validUntil: "1405/12/29",
    type: "بیمه اجباری",
  },
};

export class FakeProfileService implements ProfileService {
  private profile = { ...MOCK_PROFILE };

  async getProfile(): Promise<UserProfile> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.profile), 600);
    });
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.profile = { ...profile };
        resolve();
      }, 800);
    });
  }
}

export const profileService = new FakeProfileService();

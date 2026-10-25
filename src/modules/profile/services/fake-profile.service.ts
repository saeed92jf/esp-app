import { ProfileService } from "./profile.service";
import { UserProfile } from "../types/profile";

const MOCK_PROFILE: UserProfile = {
  personal: {
    firstName: "Saeed",
    lastName: "Jalili",
    firstNameFa: "سعید",
    lastNameFa: "جلیلی",
    avatarColor: "#0284c7",
    nationalId: "0123456789",
    phone: "09120000000",
    email: "saeed@euroslotpars.com",
    address: "تهران، خیابان ولیعصر، برج سپهر",
    birthDate: "1370/05/12",
    phoneVerified: true,
    emailVerified: true,
    maritalStatus: "married",
    childrenCount: 1,
  },
  organizational: {
    department: "فناوری اطلاعات",
    role: "مدیر فنی",
    employeeId: "ESP-9801",
    joinDate: "1398/02/01",
    manager: "علی احمدی",
    extensionNumber: "105",
    workLocation: "office",
    contractType: "full_time",
    subordinates: ["رضا محمدی", "زهرا کریمی", "مهرداد نوری"],
    subordinatesCount: 3,
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
    supplementaryPlan: "golden",
    shebaNumber: "IR120120000000001234567890",
    dependentsCount: 2,
    dependents: [
      {
        id: "dep_1",
        fullName: "مریم حسینی",
        relationship: "همسر",
        nationalId: "0012345678",
        birthDate: "1372/08/14",
      },
      {
        id: "dep_2",
        fullName: "آراد جلیلی",
        relationship: "فرزند",
        nationalId: "0023456789",
        birthDate: "1400/03/20",
      },
    ],
  },
  education: {
    degree: "کارشناسی ارشد",
    fieldOfStudy: "مهندسی متالورژی و سرامیک",
    university: "دانشگاه صنعتی شریف",
    graduationYear: "1395/04/15",
    records: [
      {
        id: "edu_1",
        degree: "کارشناسی",
        fieldOfStudy: "مهندسی متالورژی و مواد",
        university: "دانشگاه تهران",
        graduationYear: "1392/04/10",
      },
      {
        id: "edu_2",
        degree: "کارشناسی ارشد",
        fieldOfStudy: "مهندسی متالورژی و سرامیک",
        university: "دانشگاه صنعتی شریف",
        graduationYear: "1395/04/15",
      },
    ],
  },
};

export class FakeProfileService implements ProfileService {
  private profile = { ...MOCK_PROFILE };

  async getProfile(): Promise<UserProfile> {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("esp_user_profile");
        if (stored) {
          this.profile = JSON.parse(stored);
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
        const rawAuth = localStorage.getItem("esp_auth_user");
        if (rawAuth) {
          const authUser = JSON.parse(rawAuth);
          authUser.isProfileCompleted = true;
          if (authUser.accountStatus === "pending_profile") {
            authUser.accountStatus = "pending_approval";
          }
          localStorage.setItem("esp_auth_user", JSON.stringify(authUser));
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

export const profileService = new FakeProfileService();

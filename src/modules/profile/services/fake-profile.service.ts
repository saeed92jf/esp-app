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
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            this.profile = {
              ...MOCK_PROFILE,
              ...parsed,
              personal: {
                ...MOCK_PROFILE.personal,
                ...(parsed.personal || {}),
              },
              organizational: {
                ...MOCK_PROFILE.organizational,
                ...(parsed.organizational || {}),
              },
              insurance: {
                ...MOCK_PROFILE.insurance,
                ...(parsed.insurance || {}),
              },
              education: {
                ...MOCK_PROFILE.education,
                ...(parsed.education || {}),
              },
              skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : MOCK_PROFILE.skills,
              projects: Array.isArray(parsed.projects) ? parsed.projects : (MOCK_PROFILE.projects || []),
              experiences: Array.isArray(parsed.experiences) ? parsed.experiences : (MOCK_PROFILE.experiences || []),
              documents: Array.isArray(parsed.documents) && parsed.documents.length > 0 ? parsed.documents : (MOCK_PROFILE as any).documents || [],
            };
          }
        } else {
          this.profile = { ...MOCK_PROFILE };
        }

        // Clean any legacy mock avatar URLs
        if (this.profile?.personal?.avatar && (this.profile.personal.avatar.includes("unsplash.com") || this.profile.personal.avatar.includes("saeed-jalili-fard") || this.profile.personal.avatar.includes("/team/"))) {
          this.profile.personal.avatar = undefined;
          this.profile.personal.avatarUrl = undefined;
          this.profile.personal.avatarMode = "initials";
        }

        const rawAuth = localStorage.getItem("esp_auth_user") || localStorage.getItem("esp-auth-user");
        if (rawAuth) {
          const authUser = JSON.parse(rawAuth);
          const isSaeed = authUser.id === "u-saeed" || authUser.email?.includes("jalili");
          if (!isSaeed && (!stored || !JSON.parse(stored)?.personal?.nationalId)) {
            const email = authUser.email || "";
            const defaultName = authUser.name || authUser.fullName || email.split("@")[0];
            this.profile = {
              ...MOCK_PROFILE,
              userId: authUser.id,
              personal: {
                ...MOCK_PROFILE.personal,
                firstName: "",
                lastName: "",
                firstNameFa: "",
                lastNameFa: "",
                nationalId: "",
                phone: authUser.mobile || "",
                email: email,
                address: "",
                birthDate: "",
                avatar: undefined,
                avatarUrl: undefined,
                avatarColor: authUser.avatarColor || "#0284c7",
                maritalStatus: "single",
                childrenCount: 0,
              },
              organizational: {
                ...MOCK_PROFILE.organizational,
                department: "",
                role: "",
                employeeId: "",
                joinDate: "",
                manager: "",
              },
              education: {
                degree: "",
                fieldOfStudy: "",
                university: "",
                graduationYear: "",
                records: [],
              },
              documents: [],
              skills: [],
            };
          } else if (authUser && this.profile?.personal) {
            if (authUser.avatarColor) {
              this.profile.personal.avatarColor = authUser.avatarColor;
            }
            if (authUser.avatar && !authUser.avatar.includes("unsplash.com") && !authUser.avatar.includes("saeed-jalili-fard") && !authUser.avatar.includes("/team/")) {
              this.profile.personal.avatar = authUser.avatar;
              this.profile.personal.avatarUrl = authUser.avatar;
              this.profile.personal.avatarMode = "photo";
            } else if (authUser.avatarMode === "initials" || !authUser.avatar) {
              this.profile.personal.avatar = undefined;
              this.profile.personal.avatarUrl = undefined;
              this.profile.personal.avatarMode = "initials";
            }
            if (authUser.primaryColor) {
              this.profile.personal.primaryColor = authUser.primaryColor;
            }
            if (!this.profile.documents && (MOCK_PROFILE as any).documents) {
              this.profile.documents = (MOCK_PROFILE as any).documents;
            }
          }
        }
      } catch (err) {
        console.error("Error reading profile cache:", err);
        this.profile = { ...MOCK_PROFILE };
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.profile), 150);
    });
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    this.profile = { ...profile };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("esp_user_profile", JSON.stringify(this.profile));

        // Update auth user session if present and persist per user id/email
        const rawAuth = localStorage.getItem("esp_auth_user") || localStorage.getItem("esp-auth-user");
        let userId = "";
        let userEmail = "";
        if (rawAuth) {
          const authUser = JSON.parse(rawAuth);
          userId = authUser.id || "";
          userEmail = (authUser.email || "").toLowerCase();
          authUser.isProfileCompleted = true;
          if (profile.personal?.firstNameFa && profile.personal?.lastNameFa) {
            authUser.fullNameFa = `${profile.personal.firstNameFa} ${profile.personal.lastNameFa}`.trim();
            authUser.name = authUser.fullNameFa;
          }
          if (profile.personal?.firstName && profile.personal?.lastName) {
            authUser.fullName = `${profile.personal.firstName} ${profile.personal.lastName}`.trim();
          }
          if (profile.personal?.primaryColor) {
            authUser.primaryColor = profile.personal.primaryColor;
          }
          if (profile.personal?.avatarColor) {
            authUser.avatarColor = profile.personal.avatarColor;
          }
          if (profile.personal?.avatar !== undefined) {
            authUser.avatar = profile.personal.avatar;
            authUser.imageUrl = profile.personal.avatar;
          }
          if (profile.personal?.avatarMode) {
            authUser.avatarMode = profile.personal.avatarMode;
          }
          if (authUser.accountStatus === "pending_profile") {
            authUser.accountStatus = "pending_manager";
          }
          if (profile.documents) {
            authUser.documents = profile.documents;
          }
          localStorage.setItem("esp_auth_user", JSON.stringify(authUser));
          localStorage.setItem("esp-auth-user", JSON.stringify(authUser));

          if (userId) {
            localStorage.setItem(`esp_user_profile_${userId}`, JSON.stringify(this.profile));
          }
          if (userEmail) {
            localStorage.setItem(`esp_user_profile_${userEmail}`, JSON.stringify(this.profile));
          }
        }

        // Persist to esp_demo_users_override so logout & re-login NEVER wipes changes
        try {
          const rawOverride = localStorage.getItem("esp_demo_users_override");
          let overrides = rawOverride ? JSON.parse(rawOverride) : [];
          if (!Array.isArray(overrides) || overrides.length === 0) {
            const authUsersMock = require("@/data/mock/auth-users.json");
            overrides = Array.isArray(authUsersMock) ? [...authUsersMock] : [];
          }
          overrides = overrides.map((u: any) => {
            if (u.user?.id === userId || (userId === "u-saeed" && (u.email === "saeed@demo.com" || u.mobile === "09120000000"))) {
              return {
                ...u,
                user: {
                  ...u.user,
                  fullName: profile.personal?.firstName && profile.personal?.lastName
                    ? `${profile.personal.firstName} ${profile.personal.lastName}`.trim()
                    : u.user.fullName,
                  fullNameFa: profile.personal?.firstNameFa && profile.personal?.lastNameFa
                    ? `${profile.personal.firstNameFa} ${profile.personal.lastNameFa}`.trim()
                    : u.user.fullNameFa,
                  name: profile.personal?.firstNameFa && profile.personal?.lastNameFa
                    ? `${profile.personal.firstNameFa} ${profile.personal.lastNameFa}`.trim()
                    : u.user.name,
                  primaryColor: profile.personal?.primaryColor || u.user.primaryColor,
                  avatarColor: profile.personal?.avatarColor || u.user.avatarColor,
                  avatar: profile.personal?.avatar !== undefined ? profile.personal.avatar : u.user.avatar,
                  avatarMode: profile.personal?.avatarMode || u.user.avatarMode,
                }
              };
            }
            return u;
          });
          localStorage.setItem("esp_demo_users_override", JSON.stringify(overrides));
        } catch {}

        // Update corresponding request in esp_account_requests
        const rawReqs = localStorage.getItem("esp_account_requests");
        let reqs = rawReqs ? JSON.parse(rawReqs) : [];
        const targetEmail = userEmail || profile.personal?.email?.toLowerCase();
        if (targetEmail) {
          let found = reqs.find((r: any) => r.email?.toLowerCase() === targetEmail);
          const fullName = profile.personal?.firstNameFa && profile.personal?.lastNameFa
            ? `${profile.personal.firstNameFa} ${profile.personal.lastNameFa}`
            : (profile.personal?.firstName && profile.personal?.lastName
              ? `${profile.personal.firstName} ${profile.personal.lastName}`
              : targetEmail.split("@")[0]);

          const profileDataToSync = {
            name: fullName,
            fullName,
            firstNameFa: profile.personal?.firstNameFa,
            lastNameFa: profile.personal?.lastNameFa,
            firstName: profile.personal?.firstName,
            lastName: profile.personal?.lastName,
            email: userEmail,
            phone: profile.personal?.phone,
            nationalId: profile.personal?.nationalId,
            birthDate: profile.personal?.birthDate,
            address: profile.personal?.address,
            maritalStatus: profile.personal?.maritalStatus,
            childrenCount: profile.personal?.childrenCount,
            phoneVerified: profile.personal?.phoneVerified ?? true,
            emailVerified: profile.personal?.emailVerified ?? true,
            avatar: profile.personal?.avatar,
            avatarColor: profile.personal?.avatarColor,
            avatarBgColor: profile.personal?.avatarBgColor,
            avatarMode: profile.personal?.avatarMode,
            department: profile.organizational?.department || "engineering",
            jobTitle: profile.organizational?.role || "کارشناس سازمانی",
            employeeId: profile.organizational?.employeeId,
            joinDate: profile.organizational?.joinDate,
            manager: profile.organizational?.manager,
            extensionNumber: profile.organizational?.extensionNumber,
            workLocation: profile.organizational?.workLocation,
            contractType: profile.organizational?.contractType,
            insuranceCode: profile.insurance?.insuranceCode,
            insuranceProvider: profile.insurance?.provider,
            insuranceValidUntil: profile.insurance?.validUntil,
            supplementaryPlan: profile.insurance?.supplementaryPlan,
            supplementaryProvider: profile.insurance?.supplementaryProvider,
            shebaNumber: profile.insurance?.shebaNumber,
            dependents: profile.insurance?.dependents || [],
            educationDegree: profile.education?.degree,
            educationField: profile.education?.fieldOfStudy,
            university: profile.education?.university,
            graduationYear: profile.education?.graduationYear,
            educationRecords: profile.education?.records || [],
            skills: profile.skills || [],
            documents: profile.documents || [],
            isProfileCompleted: true,
            status: "pending",
          };

          if (found) {
            Object.assign(found, profileDataToSync);
          } else {
            reqs.unshift({
              id: `req-${Date.now()}`,
              userId: profile.id || profile.userId || `u-${Date.now()}`,
              requestedAt: new Date().toISOString(),
              adminApproved: false,
              managerApproved: false,
              ...profileDataToSync,
            });
          }
          localStorage.setItem("esp_account_requests", JSON.stringify(reqs));
        }
      } catch {
        // ignore
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 300);
    });
  }

  async submitProfile(profile: UserProfile): Promise<void> {
    return this.updateProfile(profile);
  }
}

export const fakeProfileService = new FakeProfileService();
export const profileService = fakeProfileService;

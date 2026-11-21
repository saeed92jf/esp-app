// src/lib/server/user-profile-store.ts
import fs from "fs";
import path from "path";
import type { UserProfile } from "@/modules/profile/types/profile";
import type { User } from "@/types/auth";

declare global {
  // eslint-disable-next-line no-var
  var __espServerUserProfiles: Record<string, UserProfile> | undefined;
  // eslint-disable-next-line no-var
  var __espServerAuthUsers: any[] | undefined;
}

const LIVE_PROFILES_PATH = "C:\\ESP_DATA\\live\\data\\user_profiles.json";
const BACKEND_PROFILES_PATH = path.resolve(process.cwd(), "../ESP-Web-Backend/app/data/user_profiles.json");
const LIVE_ADMIN_USERS_PATH = "C:\\ESP_DATA\\live\\data\\admin_users.json";
const BACKEND_ADMIN_USERS_PATH = path.resolve(process.cwd(), "../ESP-Web-Backend/app/data/admin_users.json");

function resolveProfilesPath(): string {
  if (fs.existsSync(LIVE_PROFILES_PATH)) return LIVE_PROFILES_PATH;
  if (fs.existsSync(BACKEND_PROFILES_PATH)) return BACKEND_PROFILES_PATH;
  return LIVE_PROFILES_PATH;
}

function resolveAdminUsersPath(): string {
  if (fs.existsSync(LIVE_ADMIN_USERS_PATH)) return LIVE_ADMIN_USERS_PATH;
  if (fs.existsSync(BACKEND_ADMIN_USERS_PATH)) return BACKEND_ADMIN_USERS_PATH;
  return LIVE_ADMIN_USERS_PATH;
}

// Initialize in-memory per-user map
if (!globalThis.__espServerUserProfiles) {
  globalThis.__espServerUserProfiles = {};
  const pPath = resolveProfilesPath();
  try {
    if (fs.existsSync(pPath)) {
      const raw = fs.readFileSync(pPath, "utf8");
      const seed = JSON.parse(raw);
      if (seed && typeof seed === "object") {
        if (Array.isArray(seed)) {
          for (const item of seed) {
            if (item?.userId) globalThis.__espServerUserProfiles[item.userId.toLowerCase()] = item;
          }
        } else {
          globalThis.__espServerUserProfiles = seed;
        }
      }
    }
  } catch (err) {
    console.error("Failed to load server user profiles:", err);
  }
}

if (!globalThis.__espServerAuthUsers) {
  globalThis.__espServerAuthUsers = [];
  const uPath = resolveAdminUsersPath();
  try {
    if (fs.existsSync(uPath)) {
      const raw = fs.readFileSync(uPath, "utf8");
      const users = JSON.parse(raw);
      if (Array.isArray(users)) {
        globalThis.__espServerAuthUsers = users.map((u: any) => ({
          user: u,
          email: u.email,
          mobile: u.phone,
        }));
      }
    }
  } catch (err) {
    console.error("Failed to load server auth users:", err);
  }
}

function persistProfileToDisk(profile: UserProfile) {
  const uid = (profile.userId || "").toLowerCase();
  if (!uid) return;

  if (globalThis.__espServerUserProfiles) {
    globalThis.__espServerUserProfiles[uid] = profile;
    if (profile.personal?.email) {
      globalThis.__espServerUserProfiles[profile.personal.email.toLowerCase()] = profile;
    }
  }

  try {
    const pPath = resolveProfilesPath();
    const dir = path.dirname(pPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      pPath,
      JSON.stringify(globalThis.__espServerUserProfiles || {}, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error("Failed to persist profile to disk:", err);
  }
}

function persistAuthUsersToDisk() {
  try {
    if (globalThis.__espServerAuthUsers) {
      const uPath = resolveAdminUsersPath();
      const dir = path.dirname(uPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        uPath,
        JSON.stringify(globalThis.__espServerAuthUsers, null, 2),
        "utf8"
      );
    }
  } catch (err) {
    console.error("Failed to persist auth users to disk:", err);
  }
}

export function getServerUserProfile(userId?: string): UserProfile | null {
  const normId = (userId || "").trim().toLowerCase();
  if (!normId) {
    return null;
  }

  const map = globalThis.__espServerUserProfiles || {};

  if (map[normId]) {
    return map[normId];
  }

  // Check by email
  for (const p of Object.values(map)) {
    if (p.personal?.email?.toLowerCase() === normId) {
      return p;
    }
  }

  // If explicitly Saeed
  const isSaeed = normId === "u-saeed" || normId === "s.jalili@euroslotpars.com";
  if (isSaeed && map["u-saeed"]) {
    return map["u-saeed"];
  }

  // Find user in auth users list to create an isolated clean stub
  const authUsers = globalThis.__espServerAuthUsers || [];
  const foundAuth = authUsers.find(
    (au) => au.user?.id?.toLowerCase() === normId || au.email?.toLowerCase() === normId
  );

  if (foundAuth) {
    const cleanProfile: UserProfile = {
      id: `prof-${foundAuth.user?.id || normId}`,
      userId: foundAuth.user?.id || normId,
      personal: {
        firstName: foundAuth.user?.fullName?.split(" ")[0] || "",
        lastName: foundAuth.user?.fullName?.split(" ").slice(1).join(" ") || "",
        firstNameFa: foundAuth.user?.fullNameFa?.split(" ")[0] || "",
        lastNameFa: foundAuth.user?.fullNameFa?.split(" ").slice(1).join(" ") || "",
        fullName: foundAuth.user?.fullName || "",
        fullNameFa: foundAuth.user?.fullNameFa || "",
        email: foundAuth.email || (normId.includes("@") ? normId : ""),
        phone: foundAuth.mobile || "",
        nationalId: "",
        birthDate: "",
        gender: "other",
        maritalStatus: "single",
        militaryStatus: "exempt",
        address: "",
        avatarColor: foundAuth.user?.avatarColor || "#0ea5e9",
        avatar: foundAuth.user?.avatar || undefined,
        avatarMode: foundAuth.user?.avatarMode || "initials",
      },
      organizational: {
        department: foundAuth.user?.department || "engineering",
        role: foundAuth.user?.role || "engineer",
        employeeId: foundAuth.user?.id || "",
        joinDate: "",
        manager: "سعید جلیلی فرد",
        workLocation: "office",
      },
      insurance: {
        insuranceCode: "",
        provider: "تامین اجتماعی",
        validUntil: "",
        type: "tamin_ejtemaei",
        supplementaryPlan: "none",
        supplementaryProvider: "",
      },
      education: {
        degree: "",
        fieldOfStudy: "",
        university: "",
        graduationYear: "",
        records: [],
      },
      skills: [],
      projects: [],
      experiences: [],
      documents: [],
    };

    map[normId] = cleanProfile;
    return cleanProfile;
  }

  return null;
}

export function updateServerUserProfile(patch: Partial<UserProfile>, userId?: string): UserProfile {
  const current = getServerUserProfile(userId);
  if (!current) {
    throw new Error("User profile not found");
  }
  const updated: UserProfile = {
    ...current,
    ...patch,
    personal: {
      ...current.personal,
      ...(patch.personal || {}),
    },
    organizational: {
      ...current.organizational,
      ...(patch.organizational || {}),
    },
    insurance: {
      ...current.insurance,
      ...(patch.insurance || {}),
    },
    education: {
      ...current.education,
      ...(patch.education || {}),
    },
    skills: Array.isArray(patch.skills) ? patch.skills : current.skills,
    projects: Array.isArray(patch.projects) ? patch.projects : (current.projects || []),
    experiences: Array.isArray(patch.experiences) ? patch.experiences : (current.experiences || []),
    documents: Array.isArray(patch.documents) ? patch.documents : current.documents,
  };

  const map = globalThis.__espServerUserProfiles || {};
  const targetId = (userId || updated.userId || "").trim().toLowerCase();
  if (targetId) {
    map[targetId] = updated;
  }
  if (updated.personal?.email) {
    map[updated.personal.email.toLowerCase()] = updated;
  }

  // Persist only if Saeed
  persistProfileToDisk(updated);

  // Update corresponding user in auth users list
  if (patch.personal) {
    updateServerUser({
      id: updated.userId,
      email: updated.personal.email,
      fullName: patch.personal.firstName && patch.personal.lastName
        ? `${patch.personal.firstName} ${patch.personal.lastName}`.trim()
        : undefined,
      fullNameFa: patch.personal.firstNameFa && patch.personal.lastNameFa
        ? `${patch.personal.firstNameFa} ${patch.personal.lastNameFa}`.trim()
        : undefined,
      primaryColor: patch.personal.primaryColor,
      avatarColor: patch.personal.avatarColor,
      avatar: patch.personal.avatar,
      avatarMode: patch.personal.avatarMode,
    });
  }

  return updated;
}

export function updateServerUserPreferences(
  patch: { primaryColor?: string; theme?: string },
  userId?: string
): { primaryColor?: string; theme?: string } {
  if (!userId) return patch;
  const current = getServerUserProfile(userId);
  if (!current) return patch;
  if (patch.primaryColor) {
    current.personal = {
      ...current.personal,
      primaryColor: patch.primaryColor,
    };
    updateServerUserProfile(current, userId);
    updateServerUser({ id: userId, primaryColor: patch.primaryColor });
  }
  return patch;
}

export function updateServerUser(patch: {
  id?: string;
  email?: string;
  fullName?: string;
  fullNameFa?: string;
  primaryColor?: string;
  avatarColor?: string;
  avatar?: string | null;
  avatarMode?: "photo" | "initials";
}): void {
  // STRICT: Do not proceed without explicit target id or email!
  if (!patch.id && !patch.email) {
    return;
  }

  const authUsers = globalThis.__espServerAuthUsers || [];
  let updatedAny = false;

  for (const entry of authUsers) {
    const isTarget =
      (patch.id && entry.user?.id?.toLowerCase() === patch.id.toLowerCase()) ||
      (patch.email && entry.email?.toLowerCase() === patch.email.toLowerCase());

    if (isTarget && entry.user) {
      if (patch.fullName !== undefined) entry.user.fullName = patch.fullName;
      if (patch.fullNameFa !== undefined) entry.user.fullNameFa = patch.fullNameFa;
      if (patch.primaryColor !== undefined) entry.user.primaryColor = patch.primaryColor;
      if (patch.avatarColor !== undefined) entry.user.avatarColor = patch.avatarColor;
      if (patch.avatar !== undefined) entry.user.avatar = patch.avatar;
      if (patch.avatarMode !== undefined) entry.user.avatarMode = patch.avatarMode;
      updatedAny = true;
    }
  }

  if (updatedAny) {
    persistAuthUsersToDisk();
  }
}

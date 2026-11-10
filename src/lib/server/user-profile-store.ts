// src/lib/server/user-profile-store.ts
import fs from "fs";
import path from "path";
import initialProfileMock from "@/data/mock/profile.json";
import initialAuthUsersMock from "@/data/mock/auth-users.json";
import type { UserProfile } from "@/modules/profile/types/profile";
import type { User } from "@/types/auth";

declare global {
  // eslint-disable-next-line no-var
  var __espServerUserProfiles: Record<string, UserProfile> | undefined;
  // eslint-disable-next-line no-var
  var __espServerAuthUsers: any[] | undefined;
}

const PROFILE_FILE_PATH = path.resolve(process.cwd(), "src/data/mock/profile.json");
const AUTH_USERS_FILE_PATH = path.resolve(process.cwd(), "src/data/mock/auth-users.json");

// Initialize in-memory per-user map
if (!globalThis.__espServerUserProfiles) {
  globalThis.__espServerUserProfiles = {};
  try {
    if (fs.existsSync(PROFILE_FILE_PATH)) {
      const raw = fs.readFileSync(PROFILE_FILE_PATH, "utf8");
      const seed = JSON.parse(raw);
      if (seed && seed.userId) {
        globalThis.__espServerUserProfiles[seed.userId.toLowerCase()] = seed;
      }
      globalThis.__espServerUserProfiles["u-saeed"] = seed;
    }
  } catch {
    globalThis.__espServerUserProfiles["u-saeed"] = initialProfileMock as unknown as UserProfile;
  }
}

if (!globalThis.__espServerAuthUsers) {
  try {
    if (fs.existsSync(AUTH_USERS_FILE_PATH)) {
      const raw = fs.readFileSync(AUTH_USERS_FILE_PATH, "utf8");
      globalThis.__espServerAuthUsers = JSON.parse(raw);
    } else {
      globalThis.__espServerAuthUsers = initialAuthUsersMock as any[];
    }
  } catch {
    globalThis.__espServerAuthUsers = initialAuthUsersMock as any[];
  }
}

function persistProfileToDisk(profile: UserProfile) {
  // STRICT SECURITY: Only persist to profile.json if it is specifically u-saeed (Saeed Jalili)
  const uid = (profile.userId || "").toLowerCase();
  const email = (profile.personal?.email || "").toLowerCase();
  const isSaeed = uid === "u-saeed" || email.includes("jalili");

  if (!isSaeed) {
    // Other users' profiles must NEVER overwrite src/data/mock/profile.json!
    return;
  }

  try {
    fs.writeFileSync(
      PROFILE_FILE_PATH,
      JSON.stringify(profile, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error("Failed to persist profile to disk:", err);
  }
}

function persistAuthUsersToDisk() {
  try {
    if (globalThis.__espServerAuthUsers) {
      fs.writeFileSync(
        AUTH_USERS_FILE_PATH,
        JSON.stringify(globalThis.__espServerAuthUsers, null, 2),
        "utf8"
      );
    }
  } catch (err) {
    console.error("Failed to persist auth users to disk:", err);
  }
}

export function getServerUserProfile(userId?: string): UserProfile {
  const map = globalThis.__espServerUserProfiles || {};
  const normId = (userId || "").trim().toLowerCase();

  if (normId && map[normId]) {
    return map[normId];
  }

  // Check by email
  if (normId) {
    for (const p of Object.values(map)) {
      if (p.personal?.email?.toLowerCase() === normId) {
        return p;
      }
    }
  }

  // If Saeed
  const isSaeed = !normId || normId === "u-saeed" || normId.includes("jalili");
  if (isSaeed && map["u-saeed"]) {
    return map["u-saeed"];
  }

  // Find user in auth users list to create an isolated stub
  const authUsers = globalThis.__espServerAuthUsers || [];
  const foundAuth = authUsers.find(
    (au) => au.user?.id?.toLowerCase() === normId || au.email?.toLowerCase() === normId
  );

  const base = (map["u-saeed"] || initialProfileMock) as unknown as UserProfile;
  const userProfile: UserProfile = {
    ...base,
    id: `prof-${normId || "unknown"}`,
    userId: foundAuth?.user?.id || normId || "unknown",
    personal: {
      ...base.personal,
      firstName: foundAuth?.user?.fullName?.split(" ")[0] || "",
      lastName: foundAuth?.user?.fullName?.split(" ").slice(1).join(" ") || "",
      firstNameFa: foundAuth?.user?.fullNameFa?.split(" ")[0] || "",
      lastNameFa: foundAuth?.user?.fullNameFa?.split(" ").slice(1).join(" ") || "",
      fullName: foundAuth?.user?.fullName || "",
      fullNameFa: foundAuth?.user?.fullNameFa || "",
      email: foundAuth?.email || (normId.includes("@") ? normId : ""),
      phone: foundAuth?.mobile || "",
      avatarColor: foundAuth?.user?.avatarColor || "#0ea5e9",
      avatar: foundAuth?.user?.avatar || null,
      avatarMode: foundAuth?.user?.avatarMode || "initials",
    },
    organizational: {
      ...base.organizational,
      role: foundAuth?.user?.role || "engineer",
    },
  };

  if (normId) {
    map[normId] = userProfile;
  }
  return userProfile;
}

export function updateServerUserProfile(patch: Partial<UserProfile>, userId?: string): UserProfile {
  const current = getServerUserProfile(userId);
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

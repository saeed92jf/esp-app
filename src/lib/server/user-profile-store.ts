// src/lib/server/user-profile-store.ts
import fs from "fs";
import path from "path";
import initialProfileMock from "@/data/mock/profile.json";
import initialAuthUsersMock from "@/data/mock/auth-users.json";
import type { UserProfile } from "@/modules/profile/types/profile";
import type { User } from "@/types/auth";

declare global {
  // eslint-disable-next-line no-var
  var __espServerUserProfile: UserProfile | undefined;
  // eslint-disable-next-line no-var
  var __espServerAuthUsers: any[] | undefined;
}

const PROFILE_FILE_PATH = path.resolve(process.cwd(), "src/data/mock/profile.json");
const AUTH_USERS_FILE_PATH = path.resolve(process.cwd(), "src/data/mock/auth-users.json");

// Initialize in-memory singleton
if (!globalThis.__espServerUserProfile) {
  try {
    if (fs.existsSync(PROFILE_FILE_PATH)) {
      const raw = fs.readFileSync(PROFILE_FILE_PATH, "utf8");
      globalThis.__espServerUserProfile = JSON.parse(raw);
    } else {
      globalThis.__espServerUserProfile = initialProfileMock as unknown as UserProfile;
    }
  } catch {
    globalThis.__espServerUserProfile = initialProfileMock as unknown as UserProfile;
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

function persistProfileToDisk() {
  try {
    if (globalThis.__espServerUserProfile) {
      fs.writeFileSync(
        PROFILE_FILE_PATH,
        JSON.stringify(globalThis.__espServerUserProfile, null, 2),
        "utf8"
      );
    }
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

export function getServerUserProfile(): UserProfile {
  return globalThis.__espServerUserProfile || (initialProfileMock as unknown as UserProfile);
}

export function updateServerUserProfile(patch: Partial<UserProfile>): UserProfile {
  const current = getServerUserProfile();
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

  globalThis.__espServerUserProfile = updated;
  persistProfileToDisk();

  // Also update corresponding user in auth users list
  if (patch.personal) {
    updateServerUser({
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

export function updateServerUserPreferences(patch: { primaryColor?: string; theme?: string }): {
  primaryColor?: string;
  theme?: string;
} {
  const current = getServerUserProfile();
  if (patch.primaryColor) {
    current.personal = {
      ...current.personal,
      primaryColor: patch.primaryColor,
    };
    globalThis.__espServerUserProfile = current;
    persistProfileToDisk();

    updateServerUser({ primaryColor: patch.primaryColor });
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
  const authUsers = globalThis.__espServerAuthUsers || [];
  let updatedAny = false;

  for (const entry of authUsers) {
    const isTarget =
      (patch.id && entry.user?.id === patch.id) ||
      (patch.email && entry.email?.toLowerCase() === patch.email.toLowerCase()) ||
      (!patch.id && !patch.email && entry.user?.id === "u-saeed");

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


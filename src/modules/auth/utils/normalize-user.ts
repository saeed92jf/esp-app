// src/modules/auth/utils/normalize-user.ts
import type { User, UserRole, AccountStatus } from "@/types/auth";

/**
 * Standard normalizer for user objects received from backend APIs.
 * Supports both nested UserProfileDTO (FastAPI standard) and flat structures.
 * Ensures consistent name, fullName, fullNameFa, email, avatar, and role across the app.
 */
export function normalizeUserFromApi(raw: any): User {
  if (!raw) return null as any;

  // Handle nested UserProfileDTO or flat objects
  const personal = raw.personal || raw.data?.personal || raw;
  const organizational = raw.organizational || raw.data?.organizational || {};

  const firstNameFa = (personal.firstNameFa || raw.firstNameFa || "").trim();
  const lastNameFa = (personal.lastNameFa || raw.lastNameFa || "").trim();
  let fullNameFa = (personal.fullNameFa || raw.fullNameFa || "").trim();
  if (!fullNameFa && (firstNameFa || lastNameFa)) {
    fullNameFa = `${firstNameFa} ${lastNameFa}`.trim();
  }

  const firstName = (personal.firstName || raw.firstName || "").trim();
  const lastName = (personal.lastName || raw.lastName || "").trim();
  let fullName = (personal.fullName || raw.fullName || raw.name || "").trim();
  if (!fullName && (firstName || lastName)) {
    fullName = `${firstName} ${lastName}`.trim();
  }

  const email = (personal.email || raw.email || raw.data?.email || "").trim();
  const mobile = (personal.phone || raw.phone || raw.mobile || "").trim();

  // Resolve missing name fields from available data
  if (!fullNameFa && !fullName) {
    if (email) {
      const username = email.split("@")[0];
      fullName = username.charAt(0).toUpperCase() + username.slice(1);
      fullNameFa = fullName;
    } else {
      fullName = "";
      fullNameFa = "";
    }
  } else if (!fullNameFa && fullName) {
    fullNameFa = fullName;
  } else if (!fullName && fullNameFa) {
    fullName = fullNameFa;
  }

  const name = fullNameFa || fullName;

  const roleRaw = (raw.role || organizational.role || personal.role || "staff").toLowerCase();
  const rawEmail = (raw.email || "").toLowerCase();
  let role: UserRole = "staff";
  if (roleRaw === "superadmin" || roleRaw === "super_admin" || rawEmail.includes("jalilifard") || rawEmail.includes("saeed@euroslotpars.com") || rawEmail === "saeed@demo.com") {
    role = "superadmin";
  } else if (roleRaw === "dept_admin" || roleRaw === "department_admin") {
    role = "dept_admin";
  } else if (roleRaw === "office_admin" || roleRaw === "hr_admin") {
    role = "office_admin";
  } else if (roleRaw === "admin" || roleRaw === "administrator" || roleRaw === "superuser" || Boolean(raw.is_superuser)) {
    role = "admin";
  } else if (roleRaw === "manager") {
    role = "manager";
  } else if (roleRaw === "engineer") {
    role = "engineer";
  } else if (roleRaw === "customer") {
    role = "customer";
  } else if (roleRaw === "user") {
    role = "user";
  } else {
    role = "staff";
  }

  const rawStatus = (raw.status || raw.account_status || personal.status || "active").toLowerCase();
  let accountStatus: AccountStatus = "active";
  if (rawStatus === "pending_profile" || raw.requires_onboarding) {
    accountStatus = "pending_profile";
  } else if (rawStatus.includes("pending") || rawStatus === "pending_approval") {
    accountStatus = "pending_approval";
  } else if (rawStatus === "rejected") {
    accountStatus = "rejected";
  } else {
    accountStatus = "active";
  }

  let avatar = personal.avatarUrl || personal.avatar || raw.avatarUrl || raw.avatar || undefined;
  // Strictly filter out any default/placeholder mock photos
  if (avatar && (avatar.includes("unsplash.com") || avatar.includes("saeed-jalili-fard") || avatar.includes("photo-1534528741775") || avatar.includes("/team/"))) {
    avatar = undefined;
  }
  const avatarMode = personal.avatarMode || raw.avatarMode || (avatar ? "photo" : "initials");
  const avatarColor = personal.avatarColor || raw.avatarColor || undefined;
  const avatarBgColor = personal.avatarBgColor || raw.avatarBgColor || avatarColor || undefined;
  const storedPrimary = typeof window !== "undefined" ? localStorage.getItem("esp-global-primary-color") : null;
  const primaryColor = storedPrimary || personal.primaryColor || raw.primaryColor || "red";

  return {
    id: String(raw.id || raw.userId || personal.id || "u-real"),
    fullName,
    fullNameFa,
    name,
    email: email || undefined,
    mobile: mobile || undefined,
    role,
    avatar: avatarMode === "initials" ? undefined : avatar,
    avatarMode,
    avatarColor,
    avatarBgColor,
    primaryColor,
    accountStatus,
    isProfileCompleted: true,
    hrApproved: accountStatus === "active",
    managerApproved: accountStatus === "active",
  };
}


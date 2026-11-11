import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface UserRecord {
  id: string;
  name?: string;
  fullName?: string;
  fullNameFa?: string;
  email?: string;
  phone?: string;
  role?: string;
  company?: string;
  companyMembership?: string;
  companyId?: string;
  department?: string;
  subUnit?: string;
  jobTitle?: string;
  jobTitleEn?: string;
  espJobTitle?: string;
  npcJobTitle?: string;
  personnelCode?: string | number;
  personnelCodeEsp?: string | number;
  personnelCodeNpc?: string | number;
  extensionNumber?: string;
  workLocation?: string;
  floor?: string;
  manager?: string;
  managerEsp?: string;
  managerNpc?: string;
  avatarColor?: string;
  avatar?: string | null;
  joinedAt?: string;
  [key: string]: unknown;
}

interface ProfileRecord {
  personal?: {
    avatar?: string | null;
    avatarColor?: string;
    avatarMode?: string;
    [key: string]: unknown;
  };
  organizational?: {
    dutiesEsp?: string;
    dutiesNpc?: string;
    departmentEsp?: string;
    departmentNpc?: string;
    [key: string]: unknown;
  };
  education?: {
    degree?: string;
    fieldOfStudy?: string;
    university?: string;
    graduationYear?: string;
  };
}

export async function GET() {
  try {
    // 1. Resolve path to admin_users.json and user_profiles.json
    const possibleUserPaths = [
      path.join(process.cwd(), "src", "data", "mock", "admin-users.json"),
      "C:\\ESP_DATA\\live\\data\\admin_users.json",
      path.join(process.cwd(), "..", "ESP-Web-Backend", "app", "data", "admin_users.json"),
    ];

    const possibleProfilePaths = [
      "C:\\ESP_DATA\\live\\data\\user_profiles.json",
      path.join(process.cwd(), "..", "ESP-Web-Backend", "app", "data", "user_profiles.json"),
    ];

    let users: UserRecord[] = [];
    for (const p of possibleUserPaths) {
      if (fs.existsSync(p)) {
        try {
          const raw = fs.readFileSync(p, "utf-8");
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            users = parsed;
            break;
          }
        } catch {
          // continue
        }
      }
    }

    let profiles: Record<string, ProfileRecord> = {};
    for (const p of possibleProfilePaths) {
      if (fs.existsSync(p)) {
        try {
          const raw = fs.readFileSync(p, "utf-8");
          profiles = JSON.parse(raw);
          if (profiles && typeof profiles === "object") {
            break;
          }
        } catch {
          // continue
        }
      }
    }

    // 2. Format personnel items safely
    const directory = users.map((u) => {
      const prof = profiles[u.id] || profiles[u.email?.toLowerCase() || ""] || {};
      const pers = prof.personal || {};
      const org = prof.organizational || {};
      const edu = prof.education || {};

      const membership = u.companyMembership || u.company || "Euroslot Pars / یورواسلات پارس";
      const isDual = membership.includes("هر دو") || membership.includes("Dual");
      const isNpcOnly = membership.includes("نانو") && !isDual;

      return {
        id: u.id,
        fullNameFa: u.fullNameFa || u.name || "همکار",
        fullNameEn: u.fullName || u.name || "Coworker",
        avatar: pers.avatar || u.avatar || null,
        avatarColor: pers.avatarColor || u.avatarColor || "#0284c7",
        role: u.role || "engineer",
        companyMembership: membership,
        isDual,
        isNpcOnly,
        // Euroslot Pars details
        esp: {
          hasRole: !isNpcOnly,
          personnelCode: u.personnelCodeEsp || (isNpcOnly ? null : u.personnelCode),
          jobTitleFa: u.espJobTitle || (isNpcOnly ? null : u.jobTitle),
          jobTitleEn: u.jobTitleEn && !isNpcOnly ? u.jobTitleEn : null,
          department: org.departmentEsp || (isNpcOnly ? null : u.department),
          manager: u.managerEsp || (isNpcOnly ? null : u.manager),
          email: u.email && u.email.includes("@euroslotpars") ? u.email : (isNpcOnly ? null : u.email),
          duties: org.dutiesEsp || null,
        },
        // Nano Palayesh Ceram details
        npc: {
          hasRole: isDual || isNpcOnly,
          personnelCode: u.personnelCodeNpc || (isNpcOnly ? u.personnelCode : null),
          jobTitleFa: u.npcJobTitle || (isNpcOnly ? u.jobTitle : null),
          jobTitleEn: isNpcOnly ? u.jobTitleEn : null,
          department: org.departmentNpc || (isNpcOnly ? u.department : (isDual ? "نانوپالایش سرام" : null)),
          manager: u.managerNpc || (isNpcOnly ? u.manager : null),
          email: u.email && u.email.includes("@npceram") ? u.email : (isDual ? `${u.id.replace("u-", "")}@npceram.com` : null),
          duties: org.dutiesNpc || null,
        },
        // Contact & Workplace
        contact: {
          extension: u.extensionNumber || "",
          mobile: u.phone || pers.phone || "",
          workLocation: u.workLocation || org.workLocation || "دفتر تهران",
          floor: u.floor || org.floor || "",
        },
        // Education
        education: {
          degree: edu.degree || "",
          fieldOfStudy: edu.fieldOfStudy || "",
          university: edu.university || "",
        },
      };
    });

    return NextResponse.json({
      success: true,
      count: directory.length,
      data: directory,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

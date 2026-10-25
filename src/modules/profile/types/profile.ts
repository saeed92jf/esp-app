export type MaritalStatus = "single" | "married";

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  firstNameFa?: string;
  lastNameFa?: string;
  avatarColor?: string;
  nationalId: string;
  phone: string;
  email: string;
  address: string;
  birthDate: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  maritalStatus?: MaritalStatus;
  childrenCount?: number;
}

export type WorkLocation = "office" | "factory" | "remote" | "hybrid";
export type ContractType = "full_time" | "part_time" | "hourly" | "contractual" | "internship";

export interface OrganizationalInfo {
  department: string;
  role: string;
  employeeId: string;
  joinDate: string;
  manager: string;
  extensionNumber?: string;
  workLocation?: WorkLocation | string;
  contractType?: ContractType | string;
  subordinates?: string[];
  subordinatesCount?: number;
}


export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
}

export type SupplementaryInsurancePlan = "golden" | "silver" | "special" | "none";

export interface DependentInfo {
  id: string;
  fullName: string;
  relationship: string;
  nationalId: string;
  birthDate?: string;
}

export interface InsuranceInfo {
  insuranceCode: string;
  provider: string; // "تامین اجتماعی" (Social Security)
  corporateProvider?: string;
  validUntil: string;
  type: string;
  supplementaryPlan?: SupplementaryInsurancePlan;
  supplementaryProvider?: string; // "SOS" (کمک‌رسان ایران)
  dependentsCount?: number;
  dependents?: DependentInfo[];
  shebaNumber?: string;
}

export interface EducationRecord {
  id?: string;
  degree: string;
  fieldOfStudy: string;
  university: string;
  graduationYear: string;
}

export interface EducationInfo {
  degree: string;
  fieldOfStudy: string;
  university: string;
  graduationYear: string;
  records?: EducationRecord[];
}

export interface UserProfile {
  personal: PersonalInfo;
  organizational: OrganizationalInfo;
  skills: Skill[];
  insurance: InsuranceInfo;
  education: EducationInfo;
}

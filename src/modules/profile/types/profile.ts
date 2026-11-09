export type MaritalStatus = "single" | "married";

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  firstNameFa?: string;
  lastNameFa?: string;
  fullName?: string;
  fullNameFa?: string;
  avatar?: string;
  avatarUrl?: string;
  avatarColor?: string;
  avatarBgColor?: string;
  avatarMode?: 'photo' | 'initials';
  primaryColor?: string;
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

export interface SubordinateItem {
  id: string;
  employeeId?: string;
  name: string;
  nameFa?: string;
  nameEn?: string;
  jobTitle?: string;
  department?: string;
  avatar?: string;
  avatarUrl?: string;
  avatarColor?: string;
  email?: string;
  status?: 'online' | 'offline';
}

export interface OrganizationalInfo {
  department: string;
  role: string;
  employeeId: string;
  joinDate: string;
  manager: string;
  managerId?: string;
  extensionNumber?: string;
  workLocation?: WorkLocation | string;
  contractType?: ContractType | string;
  subordinates?: (string | SubordinateItem)[];
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

export type DocumentCategory =
  | 'national_card_front'
  | 'national_card_back'
  | 'birth_certificate'
  | 'university_degree'
  | 'other';

export interface UserUploadedDocument {
  id: string;
  category: DocumentCategory;
  title: string;
  fileName: string;
  fileSize: number | string;
  fileType: string;
  fileData?: string; // Data URL for preview
  fileUrl?: string;
  uploadedAt: string;
  verified?: boolean;
}

export interface UserProfile {
  id?: string;
  userId?: string;
  personal: PersonalInfo;
  organizational: OrganizationalInfo;
  skills: Skill[];
  insurance: InsuranceInfo;
  education: EducationInfo;
  documents?: UserUploadedDocument[];
  profileEditCount?: number;
  maxProfileEdits?: number;
  remainingProfileEdits?: number;
  hasPendingEditRequest?: boolean;
  pendingEditRequestId?: string;
  pendingEditRequestedAt?: string;
}

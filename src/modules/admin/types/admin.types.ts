import type { UserUploadedDocument, UserRole } from "@/types/auth";

export interface UserModuleAccess {
  moduleId: string;
  hasAccess: boolean;
  accessLevel: 'read' | 'write' | 'admin';
  hoursSpent?: string;
  usagePercentage?: number;
}

export type AccountStatus = 'pending_profile' | 'pending_approval' | 'active' | 'rejected';

export interface User {
  id: string;
  name: string;
  firstNameFa?: string;
  lastNameFa?: string;
  fullNameFa?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  role: UserRole;
  status: 'online' | 'offline';
  isOnline?: boolean;
  lastSeenAt?: string;
  lastActiveAt?: string;
  onlineSince?: string;
  accountStatus?: AccountStatus;
  avatar?: string;
  avatarColor?: string;
  avatarBgColor?: string;
  avatarMode?: 'photo' | 'initials';
  primaryColor?: string;
  phone?: string;
  nationalId?: string;
  extensionNumber?: string;
  password?: string;
  joinedAt?: string;
  daysInCompany?: number;
  doneProjects?: number;
  score?: number;
  salary?: number;
  hasOvertime?: boolean;
  maxOvertimeHours?: number;
  monthlyBonusType?: 'cash' | 'mission_days' | 'none';
  monthlyBonusAmount?: number;
  monthlyBonusTitle?: string;
  monthlyBonuses?: MonthlyBonusItem[];
  workingFormat?: { office: number; factory: number; mission: number; leave: number };
  workLocation?: 'office' | 'factory' | 'remote' | 'hybrid' | string;
  workActivity?: { day: number; hour: number; value: number }[];
  modulesAccess?: UserModuleAccess[];
  department?: string;
  company?: string;
  companyId?: 'euroslot' | 'npceram' | 'holding' | string;
  emailVerified?: boolean;
  isEmailVerified?: boolean;
  manager?: string;
  managerId?: string;
  subordinates?: string[];
  education?: string;
  educationDegree?: string;
  educationField?: string;
  jobTitle?: string;
  age?: number;
  maritalStatus?: 'single' | 'married';
  childrenCount?: number;
  insuranceType?: 'none' | 'socialSecurity' | 'complementary';
  recentActivities?: { id: string; title: string; date: string; status: 'pending' | 'approved' | 'rejected'; grade?: number }[];
  checklists?: { id: string; title: string; completed: boolean }[];
  skills?: { name: string; rate: number }[];
  employeeId?: string;
  contractType?: string;
  joinDate?: string;
  birthDate?: string;
  address?: string;
  insuranceCode?: string;
  insuranceProvider?: string;
  insuranceValidUntil?: string;
  supplementaryPlan?: string;
  supplementaryProvider?: string;
  shebaNumber?: string;
  university?: string;
  graduationYear?: string;
  personnelCode?: string;
  mobile?: string;
  subUnit?: string;
  jobPosition?: string;
  jobPositionEn?: string;
  directManager?: string;
  floor?: string;
  unit?: string;
  employmentDate?: string;
  fieldOfStudy?: string;
  graduationDate?: string;
  fatherName?: string;
  birthPlace?: string;
  militaryDuty?: string;
  insuranceNumber?: string;
  bankAccount?: string;
  duties?: string[];
  isProfileCompleted?: boolean;
  adminApproved?: boolean;
  adminApprovedAt?: string;
  adminApprovedBy?: string;
  managerApproved?: boolean;
  documents?: UserUploadedDocument[];
  // Deprecated HR compatibility field
  hrApproved?: boolean;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
}

export interface ChecklistItem {
  id: string;
  userId: string;
  task: string;
  completed: boolean;
}

export type RequestStatus = 'pending' | 'active' | 'rejected' | 'hr_approved';

export interface EducationRecord {
  id?: string;
  degree: string;
  fieldOfStudy: string;
  university: string;
  graduationYear: string;
}

export interface DependentRecord {
  id: string;
  fullName: string;
  relationship: string;
  nationalId: string;
  birthDate?: string;
}

export interface MonthlyBonusItem {
  id: string;
  title: string;
  type: 'cash' | 'mission_days' | 'none';
  amount: number;
}

export interface PendingRequest {
  id: string;
  userId?: string;
  name: string;
  fullName?: string;
  email: string;
  avatar?: string;
  avatarColor?: string;
  avatarBgColor?: string;
  avatarMode?: 'photo' | 'initials';
  phone?: string;
  nationalId?: string;
  department?: string;
  company?: string;
  companyId?: 'euroslot' | 'npceram' | 'holding' | string;
  emailVerified?: boolean;
  isEmailVerified?: boolean;
  jobTitle?: string;
  role?: UserRole;
  requestedAt: string;
  status: RequestStatus;
  requestType?: 'registration' | 'edit_profile';
  requestTag?: string;
  isProfileCompleted?: boolean;
  
  // Unified Admin Approval
  adminApproved?: boolean;
  adminApprovedAt?: string;
  adminApprovedBy?: string;
  
  // Backward compatibility
  managerApproved?: boolean;
  managerApprovedAt?: string;
  managerApprovedBy?: string;
  hrApproved?: boolean;
  hrApprovedAt?: string;
  hrApprovedBy?: string;

  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  tempPassword?: string;
  notes?: string;
  modulesAccess?: UserModuleAccess[];

  // Complete Profile Fields (from User Profile Management)
  firstNameFa?: string;
  lastNameFa?: string;
  fullNameFa?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  address?: string;
  maritalStatus?: 'single' | 'married';
  childrenCount?: number;
  phoneVerified?: boolean;

  employeeId?: string;
  joinDate?: string;
  manager?: string;
  managerId?: string;
  subordinates?: string[];
  extensionNumber?: string;
  workLocation?: 'office' | 'factory' | 'remote' | 'hybrid' | string;
  contractType?: 'full_time' | 'part_time' | 'hourly' | 'contractual' | 'internship' | string;

  insuranceCode?: string;
  insuranceProvider?: string;
  insuranceValidUntil?: string;
  insuranceType?: string;
  supplementaryPlan?: 'golden' | 'silver' | 'special' | 'none';
  supplementaryProvider?: string;
  shebaNumber?: string;
  dependents?: DependentRecord[];

  educationDegree?: string;
  educationField?: string;
  university?: string;
  graduationYear?: string;
  educationRecords?: EducationRecord[];
  skills?: { id: string; name: string; level: number }[];
  documents?: UserUploadedDocument[];

  // Compensation & Benefits (حقوق، اضافه کاری و پاداش)
  salary?: number;
  hasOvertime?: boolean;
  maxOvertimeHours?: number;
  monthlyBonusType?: 'cash' | 'mission_days' | 'none';
  monthlyBonusAmount?: number;
  monthlyBonusTitle?: string;
  monthlyBonuses?: MonthlyBonusItem[];
}

export interface UserQueryParams {
  [key: string]: string | number | boolean | undefined;
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  accountStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RequestQueryParams {
  [key: string]: string | number | boolean | undefined;
  search?: string;
  status?: 'all' | RequestStatus;
  domain?: string;
  page?: number;
  limit?: number;
  sortBy?: 'requestedAt' | 'name' | 'status';
  sortOrder?: 'asc' | 'desc';
}


export interface ModuleAccessRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  moduleId: string;
  moduleName: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string | null;
  reviewedBy?: string | null;
}

export interface SystemAuditLog {
  id: string;
  action: string;
  category: 'auth' | 'admin' | 'tasks' | 'projects' | 'requests' | 'system' | string;
  severity: 'info' | 'success' | 'warning' | 'error';
  title: string;
  titleFa?: string;
  titleEn?: string;
  description: string;
  descriptionFa?: string;
  descriptionEn?: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  actorEmail?: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AuditLogQueryParams {
  [key: string]: string | number | boolean | undefined;
  category?: string;
  severity?: string;
  search?: string;
  page?: number;
  limit?: number;
}

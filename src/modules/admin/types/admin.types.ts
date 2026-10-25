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
  email: string;
  role: 'admin' | 'user';
  status: 'online' | 'offline';
  accountStatus?: AccountStatus;
  avatar?: string;
  avatarColor?: string;
  primaryColor?: string;
  phone?: string;
  nationalId?: string;
  joinedAt?: string;
  daysInCompany?: number;
  doneProjects?: number;
  score?: number;
  salary?: number;
  workingFormat?: { office: number; factory: number; mission: number; leave: number };
  workActivity?: { day: number; hour: number; value: number }[];
  modulesAccess?: UserModuleAccess[];
  department?: string;
  manager?: string;
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
  isProfileCompleted?: boolean;
  hrApproved?: boolean;
  managerApproved?: boolean;
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

export type RequestStatus = 'pending' | 'hr_approved' | 'active' | 'rejected';

export interface PendingRequest {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  nationalId?: string;
  department?: string;
  jobTitle?: string;
  requestedAt: string;
  status: RequestStatus;
  isProfileCompleted?: boolean;
  hrApproved?: boolean;
  hrApprovedAt?: string;
  hrApprovedBy?: string;
  managerApproved?: boolean;
  managerApprovedAt?: string;
  managerApprovedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  tempPassword?: string;
  notes?: string;
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

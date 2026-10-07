export interface UserModuleAccess {
  moduleId: string;
  hasAccess: boolean;
  accessLevel: 'read' | 'write' | 'admin';
  hoursSpent?: string;
  usagePercentage?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'online' | 'offline';
  avatar?: string;
  phone?: string;
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

export interface PendingRequest {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  requestedAt: string;
}

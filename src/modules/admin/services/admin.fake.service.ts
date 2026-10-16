import { User, PendingRequest } from '../types/admin.types';

const getAvatar = (gender: 'male' | 'female') => {
  return `/avatar/${gender}-01.webp`;
};

const generateWorkActivity = (): { day: number; hour: number; value: number }[] => {
  const data = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      data.push({ day: i, hour: j, value: Math.floor(Math.random() * 100) });
    }
  }
  return data;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Saeed Jalili Fard',
    email: 'saeed@demo.com',
    role: 'admin',
    status: 'online',
    avatar: '/team/saeed-jalili-fard.webp',
    phone: '09120000000',
    joinedAt: '2023-01-01',
    daysInCompany: 1100,
    doneProjects: 28,
    salary: 65000,
    department: 'Engineering',
    manager: 'CEO',
    education: 'Master of Software Engineering',
    educationDegree: 'master',
    educationField: 'مهندسی نرم‌افزار',
    jobTitle: 'Senior System Administrator & Lead Engineer',
    workingFormat: { office: 60, factory: 20, mission: 10, leave: 10 },
    workActivity: generateWorkActivity(),
    modulesAccess: [
      { moduleId: 'marketing', hasAccess: true, accessLevel: 'admin', hoursSpent: '120:00:00', usagePercentage: 50 },
      { moduleId: 'projectManagement', hasAccess: true, accessLevel: 'admin', hoursSpent: '85:00:00', usagePercentage: 40 }
    ],
    recentActivities: [
      { id: 'a1', title: 'Leave form completed', date: 'Today', status: 'pending' },
      { id: 'a2', title: 'Architecture doc uploaded', date: 'Yesterday', status: 'approved', grade: 98 }
    ],
    checklists: [
      { id: 'c1', title: 'Check server logs', completed: false },
      { id: 'c2', title: 'Update permissions', completed: true }
    ],
    age: 34,
    maritalStatus: 'married',
    childrenCount: 1,
    insuranceType: 'complementary'
  },
  {
    id: '2',
    name: 'Guest (Gust)',
    email: 'guest@demo.com',
    role: 'user',
    status: 'online',
    avatar: getAvatar('male'),
    phone: '09120000001',
    joinedAt: '2026-01-01',
    daysInCompany: 30,
    doneProjects: 1,
    salary: 15000,
    department: 'Engineering',
    manager: 'Saeed Jalili Fard',
    education: 'Bachelor',
    educationDegree: 'bachelors',
    educationField: 'مهندسی کامپیوتر',
    jobTitle: 'Guest User',
    workingFormat: { office: 70, factory: 15, mission: 10, leave: 5 },
    workActivity: generateWorkActivity(),
    modulesAccess: [
      { moduleId: 'marketing', hasAccess: true, accessLevel: 'read', hoursSpent: '05:00:00', usagePercentage: 10 }
    ],
    recentActivities: [
      { id: 'g1', title: 'Guest session started', date: 'Today', status: 'approved' }
    ],
    checklists: [
      { id: 'gc1', title: 'Explore modules', completed: false }
    ],
    age: 26,
    maritalStatus: 'single',
    childrenCount: 0,
    insuranceType: 'none'
  }
];

const mockRequests: PendingRequest[] = [];

export const AdminFakeService = {
  getUsers: async (): Promise<User[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockUsers), 500));
  },
  getPendingRequests: async (): Promise<PendingRequest[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockRequests), 500));
  }
};

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
  { id: '1', name: 'Ali Rezaei', email: 'ali@example.com', role: 'admin', status: 'online', avatar: getAvatar('male'), phone: '09123456789', joinedAt: '2025-01-01', daysInCompany: 362, doneProjects: 12, salary: 48500, department: 'engineering', manager: 'Dr. Mohammadi', education: 'Master of Software', jobTitle: 'Senior System Admin', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [{moduleId: 'marketing', hasAccess: true, accessLevel: 'admin', hoursSpent: '42:00:07', usagePercentage: 35}, {moduleId: 'projectManagement', hasAccess: true, accessLevel: 'admin', hoursSpent: '30:00:00', usagePercentage: 25}], recentActivities: [{id: 'a1', title: 'Leave form completed', date: 'Today', status: 'pending'}, {id: 'a2', title: 'Architecture doc uploaded', date: 'Yesterday', status: 'approved', grade: 90}], checklists: [{id: 'c1', title: 'Check server logs', completed: false}, {id: 'c2', title: 'Update permissions', completed: true}] },
  { id: '2', name: 'Sarah Connor', email: 'sarah@example.com', role: 'user', status: 'online', avatar: getAvatar('female'), phone: '09121234567', daysInCompany: 120, doneProjects: 4, salary: 21000, department: 'engineering', manager: 'Ali Rezaei', education: 'Software Engineering', jobTitle: 'Developer', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [{moduleId: 'marketing', hasAccess: true, accessLevel: 'write', hoursSpent: '12:30:00', usagePercentage: 60}], recentActivities: [{id: 'a3', title: 'Backend code commit', date: '2 days ago', status: 'approved', grade: 100}], checklists: [{id: 'c3', title: 'Test new module', completed: false}] },
  { id: '3', name: 'Hamid Nouri', email: 'hamid@example.com', role: 'user', status: 'offline', avatar: getAvatar('male'), daysInCompany: 45, doneProjects: 1, salary: 15000, department: 'engineering', manager: 'Ali Rezaei', education: 'Diploma', jobTitle: 'Technician', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [], recentActivities: [], checklists: [] },
  { id: '4', name: 'Maryam Hosseini', email: 'maryam@example.com', role: 'user', status: 'online', avatar: getAvatar('female'), daysInCompany: 800, doneProjects: 45, salary: 32000, department: 'marketDevelopment', manager: 'Ali', education: 'Marketing', jobTitle: 'Marketing Manager', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [{moduleId: 'marketing', hasAccess: true, accessLevel: 'admin', hoursSpent: '120:00:00', usagePercentage: 90}], recentActivities: [], checklists: [] },
  { id: '5', name: 'John Smith', email: 'john@example.com', role: 'user', status: 'offline', avatar: getAvatar('male'), daysInCompany: 10, doneProjects: 0, salary: 12000, department: 'marketDevelopment', manager: 'Maryam Hosseini', education: 'Business', jobTitle: 'Business Analyst', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [], recentActivities: [], checklists: [] },
  { id: '6', name: 'Neda Salehi', email: 'neda@example.com', role: 'user', status: 'online', avatar: getAvatar('female'), daysInCompany: 200, doneProjects: 5, salary: 18000, department: 'marketDevelopment', manager: 'Maryam Hosseini', education: 'Management', jobTitle: 'Sales Expert', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [], recentActivities: [], checklists: [] },
  { id: '7', name: 'Hossein Akbari', email: 'hossein@example.com', role: 'user', status: 'online', avatar: getAvatar('male'), daysInCompany: 450, doneProjects: 20, salary: 25000, department: 'projectControl', manager: 'Ali', education: 'Industrial Engineering', jobTitle: 'Project Manager', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [{moduleId: 'projectManagement', hasAccess: true, accessLevel: 'admin', hoursSpent: '200:00:00', usagePercentage: 80}], recentActivities: [], checklists: [] },
  { id: '8', name: 'Emma Watson', email: 'emma@example.com', role: 'user', status: 'offline', avatar: getAvatar('female'), daysInCompany: 300, doneProjects: 15, salary: 22000, department: 'projectControl', manager: 'Hossein Akbari', education: 'Industrial Engineering', jobTitle: 'Coordinator', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [], recentActivities: [], checklists: [] },
  { id: '9', name: 'Reza Karimi', email: 'reza@example.com', role: 'user', status: 'online', avatar: getAvatar('male'), daysInCompany: 150, doneProjects: 8, salary: 17000, department: 'projectControl', manager: 'Hossein Akbari', education: 'Management', jobTitle: 'Assistant', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [], recentActivities: [], checklists: [] },
  { id: '10', name: 'Sara Amini', email: 'sara@example.com', role: 'user', status: 'online', avatar: getAvatar('female'), daysInCompany: 600, doneProjects: 10, salary: 19000, department: 'administrative', manager: 'Ali', education: 'Accounting', jobTitle: 'Financial Manager', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [], recentActivities: [], checklists: [] },
  { id: '11', name: 'Michael Brown', email: 'michael@example.com', role: 'user', status: 'offline', avatar: getAvatar('male'), daysInCompany: 400, doneProjects: 5, salary: 16000, department: 'administrative', manager: 'Sara Amini', education: 'HR Management', jobTitle: 'HR Expert', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [], recentActivities: [], checklists: [] },
  { id: '12', name: 'Fatemeh Zare', email: 'fatemeh@example.com', role: 'user', status: 'online', avatar: getAvatar('female'), daysInCompany: 250, doneProjects: 3, salary: 14000, department: 'administrative', manager: 'Sara Amini', education: 'Accounting', jobTitle: 'Accountant', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [], recentActivities: [], checklists: [] },
  { id: '13', name: 'Mohammad Ghasemi', email: 'mohammad@example.com', role: 'user', status: 'online', avatar: getAvatar('male'), daysInCompany: 500, doneProjects: 18, salary: 30000, department: 'rAndD', manager: 'Ali', education: 'Computer Science', jobTitle: 'Researcher', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [], recentActivities: [], checklists: [] },
  { id: '14', name: 'David Lee', email: 'david@example.com', role: 'user', status: 'online', avatar: getAvatar('male'), daysInCompany: 350, doneProjects: 12, salary: 28000, department: 'rAndD', manager: 'Mohammad Ghasemi', education: 'AI Engineering', jobTitle: 'AI Engineer', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [], recentActivities: [], checklists: [] },
  { id: '15', name: 'Leila Ahmadi', email: 'leila@example.com', role: 'user', status: 'offline', avatar: getAvatar('female'), daysInCompany: 100, doneProjects: 2, salary: 20000, department: 'rAndD', manager: 'Mohammad Ghasemi', education: 'Data Science', jobTitle: 'Data Analyst', workingFormat: { office: 45, factory: 25, mission: 15, leave: 15 }, workActivity: generateWorkActivity(), modulesAccess: [], recentActivities: [], checklists: [] }
];

const mockRequests: PendingRequest[] = [
  { id: 'r1', name: 'Sima', email: 'sima@example.com', requestedAt: '2 days ago' },
  { id: 'r2', name: 'Omid', email: 'omid@example.com', requestedAt: '1 day ago' }
];

export const AdminFakeService = {
  getUsers: async (): Promise<User[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockUsers), 500));
  },
  getPendingRequests: async (): Promise<PendingRequest[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockRequests), 500));
  }
};

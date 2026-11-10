import type { UserRole } from '@/types/auth';
import { 
  User, 
  PendingRequest, 
  UserModuleAccess,
  ModuleAccessRequest,
  UserQueryParams, 
  RequestQueryParams,
  SystemAuditLog,
  AuditLogQueryParams
} from "../types/admin.types";

export interface IAdminService {
  // Users Management
  getUsers(params?: UserQueryParams): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  createUser(user: Partial<User> & { password?: string }): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserModules(id: string, modules: UserModuleAccess[]): Promise<User>;
  deleteUser(id: string): Promise<void>;
  searchUsers(query: string, filters?: UserQueryParams): Promise<User[]>;

  // Account Requests & HR / Manager Approvals
  getPendingRequests(params?: RequestQueryParams): Promise<PendingRequest[]>;
  createRequest(request: Partial<PendingRequest>): Promise<PendingRequest>;
  searchRequests(query: string, filters?: RequestQueryParams): Promise<PendingRequest[]>;
  approveHr(requestId: string, notes?: string): Promise<PendingRequest>;
  approveManager(
    requestId: string, 
    options?: { tempPassword?: string; role?: UserRole; modulesAccess?: UserModuleAccess[]; requestData?: Partial<PendingRequest> }
  ): Promise<{ request: PendingRequest; tempPassword?: string; user: User }>;
  approveAndDispatchServiceRequest(
    requestId: string,
    payload: {
      assignedUserId: string;
      emailTo: string;
      emailSubject: string;
      emailBody: string;
      managerNote?: string;
      priority?: string;
    }
  ): Promise<{ success: boolean; request: PendingRequest; message?: string }>;
  rejectRequest(requestId: string, reason: string): Promise<PendingRequest>;
  resendCredentials(requestId: string): Promise<{ success: boolean; tempPassword?: string }>;
  approveRequest(requestId: string): Promise<{ email: string; tempPassword: string }>;
  updateRequest(requestId: string, updates: Partial<PendingRequest>): Promise<PendingRequest>;
  sendPassword(userId: string): Promise<{ success: boolean; password?: string }>;
  deleteRequest(requestId: string): Promise<void>;

  // Module Access Requests
  getModuleRequests(): Promise<ModuleAccessRequest[]>;
  requestModuleAccess(payload: { userId: string; userName?: string; userEmail?: string; moduleId: string; moduleName?: string }): Promise<ModuleAccessRequest>;
  approveModuleRequest(requestId: string): Promise<{ success: boolean; message?: string }>;
  rejectModuleRequest(requestId: string): Promise<{ success: boolean; message?: string }>;

  // Audit Logs (Super Admin Exclusive)
  getAuditLogs(params?: AuditLogQueryParams): Promise<{ logs: SystemAuditLog[]; total: number; limit: number; offset: number }>;
  clearAuditLogs(): Promise<{ success: boolean; deletedCount: number; message: string }>;
}

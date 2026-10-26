import { 
  User, 
  PendingRequest, 
  UserModuleAccess, 
  UserQueryParams, 
  RequestQueryParams 
} from "../types/admin.types";

export interface IAdminService {
  // Users Management
  getUsers(params?: UserQueryParams): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserModules(id: string, modules: UserModuleAccess[]): Promise<User>;
  deleteUser(id: string): Promise<void>;
  searchUsers(query: string, filters?: UserQueryParams): Promise<User[]>;

  // Account Requests & HR / Manager Approvals
  getPendingRequests(params?: RequestQueryParams): Promise<PendingRequest[]>;
  searchRequests(query: string, filters?: RequestQueryParams): Promise<PendingRequest[]>;
  approveHr(requestId: string, notes?: string): Promise<PendingRequest>;
  approveManager(
    requestId: string, 
    options?: { tempPassword?: string; role?: 'admin' | 'user'; modulesAccess?: UserModuleAccess[] }
  ): Promise<{ request: PendingRequest; tempPassword?: string; user: User }>;
  rejectRequest(requestId: string, reason: string): Promise<PendingRequest>;
  resendCredentials(requestId: string): Promise<{ success: boolean; tempPassword?: string }>;
  approveRequest(requestId: string): Promise<{ email: string; tempPassword: string }>;
  updateRequest(requestId: string, updates: Partial<PendingRequest>): Promise<PendingRequest>;
}

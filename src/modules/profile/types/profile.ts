export interface PersonalInfo {
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  email: string;
  address: string;
  birthDate: string;
}

export interface OrganizationalInfo {
  department: string;
  role: string;
  employeeId: string;
  joinDate: string;
  manager: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
}

export interface InsuranceInfo {
  insuranceCode: string;
  provider: string;
  validUntil: string;
  type: string;
}

export interface UserProfile {
  personal: PersonalInfo;
  organizational: OrganizationalInfo;
  skills: Skill[];
  insurance: InsuranceInfo;
}

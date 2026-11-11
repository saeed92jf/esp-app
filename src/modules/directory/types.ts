export interface CompanyRoleInfo {
  hasRole: boolean;
  personnelCode?: string | number | null;
  jobTitleFa?: string | null;
  jobTitleEn?: string | null;
  department?: string | null;
  manager?: string | null;
  email?: string | null;
  duties?: string | null;
}

export interface PersonnelItem {
  id: string;
  fullNameFa: string;
  fullNameEn: string;
  avatar?: string | null;
  avatarColor: string;
  role: string;
  companyMembership: string;
  isDual: boolean;
  isNpcOnly: boolean;
  esp: CompanyRoleInfo;
  npc: CompanyRoleInfo;
  contact: {
    extension: string;
    mobile: string;
    workLocation: string;
    floor: string;
  };
  education: {
    degree?: string;
    fieldOfStudy?: string;
    university?: string;
  };
}


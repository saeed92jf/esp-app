// src/modules/projects/types/projects.types.ts

export type ProjectType = 'internal' | 'export' | 'joint_venture' | 'rd' | 'epc';

export type ProjectStatus =
  | 'tendering'
  | 'basic_engineering'
  | 'detailed_engineering'
  | 'procurement'
  | 'fabrication'
  | 'qc_testing'
  | 'commissioning'
  | 'completed'
  | 'on_hold';

export type VdisDocumentStatus =
  | 'draft'
  | 'pending_approval'      // در حال بررسی داخلی مدیر بالادستی
  | 'approved_by_manager'   // تایید مدیر - آماده ارسال به کارفرما
  | 'rejected_by_manager'   // رد داخلی توسط مدیر
  | 'transmitted'           // ارسال رسمی به کارفرما (Outlook Transmittal)
  | 'code_1_approved'       // تایید کامل کارفرما بدون کامنت
  | 'code_2_approved_comm'  // تایید مشروط با کامنت
  | 'code_3_rejected';      // رد شده توسط کارفرما - نیاز به بازنگری

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskProbability = 'unlikely' | 'possible' | 'likely' | 'almost_certain';

export interface ProjectTeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone?: string;
  avatar?: string;
  isManager?: boolean;
  raci?: 'Responsible' | 'Accountable' | 'Consulted' | 'Informed';
}

export interface ProjectPhase {
  id: string;
  name: string;
  description?: string;
  order: number;
  progressPercent: number;
  startDate?: string;
  endDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  leadName?: string;
  isCustom?: boolean;
}

export interface ProjectSubPackage {
  id: string;
  name: string;
  code: string;
  equipmentType: string;
  weightTon?: number;
  budgetCurrency?: string;
  leadName: string;
  progressPercent: number;
  modulesCount: number;
}

export interface ProjectRiskItem {
  id: string;
  category: 'material' | 'fabrication' | 'thickness' | 'special_equipment' | 'procurement' | 'schedule';
  title: string;
  description: string;
  severity: RiskSeverity;
  probability: RiskProbability;
  riskScore: number; // 1 to 25
  mitigationPlan: string;
  responsiblePerson: string;
  status: 'identified' | 'mitigating' | 'controlled' | 'closed';
}

export interface VdisDocumentItem {
  id: string;
  docNumber: string;         // e.g. ESP-TK101-01-PID-001
  title: string;
  phase: string;             // Engineering, QC, Fabrication
  revision: string;          // Rev A, Rev 0, Rev 1
  category: string;          // P&ID, Stress Calc, WPS/PQR, ITP, DataSheet
  status: VdisDocumentStatus;
  fileFormat: string;        // PDF, DWG, XLSX, ZIP
  fileSize: string;
  filePathUrl?: string;
  preparedBy: string;
  preparedDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
  transmittedDate?: string;
  transmittalNumber?: string;
  clientReturnDate?: string;
  clientComments?: string;
}

export interface TransmittalLetter {
  id: string;
  transmittalNo: string;     // e.g. TR-ESP-2024-042
  subject: string;
  recipientCompany: string;  // کارفرما / مهندس مشاور
  recipientEmail: string;
  ccEmails: string[];
  senderName: string;
  senderRole: string;
  coverLetterText: string;
  status: 'draft' | 'pending_manager' | 'approved_sent' | 'rejected';
  approverManagerName?: string;
  approvalDate?: string;
  sentDate?: string;
  documents: VdisDocumentItem[];
  activities: {
    id: string;
    timestamp: string;
    author: string;
    action: string;
    comment?: string;
  }[];
}

export interface StrategicGoalLink {
  id: string;
  objectiveTitle: string;
  corporateCategory: string; // توسعه صادرات، بومی‌سازی، ظرفیت تولید
  impactLevel: 'high' | 'strategic' | 'medium';
  contributionDescription: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  phaseId: string;
  date: string;
  status: 'done' | 'active' | 'upcoming' | 'blocked';
  x: number; // visual coordinates for Miro canvas
  y: number;
  dependencies: string[]; // IDs of preceding nodes
  assigneeName?: string;
  progressPercent: number;
}

export interface ProjectTaskItem {
  id: string;
  title: string;
  phaseId: string;
  sprint?: string;
  storyPoints?: number;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedToName: string;
  assignedToRole?: string;
  dueDate?: string;
  progressPercent: number;
  commentsCount: number;
  attachmentsCount: number;
}

export interface ProjectItem {
  id: string;
  code: string;                  // e.g. PRJ-ESP-2024-TK101
  title: string;
  clientName: string;            // e.g. پتروشیمی بوعلی سینا
  organization: string;          // یورو اسلات پارس، نانو پالایش سرام، پترو اسپادانا
  quotationNumber: string;       // شماره کوتیشن / استعلام (e.g. QT-2024-884-R2)
  contractNumber?: string;
  projectType: ProjectType;
  status: ProjectStatus;
  progressPercent: number;       // Actual progress
  plannedProgressPercent: number;// S-curve planned
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  budgetAmount: string;          // e.g. ۴۵ میلیارد ریال or $1.2M
  currency: string;
  dmsNetworkPath: string;        // e.g. \\DMS\Projects\TK101-Ammonia-Vessel\
  description: string;
  
  // Hierarchy
  subPackages: ProjectSubPackage[];
  
  // Workflow & Phases
  phases: ProjectPhase[];
  
  // Team
  team: ProjectTeamMember[];
  
  // Tasks (Scrum/Kanban)
  tasks: ProjectTaskItem[];
  
  // VDIS Documents & Transmittals
  vdisDocuments: VdisDocumentItem[];
  transmittals: TransmittalLetter[];
  
  // Risk Matrix
  risks: ProjectRiskItem[];
  
  // Strategic OKRs
  strategicGoals: StrategicGoalLink[];
  
  // Miro Visual Roadmap
  roadmapNodes: RoadmapNode[];
}

export interface ProjectFilterState {
  search: string;
  organization: string;
  status: string;
  projectType: string;
}

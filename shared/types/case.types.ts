import type { Assignment } from './assignment.types';
import type { Area } from './area.types';
import type { Message } from './message.types';

export type CaseStatus = 'new' | 'assigned' | 'in_progress' | 'awaiting_doctor' | 'completed' | 'closed' | 'resolved';
export type UrgencyLevel = 'critical' | 'urgent' | 'moderate' | 'routine';

export interface Case {
  id: number;
  patientId: number;
  createdByUserId: number;
  areaId: number | null;
  description: string;
  language: string;
  status: CaseStatus;
  createdAt: Date;
  updatedAt: Date;
  patientName?: string;
  patientAge?: number;
  location?: string;
  audioUrl?: string;
}

export interface CaseTriage {
  id: number;
  caseId: number;
  urgencyLevel: UrgencyLevel;
  structuredSymptoms: Record<string, any>;
  symptoms?: string[];
  recommendations?: string;
  riskFlags: string[];
  aiModel: string;
  summary?: string;
  translatedDescription?: string;
  createdAt: Date;
}

export interface CaseWithTriage extends Case {
  triage?: CaseTriage;
  assignment?: Assignment;
  area?: Area;
  messages?: Message[];
}

export interface CreateCaseRequest {
  patientName?: string;
  patientAge?: number;
  location?: string;
  language: string;
  description: string;
  areaId?: number;
}

export interface UpdateCaseRequest {
  status?: CaseStatus;
  description?: string;
  areaId?: number;
}

export type AssignmentStatus = 'pending' | 'accepted' | 'in_progress' | 'completed';

export interface Assignment {
  id: number;
  caseId: number;
  workerId: number | null;
  doctorId: number | null;
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
  workerName?: string;
  doctorName?: string;
}

export interface CreateAssignmentRequest {
  caseId: number;
  workerId?: number;
  doctorId?: number;
}

export interface UpdateAssignmentRequest {
  status?: AssignmentStatus;
  workerId?: number;
  doctorId?: number;
}

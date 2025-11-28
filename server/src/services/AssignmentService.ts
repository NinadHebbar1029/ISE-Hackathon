import { assignmentQueries } from '../db/queries/assignment.queries';

export class AssignmentService {
  async createAssignment(data: {
    caseId: number;
    workerId?: number;
    doctorId?: number;
  }) {
    const assignmentId = await assignmentQueries.create(data);
    return this.getAssignmentByCaseId(data.caseId);
  }

  async getAssignmentByCaseId(caseId: number) {
    const assignment = await assignmentQueries.findByCaseId(caseId);
    return assignment ? this.formatAssignment(assignment) : null;
  }

  async getAssignmentsByWorkerId(workerId: number) {
    const assignments = await assignmentQueries.findByWorkerId(workerId);
    return assignments.map(this.formatAssignment);
  }

  async getAssignmentsByDoctorId(doctorId: number) {
    const assignments = await assignmentQueries.findByDoctorId(doctorId);
    return assignments.map(this.formatAssignment);
  }

  async updateAssignment(assignmentId: number, updates: any) {
    await assignmentQueries.update(assignmentId, updates);
  }

  async assignWorker(caseId: number, workerId: number) {
    const existing = await assignmentQueries.findByCaseId(caseId);
    if (existing) {
      await assignmentQueries.update(existing.id, { workerId });
    } else {
      await assignmentQueries.create({ caseId, workerId });
    }
    return this.getAssignmentByCaseId(caseId);
  }

  private formatAssignment(assignment: any) {
    return {
      id: assignment.id,
      caseId: assignment.case_id,
      workerId: assignment.worker_id,
      doctorId: assignment.doctor_id,
      status: assignment.status,
      workerName: assignment.worker_name,
      doctorName: assignment.doctor_name,
      createdAt: assignment.created_at,
      updatedAt: assignment.updated_at,
    };
  }
}

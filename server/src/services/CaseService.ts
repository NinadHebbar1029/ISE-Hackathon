import { caseQueries } from '../db/queries/case.queries';
import { triageQueries } from '../db/queries/triage.queries';
import { assignmentQueries } from '../db/queries/assignment.queries';
import { messageQueries } from '../db/queries/message.queries';

export class CaseService {
  async createCase(data: {
    patientId: number;
    createdByUserId: number;
    description: string;
    language: string;
    areaId?: number;
    patientName?: string;
    patientAge?: number;
    location?: string;
    audioUrl?: string;
  }) {
    const caseId = await caseQueries.create(data);
    return this.getCaseById(caseId);
  }

  async getCaseById(id: number) {
    const caseData = await caseQueries.findById(id);
    if (!caseData) {
      throw new Error('Case not found');
    }

    const triage = await triageQueries.findByCaseId(id);
    const assignment = await assignmentQueries.findByCaseId(id);
    const messages = await messageQueries.findByCaseId(id);

    return this.formatCase(caseData, triage, assignment, messages);
  }

  async getCasesByPatientId(patientId: number) {
    const cases = await caseQueries.findByPatientId(patientId);
    return Promise.all(cases.map(async (c: any) => {
      const triage = await triageQueries.findByCaseId(c.id);
      const assignment = await assignmentQueries.findByCaseId(c.id);
      return this.formatCase(c, triage, assignment);
    }));
  }

  async getCasesByCreatorId(createdByUserId: number) {
    const cases = await caseQueries.findByCreatorId(createdByUserId);
    return Promise.all(cases.map(async (c: any) => {
      const triage = await triageQueries.findByCaseId(c.id);
      const assignment = await assignmentQueries.findByCaseId(c.id);
      return this.formatCase(c, triage, assignment);
    }));
  }

  async getCasesByAreaIds(areaIds: number[]) {
    const cases = await caseQueries.findByAreaIds(areaIds);
    return Promise.all(cases.map(async (c: any) => {
      const triage = await triageQueries.findByCaseId(c.id);
      const assignment = await assignmentQueries.findByCaseId(c.id);
      return this.formatCase(c, triage, assignment);
    }));
  }

  async getAllCases() {
    const cases = await caseQueries.findAll();
    return Promise.all(cases.map(async (c: any) => {
      const triage = await triageQueries.findByCaseId(c.id);
      const assignment = await assignmentQueries.findByCaseId(c.id);
      return this.formatCase(c, triage, assignment);
    }));
  }

  async updateCase(id: number, updates: any) {
    await caseQueries.update(id, updates);
    return this.getCaseById(id);
  }

  async deleteCase(id: number) {
    await caseQueries.delete(id);
  }

  async addTriage(data: {
    caseId: number;
    urgencyLevel: string;
    structuredSymptoms: Record<string, any>;
    riskFlags: string[];
    aiModel: string;
    summary?: string;
    translatedDescription?: string;
  }) {
    await triageQueries.create(data);
    await caseQueries.update(data.caseId, { status: 'assigned' });
    return this.getCaseById(data.caseId);
  }

  async updateTriage(triageId: number, updates: any) {
    await triageQueries.update(triageId, updates);
  }

  async addMessage(data: {
    caseId: number;
    authorId: number;
    authorRole: string;
    content: string;
  }) {
    const messageId = await messageQueries.create(data);
    const messages = await messageQueries.findByCaseId(data.caseId);
    return messages.find((m: any) => m.id === messageId);
  }

  async getCaseStatistics(areaIds?: number[]) {
    const statusCounts = await caseQueries.getCountsByStatus(areaIds);
    const urgencyCounts = await caseQueries.getCountsByUrgency(areaIds);

    return {
      byStatus: statusCounts,
      byUrgency: urgencyCounts,
    };
  }

  private formatCase(caseData: any, triage?: any, assignment?: any, messages?: any[]) {
    const safeParse = <T>(val: any, fallback: T): T => {
      try {
        if (val === null || val === undefined) return fallback;
        if (typeof val === 'string') return JSON.parse(val);
        return val as T;
      } catch {
        return fallback;
      }
    };
    return {
      id: caseData.id,
      patientId: caseData.patient_id,
      createdByUserId: caseData.created_by_user_id,
      areaId: caseData.area_id,
      description: caseData.description,
      language: caseData.language,
      status: caseData.status,
      patientName: caseData.patient_name,
      patientAge: caseData.patient_age,
      location: caseData.location,
      audioUrl: caseData.audio_url,
      createdAt: caseData.created_at,
      updatedAt: caseData.updated_at,
      area: caseData.area_name ? { name: caseData.area_name } : null,
      triage: triage ? {
        id: triage.id,
        caseId: triage.case_id,
        urgencyLevel: triage.urgency_level,
        structuredSymptoms: safeParse(triage.structured_symptoms, {} as Record<string, any>),
        riskFlags: safeParse(triage.risk_flags, [] as string[]),
        aiModel: triage.ai_model,
        summary: triage.summary,
        translatedDescription: triage.translated_description,
        createdAt: triage.created_at,
      } : null,
      assignment: assignment ? {
        id: assignment.id,
        caseId: assignment.case_id,
        workerId: assignment.worker_id,
        doctorId: assignment.doctor_id,
        status: assignment.status,
        workerName: assignment.worker_name,
        doctorName: assignment.doctor_name,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at,
      } : null,
      messages: messages ? messages.map((m: any) => ({
        id: m.id,
        caseId: m.case_id,
        authorId: m.author_id,
        authorRole: m.author_role,
        content: m.content,
        authorName: m.author_name,
        createdAt: m.created_at,
      })) : [],
    };
  }
}

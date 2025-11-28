import pool from '../connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export const triageQueries = {
  create: async (data: {
    caseId: number;
    urgencyLevel: string;
    structuredSymptoms: Record<string, any>;
    riskFlags: string[];
    aiModel: string;
    summary?: string;
    translatedDescription?: string;
  }) => {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO case_triage (case_id, urgency_level, structured_symptoms, risk_flags, ai_model, summary, translated_description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.caseId,
        data.urgencyLevel,
        JSON.stringify(data.structuredSymptoms),
        JSON.stringify(data.riskFlags),
        data.aiModel,
        data.summary || null,
        data.translatedDescription || null,
      ]
    );
    return result.insertId;
  },

  findByCaseId: async (caseId: number) => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM case_triage WHERE case_id = ? ORDER BY created_at DESC LIMIT 1',
      [caseId]
    );
    return rows[0];
  },

  update: async (id: number, updates: any) => {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.urgencyLevel) {
      fields.push('urgency_level = ?');
      values.push(updates.urgencyLevel);
    }
    if (updates.summary) {
      fields.push('summary = ?');
      values.push(updates.summary);
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.execute(
      `UPDATE case_triage SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },
};

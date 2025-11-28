import pool from '../connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export const caseQueries = {
  create: async (data: {
    patientId: number;
    createdByUserId: number;
    description: string;
    language: string;
    areaId?: number;
    patientName?: string;
    patientAge?: number;
    location?: string;
    audioUrl?: string;
  }) => {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO cases (patient_id, created_by_user_id, area_id, description, language, patient_name, patient_age, location, audio_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.patientId,
        data.createdByUserId,
        data.areaId || null,
        data.description,
        data.language,
        data.patientName || null,
        data.patientAge || null,
        data.location || null,
        data.audioUrl || null,
      ]
    );
    return result.insertId;
  },

  findById: async (id: number) => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, a.name as area_name
       FROM cases c
       LEFT JOIN areas a ON c.area_id = a.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0];
  },

  findByPatientId: async (patientId: number) => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, a.name as area_name
       FROM cases c
       LEFT JOIN areas a ON c.area_id = a.id
       WHERE c.patient_id = ?
       ORDER BY c.created_at DESC`,
      [patientId]
    );
    return rows;
  },

  findByCreatorId: async (createdByUserId: number) => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, a.name as area_name
       FROM cases c
       LEFT JOIN areas a ON c.area_id = a.id
       WHERE c.created_by_user_id = ?
       ORDER BY c.created_at DESC`,
      [createdByUserId]
    );
    return rows;
  },

  findByAreaIds: async (areaIds: number[]) => {
    if (areaIds.length === 0) return [];
    const placeholders = areaIds.map(() => '?').join(',');
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, a.name as area_name
       FROM cases c
       LEFT JOIN areas a ON c.area_id = a.id
       WHERE c.area_id IN (${placeholders})
       ORDER BY c.created_at DESC`,
      areaIds
    );
    return rows;
  },

  findAll: async () => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, a.name as area_name
       FROM cases c
       LEFT JOIN areas a ON c.area_id = a.id
       ORDER BY c.created_at DESC`
    );
    return rows;
  },

  update: async (id: number, updates: any) => {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.description) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.areaId !== undefined) {
      fields.push('area_id = ?');
      values.push(updates.areaId);
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.execute(
      `UPDATE cases SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  delete: async (id: number) => {
    await pool.execute('DELETE FROM cases WHERE id = ?', [id]);
  },

  getCountsByStatus: async (areaIds?: number[]) => {
    if (areaIds && areaIds.length > 0) {
      const placeholders = areaIds.map(() => '?').join(',');
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT status, COUNT(*) as count FROM cases WHERE area_id IN (${placeholders}) GROUP BY status`,
        areaIds
      );
      return rows;
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT status, COUNT(*) as count FROM cases GROUP BY status'
    );
    return rows;
  },

  getCountsByUrgency: async (areaIds?: number[]) => {
    const query = areaIds && areaIds.length > 0
      ? `SELECT ct.urgency_level, COUNT(*) as count 
         FROM case_triage ct
         JOIN cases c ON ct.case_id = c.id
         WHERE c.area_id IN (${areaIds.map(() => '?').join(',')})
         GROUP BY ct.urgency_level`
      : 'SELECT urgency_level, COUNT(*) as count FROM case_triage GROUP BY urgency_level';
    
    const [rows] = await pool.execute<RowDataPacket[]>(
      query,
      areaIds || []
    );
    return rows;
  },
};

import pool from '../connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export const assignmentQueries = {
  create: async (data: {
    caseId: number;
    workerId?: number;
    doctorId?: number;
  }) => {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO assignments (case_id, worker_id, doctor_id) VALUES (?, ?, ?)',
      [data.caseId, data.workerId || null, data.doctorId || null]
    );
    return result.insertId;
  },

  findByCaseId: async (caseId: number) => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT a.*, 
              w.name as worker_name,
              d.name as doctor_name
       FROM assignments a
       LEFT JOIN users w ON a.worker_id = w.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.case_id = ?
       ORDER BY a.created_at DESC
       LIMIT 1`,
      [caseId]
    );
    return rows[0];
  },

  findByWorkerId: async (workerId: number) => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT a.*, c.*, ct.urgency_level
       FROM assignments a
       JOIN cases c ON a.case_id = c.id
       LEFT JOIN case_triage ct ON c.id = ct.case_id
       WHERE a.worker_id = ?
       ORDER BY a.created_at DESC`,
      [workerId]
    );
    return rows;
  },

  findByDoctorId: async (doctorId: number) => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT a.*, c.*, ct.urgency_level
       FROM assignments a
       JOIN cases c ON a.case_id = c.id
       LEFT JOIN case_triage ct ON c.id = ct.case_id
       WHERE a.doctor_id = ?
       ORDER BY a.created_at DESC`,
      [doctorId]
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
    if (updates.workerId !== undefined) {
      fields.push('worker_id = ?');
      values.push(updates.workerId);
    }
    if (updates.doctorId !== undefined) {
      fields.push('doctor_id = ?');
      values.push(updates.doctorId);
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.execute(
      `UPDATE assignments SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },
};

import pool from '../connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export const messageQueries = {
  create: async (data: {
    caseId: number;
    authorId: number;
    authorRole: string;
    content: string;
  }) => {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO messages (case_id, author_id, author_role, content) VALUES (?, ?, ?, ?)',
      [data.caseId, data.authorId, data.authorRole, data.content]
    );
    return result.insertId;
  },

  findByCaseId: async (caseId: number) => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT m.*, u.name as author_name
       FROM messages m
       LEFT JOIN users u ON m.author_id = u.id
       WHERE m.case_id = ?
       ORDER BY m.created_at ASC`,
      [caseId]
    );
    return rows;
  },
};

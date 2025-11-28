import pool from '../connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export const areaQueries = {
  create: async (name: string, metadata?: Record<string, any>) => {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO areas (name, metadata) VALUES (?, ?)',
      [name, metadata ? JSON.stringify(metadata) : null]
    );
    return result.insertId;
  },

  findById: async (id: number) => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM areas WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  findAll: async () => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM areas ORDER BY name'
    );
    return rows;
  },

  update: async (id: number, updates: any) => {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.metadata !== undefined) {
      fields.push('metadata = ?');
      values.push(JSON.stringify(updates.metadata));
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.execute(
      `UPDATE areas SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  delete: async (id: number) => {
    await pool.execute('DELETE FROM areas WHERE id = ?', [id]);
  },
};

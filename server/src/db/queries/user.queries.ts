import pool from '../connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export const userQueries = {
  create: async (name: string, email: string, passwordHash: string, role: string, areas?: number[], languages?: string[]) => {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash, role, areas, languages) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, areas ? JSON.stringify(areas) : null, languages ? JSON.stringify(languages) : null]
    );
    return result.insertId;
  },

  findByEmail: async (email: string) => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  },

  findById: async (id: number) => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, role, areas, languages, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  findAll: async (role?: string) => {
    if (role) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, name, email, role, areas, languages, created_at, updated_at FROM users WHERE role = ?',
        [role]
      );
      return rows;
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, role, areas, languages, created_at, updated_at FROM users'
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
    if (updates.email) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.role) {
      fields.push('role = ?');
      values.push(updates.role);
    }
    if (updates.areas !== undefined) {
      fields.push('areas = ?');
      values.push(JSON.stringify(updates.areas));
    }
    if (updates.languages !== undefined) {
      fields.push('languages = ?');
      values.push(JSON.stringify(updates.languages));
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  delete: async (id: number) => {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
  },
};

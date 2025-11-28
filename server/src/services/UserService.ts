import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userQueries } from '../db/queries/user.queries';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class UserService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role: string;
    areas?: number[];
    languages?: string[];
  }) {
    const existingUser = await userQueries.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const userId = await userQueries.create(
      data.name,
      data.email,
      passwordHash,
      data.role,
      data.areas,
      data.languages
    );

    const user = await userQueries.findById(userId);
    const token = jwt.sign({ userId, role: data.role }, JWT_SECRET, { expiresIn: '7d' });

    return { token, user: this.formatUser(user) };
  }

  async login(email: string, password: string) {
    const user = await userQueries.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return { token, user: this.formatUser(user) };
  }

  async getUserById(id: number) {
    const user = await userQueries.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return this.formatUser(user);
  }

  async getAllUsers(role?: string) {
    const users = await userQueries.findAll(role);
    return users.map(this.formatUser);
  }

  async getUsersByRoleAndArea(role: string, areaId?: number) {
    const users = await userQueries.findAll(role);
    const formatted = users.map(this.formatUser);
    if (areaId === undefined) return formatted;
    return formatted.filter((u) => Array.isArray(u.areas) && u.areas.includes(areaId));
  }

  async updateUser(id: number, updates: any) {
    await userQueries.update(id, updates);
    return this.getUserById(id);
  }

  async deleteUser(id: number) {
    await userQueries.delete(id);
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  private formatUser(user: any) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      areas: user.areas ? JSON.parse(user.areas) : null,
      languages: user.languages ? JSON.parse(user.languages) : null,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}

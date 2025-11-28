import { Router } from 'express';
import { UserService } from '../services/UserService';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userService = new UserService();

router.get('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const users = await userService.getAllUsers(role as string);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Lightweight search for users by role and optional area; accessible to any authenticated user
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const role = (req.query.role as string) || '';
    const areaId = req.query.areaId ? parseInt(String(req.query.areaId)) : undefined;
    if (!role) {
      return res.status(400).json({ error: 'role query parameter is required' });
    }
    const users = await userService.getUsersByRoleAndArea(role, areaId);
    // Return minimal public profile for selection lists
    const trimmed = users.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      areas: u.areas,
      languages: u.languages,
    }));
    res.json(trimmed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await userService.getUserById(parseInt(req.params.id));
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const user = await userService.updateUser(parseInt(req.params.id), req.body);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    await userService.deleteUser(parseInt(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

import { Router } from 'express';
import { UserService } from '../services/UserService';

const router = Router();
const userService = new UserService();

router.post('/register', async (req, res) => {
  try {
    const result = await userService.register(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = userService.verifyToken(token);
    const user = await userService.getUserById(decoded.userId);
    res.json(user);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;

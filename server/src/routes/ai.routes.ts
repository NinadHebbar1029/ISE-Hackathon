import { Router } from 'express';
import { AIService } from '../services/AIService';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const aiService = new AIService();

router.post('/triage', authMiddleware, async (req, res) => {
  try {
    const result = await aiService.performTriage(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/translate', authMiddleware, async (req, res) => {
  try {
    const result = await aiService.translate(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/draft-advice', authMiddleware, async (req, res) => {
  try {
    const result = await aiService.draftAdvice(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

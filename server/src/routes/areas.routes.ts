import { Router } from 'express';
import { AreaService } from '../services/AreaService';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const areaService = new AreaService();

router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const area = await areaService.createArea(req.body);
    res.status(201).json(area);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const areas = await areaService.getAllAreas();
    res.json(areas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const area = await areaService.getAreaById(parseInt(req.params.id));
    res.json(area);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const area = await areaService.updateArea(parseInt(req.params.id), req.body);
    res.json(area);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    await areaService.deleteArea(parseInt(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

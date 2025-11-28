import { Router } from 'express';
import { AssignmentService } from '../services/AssignmentService';
import { authMiddleware, AuthRequest, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const assignmentService = new AssignmentService();

router.post('/', authMiddleware, roleMiddleware('admin'), async (req: AuthRequest, res) => {
  try {
    const assignment = await assignmentService.createAssignment(req.body);
    res.status(201).json(assignment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/worker/:workerId', authMiddleware, async (req, res) => {
  try {
    const assignments = await assignmentService.getAssignmentsByWorkerId(parseInt(req.params.workerId));
    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/doctor/:doctorId', authMiddleware, async (req, res) => {
  try {
    const assignments = await assignmentService.getAssignmentsByDoctorId(parseInt(req.params.doctorId));
    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    await assignmentService.updateAssignment(parseInt(req.params.id), req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

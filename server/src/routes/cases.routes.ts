import { Router } from 'express';
import { CaseService } from '../services/CaseService';
import { AIService } from '../services/AIService';
import { AssignmentService } from '../services/AssignmentService';
import { authMiddleware, AuthRequest, roleMiddleware } from '../middleware/auth.middleware';
import { UserService } from '../services/UserService';

const router = Router();
const caseService = new CaseService();
const aiService = new AIService();
const assignmentService = new AssignmentService();
const userService = new UserService();

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    // Normalize inputs
    const areaIdNormalized = req.body.areaId !== undefined && req.body.areaId !== null && req.body.areaId !== ''
      ? parseInt(String(req.body.areaId))
      : undefined;
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const language = typeof req.body.language === 'string' ? req.body.language : '';

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    if (!language) {
      return res.status(400).json({ error: 'Language is required' });
    }

    const caseData = {
      ...req.body,
      description,
      language,
      areaId: Number.isFinite(areaIdNormalized as number) ? areaIdNormalized : undefined,
      patientId: role === 'patient' ? userId : req.body.patientId || userId,
      createdByUserId: userId,
    };

    // Optional: patient/admin/worker can propose a specific worker assignment at creation time
    const requestedWorkerId: number | undefined = (req.body.workerId !== undefined && req.body.workerId !== null && req.body.workerId !== '')
      ? parseInt(String(req.body.workerId))
      : undefined;

    // Validate requested worker if provided
    if (requestedWorkerId) {
      try {
        const worker = await userService.getUserById(requestedWorkerId);
        if (worker.role !== 'worker') {
          return res.status(400).json({ error: 'Provided workerId does not belong to a worker' });
        }
        if (caseData.areaId && worker.areas && !worker.areas.includes(caseData.areaId)) {
          return res.status(400).json({ error: 'Selected worker is not assigned to the chosen area' });
        }
      } catch (e: any) {
        return res.status(400).json({ error: 'Invalid workerId' });
      }
    }

    const newCase = await caseService.createCase(caseData);

    try {
      const triageResult = await aiService.performTriage({
        description: caseData.description,
        language: caseData.language,
        patientAge: caseData.patientAge,
        patientName: caseData.patientName,
      });

      await caseService.addTriage({
        caseId: newCase.id,
        urgencyLevel: triageResult.urgencyLevel,
        structuredSymptoms: triageResult.structuredSymptoms,
        riskFlags: triageResult.riskFlags,
        aiModel: triageResult.aiModel,
        summary: triageResult.summary,
      });

      // Create an assignment either to the requested worker, or auto-assign placeholder if area is provided
      if (requestedWorkerId) {
        await assignmentService.createAssignment({ caseId: newCase.id, workerId: requestedWorkerId });
      } else if (caseData.areaId) {
        await assignmentService.createAssignment({ caseId: newCase.id });
      }
    } catch (aiError) {
      console.error('AI triage failed:', aiError);
      // Fallback: persist a default triage so UI doesn't remain in pending state
      try {
        await caseService.addTriage({
          caseId: newCase.id,
          urgencyLevel: 'moderate',
          structuredSymptoms: {},
          riskFlags: [],
          aiModel: 'fallback',
          summary: 'AI triage unavailable at the moment. Showing default assessment.',
        });
      } catch (persistErr) {
        console.error('Failed to persist fallback triage:', persistErr);
      }
    }

    const updatedCase = await caseService.getCaseById(newCase.id);
    res.status(201).json(updatedCase);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    let cases;
    if (role === 'patient') {
      cases = await caseService.getCasesByPatientId(userId);
    } else if (role === 'admin') {
      const areaId = req.query.areaId ? parseInt(String(req.query.areaId)) : undefined;
      const patientId = req.query.patientId ? parseInt(String(req.query.patientId)) : undefined;
      if (areaId) {
        cases = await caseService.getCasesByAreaIds([areaId]);
        if (patientId) {
          cases = cases.filter((c: any) => c.patientId === patientId);
        }
      } else if (patientId) {
        cases = await caseService.getCasesByPatientId(patientId);
      } else {
        cases = await caseService.getAllCases();
      }
    } else {
      const userServiceModule = await import('../services/UserService');
      const userServiceInstance = new userServiceModule.UserService();
      const user = await userServiceInstance.getUserById(userId);
      const areaIds = user.areas || [];

      // For workers/doctors: show cases in their areas AND cases they created
      const areaCases = areaIds.length > 0
        ? await caseService.getCasesByAreaIds(areaIds)
        : [];
      const ownCases = await caseService.getCasesByCreatorId(userId);

      const caseMap = new Map<number, any>();
      for (const c of [...areaCases, ...ownCases]) {
        caseMap.set(c.id, c);
      }
      cases = Array.from(caseMap.values());
    }

    res.json(cases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const role = req.user!.role;
    let areaIds: number[] | undefined;

    if (role !== 'admin') {
      const userService = new (await import('../services/UserService')).UserService();
      const user = await userService.getUserById(req.user!.userId);
      areaIds = user.areas || [];
    }

    const stats = await caseService.getCaseStatistics(areaIds);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const caseData = await caseService.getCaseById(parseInt(req.params.id));
    res.json(caseData);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const updatedCase = await caseService.updateCase(parseInt(req.params.id), req.body);
    res.json(updatedCase);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/messages', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const message = await caseService.addMessage({
      caseId: parseInt(req.params.id),
      authorId: req.user!.userId,
      authorRole: req.user!.role,
      content: req.body.content,
    });
    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Fetch all messages for a case
router.get('/:id/messages', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const c = await caseService.getCaseById(id);
    res.json(c.messages || []);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await caseService.deleteCase(parseInt(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

// Re-run AI triage for a case
router.post('/:id/retriage', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const caseId = parseInt(req.params.id);
    const c = await caseService.getCaseById(caseId);

    // Authorization: patients can retriage their own cases; staff can retriage any
    const role = req.user!.role;
    const userId = req.user!.userId;
    if (role === 'patient' && c.patientId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const triageResult = await aiService.performTriage({
        description: c.description,
        language: c.language,
        patientAge: c.patientAge,
        patientName: c.patientName,
      });

      await caseService.addTriage({
        caseId,
        urgencyLevel: triageResult.urgencyLevel,
        structuredSymptoms: triageResult.structuredSymptoms,
        riskFlags: triageResult.riskFlags,
        aiModel: triageResult.aiModel,
        summary: triageResult.summary,
      });
    } catch (err) {
      // If AI fails, persist fallback triage so UI updates
      await caseService.addTriage({
        caseId,
        urgencyLevel: 'moderate',
        structuredSymptoms: {},
        riskFlags: [],
        aiModel: 'fallback',
        summary: 'AI triage unavailable at the moment. Showing default assessment.',
      });
    }

    const updated = await caseService.getCaseById(caseId);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: assign a case to a health worker
router.put('/:id/assign', authMiddleware, roleMiddleware('admin'), async (req: AuthRequest, res) => {
  try {
    const caseId = parseInt(req.params.id);
    const { workerId } = req.body as { workerId: number };
    if (!workerId) {
      return res.status(400).json({ error: 'workerId is required' });
    }

    // Validate case exists and has an area
    const c = await caseService.getCaseById(caseId);
    if (!c.areaId) {
      return res.status(400).json({ error: 'Case does not have an area set; set area before assignment' });
    }

    // Validate worker role and area alignment
    const worker = await userService.getUserById(workerId);
    if (worker.role !== 'worker') {
      return res.status(400).json({ error: 'Provided user is not a worker' });
    }
    if (!Array.isArray(worker.areas) || !worker.areas.includes(c.areaId)) {
      return res.status(400).json({ error: 'Worker is not assigned to the case area' });
    }

    const assignment = await assignmentService.assignWorker(caseId, workerId);
    res.json(assignment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

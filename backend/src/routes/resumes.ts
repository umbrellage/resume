import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../services/db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/resumes/shared/:token - Public access to shared resume (NO auth required)
// NOTE: This route must be defined BEFORE authMiddleware
router.get('/shared/:token', async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;
    const resume = await prisma.resume.findUnique({
      where: { shareToken: token },
      select: {
        id: true,
        title: true,
        templateId: true,
        data: true,
      },
    });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json({ resume });
  } catch (error) {
    console.error('Shared resume error:', error);
    res.status(500).json({ error: 'Failed to get resume' });
  }
});

// All routes below require auth
router.use(authMiddleware);

// GET /api/resumes - List user's resumes (excluding soft-deleted)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId, deletedAt: null },
      select: {
        id: true,
        title: true,
        templateId: true,
        shareToken: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ resumes });
  } catch (error) {
    console.error('List resumes error:', error);
    res.status(500).json({ error: 'Failed to list resumes' });
  }
});

// GET /api/resumes/trash - List trashed resumes
router.get('/trash', async (req: AuthRequest, res: Response) => {
  try {
    // Auto-clean records older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await prisma.resume.deleteMany({
      where: { userId: req.userId, deletedAt: { not: null, lt: thirtyDaysAgo } },
    });

    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId, deletedAt: { not: null } },
      select: { id: true, title: true, templateId: true, deletedAt: true, createdAt: true, updatedAt: true },
      orderBy: { deletedAt: 'desc' },
    });
    res.json({ resumes });
  } catch (error) {
    console.error('List trash error:', error);
    res.status(500).json({ error: 'Failed to list trash' });
  }
});

// POST /api/resumes/trash/:id/restore - Restore a trashed resume
router.post('/trash/:id/restore', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.resume.findFirst({ where: { id, userId: req.userId, deletedAt: { not: null } } });
    if (!existing) return res.status(404).json({ error: 'Resume not found in trash' });

    await prisma.resume.update({ where: { id }, data: { deletedAt: null } });
    res.json({ success: true });
  } catch (error) {
    console.error('Restore resume error:', error);
    res.status(500).json({ error: 'Failed to restore resume' });
  }
});

// DELETE /api/resumes/trash/:id - Permanently delete a trashed resume
router.delete('/trash/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.resume.findFirst({ where: { id, userId: req.userId, deletedAt: { not: null } } });
    if (!existing) return res.status(404).json({ error: 'Resume not found in trash' });

    await prisma.resume.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ error: 'Failed to permanently delete resume' });
  }
});

// GET /api/resumes/:id - Get single resume with full data (excluding soft-deleted)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const resume = await prisma.resume.findFirst({
      where: { id, userId: req.userId, deletedAt: null },
    });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json({ resume });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Failed to get resume' });
  }
});

// POST /api/resumes - Create resume
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, templateId, data } = req.body;
    const resume = await prisma.resume.create({
      data: {
        userId: req.userId!,
        title: title || '我的简历',
        templateId: templateId || 'classic',
        data: data || {},
      },
    });
    res.json({ resume });
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({ error: 'Failed to create resume' });
  }
});

// PUT /api/resumes/:id - Update resume
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, templateId, data } = req.body;

    // Verify ownership
    const existing = await prisma.resume.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(templateId !== undefined && { templateId }),
        ...(data !== undefined && { data }),
      },
    });
    res.json({ resume });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

// DELETE /api/resumes/:id - Soft delete resume (move to trash)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership and not already deleted
    const existing = await prisma.resume.findFirst({
      where: { id, userId: req.userId, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    await prisma.resume.update({ where: { id }, data: { deletedAt: new Date(), shareToken: null } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// POST /api/resumes/:id/share - Generate/refresh share link
router.post('/:id/share', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.resume.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const shareToken = uuidv4().replace(/-/g, '');
    const resume = await prisma.resume.update({
      where: { id },
      data: { shareToken },
    });
    res.json({ shareToken: resume.shareToken });
  } catch (error) {
    console.error('Share resume error:', error);
    res.status(500).json({ error: 'Failed to share resume' });
  }
});

// POST /api/resumes/:id/duplicate - Duplicate a resume
router.post('/:id/duplicate', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get original
    const original = await prisma.resume.findFirst({
      where: { id, userId: req.userId },
    });
    if (!original) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Create duplicate
    const duplicate = await prisma.resume.create({
      data: {
        userId: req.userId!,
        title: `${original.title} (副本)`,
        templateId: original.templateId,
        data: original.data ?? {},
      },
    });

    res.json({ resume: duplicate });
  } catch (error) {
    console.error('Duplicate resume error:', error);
    res.status(500).json({ error: 'Failed to duplicate resume' });
  }
});

export default router;

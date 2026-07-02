import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest, requireEditor, requireAdmin } from '../middleware/auth';
const router = Router();

// Submissions List for Reviewers (Editors or Admins)
router.get('/submissions', requireEditor, async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.query;

  try {
    const whereClause: any = {};
    if (status) {
      whereClause.status = status as string;
    }

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return res.json({ submissions });
  } catch (error) {
    console.error('Admin get submissions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Submission Status & Review Notes
router.put('/submissions/:id/status', requireEditor, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, editorNote } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const validStatuses: string[] = ['PENDING', 'IN_REVIEW', 'ACCEPTED', 'PUBLISHED', 'REJECTED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const currentSubmission = await prisma.submission.findUnique({ where: { id } });
    if (!currentSubmission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const updateData: any = {
      status: status as string,
      editorNote: editorNote || currentSubmission.editorNote,
      reviewerId: req.user!.id,
      reviewedAt: new Date(),
    };

    if (status === 'PUBLISHED' && !currentSubmission.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      message: 'Submission updated successfully',
      submission: updated,
    });
  } catch (error) {
    console.error('Update submission status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Feature as Poem of the Day
router.post('/submissions/:id/feature', requireEditor, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { featuredDate } = req.body; // e.g. "2026-07-02"

  if (!featuredDate) {
    return res.status(400).json({ error: 'Featured date is required' });
  }

  try {
    const submission = await prisma.submission.findUnique({ where: { id } });
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.status !== 'PUBLISHED') {
      return res.status(400).json({ error: 'Only published pieces can be featured as Poem of the Day' });
    }

    const targetDate = new Date(featuredDate);

    // Check if another piece is already featured on this date
    const conflicting = await prisma.submission.findFirst({
      where: {
        featuredOnDate: targetDate,
        id: { not: id },
      },
    });

    if (conflicting) {
      return res.status(400).json({
        error: `Another piece ("${conflicting.title}") is already featured on ${featuredDate}.`,
      });
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        featuredOnDate: targetDate,
      },
    });

    return res.json({
      message: `Successfully scheduled "${updated.title}" as Poem of the Day on ${featuredDate}`,
      submission: updated,
    });
  } catch (error) {
    console.error('Feature submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Subscribers list (ADMIN only)
router.get('/subscribers', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    });
    return res.json({ subscribers });
  } catch (error) {
    console.error('Get subscribers error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// ADMIN CRUD: TEAM MEMBERS
// ============================================================

// Get all team members
router.get('/team', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const team = await prisma.teamMember.findMany({
      orderBy: { order: 'asc' },
    });
    return res.json({ team });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Create team member
router.post('/team', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { name, role, bio, avatarUrl, order } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required' });
  }
  try {
    const member = await prisma.teamMember.create({
      data: { name, role, bio, avatarUrl, order: parseInt(order || '0') },
    });
    return res.status(201).json({ member });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create team member' });
  }
});

// Update team member
router.put('/team/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, role, bio, avatarUrl, order, isActive } = req.body;
  try {
    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        name,
        role,
        bio,
        avatarUrl,
        order: order !== undefined ? parseInt(order) : undefined,
        isActive,
      },
    });
    return res.json({ member });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update team member' });
  }
});

// Delete team member
router.delete('/team/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.teamMember.delete({ where: { id } });
    return res.json({ message: 'Team member deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete team member' });
  }
});

// ============================================================
// ADMIN CRUD: PODCAST EPISODES
// ============================================================

// Get all episodes
router.get('/podcast', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const episodes = await prisma.podcastEpisode.findMany({
      orderBy: { publishedAt: 'desc' },
    });
    return res.json({ episodes });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch podcast episodes' });
  }
});

// Create episode
router.post('/podcast', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, spotifyUrl, publishedAt } = req.body;
  if (!title || !description || !spotifyUrl) {
    return res.status(400).json({ error: 'Title, description, and Spotify URL are required' });
  }
  try {
    const episode = await prisma.podcastEpisode.create({
      data: {
        title,
        description,
        spotifyUrl,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
    });
    return res.status(201).json({ episode });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create episode' });
  }
});

// Update episode
router.put('/podcast/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, spotifyUrl, publishedAt } = req.body;
  try {
    const episode = await prisma.podcastEpisode.update({
      where: { id },
      data: {
        title,
        description,
        spotifyUrl,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      },
    });
    return res.json({ episode });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update episode' });
  }
});

// Delete episode
router.delete('/podcast/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.podcastEpisode.delete({ where: { id } });
    return res.json({ message: 'Episode deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete episode' });
  }
});

// ============================================================
// ADMIN CRUD: TESTIMONIALS
// ============================================================

// Get all testimonials
router.get('/testimonials', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ testimonials });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Create testimonial
router.post('/testimonials', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { memberName, role, quote, approved } = req.body;
  if (!memberName || !quote) {
    return res.status(400).json({ error: 'Name and quote are required' });
  }
  try {
    const testimonial = await prisma.testimonial.create({
      data: { memberName, role, quote, approved: !!approved },
    });
    return res.status(201).json({ testimonial });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

// Update testimonial
router.put('/testimonials/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { memberName, role, quote, approved } = req.body;
  try {
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: { memberName, role, quote, approved },
    });
    return res.json({ testimonial });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// Delete testimonial
router.delete('/testimonials/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.testimonial.delete({ where: { id } });
    return res.json({ message: 'Testimonial deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

export default router;

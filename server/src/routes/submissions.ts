import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
const router = Router();

// Create Submission (MEMBER only)
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { title, body, excerpt, category, tags, aiDeclaration } = req.body;

  if (!title || !body || !category) {
    return res.status(400).json({ error: 'Title, body, and category are required' });
  }

  // Strict Zero-AI check
  if (!aiDeclaration) {
    return res.status(400).json({ error: 'Zero-AI attestation is mandatory to submit your work.' });
  }

  // Validate category enum
  const validCategories: string[] = ['POETRY', 'PROSE', 'SPOKEN_WORD_SCRIPT', 'ESSAY', 'OTHER'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
  }

  try {
    const authorId = req.user!.id;
    const computedExcerpt = excerpt || (body.length > 150 ? body.substring(0, 147) + '...' : body);

    const submission = await prisma.submission.create({
      data: {
        title,
        body,
        excerpt: computedExcerpt,
        category: category as string,
        aiDeclaration: true,
        authorId,
        status: 'PENDING',
      },
    });

    // Handle tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        const cleanedName = tagName.trim().toLowerCase();
        if (cleanedName.length === 0) continue;

        // Find or create Tag
        const tag = await prisma.tag.upsert({
          where: { name: cleanedName },
          update: {},
          create: { name: cleanedName },
        });

        // Create relation
        await prisma.submissionTag.create({
          data: {
            submissionId: submission.id,
            tagId: tag.id,
          },
        });
      }
    }

    return res.status(201).json({
      message: 'Submission created successfully',
      submission,
    });
  } catch (error) {
    console.error('Create submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Current User's Submissions (MEMBER dashboard)
router.get('/my-submissions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { authorId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    return res.json({ submissions });
  } catch (error) {
    console.error('Get my submissions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Single Submission (Details)
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Access control: if not published, must be author or an editor/admin
    if (submission.status !== 'PUBLISHED') {
      if (!req.user) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const isAuthor = submission.authorId === req.user.id;
      const isStaff = req.user.role === 'EDITOR' || req.user.role === 'ADMIN';
      if (!isAuthor && !isStaff) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    return res.json({ submission });
  } catch (error) {
    console.error('Get submission by id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

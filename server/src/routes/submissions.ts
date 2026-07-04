import { Router, Request, Response } from 'express';
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
    } else {
      // Increment view count asynchronously
      prisma.submission.update({
        where: { id },
        data: { views: { increment: 1 } },
      }).catch(err => console.error('Error incrementing views:', err));
    }

    return res.json({ submission });
  } catch (error) {
    console.error('Get submission by id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Related Pieces
router.get('/:id/related', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const currentPiece = await prisma.submission.findUnique({
      where: { id },
      select: {
        id: true,
        category: true,
        authorId: true,
        publishedAt: true,
        status: true,
      },
    });

    if (!currentPiece || currentPiece.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'Piece not found' });
    }

    const includeBlock = {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          bio: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    };

    // Query 1: Same category
    const sameCategory = await prisma.submission.findMany({
      where: {
        id: { not: currentPiece.id },
        category: currentPiece.category,
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      include: includeBlock,
    });

    // Query 2: Same author
    const sameAuthor = await prisma.submission.findMany({
      where: {
        id: { not: currentPiece.id },
        authorId: currentPiece.authorId,
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      include: includeBlock,
    });

    // Query 3: Featured around same time window (±30 days)
    let featuredAroundTime: any[] = [];
    if (currentPiece.publishedAt) {
      const thirtyDaysAgo = new Date(currentPiece.publishedAt.getTime() - 30 * 24 * 60 * 60 * 1000);
      const thirtyDaysAhead = new Date(currentPiece.publishedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      featuredAroundTime = await prisma.submission.findMany({
        where: {
          id: { not: currentPiece.id },
          status: 'PUBLISHED',
          featuredOnDate: {
            gte: thirtyDaysAgo,
            lte: thirtyDaysAhead,
          },
        },
        orderBy: { featuredOnDate: 'desc' },
        take: 4,
        include: includeBlock,
      });
    }

    // Query 4: Recent Fallback
    const recentFallback = await prisma.submission.findMany({
      where: {
        id: { not: currentPiece.id },
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      include: includeBlock,
    });

    // Deduplicate in memory
    const relatedList: any[] = [];
    const seenIds = new Set<string>([currentPiece.id]);

    const addUnique = (pieces: any[]) => {
      for (const p of pieces) {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
          relatedList.push(p);
        }
      }
    };

    addUnique(sameCategory);
    if (relatedList.length < 4) {
      addUnique(sameAuthor);
    }
    if (relatedList.length < 4) {
      addUnique(featuredAroundTime);
    }
    if (relatedList.length < 4) {
      addUnique(recentFallback);
    }

    return res.json({ related: relatedList.slice(0, 4) });
  } catch (error) {
    console.error('Get related pieces error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT Update Submission (Draft/Pending pieces only, Author only)
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, body, excerpt, category, tags } = req.body;

  if (!title || !body || !category) {
    return res.status(400).json({ error: 'Title, body, and category are required' });
  }

  try {
    const currentPiece = await prisma.submission.findUnique({
      where: { id },
    });

    if (!currentPiece) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (currentPiece.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied. You can only edit your own submissions.' });
    }

    if (currentPiece.status === 'PUBLISHED') {
      return res.status(400).json({ error: 'Cannot edit a piece after it has been published.' });
    }

    // 5-minute debounced Snapshotting logic
    const lastRevision = await prisma.draftRevision.findFirst({
      where: { submissionId: id },
      orderBy: { createdAt: 'desc' },
    });

    const fiveMinutes = 5 * 60 * 1000;
    if (!lastRevision || (Date.now() - lastRevision.createdAt.getTime() > fiveMinutes)) {
      await prisma.draftRevision.create({
        data: {
          submissionId: id,
          title: currentPiece.title,
          body: currentPiece.body,
        },
      });
    }

    const computedExcerpt = excerpt || (body.length > 150 ? body.substring(0, 147) + '...' : body);

    // Update submission
    const updated = await prisma.submission.update({
      where: { id },
      data: {
        title,
        body,
        excerpt: computedExcerpt,
        category,
        status: 'PENDING', // Reset status to PENDING on edit for review
      },
    });

    // Handle tags update (clear old and insert new)
    if (tags && Array.isArray(tags)) {
      await prisma.submissionTag.deleteMany({
        where: { submissionId: id },
      });

      for (const tagName of tags) {
        const cleanedName = tagName.trim().toLowerCase();
        if (cleanedName.length === 0) continue;

        const tag = await prisma.tag.upsert({
          where: { name: cleanedName },
          update: {},
          create: { name: cleanedName },
        });

        await prisma.submissionTag.create({
          data: {
            submissionId: id,
            tagId: tag.id,
          },
        }).catch(() => {}); // ignore duplicates
      }
    }

    return res.json({
      message: 'Submission updated successfully',
      submission: updated,
    });
  } catch (error) {
    console.error('Update submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all snapshots for a draft (Author or Staff only)
router.get('/:id/revisions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const piece = await prisma.submission.findUnique({
      where: { id },
    });

    if (!piece) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const isAuthor = piece.authorId === req.user!.id;
    const isStaff = req.user!.role === 'EDITOR' || req.user!.role === 'ADMIN';

    if (!isAuthor && !isStaff) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const revisions = await prisma.draftRevision.findMany({
      where: { submissionId: id },
      select: {
        id: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ revisions });
  } catch (error) {
    console.error('Get revisions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET a specific snapshot content (Author or Staff only)
router.get('/:id/revisions/:revisionId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id, revisionId } = req.params;

  try {
    const piece = await prisma.submission.findUnique({
      where: { id },
    });

    if (!piece) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const isAuthor = piece.authorId === req.user!.id;
    const isStaff = req.user!.role === 'EDITOR' || req.user!.role === 'ADMIN';

    if (!isAuthor && !isStaff) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const revision = await prisma.draftRevision.findFirst({
      where: {
        id: revisionId,
        submissionId: id,
      },
    });

    if (!revision) {
      return res.status(404).json({ error: 'Revision not found' });
    }

    return res.json({ revision });
  } catch (error) {
    console.error('Get revision detail error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

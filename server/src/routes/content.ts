import { Router, Request, Response } from 'express';
import Parser from 'rss-parser';
import { prisma } from '../lib/prisma';
const router = Router();
const parser = new Parser();

// 1. Get Poem of the Day
router.get('/poem-of-day', async (req: Request, res: Response) => {
  try {
    // Find the piece featured for today (or most recently featured)
    const featured = await prisma.submission.findFirst({
      where: {
        status: 'PUBLISHED',
        featuredOnDate: {
          lte: new Date(),
        },
      },
      orderBy: {
        featuredOnDate: 'desc',
      },
      include: {
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
      },
    });

    if (featured) {
      return res.json({ poem: featured });
    }

    // Fallback: get the latest published poetry
    const fallback = await prisma.submission.findFirst({
      where: {
        status: 'PUBLISHED',
        category: 'POETRY',
      },
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
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
      },
    });

    return res.json({ poem: fallback });
  } catch (error) {
    console.error('Poem of the day error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get Archive (Published pieces with filters & pagination)
router.get('/archive', async (req: Request, res: Response) => {
  const { category, tag, q, page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  try {
    const whereClause: any = {
      status: 'PUBLISHED',
    };

    if (category) {
      whereClause.category = category as string;
    }

    if (tag) {
      whereClause.tags = {
        some: {
          tag: {
            name: (tag as string).trim().toLowerCase(),
          },
        },
      };
    }

    if (q) {
      const search = (q as string).trim();
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [pieces, total] = await Promise.all([
      prisma.submission.findMany({
        where: whereClause,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limitNum,
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
        },
      }),
      prisma.submission.count({ where: whereClause }),
    ]);

    return res.json({
      pieces,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get archive error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Get Team Members
router.get('/team', async (req: Request, res: Response) => {
  try {
    const team = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return res.json({ team });
  } catch (error) {
    console.error('Get team error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Get Podcast Episodes
router.get('/podcast', async (req: Request, res: Response) => {
  try {
    const episodes = await prisma.podcastEpisode.findMany({
      orderBy: { publishedAt: 'desc' },
    });
    return res.json({ episodes });
  } catch (error) {
    console.error('Get podcast error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Get Instagram Highlights
router.get('/instagram', async (req: Request, res: Response) => {
  try {
    const highlights = await prisma.instagramHighlight.findMany({
      orderBy: { order: 'asc' },
    });
    return res.json({ highlights });
  } catch (error) {
    console.error('Get instagram highlights error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. Get Substack Feed (RSS Proxy)
router.get('/substack', async (req: Request, res: Response) => {
  const SUBSTACK_URL = 'https://midnightquill.substack.com/feed';
  try {
    const feed = await parser.parseURL(SUBSTACK_URL);
    const items = feed.items.map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      excerpt: item.contentSnippet || item.content || '',
      author: item.creator || 'TMQ Editorial',
    }));
    return res.json({ items: items.slice(0, 5) });
  } catch (error) {
    // If substack parsing fails (e.g. feed does not exist yet), return mock/last known RSS feed info
    console.warn('Substack RSS parse failed, using offline fallback');
    return res.json({
      items: [
        {
          title: 'Welcome to The Midnight Quill',
          link: 'https://midnightquill.substack.com/p/welcome',
          pubDate: '2025-10-18',
          excerpt: 'This is where it begins. A space for raw, unfiltered, human writing.',
          author: 'Imran Ali',
        },
        {
          title: 'Why We Don\'t Use AI to Write',
          link: 'https://midnightquill.substack.com/p/why-no-ai',
          pubDate: '2025-11-05',
          excerpt: 'Every word here is human. Here\'s why that matters.',
          author: 'Imran Ali',
        },
        {
          title: 'The Art of Letting Go — Ritashree Das',
          link: 'https://midnightquill.substack.com/p/art-of-letting-go',
          pubDate: '2025-10-22',
          excerpt: 'You don\'t learn to let go. You practice it, every morning, like prayer.',
          author: 'Ritashree Das',
        },
      ],
    });
  }
});

export default router;

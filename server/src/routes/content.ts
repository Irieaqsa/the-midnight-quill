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

// Helper to parse year/season into start/end Dates
function parsePeriod(periodStr: string): { start: Date; end: Date; label: string } {
  const clean = periodStr.trim().toLowerCase();
  
  // Year match: e.g. "2026"
  const yearMatch = clean.match(/^(\d{4})$/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    return {
      start: new Date(`${year}-01-01T00:00:00.000Z`),
      end: new Date(`${year}-12-31T23:59:59.999Z`),
      label: `${year} Annual Digest`,
    };
  }

  // Season match: e.g. "2026-summer"
  const seasonMatch = clean.match(/^(\d{4})-(spring|summer|autumn|fall|winter)$/);
  if (seasonMatch) {
    const year = parseInt(seasonMatch[1], 10);
    const season = seasonMatch[2];
    
    if (season === 'spring') {
      return {
        start: new Date(`${year}-03-01T00:00:00.000Z`),
        end: new Date(`${year}-05-31T23:59:59.999Z`),
        label: `${year} Spring Digest`,
      };
    } else if (season === 'summer') {
      return {
        start: new Date(`${year}-06-01T00:00:00.000Z`),
        end: new Date(`${year}-08-31T23:59:59.999Z`),
        label: `${year} Summer Digest`,
      };
    } else if (season === 'autumn' || season === 'fall') {
      return {
        start: new Date(`${year}-09-01T00:00:00.000Z`),
        end: new Date(`${year}-11-30T23:59:59.999Z`),
        label: `${year} Autumn Digest`,
      };
    } else { // winter
      return {
        start: new Date(`${year}-12-01T00:00:00.000Z`),
        end: new Date(`${year + 1}-02-28T23:59:59.999Z`),
        label: `${year}-${year + 1} Winter Digest`,
      };
    }
  }

  // Default fallback (e.g. current year)
  const currentYear = new Date().getFullYear();
  return {
    start: new Date(`${currentYear}-01-01T00:00:00.000Z`),
    end: new Date(`${currentYear}-12-31T23:59:59.999Z`),
    label: `${currentYear} Digest`,
  };
}

// Simple in-memory cache
const digestCache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Get Seasonal/Annual Digest
router.get('/digest', async (req: Request, res: Response) => {
  const { period = new Date().getFullYear().toString() } = req.query;
  const periodStr = period as string;

  // Check cache
  const cached = digestCache[periodStr];
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return res.json(cached.data);
  }

  try {
    const { start, end, label } = parsePeriod(periodStr);

    // 1. Total pieces published
    const totalPieces = await prisma.submission.count({
      where: {
        status: 'PUBLISHED',
        publishedAt: { gte: start, lte: end },
      },
    });

    // 2. Unique contributing authors
    const authors = await prisma.submission.groupBy({
      by: ['authorId'],
      where: {
        status: 'PUBLISHED',
        publishedAt: { gte: start, lte: end },
      },
    });
    const totalAuthors = authors.length;

    // 3. Category breakdown
    const categories = await prisma.submission.groupBy({
      by: ['category'],
      where: {
        status: 'PUBLISHED',
        publishedAt: { gte: start, lte: end },
      },
      _count: {
        category: true,
      },
    });

    const categoryBreakdown = categories.reduce((acc: any, curr) => {
      acc[curr.category] = curr._count.category;
      return acc;
    }, {});

    // 4. Poem of the Day features
    const poemOfDayCount = await prisma.submission.count({
      where: {
        status: 'PUBLISHED',
        featuredOnDate: { gte: start, lte: end },
      },
    });

    // 5. Standout pieces (top 5 by comment count)
    const allPiecesInPeriod = await prisma.submission.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { gte: start, lte: end },
      },
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
        _count: {
          select: { comments: true },
        },
      },
    });

    const standoutPieces = allPiecesInPeriod
      .sort((a, b) => b._count.comments - a._count.comments)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        publishedAt: p.publishedAt,
        author: p.author,
        tags: p.tags,
        commentCount: p._count.comments,
      }));

    const digestData = {
      period: periodStr,
      label,
      totalPieces,
      totalAuthors,
      categoryBreakdown,
      poemOfDayCount,
      standoutPieces,
    };

    // Cache computed data
    digestCache[periodStr] = {
      data: digestData,
      timestamp: Date.now(),
    };

    return res.json(digestData);
  } catch (error) {
    console.error('Get digest error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

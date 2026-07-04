import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import submissionRoutes from './routes/submissions';
import contentRoutes from './routes/content';
import adminRoutes from './routes/admin';
import newsletterRoutes from './routes/newsletter';
import { authenticateToken } from './middleware/auth';

import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(authenticateToken);

// Public & Secured Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newsletter', newsletterRoutes);

import { prisma } from './lib/prisma';

// Helper to escape XML characters
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Native RSS Feed for TMQ Archive
app.get('/rss.xml', async (req, res) => {
  try {
    const pieces = await prisma.submission.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 40,
      include: {
        author: {
          select: { name: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    const host = req.get('host') || 'the-midnight-quill.onrender.com';
    const protocol = req.secure ? 'https' : 'http';
    const siteUrl = `${protocol}://${host}`;

    let xml = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
    xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>The Midnight Quill</title>\n`;
    xml += `    <link>${siteUrl}</link>\n`;
    xml += `    <description>A literary sanctuary for raw, human emotional expression.</description>\n`;
    xml += `    <language>en-us</language>\n`;
    xml += `    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;
    
    if (pieces.length > 0 && pieces[0].publishedAt) {
      xml += `    <lastBuildDate>${pieces[0].publishedAt.toUTCString()}</lastBuildDate>\n`;
    }

    for (const piece of pieces) {
      const pieceUrl = `${siteUrl}/post/${piece.id}`;
      const pubDate = piece.publishedAt ? piece.publishedAt.toUTCString() : new Date().toUTCString();
      const authorName = escapeXml(piece.author.name);
      const title = escapeXml(piece.title);
      const description = escapeXml(piece.excerpt || piece.body.substring(0, 150) + '...');
      
      xml += `    <item>\n`;
      xml += `      <title>${title}</title>\n`;
      xml += `      <link>${pieceUrl}</link>\n`;
      xml += `      <guid isPermaLink="true">${pieceUrl}</guid>\n`;
      xml += `      <pubDate>${pubDate}</pubDate>\n`;
      xml += `      <author>noreply@the-midnight-quill.onrender.com (${authorName})</author>\n`;
      xml += `      <description>${description}</description>\n`;
      
      for (const t of piece.tags) {
        xml += `      <category>${escapeXml(t.tag.name)}</category>\n`;
      }
      
      xml += `    </item>\n`;
    }

    xml += `  </channel>\n`;
    xml += `</rss>\n`;

    res.header('Content-Type', 'application/rss+xml; charset=utf-8');
    return res.send(xml);
  } catch (error) {
    console.error('RSS feed error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Serve React Frontend in Production
const frontendPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendPath));

// Fallback to React Router for all non-API routes
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

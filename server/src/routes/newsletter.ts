import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.post('/subscribe', async (req: Request, res: Response) => {
  const { email, source } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.unsubscribedAt) {
        // Resubscribe
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { unsubscribedAt: null },
        });
        return res.json({ message: 'Resubscribed successfully!' });
      }
      return res.status(400).json({ error: 'This email is already subscribed.' });
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email,
        source: source || 'site-footer',
      },
    });

    return res.status(201).json({ message: 'Successfully subscribed to The Midnight Quill newsletter!' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { sendEmail } from '../lib/email';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-tmq';

// Register User
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields (email, password, name) are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Auto-promote founder emails to correct roles
    let role: 'MEMBER' | 'EDITOR' | 'ADMIN' = 'MEMBER';
    const lowerEmail = email.toLowerCase();
    if (lowerEmail === 'irie1imran@mail.com' || lowerEmail === 'irie1imran@gmail.com') {
      role = 'ADMIN';
    } else if (lowerEmail === 'dasritasree1@gmail.com') {
      role = 'EDITOR';
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout User
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully' });
});

// Get Current User details
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Security practice: do not leak whether user exists.
    // Return a success status even if the email is not registered.
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpires,
      },
    });

    // Construct reset link using request origin
    const clientUrl = process.env.CLIENT_URL || req.headers.referer || `${req.protocol}://${req.get('host')}`;
    // Clean trailing slashes
    const baseClientUrl = clientUrl.replace(/\/+$/, '');
    const resetLink = `${baseClientUrl}/auth?mode=reset&token=${token}`;

    const mailText = `You are receiving this email because you (or someone else) requested a password reset for your account.\n\n`
      + `Please click on the following link, or paste it into your browser to complete the process within 1 hour:\n\n`
      + `${resetLink}\n\n`
      + `If you did not request this, please ignore this email and your password will remain unchanged.\n`;

    const mailHtml = `<p>You are receiving this email because you (or someone else) requested a password reset for your account.</p>`
      + `<p>Please click on the link below, or paste it into your browser to complete the process within 1 hour:</p>`
      + `<p><a href="${resetLink}" style="padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>`
      + `<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

    const emailSent = await sendEmail({
      to: user.email,
      subject: 'The Midnight Quill — Password Reset Request',
      text: mailText,
      html: mailHtml,
    });

    // Add a comment to explain root causes of SMTP failures
    // Note: SMTP failures in production are typically due to missing environment variables on Render.
    if (!emailSent.success) {
      console.error(`Root cause warning: Email sending failed. Verify your SMTP env vars on Render dashboard.`, emailSent.error);
      return res.status(500).json({ 
        error: 'Failed to send reset email. Please try again later.',
        details: emailSent.error ? (emailSent.error as any).message : 'Unknown SMTP error'
      });
    }

    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  try {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: resetTokenHash,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Update password and invalidate token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return res.json({ message: 'Password has been successfully reset. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Change Password Route (authenticated users)
router.put('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash || '');
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    // Hash and update new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

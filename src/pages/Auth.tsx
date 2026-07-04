import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Feather, Mail, Lock, ArrowRight, ArrowLeft, Loader2, Check, User } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address' }),
});

const passwordSchema = z.object({
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
});

type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'reset-password';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('signin');
  
  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [resetSent, setResetSent] = useState(false);
  
  const { signIn, signUp, sendPasswordReset, resetPassword, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Update mode based on URL params
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup') setMode('signup');
    else if (urlMode === 'forgot') setMode('forgot-password');
    else if (urlMode === 'reset') setMode('reset-password');
    else setMode('signin');
  }, [searchParams]);

  // Reset state when mode changes
  useEffect(() => {
    setErrors({});
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setResetSent(false);
  }, [mode]);

  const validateEmail = (emailValue: string) => {
    const result = emailSchema.safeParse({ email: emailValue });
    if (!result.success) {
      setErrors({ email: result.error.errors[0].message });
      return false;
    }
    setErrors({});
    return true;
  };

  const validatePassword = (passwordValue: string) => {
    const result = passwordSchema.safeParse({ password: passwordValue });
    if (!result.success) {
      setErrors({ password: result.error.errors[0].message });
      return false;
    }
    setErrors({});
    return true;
  };

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    if (!password.trim()) {
      setErrors({ password: 'Password is required' });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: 'Sign in failed',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
      } else {
        navigate('/');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }
    if (!validateEmail(email) || !validatePassword(password)) return;
    
    if (password !== confirmPassword) {
      setErrors({ password: 'Passwords do not match' });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await signUp(email, password, name);
      if (error) {
        if (error.toLowerCase().includes('already registered') || error.toLowerCase().includes('already exists')) {
          toast({
            title: 'Account exists',
            description: 'This email is already registered. Please sign in instead.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Sign up failed',
            description: error || 'Unable to create account. Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Welcome to TMQ',
          description: 'Your account has been created successfully.',
        });
        navigate('/');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    
    setIsLoading(true);
    try {
      const { error } = await sendPasswordReset(email);
      if (error) {
        toast({
          title: 'Error',
          description: 'Unable to send reset email. Please try again.',
          variant: 'destructive',
        });
      } else {
        setResetSent(true);
        toast({
          title: 'Check your email',
          description: 'If an account exists, you will receive a password reset link.',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = searchParams.get('token');

    if (!token) {
      toast({
        title: 'Invalid Reset Request',
        description: 'No password reset token was found in the URL.',
        variant: 'destructive',
      });
      return;
    }

    if (!validatePassword(password)) return;

    if (password !== confirmPassword) {
      setErrors({ password: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resetPassword(token, password);
      if (error) {
        toast({
          title: 'Reset failed',
          description: error || 'Unable to reset your password. The token may be invalid or expired.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password reset successful',
          description: 'Your password has been updated. You can now log in.',
        });
        setMode('signin');
        navigate('/auth');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderSignIn = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-2">
          Welcome back
        </h1>
        <p className="text-muted-foreground">
          Sign in to continue to your work
        </p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11"
              disabled={isLoading}
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <button
              type="button"
              onClick={() => setMode('forgot-password')}
              className="text-xs text-primary hover:underline underline-offset-4"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-11"
              disabled={isLoading}
            />
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button type="button" onClick={() => setMode('signup')} className="text-primary font-medium hover:underline underline-offset-4">
            Sign up
          </button>
        </p>
      </div>
    </>
  );

  const renderSignUp = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-2">
          Create account
        </h1>
        <p className="text-muted-foreground">
          Join TMQ and start writing
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="signup-name" className="text-sm font-medium">Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-name"
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 h-11"
              disabled={isLoading}
            />
          </div>
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11"
              disabled={isLoading}
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-11"
              disabled={isLoading}
            />
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-11"
              disabled={isLoading}
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <button type="button" onClick={() => setMode('signin')} className="text-primary font-medium hover:underline underline-offset-4">
            Sign in
          </button>
        </p>
      </div>
    </>
  );

  const renderForgotPassword = () => (
    <>
      <button
        type="button"
        onClick={() => setMode('signin')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </button>

      <div className="text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-2">
          Reset password
        </h1>
        <p className="text-muted-foreground">
          Enter your email to receive a reset link
        </p>
      </div>

      {resetSent ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Check your email</h2>
          <p className="text-muted-foreground mb-6">
            If an account exists for {email}, you will receive a password reset link.
          </p>
          <Button variant="outline" onClick={() => setMode('signin')}>
            Back to sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={handleForgotPassword} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="forgot-email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11"
                disabled={isLoading}
              />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send Reset Link <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>
      )}
    </>
  );

  const renderResetPassword = () => (
    <>
      <button
        type="button"
        onClick={() => setMode('signin')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </button>

      <div className="text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-2">
          New Password
        </h1>
        <p className="text-muted-foreground">
          Enter and confirm your new password below.
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="reset-password" className="text-sm font-medium">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reset-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-11"
              disabled={isLoading}
            />
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-reset-password" className="text-sm font-medium">Confirm New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirm-reset-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-11"
              disabled={isLoading}
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Update Password <Check className="h-4 w-4" /></>}
        </Button>
      </form>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <Feather className="h-12 w-12 text-primary" />
            <span className="font-display text-4xl font-semibold text-foreground">The Midnight Quill</span>
          </Link>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A literary sanctuary for raw, human emotional expression. Strikingly authentic, strictly zero-AI.
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Feather className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-semibold text-foreground">TMQ</span>
          </Link>

          {mode === 'signin' && renderSignIn()}
          {mode === 'signup' && renderSignUp()}
          {mode === 'forgot-password' && renderForgotPassword()}
          {mode === 'reset-password' && renderResetPassword()}
        </div>
      </div>
    </div>
  );
}

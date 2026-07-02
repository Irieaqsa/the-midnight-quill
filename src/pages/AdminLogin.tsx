import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Loader2, Feather, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

export default function AdminLogin() {
  const { user, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as admin/editor, redirect to panel
  useEffect(() => {
    if (user) {
      if (user.role === 'EDITOR' || user.role === 'ADMIN') {
        navigate('/admin/submissions');
      } else {
        // Logged in as regular member, redirect to homepage or dashboard
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        toast({
          title: 'Authentication failed',
          description: signInError || 'Invalid email or password.',
          variant: 'destructive',
        });
        setError('Invalid credentials.');
      } else {
        // Success check role in a separate fetch or relying on AuthContext state update
        const token = localStorage.getItem('tmq_token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          const role = data.user?.role;
          
          if (role === 'EDITOR' || role === 'ADMIN') {
            toast({
              title: 'Access Granted',
              description: `Welcome back, Editor ${data.user.name}.`,
            });
            navigate('/admin/submissions');
          } else {
            // Disallow regular users from using this login page
            await signOut();
            toast({
              title: 'Access Denied',
              description: 'This portal is restricted to editors and administrators.',
              variant: 'destructive',
            });
            setError('Access restricted to editorial staff.');
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the authentication server.',
        variant: 'destructive',
      });
      setError('Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md bg-card border border-white/5 rounded-xl p-8 space-y-6 shadow-2xl animate-scale-in">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
              <Feather className="h-7 w-7 text-primary group-hover:rotate-12 transition-transform duration-350" />
              <span className="font-display text-xl font-bold text-foreground">The Midnight Quill</span>
            </Link>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight flex items-center justify-center gap-2">
              Editor Portal
            </h1>
            <p className="text-xs text-muted-foreground">
              Sign in to manage submissions and moderate community content.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
              <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Editorial Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="name@midnightquill.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10 bg-background/50 border-white/5 text-foreground"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Secure Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-10 bg-background/50 border-white/5 text-foreground"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full cta-primary h-10 gap-1.5 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Access Dashboard'
              )}
            </Button>
          </form>

          {/* Footer Back link */}
          <div className="text-center pt-2 border-t border-white/5">
            <Link 
              to="/auth" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="h-3 w-3" />
              Go to Member Sign In
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  );
}

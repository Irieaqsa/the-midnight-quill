import { ReactNode, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { FileText, Users, Headphones, Star, Settings } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (user.role !== 'EDITOR' && user.role !== 'ADMIN') {
        navigate('/dashboard');
      }
    }
  }, [user, loading, navigate]);

  if (loading || !user || (user.role !== 'EDITOR' && user.role !== 'ADMIN')) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
        </div>
      </Layout>
    );
  }

  const isActive = (path: string) => location.pathname === path;

  const AdminLink = ({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon: any }) => (
    <Link
      to={to}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
        isActive(to)
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
      }`}
    >
      <Icon className="h-4.5 w-4.5" />
      {children}
    </Link>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Nav */}
          <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-1.5 p-4 bg-card rounded-lg border border-white/5 h-fit">
            <span className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Editor Controls
            </span>
            <AdminLink to="/admin/submissions" icon={FileText}>
              Submissions
            </AdminLink>
            {user.role === 'ADMIN' && (
              <>
                <AdminLink to="/admin/team" icon={Users}>
                  Team Directory
                </AdminLink>
                <AdminLink to="/admin/podcast" icon={Headphones}>
                  Podcast Log
                </AdminLink>
                <AdminLink to="/admin/testimonials" icon={Star}>
                  Testimonials
                </AdminLink>
              </>
            )}
            <AdminLink to="/dashboard" icon={Settings}>
              Back to Dashboard
            </AdminLink>
          </aside>

          {/* Main content pane */}
          <main className="flex-1 p-6 bg-card rounded-lg border border-white/5 min-h-[500px]">
            {children}
          </main>
        </div>
      </div>
    </Layout>
  );
}

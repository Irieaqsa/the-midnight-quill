import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, PenLine, BookOpen, Clock, Send, ShieldAlert, BadgeHelp, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Submission {
  id: string;
  title: string;
  excerpt: string | null;
  category: 'POETRY' | 'PROSE' | 'SPOKEN_WORD_SCRIPT' | 'ESSAY' | 'OTHER';
  status: 'PENDING' | 'IN_REVIEW' | 'ACCEPTED' | 'PUBLISHED' | 'REJECTED';
  editorNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch user's submissions
  useEffect(() => {
    async function fetchSubmissions() {
      if (!user) return;

      const token = localStorage.getItem('tmq_token');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/submissions/my-submissions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setSubmissions(data.submissions || []);
        } else {
          toast.error(data.error || 'Failed to fetch submissions.');
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        toast.error('Could not connect to the server.');
      } finally {
        setIsLoadingSubmissions(false);
      }
    }

    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs border border-white/5">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20">
            <Clock className="h-3 w-3 animate-pulse" />
            In Review
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs border border-primary/30">
            <CheckCircle2 className="h-3 w-3" />
            Accepted
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
            <Send className="h-3 w-3" />
            Published
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs border border-rose-500/20">
            <ShieldAlert className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
            <BadgeHelp className="h-3 w-3" />
            Unknown
          </span>
        );
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-12 animate-fade-up">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-2">
              Submission Dashboard
            </h1>
            <p className="text-muted-foreground">
              Submit your work, track editorial progress, and view review feedback.
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>Account Role: <strong className="text-primary">{user.role}</strong></span>
              {user.role !== 'MEMBER' && (
                <Link to="/admin" className="text-sm text-primary hover:underline font-semibold ml-2">
                  → Go to Editor Moderation Panel
                </Link>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            <Link 
              to="/write"
              className="group p-6 bg-card rounded-lg border border-white/5 hover:border-primary/30 hover:shadow-soft transition-smooth text-left animate-fade-up"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-secondary mb-4 group-hover:bg-primary/10 transition-base">
                <PenLine className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                New Submission
              </h3>
              <p className="text-sm text-muted-foreground">
                Submit a poem, prose piece, spoken word script, or essay
              </p>
            </Link>

            <div className="group p-6 bg-card rounded-lg border border-white/5 animate-fade-up">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-secondary mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                My Submissions
              </h3>
              <p className="text-sm text-muted-foreground">
                {submissions.length} {submissions.length === 1 ? 'piece' : 'pieces'} submitted total
              </p>
            </div>
          </div>

          {/* Submissions list */}
          {isLoadingSubmissions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 px-4 bg-card rounded-lg border border-white/5 animate-fade-up">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-6">
                <PenLine className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                Your canvas awaits
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't submitted any pieces yet. Share your writing to start the journey.
              </p>
              <Button className="cta-primary gap-2" asChild>
                <Link to="/write">
                  <PenLine className="h-4 w-4" />
                  Submit Your First Piece
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-up">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Active & Past Submissions
              </h2>
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 bg-card rounded-lg border border-white/5 hover:border-white/10 transition-smooth flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-display text-lg font-semibold text-foreground truncate">
                            {sub.title || 'Untitled'}
                          </h3>
                          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] tracking-wider uppercase text-muted-foreground">
                            {sub.category.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {sub.excerpt && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {sub.excerpt}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/60 mt-3">
                          Submitted on {formatDate(sub.createdAt)}
                        </p>
                      </div>
                      <div>
                        {getStatusBadge(sub.status)}
                      </div>
                    </div>

                    {/* Editor Note Banner */}
                    {sub.editorNote && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-primary/5 border border-primary/10 rounded-lg mt-2 text-sm">
                        <MessageSquare className="h-4.5 w-4.5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-foreground">Editor feedback:</span>
                          <p className="text-muted-foreground mt-1 leading-relaxed italic">
                            "{sub.editorNote}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

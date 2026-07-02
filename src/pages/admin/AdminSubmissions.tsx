import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Loader2, FileText, CheckCircle2, XCircle, Send, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Submission {
  id: string;
  title: string;
  body: string;
  excerpt: string | null;
  category: string;
  status: 'PENDING' | 'IN_REVIEW' | 'ACCEPTED' | 'PUBLISHED' | 'REJECTED';
  aiDeclaration: boolean;
  editorNote: string | null;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [editorNote, setEditorNote] = useState('');
  const [featuredDate, setFeaturedDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubmissions = async () => {
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions || []);
      } else {
        toast.error('Failed to load submissions.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not connect to the API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleUpdateStatus = async (id: string, status: Submission['status']) => {
    setActionLoading(true);
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/submissions/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, editorNote }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Submission status updated to ${status}`);
        fetchSubmissions();
        setSelectedSub(null);
        setEditorNote('');
      } else {
        toast.error(data.error || 'Update failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeaturePoem = async (id: string) => {
    if (!featuredDate) {
      toast.error('Please select a date.');
      return;
    }
    setActionLoading(true);
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/submissions/${id}/feature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ featuredDate }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Poem scheduled successfully!');
        setFeaturedDate('');
      } else {
        toast.error(data.error || 'Scheduling failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Submission Moderation Queue</h1>
          <p className="text-sm text-muted-foreground">Review incoming member writings and manage publication status.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No submissions found in the queue.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* List panel */}
            <div className={`${selectedSub ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-3`}>
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelectedSub(sub);
                    setEditorNote(sub.editorNote || '');
                  }}
                  className={`p-4 bg-card rounded-lg border cursor-pointer hover:border-primary/20 transition-all duration-200 ${
                    selectedSub?.id === sub.id ? 'border-primary/40 bg-primary/5' : 'border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-display text-base font-semibold text-foreground truncate">{sub.title}</h4>
                      <p className="text-xs text-muted-foreground/80 mt-1">By {sub.author.name}</p>
                    </div>
                    <span className="text-[10px] tracking-wider uppercase bg-white/5 px-2 py-0.5 rounded text-muted-foreground">
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Read & Action panel */}
            {selectedSub && (
              <div className="lg:col-span-7 bg-background/50 border border-white/5 rounded-lg p-5 space-y-5 animate-fade-in">
                <div className="flex items-start justify-between pb-4 border-b border-white/5 gap-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">{selectedSub.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted by {selectedSub.author.name} ({selectedSub.author.email})
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSub(null)}>
                    Close
                  </Button>
                </div>

                {/* Body Content */}
                <div className="prose prose-invert max-w-none text-foreground leading-relaxed text-sm bg-card/40 p-4 rounded border border-white/5 font-serif max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                  {selectedSub.body}
                </div>

                {/* Editor Notes Input */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Review Notes / Feedback
                  </span>
                  <Textarea
                    placeholder="Write a message or notes for the author..."
                    value={editorNote}
                    onChange={(e) => setEditorNote(e.target.value)}
                    className="bg-card border-white/5 text-sm h-20"
                    disabled={actionLoading}
                  />
                </div>

                {/* Actions Button Grid */}
                <div className="flex flex-wrap gap-2.5 pt-3 border-t border-white/5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedSub.id, 'IN_REVIEW')}
                    disabled={actionLoading}
                    className="gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20"
                  >
                    <Loader2 className={`h-4 w-4 ${actionLoading ? 'animate-spin' : ''}`} />
                    In Review
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedSub.id, 'ACCEPTED')}
                    disabled={actionLoading}
                    className="gap-1 bg-primary/20 hover:bg-primary/30 text-primary border-primary/30"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Accept
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedSub.id, 'PUBLISHED')}
                    disabled={actionLoading}
                    className="gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                  >
                    <Send className="h-4 w-4" />
                    Publish
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedSub.id, 'REJECTED')}
                    disabled={actionLoading}
                    className="gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>

                {/* Poem of the Day Scheduling (Only if published) */}
                {selectedSub.status === 'PUBLISHED' && (
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg space-y-3 mt-4">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Schedule as Poem of the Day
                    </span>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={featuredDate}
                        onChange={(e) => setFeaturedDate(e.target.value)}
                        className="bg-card border-white/5 text-xs text-foreground"
                        disabled={actionLoading}
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleFeaturePoem(selectedSub.id)}
                        disabled={actionLoading}
                      >
                        Schedule
                      </Button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}
      </div>
    </AdminLayout>
  );
}

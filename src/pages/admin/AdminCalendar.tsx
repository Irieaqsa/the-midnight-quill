import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { Loader2, Plus, Edit2, Trash2, Calendar, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CalendarEntry {
  id: string;
  type: 'SITE' | 'INSTAGRAM' | 'PODCAST' | string;
  title: string;
  scheduledDate: string;
  status: 'PLANNED' | 'COMPLETED' | string;
  notes: string | null;
  relatedId: string | null;
}

interface Piece {
  id: string;
  title: string;
  status: string;
  author: { name: string };
}

export default function AdminCalendar() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null);

  // Form states
  const [type, setType] = useState<'SITE' | 'INSTAGRAM' | 'PODCAST'>('SITE');
  const [title, setTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [status, setStatus] = useState<'PLANNED' | 'COMPLETED'>('PLANNED');
  const [notes, setNotes] = useState('');
  const [relatedId, setRelatedId] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const fetchCalendar = async () => {
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/calendar`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load calendar entries.');
    }
  };

  const fetchPieces = async () => {
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const filtered = (data.submissions || []).filter(
          (s: Piece) => s.status === 'ACCEPTED' || s.status === 'PUBLISHED'
        );
        setPieces(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchCalendar(), fetchPieces()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleEdit = (entry: CalendarEntry) => {
    setEditingEntry(entry);
    setType(entry.type as any);
    setTitle(entry.title);
    setScheduledDate(entry.scheduledDate.substring(0, 10)); // Format YYYY-MM-DD
    setStatus(entry.status as any);
    setNotes(entry.notes || '');
    setRelatedId(entry.relatedId || '');
  };

  const handleCancel = () => {
    setEditingEntry(null);
    setTitle('');
    setScheduledDate('');
    setNotes('');
    setRelatedId('');
    setStatus('PLANNED');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledDate) {
      toast.error('Title and Scheduled Date are required.');
      return;
    }

    setIsSubmitLoading(true);
    const token = localStorage.getItem('tmq_token');
    const payload = {
      type,
      title,
      scheduledDate,
      status,
      notes: notes || null,
      relatedId: relatedId || null,
    };

    try {
      const url = editingEntry 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/calendar/${editingEntry.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/calendar`;
      
      const method = editingEntry ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingEntry ? 'Calendar entry updated.' : 'Calendar entry created.');
        fetchCalendar();
        handleCancel();
      } else {
        toast.error(data.error || 'Failed to save entry.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this calendar entry?')) return;

    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/calendar/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Calendar entry deleted.');
        fetchCalendar();
      } else {
        toast.error('Failed to delete entry.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error.');
    }
  };

  const getTypeBadgeColor = (t: string) => {
    switch (t) {
      case 'SITE':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
      case 'INSTAGRAM':
        return 'bg-pink-500/10 text-pink-400 border border-pink-500/25';
      case 'PODCAST':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Editorial Calendar</h1>
          <p className="text-muted-foreground text-sm">Schedule and organize published writing, Instagram promotions, and Podcast releases.</p>
        </div>

        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Scheduled Entries List */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Scheduled Pipeline</h2>
              
              {entries.length === 0 ? (
                <div className="p-8 text-center bg-background rounded-lg border border-white/5">
                  <Calendar className="h-8 w-8 text-muted-foreground/35 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No content scheduled in the calendar yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {entries.map((entry) => (
                    <div key={entry.id} className="p-4 bg-background rounded-lg border border-white/5 hover:border-white/10 transition-smooth flex items-start justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getTypeBadgeColor(entry.type)}`}>
                            {entry.type}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                            entry.status === 'COMPLETED' 
                              ? 'bg-green-500/5 border-green-500/20 text-green-400' 
                              : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'
                          }`}>
                            {entry.status}
                          </span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(entry.scheduledDate)}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-sm text-foreground leading-snug">{entry.title}</h3>
                        
                        {entry.notes && (
                          <p className="text-xs text-muted-foreground leading-relaxed italic">
                            "{entry.notes}"
                          </p>
                        )}

                        {entry.type === 'SITE' && entry.relatedId && (
                          <div className="flex items-center gap-1.5 text-[11px] text-primary">
                            <Link2 className="h-3.5 w-3.5" />
                            <Link to={`/post/${entry.relatedId}`} className="hover:underline truncate">
                              View linked piece
                            </Link>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(entry)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Add/Edit Form */}
            <div className="lg:col-span-5 p-5 bg-background rounded-lg border border-white/5 h-fit space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {editingEntry ? 'Edit Entry' : 'Schedule New Content'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Content Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="entry-type" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Channel Type</Label>
                  <select
                    id="entry-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-md bg-card border border-white/5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={isSubmitLoading}
                  >
                    <option value="SITE">Site Release (Poem of the Day)</option>
                    <option value="INSTAGRAM">Instagram Promotion</option>
                    <option value="PODCAST">Podcast Episode</option>
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="entry-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title / Headline</Label>
                  <Input
                    id="entry-title"
                    placeholder="e.g. Publish 'The Art of Letting Go'"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitLoading}
                  />
                </div>

                {/* Scheduled Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="entry-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scheduled Date</Label>
                  <Input
                    id="entry-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    disabled={isSubmitLoading}
                  />
                </div>

                {/* Status Selection */}
                <div className="space-y-1.5">
                  <Label htmlFor="entry-status" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pipeline Status</Label>
                  <select
                    id="entry-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-md bg-card border border-white/5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={isSubmitLoading}
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {/* Related Submission (conditional on SITE) */}
                {type === 'SITE' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="entry-piece" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Link Accepted Work</Label>
                    <select
                      id="entry-piece"
                      value={relatedId}
                      onChange={(e) => {
                        setRelatedId(e.target.value);
                        // Auto-fill title with piece title if blank
                        if (e.target.value && !title.trim()) {
                          const piece = pieces.find(p => p.id === e.target.value);
                          if (piece) setTitle(`Feature "${piece.title}" by ${piece.author.name}`);
                        }
                      }}
                      className="w-full h-10 px-3 rounded-md bg-card border border-white/5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      disabled={isSubmitLoading}
                    >
                      <option value="">-- Select an accepted piece (optional) --</option>
                      {pieces.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} (by {p.author.name})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Spotify Link / Notes (conditional on PODCAST) */}
                {type === 'PODCAST' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="entry-link" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Spotify Episode Link (Optional)</Label>
                    <Input
                      id="entry-link"
                      placeholder="https://open.spotify.com/episode/..."
                      value={relatedId}
                      onChange={(e) => setRelatedId(e.target.value)}
                      disabled={isSubmitLoading}
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="entry-notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes / Tasks</Label>
                  <Textarea
                    id="entry-notes"
                    placeholder="e.g. Design post graphics, write caption tags..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isSubmitLoading}
                    rows={3}
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1 gap-2" disabled={isSubmitLoading}>
                    {isSubmitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingEntry ? 'Save changes' : 'Schedule'}
                  </Button>
                  {editingEntry && (
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitLoading}>
                      Cancel
                    </Button>
                  )}
                </div>

              </form>
            </div>

          </div>
        )}
      </div>
    </AdminLayout>
  );
}

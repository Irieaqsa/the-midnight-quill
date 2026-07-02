import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Loader2, Edit2, Trash2, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Episode {
  id: string;
  title: string;
  description: string;
  spotifyUrl: string;
  publishedAt: string;
}

export default function AdminPodcast() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const fetchEpisodes = async () => {
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/podcast`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setEpisodes(data.episodes || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load podcast log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const handleEdit = (ep: Episode) => {
    setEditingEpisode(ep);
    setTitle(ep.title);
    setDescription(ep.description);
    setSpotifyUrl(ep.spotifyUrl);
    setPublishedAt(new Date(ep.publishedAt).toISOString().split('T')[0]);
  };

  const handleCancel = () => {
    setEditingEpisode(null);
    setTitle('');
    setDescription('');
    setSpotifyUrl('');
    setPublishedAt('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !spotifyUrl.trim()) {
      toast.error('All fields are required.');
      return;
    }

    setIsSubmitLoading(true);
    const token = localStorage.getItem('tmq_token');
    const method = editingEpisode ? 'PUT' : 'POST';
    const url = editingEpisode
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/podcast/${editingEpisode.id}`
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/podcast`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, spotifyUrl, publishedAt }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editingEpisode ? 'Episode updated!' : 'Episode created!');
        fetchEpisodes();
        handleCancel();
      } else {
        toast.error(data.error || 'Operation failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this episode?')) return;
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/podcast/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Episode deleted successfully.');
        fetchEpisodes();
      } else {
        toast.error('Deletion failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Podcast Episode Logs</h1>
          <p className="text-sm text-muted-foreground">Manage and schedule Spotify episodes for "The Road Which Is Taken" podcast hub.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form */}
          <div className="lg:col-span-5 bg-background/50 border border-white/5 rounded-lg p-5 h-fit space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-1.5">
              <Headphones className="h-5 w-5 text-primary" />
              {editingEpisode ? 'Edit Episode details' : 'Register Podcast Episode'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ep-title" className="text-xs text-muted-foreground">Episode Title</Label>
                <Input
                  id="ep-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-card border-white/5 h-10"
                  placeholder="e.g. S1E1: Why We Built This"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ep-desc" className="text-xs text-muted-foreground">Description</Label>
                <Textarea
                  id="ep-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-card border-white/5 h-20 text-sm"
                  placeholder="Summary of the conversation or reciting pieces..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ep-spotify" className="text-xs text-muted-foreground">Spotify URL</Label>
                <Input
                  id="ep-spotify"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  className="bg-card border-white/5 h-10"
                  placeholder="https://open.spotify.com/episode/..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ep-date" className="text-xs text-muted-foreground">Publish Date</Label>
                <Input
                  id="ep-date"
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="bg-card border-white/5 h-10"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isSubmitLoading} className="cta-primary flex-1">
                  {isSubmitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingEpisode ? 'Save Changes' : 'Register Episode'}
                </Button>
                {editingEpisode && (
                  <Button type="button" variant="outline" onClick={handleCancel} className="bg-transparent border-white/5">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-7 space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : episodes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-white/5 rounded-lg bg-card/10">No episodes logged yet.</div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="p-4 bg-card rounded-lg border border-white/5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <h4 className="font-display font-semibold text-foreground text-base truncate">{ep.title}</h4>
                      <p className="text-xs text-muted-foreground/80 mt-1 truncate">{ep.spotifyUrl}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button size="sm" variant="ghost" className="p-2 hover:bg-white/5" onClick={() => handleEdit(ep)}>
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-2 hover:bg-rose-500/10" onClick={() => handleDelete(ep.id)}>
                        <Trash2 className="h-4 w-4 text-rose-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

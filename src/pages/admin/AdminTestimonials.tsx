import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Loader2, Edit2, Trash2, Star, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Testimonial {
  id: string;
  memberName: string;
  role: string | null;
  quote: string;
  approved: boolean;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Form states
  const [memberName, setMemberName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');
  const [approved, setApproved] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const fetchTestimonials = async () => {
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/testimonials`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTestimonials(data.testimonials || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load testimonials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleEdit = (t: Testimonial) => {
    setEditingTestimonial(t);
    setMemberName(t.memberName);
    setRole(t.role || '');
    setQuote(t.quote);
    setApproved(t.approved);
  };

  const handleCancel = () => {
    setEditingTestimonial(null);
    setMemberName('');
    setRole('');
    setQuote('');
    setApproved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !quote.trim()) {
      toast.error('Name and quote are required.');
      return;
    }

    setIsSubmitLoading(true);
    const token = localStorage.getItem('tmq_token');
    const method = editingTestimonial ? 'PUT' : 'POST';
    const url = editingTestimonial
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/testimonials/${editingTestimonial.id}`
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/testimonials`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ memberName, role, quote, approved }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editingTestimonial ? 'Testimonial updated!' : 'Testimonial created!');
        fetchTestimonials();
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

  const handleToggleApprove = async (t: Testimonial) => {
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/testimonials/${t.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ approved: !t.approved }),
      });
      if (res.ok) {
        toast.success(t.approved ? 'Disapproved testimonial' : 'Approved testimonial!');
        fetchTestimonials();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Testimonial deleted successfully.');
        fetchTestimonials();
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
          <h1 className="font-display text-2xl font-bold text-foreground">Member Feedback & Testimonials</h1>
          <p className="text-sm text-muted-foreground">Manage, review, and approve testimonials submitted by community members.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form */}
          <div className="lg:col-span-5 bg-background/50 border border-white/5 rounded-lg p-5 h-fit space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-1.5">
              <Star className="h-5 w-5 text-primary" />
              {editingTestimonial ? 'Edit Testimonial Details' : 'Register Testimonial'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="t-name" className="text-xs text-muted-foreground">Member Name</Label>
                <Input
                  id="t-name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="bg-card border-white/5 h-10"
                  placeholder="e.g. Zara"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="t-role" className="text-xs text-muted-foreground">Role/Handle (optional)</Label>
                <Input
                  id="t-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-card border-white/5 h-10"
                  placeholder="e.g. Writer"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="t-quote" className="text-xs text-muted-foreground">Quote / Feedback</Label>
                <Textarea
                  id="t-quote"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="bg-card border-white/5 h-20 text-sm"
                  placeholder="Feedback quotes about TMQ..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground block mb-2">Moderation status</Label>
                <label className="flex items-center gap-2 cursor-pointer mt-1 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={approved}
                    onChange={(e) => setApproved(e.target.checked)}
                    className="accent-primary"
                  />
                  Approved (visible publicly)
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isSubmitLoading} className="cta-primary flex-1">
                  {isSubmitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingTestimonial ? 'Save Changes' : 'Register Testimonial'}
                </Button>
                {editingTestimonial && (
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
            ) : testimonials.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-white/5 rounded-lg bg-card/10">No testimonials registered yet.</div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 bg-card rounded-lg border border-white/5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-semibold text-foreground text-base flex items-center gap-1.5">
                        {t.memberName}
                        {t.approved ? (
                          <span className="text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle className="h-2.5 w-2.5" /> Approved
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <XCircle className="h-2.5 w-2.5" /> Hidden
                          </span>
                        )}
                      </h4>
                      {t.role && <p className="text-xs text-primary font-semibold tracking-wider uppercase mt-0.5">{t.role}</p>}
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">"{t.quote}"</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button size="sm" variant="ghost" className="p-2 hover:bg-white/5" onClick={() => handleToggleApprove(t)}>
                        {t.approved ? 'Hide' : 'Approve'}
                      </Button>
                      <Button size="sm" variant="ghost" className="p-2 hover:bg-white/5" onClick={() => handleEdit(t)}>
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-2 hover:bg-rose-500/10" onClick={() => handleDelete(t.id)}>
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

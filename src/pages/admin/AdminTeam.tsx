import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Loader2, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  avatarUrl: string | null;
  order: number;
  isActive: boolean;
}

export default function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [order, setOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const fetchTeam = async () => {
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/team`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMembers(data.team || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setBio(member.bio || '');
    setAvatarUrl(member.avatarUrl || '');
    setOrder(String(member.order));
    setIsActive(member.isActive);
  };

  const handleCancel = () => {
    setEditingMember(null);
    setName('');
    setRole('');
    setBio('');
    setAvatarUrl('');
    setOrder('0');
    setIsActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      toast.error('Name and role are required.');
      return;
    }

    setIsSubmitLoading(true);
    const token = localStorage.getItem('tmq_token');
    const method = editingMember ? 'PUT' : 'POST';
    const url = editingMember
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/team/${editingMember.id}`
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/team`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, role, bio, avatarUrl, order, isActive }),
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success(editingMember ? 'Team member updated!' : 'Team member created!');
        fetchTeam();
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
    if (!confirm('Are you sure you want to delete this team member?')) return;

    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/team/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Deleted successfully!');
        fetchTeam();
      } else {
        toast.error('Failed to delete.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Team Roster Management</h1>
            <p className="text-sm text-muted-foreground">Add, update, or remove active members from the public grid.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form Block */}
          <div className="lg:col-span-5 bg-background/50 border border-white/5 rounded-lg p-5 h-fit space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {editingMember ? 'Edit Member Details' : 'Register New Member'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="mem-name" className="text-xs text-muted-foreground">Full Name</Label>
                <Input
                  id="mem-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-card border-white/5 h-10"
                  placeholder="e.g. Imran Ali"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mem-role" className="text-xs text-muted-foreground">Community Role</Label>
                <Input
                  id="mem-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-card border-white/5 h-10"
                  placeholder="e.g. Art Crafter"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mem-bio" className="text-xs text-muted-foreground">Short Bio</Label>
                <Textarea
                  id="mem-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-card border-white/5 h-20 text-sm"
                  placeholder="Tell us about their style..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mem-order" className="text-xs text-muted-foreground">Display Order</Label>
                  <Input
                    id="mem-order"
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="bg-card border-white/5 h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mem-active" className="text-xs text-muted-foreground block mb-2">Status</Label>
                  <label className="flex items-center gap-2 cursor-pointer mt-1 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-primary"
                    />
                    Active Member
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isSubmitLoading} className="cta-primary flex-1">
                  {isSubmitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingMember ? 'Save Changes' : 'Add Member'}
                </Button>
                {editingMember && (
                  <Button type="button" variant="outline" onClick={handleCancel} className="bg-transparent border-white/5">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Members List */}
          <div className="lg:col-span-7 space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-white/5 rounded-lg bg-card/10">No members registered yet.</div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 bg-card rounded-lg border border-white/5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <h4 className="font-display font-semibold text-foreground flex items-center gap-1.5 text-base">
                        {member.name}
                        {!member.isActive && (
                          <span className="text-[9px] uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-primary font-semibold tracking-wider uppercase mt-0.5">{member.role}</p>
                      {member.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">"{member.bio}"</p>}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button size="sm" variant="ghost" className="p-2 hover:bg-white/5" onClick={() => handleEdit(member)}>
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-2 hover:bg-rose-500/10" onClick={() => handleDelete(member.id)}>
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

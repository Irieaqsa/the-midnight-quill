import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Loader2, Search, Key, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface UserMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminMembers() {
  const [users, setUsers] = useState<UserMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reset Password State
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchUsers = async () => {
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        toast.error(data.error || 'Failed to load users.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not connect to the API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleResetPassword = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to reset the password for ${userName}? This will invalidate their current password.`)) {
      return;
    }

    setResettingUserId(userId);
    setTempPassword(null);
    setCopied(false);
    
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTempPassword(data.tempPassword);
        toast.success(`Temporary password generated for ${userName}`);
      } else {
        toast.error(data.error || 'Failed to reset password.');
        setResettingUserId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error.');
      setResettingUserId(null);
    }
  };

  const copyToClipboard = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      toast.success('Temporary password copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Member Directory</h1>
          <p className="text-muted-foreground text-sm">Manage registered platform members, view roles, and reset access credentials manually.</p>
        </div>

        {/* Temporary Password Alert Block */}
        {tempPassword && (
          <div className="p-5 bg-primary/10 border border-primary/20 rounded-lg space-y-3 animate-fade-up">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Key className="h-5 w-5" />
              <span>Temporary Password Generated</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Provide this temporary password to the member. Once they log in, they can update their password on their dashboard:
            </p>
            <div className="flex items-center gap-2 max-w-sm">
              <Input
                readOnly
                value={tempPassword}
                className="font-mono text-center text-lg tracking-wider bg-black border-white/10 select-all"
              />
              <Button onClick={copyToClipboard} variant="outline" className="gap-2">
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => { setTempPassword(null); setResettingUserId(null); }}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Directory List */}
        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center bg-background rounded-lg border border-white/5">
            <p className="text-sm text-muted-foreground">No members found matching that search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Joined On</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((member) => (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-base">
                    <td className="py-3.5 px-4 font-semibold text-foreground">{member.name}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{member.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        member.role === 'ADMIN' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/25'
                          : member.role === 'EDITOR'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
                          : 'bg-muted text-muted-foreground border border-white/5'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{formatDate(member.createdAt)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs font-semibold border-white/10 hover:bg-white/5"
                        onClick={() => handleResetPassword(member.id, member.name)}
                        disabled={resettingUserId === member.id && !tempPassword}
                      >
                        {resettingUserId === member.id && !tempPassword ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Key className="h-3.5 w-3.5" />
                        )}
                        Reset Password
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

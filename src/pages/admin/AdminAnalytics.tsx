import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Loader2, FileText, Users, Eye, MessageSquare, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface AnalyticsData {
  volumeTrends: { month: string; submitted: number; approved: number; rejected: number }[];
  conversionRate: number;
  topRead: { id: string; title: string; views: number; category: string; author: { name: string } }[];
  topEngaged: { id: string; title: string; category: string; author: { name: string }; commentsCount: number }[];
  subscriberTrends: { month: string; count: number }[];
  totalSubmissions: number;
  totalSubscribers: number;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem('tmq_token');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/analytics`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
          setData(json);
        } else {
          toast.error(json.error || 'Failed to load analytics.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Could not connect to the API.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[400px] flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground text-sm">Aggregating platform intelligence...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load platform analytics.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Platform Intelligence</h1>
          <p className="text-muted-foreground text-sm">Submission lifecycle conversion and audience growth metrics.</p>
        </div>

        {/* Stats Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 bg-background rounded-lg border border-white/5 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Submissions</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-foreground">{data.totalSubmissions}</span>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <p className="text-[11px] text-muted-foreground">Original human-crafted works submitted.</p>
          </div>

          <div className="p-5 bg-background rounded-lg border border-white/5 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Newsletter Subscribers</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-foreground">{data.totalSubscribers}</span>
              <Users className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-[11px] text-muted-foreground">Active email readers in directory.</p>
          </div>

          <div className="p-5 bg-background rounded-lg border border-white/5 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Publish Conversion Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-foreground">{data.conversionRate}%</span>
              <TrendingUp className="h-4 w-4 text-pink-400" />
            </div>
            <p className="text-[11px] text-muted-foreground">Percentage of submissions published live.</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Submission Trends Chart */}
          <div className="p-5 bg-background rounded-lg border border-white/5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Submission Volume</h3>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.volumeTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#222', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="submitted" stroke="#6366f1" name="Submitted" strokeWidth={2} />
                  <Line type="monotone" dataKey="approved" stroke="#22c55e" name="Approved" strokeWidth={2} />
                  <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subscriber Growth Chart */}
          <div className="p-5 bg-background rounded-lg border border-white/5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Newsletter Signups</h3>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.subscriberTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#222', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="count" fill="#fbbf24" name="New Signups" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Leaderboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Most Read Leaderboard */}
          <div className="p-5 bg-background rounded-lg border border-white/5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-primary" />
              Most Read Works
            </h3>
            <div className="divide-y divide-white/5">
              {data.topRead.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4">No published works registered yet.</p>
              ) : (
                data.topRead.map((piece, idx) => (
                  <div key={piece.id} className="py-3 flex items-center justify-between text-sm">
                    <div className="space-y-0.5 truncate pr-4">
                      <p className="font-medium text-foreground truncate">{piece.title}</p>
                      <p className="text-xs text-muted-foreground">By {piece.author.name} · <span className="uppercase text-[10px] tracking-wider">{piece.category}</span></p>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium flex-shrink-0 text-xs">
                      <span>{piece.views} views</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Most Engaged Leaderboard */}
          <div className="p-5 bg-background rounded-lg border border-white/5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-primary" />
              Most Engaged Works
            </h3>
            <div className="divide-y divide-white/5">
              {data.topEngaged.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4">No discussions started yet.</p>
              ) : (
                data.topEngaged.map((piece) => (
                  <div key={piece.id} className="py-3 flex items-center justify-between text-sm">
                    <div className="space-y-0.5 truncate pr-4">
                      <p className="font-medium text-foreground truncate">{piece.title}</p>
                      <p className="text-xs text-muted-foreground">By {piece.author.name} · <span className="uppercase text-[10px] tracking-wider">{piece.category}</span></p>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium flex-shrink-0 text-xs">
                      <span>{piece.commentsCount} comments</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}

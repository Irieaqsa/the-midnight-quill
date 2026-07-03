import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Loader2, User, Star } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  avatarUrl: string | null;
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/content/team`);
        const data = await res.json();
        if (res.ok) {
          setTeam(data.team || []);
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, []);

  return (
    <Layout>
      <SEOHead 
        title="Our Team & Roster — The Midnight Quill"
        description="Meet the founders, writers, designers, and performers behind The Midnight Quill community."
      />
      
      <div className="min-h-[calc(100vh-4rem)] container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-up">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
              The Midnight Roster
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Meet the writers, performers, crafters, and artists who shape the creative ecosystem of The Midnight Quill.
            </p>
          </div>

          {/* Team Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : team.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-lg border border-white/5 text-muted-foreground">
              No team members listed in the database.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {team.map((member, index) => {
                const isCore = member.role.toLowerCase().includes('founder') || member.role.toLowerCase().includes('vp');
                return (
                  <div
                    key={member.id}
                    className={`p-6 bg-card/60 backdrop-blur-sm rounded-xl border transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center gap-4 ${
                      isCore ? 'border-primary/25 bg-primary/5' : 'border-white/5'
                    } animate-fade-up`}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* Avatar */}
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-secondary flex items-center justify-center border-2 border-white/10 flex-shrink-0">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // Fallback to placeholder if custom matched photo doesn't exist
                            (e.target as HTMLImageElement).src = '';
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <User className="h-8 w-8 text-muted-foreground absolute z-[-1]" />
                    </div>

                    {/* Roster details */}
                    <div className="space-y-1 min-w-0 w-full">
                      <h3 className="font-display text-lg font-semibold text-foreground flex items-center justify-center gap-1.5 truncate">
                        {member.name}
                        {isCore && <Star className="h-4.5 w-4.5 text-primary fill-current flex-shrink-0" />}
                      </h3>
                      <p className="text-xs text-primary font-semibold tracking-wider uppercase truncate">
                        {member.role}
                      </p>
                    </div>

                    {member.bio && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 italic pt-2 border-t border-white/5 w-full">
                        "{member.bio}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}

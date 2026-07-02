import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileEditDialog } from '@/components/ProfileEditDialog';
import { ProfileSkeleton } from '@/components/Skeletons';
import { ProfileNotFound } from '@/components/EmptyStates';
import { FollowButton } from '@/components/FollowButton';
import { useFollowCounts } from '@/hooks/useFollow';
import { 
  ArrowLeft, 
  Calendar,
  Heart,
  Feather,
  BookOpen,
  Eye,
  Edit,
  Users,
  UserPlus,
  Globe,
  PenLine
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  post_type: string;
  published_at: string | null;
  view_count: number;
  likes: { count: number }[];
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const isOwnProfile = user?.id === id;
  const { followerCount, followingCount } = useFollowCounts(id);

  const fetchProfile = async () => {
    if (!id) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        setNotFound(true);
        return;
      }

      setProfile(profileData);

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          excerpt,
          post_type,
          published_at,
          view_count,
          likes(count)
        `)
        .eq('author_id', id)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (postsError) throw postsError;

      setPosts(postsData || []);

      const likes = (postsData || []).reduce((sum, post) => {
        return sum + (post.likes?.[0]?.count || 0);
      }, 0);
      setTotalLikes(likes);

    } catch (error) {
      console.error('Error fetching profile:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const getDisplayName = (profile: Profile | null) => {
    if (!profile) return 'Anonymous';
    return profile.display_name || profile.username || 'Anonymous';
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <SEOHead title="Loading Profile" />
        <ProfileSkeleton />
      </Layout>
    );
  }

  if (notFound || !profile) {
    return (
      <Layout>
        <SEOHead title="Profile Not Found" />
        <ProfileNotFound />
      </Layout>
    );
  }

  const displayName = getDisplayName(profile);
  const nameParts = displayName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return (
    <Layout>
      <SEOHead 
        title={displayName}
        description={profile.bio || `Read posts by ${displayName} on TMQ.`}
      />
      <div className="min-h-[calc(100vh-4rem)]">
        {/* Back navigation */}
        <div className="border-b border-white/5 sticky top-16 z-30">
          <div className="container mx-auto px-4 py-3">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground hover:bg-white/5">
              <Link to="/feed" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Feed
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Profile Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left - Profile Image */}
                <div className="relative animate-fade-up order-2 lg:order-1">
                  <div className="relative mx-auto lg:mx-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
                    {/* Glow effect behind avatar */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl blur-2xl transform rotate-6" />
                    
                    {/* Main avatar container */}
                    <div className="relative h-full w-full rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <span className="text-8xl sm:text-9xl font-display text-primary/60">
                            {getInitials(displayName)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Decorative accent line */}
                    <div className="absolute -bottom-4 left-0 w-2/3 h-1 bg-gradient-to-r from-primary to-transparent rounded-full" />
                  </div>
                </div>

                {/* Right - Profile Info */}
                <div className="animate-fade-up order-1 lg:order-2 text-center lg:text-left" style={{ animationDelay: '100ms' }}>
                  {/* Greeting */}
                  <p className="text-lg sm:text-xl text-muted-foreground mb-2">HI.</p>
                  
                  {/* Name with accent */}
                  <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                    <span className="text-foreground">I'M </span>
                    <span className="text-primary">{firstName.toUpperCase()}</span>
                    {lastName && (
                      <>
                        <br />
                        <span className="text-primary">{lastName.toUpperCase()}</span>
                      </>
                    )}
                  </h1>

                  {/* Role/Type badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg mb-6">
                    <PenLine className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground tracking-wide uppercase">
                      Writer & Poet
                    </span>
                  </div>

                  {/* Bio */}
                  {profile.bio ? (
                    <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0 mb-6">
                      {profile.bio}
                    </p>
                  ) : (
                    <p className="text-muted-foreground/60 italic max-w-lg mx-auto lg:mx-0 mb-6">
                      A quiet writer finding beauty in words.
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
                    {!isOwnProfile && (
                      <FollowButton targetUserId={profile.id} />
                    )}
                    {isOwnProfile && (
                      <Button 
                        onClick={() => setEditDialogOpen(true)}
                        className="cta-primary gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}
                    {profile.website && (
                      <Button variant="outline" size="default" asChild className="cta-secondary gap-2">
                        <a 
                          href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="h-4 w-4" />
                          Website
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* Username */}
                  {profile.username && (
                    <p className="text-sm text-muted-foreground/60 font-mono">
                      @{profile.username}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Me Section */}
        <section className="py-16 border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Section Title */}
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-center mb-12">
                <span className="text-muted-foreground">About</span>{' '}
                <span className="text-primary">Me</span>
              </h2>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="stat-card">
                  <Calendar className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Joined</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(profile.created_at)}</p>
                </div>
                
                <div className="stat-card">
                  <BookOpen className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Published</p>
                  <p className="text-sm font-medium text-foreground">{posts.length} {posts.length === 1 ? 'Work' : 'Works'}</p>
                </div>
                
                <div className="stat-card">
                  <Heart className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Likes</p>
                  <p className="text-sm font-medium text-foreground">{totalLikes}</p>
                </div>
                
                <div className="stat-card">
                  <Users className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Community</p>
                  <p className="text-sm font-medium text-foreground">
                    {followerCount} {followerCount === 1 ? 'Follower' : 'Followers'}
                  </p>
                </div>
              </div>

              {/* Following stat */}
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary/60" />
                  Following {followingCount}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Published Works */}
        <section className="py-16 border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-center mb-12">
                <span className="text-muted-foreground">Published</span>{' '}
                <span className="text-primary">Works</span>
              </h2>

              {posts.length === 0 ? (
                <div className="text-center py-16">
                  <Feather className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No published works yet.</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">The journey of a thousand words begins with a single verse.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {posts.map((post, index) => (
                    <Link
                      key={post.id}
                      to={`/post/${post.id}`}
                      className="group animate-fade-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <article className="h-full p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/20 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <span className="flex-shrink-0 p-2.5 rounded-lg bg-primary/10 text-primary">
                            {post.post_type === 'poetry' ? (
                              <Feather className="h-5 w-5" />
                            ) : (
                              <BookOpen className="h-5 w-5" />
                            )}
                          </span>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                              {post.title}
                            </h3>
                            {post.excerpt && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {post.excerpt}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
                              {post.published_at && (
                                <span>
                                  {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                {post.view_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3.5 w-3.5" />
                                {post.likes?.[0]?.count || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {isOwnProfile && (
        <ProfileEditDialog 
          open={editDialogOpen} 
          onOpenChange={setEditDialogOpen}
          profile={profile}
          onProfileUpdated={fetchProfile}
        />
      )}
    </Layout>
  );
}

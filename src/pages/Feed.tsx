import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FeedSkeleton } from '@/components/Skeletons';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Feather, 
  Eye, 
  Clock,
  Filter,
  X,
  Search,
  BookMarked
} from 'lucide-react';

interface Piece {
  id: string;
  title: string;
  excerpt: string | null;
  body: string;
  category: 'POETRY' | 'PROSE' | 'SPOKEN_WORD_SCRIPT' | 'ESSAY' | 'OTHER';
  publishedAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  tags: {
    tag: {
      name: string;
    };
  }[];
}

export default function Feed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag');
  
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchPieces() {
      setIsLoading(true);
      try {
        let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/content/archive?limit=50`;
        
        if (categoryFilter !== 'all') {
          url += `&category=${categoryFilter}`;
        }
        if (tagFilter) {
          url += `&tag=${tagFilter}`;
        }
        if (debouncedSearch) {
          url += `&q=${encodeURIComponent(debouncedSearch)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
          setPieces(data.pieces || []);
        }
      } catch (error) {
        console.error('Error fetching archive pieces:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPieces();
  }, [categoryFilter, tagFilter, debouncedSearch]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Pending';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'POETRY':
        return <Feather className="h-3 w-3 text-pink-400" />;
      case 'PROSE':
        return <BookOpen className="h-3 w-3 text-amber-400" />;
      case 'SPOKEN_WORD_SCRIPT':
        return <BookMarked className="h-3 w-3 text-primary" />;
      default:
        return <BookOpen className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const clearTagFilter = () => {
    searchParams.delete('tag');
    setSearchParams(searchParams);
  };

  return (
    <Layout>
      <SEOHead 
        title="Writing Archive"
        description="Discover stories and poetry from TMQ writers. Browse original poems, prose, essays, and scripts."
      />
      <div className="min-h-[calc(100vh-4rem)]">
        {/* Hero */}
        <section className="py-16 sm:py-20 lg:py-24 border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-foreground mb-5 animate-heading-reveal">
              The Midnight Archive
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto animate-fade-up">
              Explore authentic, human-crafted writings, poetry, prose, and performance scripts.
            </p>
          </div>
        </section>

        {/* Filters & Search */}
        <section className="py-4 border-b border-white/5 bg-background sticky top-14 z-30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Button
                  variant={categoryFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCategoryFilter('all')}
                  className="rounded-lg text-xs"
                >
                  All
                </Button>
                <Button
                  variant={categoryFilter === 'POETRY' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCategoryFilter('POETRY')}
                  className="gap-1 rounded-lg text-xs"
                >
                  <Feather className="h-3 w-3" />
                  Poetry
                </Button>
                <Button
                  variant={categoryFilter === 'PROSE' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCategoryFilter('PROSE')}
                  className="gap-1 rounded-lg text-xs"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Prose
                </Button>
                <Button
                  variant={categoryFilter === 'SPOKEN_WORD_SCRIPT' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCategoryFilter('SPOKEN_WORD_SCRIPT')}
                  className="gap-1 rounded-lg text-xs"
                >
                  <BookMarked className="h-3.5 w-3.5" />
                  Scripts
                </Button>
                <Button
                  variant={categoryFilter === 'ESSAY' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCategoryFilter('ESSAY')}
                  className="gap-1 rounded-lg text-xs"
                >
                  Essays
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search archive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/5 border-white/5 text-sm h-9 text-foreground rounded-lg"
                />
              </div>

            </div>

            {/* Active tag filter */}
            {tagFilter && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Active Tag:</span>
                <Badge variant="secondary" className="gap-1 rounded-full text-xs bg-primary/10 text-primary border-primary/20">
                  #{tagFilter}
                  <button
                    onClick={clearTagFilter}
                    className="ml-1 rounded-full hover:bg-foreground/10 transition-colors p-0.5 text-[8px]"
                  >
                    ✕
                  </button>
                </Badge>
              </div>
            )}
          </div>
        </section>

        {/* Pieces List */}
        <section className="py-10 sm:py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            {isLoading ? (
              <FeedSkeleton />
            ) : pieces.length === 0 ? (
              <div className="text-center py-16 px-4 bg-card rounded-lg border border-white/5">
                <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                  Archive empty
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  No published pieces match your search or filter selection.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pieces.map((piece, index) => (
                  <Link
                    key={piece.id}
                    to={`/post/${piece.id}`}
                    className="group block animate-fade-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <article className="p-6 bg-card rounded-lg border border-white/5 hover:border-primary/20 transition-all duration-300">
                      <div className="flex flex-col gap-2.5">
                        
                        {/* Meta Category Row */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                          {getCategoryIcon(piece.category)}
                          <span>{piece.category.replace(/_/g, ' ')}</span>
                        </div>

                        {/* Title */}
                        <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                          {piece.title}
                        </h2>

                        {/* Excerpt */}
                        {piece.excerpt && (
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 italic">
                            "{piece.excerpt}"
                          </p>
                        )}

                        {/* Tag list */}
                        {piece.tags && piece.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {piece.tags.map((pt) => (
                              <span 
                                key={pt.tag.name}
                                className="text-[11px] text-muted-foreground/80 hover:text-foreground"
                              >
                                #{pt.tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Bottom Row: Author & Date */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                              {piece.author.avatarUrl ? (
                                <img 
                                  src={piece.author.avatarUrl} 
                                  alt="" 
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-[9px] font-bold">
                                  {piece.author.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <span>By {piece.author.name}</span>
                          </div>
                          <span>Published {formatDate(piece.publishedAt)}</span>
                        </div>

                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PieceCard } from '@/components/PieceCard';
import { 
  Share2, 
  BookOpen, 
  Feather, 
  Sparkles, 
  Award,
  Loader2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DigestData {
  period: string;
  label: string;
  totalPieces: number;
  totalAuthors: number;
  categoryBreakdown: { [key: string]: number };
  poemOfDayCount: number;
  standoutPieces: any[];
}

export default function DigestPage() {
  const { period } = useParams<{ period: string }>();
  const activePeriod = period || new Date().getFullYear().toString();
  const { toast } = useToast();
  
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDigest() {
      setIsLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/content/digest?period=${activePeriod}`);
        if (res.ok) {
          const data = await res.json();
          setDigest(data);
        }
      } catch (error) {
        console.error('Error fetching digest:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDigest();
  }, [activePeriod]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = `${digest?.label || 'Seasonal Digest'} — The Midnight Quill`;
    const shareText = `Check out the standoff human-crafted literature and statistics on The Midnight Quill!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link copied',
          description: 'Digest link copied to your clipboard!',
        });
      } catch {
        toast({
          title: 'Copy failed',
          description: 'Could not copy link automatically.',
          variant: 'destructive',
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground text-sm">Compiling seasonal archive...</p>
        </div>
      </Layout>
    );
  }

  if (!digest || digest.totalPieces === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-xl text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/35 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-semibold mb-2">Digest Empty</h2>
          <p className="text-muted-foreground text-sm mb-6">
            There is not enough published data to compile a digest for period "{activePeriod}".
          </p>
          <Button asChild variant="outline">
            <Link to="/feed">Explore Live Archive</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Calculate percentages for categories
  const categoriesList = Object.entries(digest.categoryBreakdown).map(([name, count]) => {
    const percentage = digest.totalPieces > 0 ? Math.round((count / digest.totalPieces) * 100) : 0;
    return { name, count, percentage };
  }).sort((a, b) => b.count - a.count);

  return (
    <Layout>
      <SEOHead 
        title={`${digest.label} — Year in Writing`}
        description={`Standout writing and statistics from The Midnight Quill for ${digest.label}. Featuring ${digest.totalPieces} published works and ${digest.totalAuthors} unique human authors.`}
      />
      
      <div className="min-h-screen py-10 sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-12">
          
          {/* Header */}
          <header className="text-center relative py-6">
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <Sparkles className="h-44 w-44 animate-pulse" />
            </div>
            
            <div className="relative space-y-4">
              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 rounded-full px-3 py-1 text-xs">
                Digest Showcase
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                {digest.label}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto italic">
                “A curated aggregate of pure human writing and memory.”
              </p>
              
              <div className="flex justify-center gap-3 pt-2">
                <Button size="sm" variant="outline" className="gap-2 rounded-full border-white/5 bg-white/5" onClick={handleShare}>
                  <Share2 className="h-3.5 w-3.5" />
                  Share Digest
                </Button>
              </div>
            </div>
          </header>

          {/* Stat Cards Grid */}
          <section className="grid grid-cols-3 gap-3 sm:gap-6">
            {/* Stat 1 */}
            <div className="p-4 sm:p-6 bg-card rounded-xl border border-white/5 flex flex-col items-center justify-center text-center space-y-1 sm:space-y-2">
              <Feather className="h-5 w-5 text-pink-400" />
              <span className="font-display text-2xl sm:text-4xl font-bold text-foreground">{digest.totalPieces}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Works Published</span>
            </div>
            
            {/* Stat 2 */}
            <div className="p-4 sm:p-6 bg-card rounded-xl border border-white/5 flex flex-col items-center justify-center text-center space-y-1 sm:space-y-2">
              <Layers className="h-5 w-5 text-amber-400" />
              <span className="font-display text-2xl sm:text-4xl font-bold text-foreground">{digest.totalAuthors}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Human Authors</span>
            </div>

            {/* Stat 3 */}
            <div className="p-4 sm:p-6 bg-card rounded-xl border border-white/5 flex flex-col items-center justify-center text-center space-y-1 sm:space-y-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-display text-2xl sm:text-4xl font-bold text-foreground">{digest.poemOfDayCount}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Poem of the Days</span>
            </div>
          </section>

          {/* Category Breakdown Progress */}
          {categoriesList.length > 0 && (
            <section className="p-6 bg-card rounded-xl border border-white/5 space-y-4">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Category Distribution
              </h3>
              
              <div className="space-y-3.5">
                {categoriesList.map((cat) => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                      <span className="text-foreground">{cat.name.replace(/_/g, ' ')}</span>
                      <span className="text-muted-foreground">{cat.count} ({cat.percentage}%)</span>
                    </div>
                    {/* Replaced shadcn progress with standard CSS progress bar */}
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500" 
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Standout Pieces List */}
          {digest.standoutPieces && digest.standoutPieces.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Standout Works
                </h3>
                <span className="text-xs text-muted-foreground">Highest community resonance</span>
              </div>
              
              <div className="space-y-4">
                {digest.standoutPieces.map((piece, index) => (
                  <div key={piece.id} className="relative">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary/40 rounded-r-md hidden sm:block" />
                    <PieceCard piece={piece} index={index} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer Backlink */}
          <footer className="text-center pt-8 border-t border-white/5">
            <p className="text-xs text-muted-foreground mb-4">
              All literature published on TMQ is 100% human-crafted and zero-AI attested.
            </p>
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground" asChild>
              <Link to="/feed">
                Back to Archive
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </footer>

        </div>
      </div>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { PieceCard } from '@/components/PieceCard';
import { 
  ArrowLeft, 
  Calendar,
  Feather,
  BookOpen,
  User,
  BookMarked
} from 'lucide-react';

interface Tag {
  tag: {
    name: string;
  };
}

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: {
    name: string;
    avatarUrl: string | null;
  };
}

interface Submission {
  id: string;
  title: string;
  body: string;
  excerpt: string | null;
  category: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
  };
  tags: Tag[];
  comments: Comment[];
  score: string | null;
}

export default function Post() {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [relatedPieces, setRelatedPieces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchSubmission() {
      if (!id) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem('tmq_token');
        const headers: any = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/submissions/${id}`, {
          headers
        });

        if (res.status === 404) {
          setNotFound(true);
          return;
        }

        const data = await res.json();
        if (res.ok && data.submission) {
          setSubmission(data.submission);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchRelatedPieces() {
      if (!id) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/submissions/${id}/related`);
        if (res.ok) {
          const data = await res.json();
          setRelatedPieces(data.related || []);
        }
      } catch (error) {
        console.error('Error fetching related pieces:', error);
      }
    }

    fetchSubmission();
    fetchRelatedPieces();
  }, [id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'POETRY':
        return <Feather className="h-4 w-4 text-pink-400" />;
      case 'PROSE':
        return <BookOpen className="h-4 w-4 text-amber-400" />;
      case 'SPOKEN_WORD_SCRIPT':
        return <BookMarked className="h-4 w-4 text-primary" />;
      default:
        return <BookOpen className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (notFound || !submission) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Piece Not Found</h1>
          <p className="text-muted-foreground mb-6 max-w-sm">
            This piece may not be published yet, or you do not have permission to view it.
          </p>
          <Button asChild>
            <Link to="/feed">Back to Archive</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead 
        title={submission.title}
        description={submission.excerpt || 'Read original writing on The Midnight Quill.'}
      />
      
      <article className="min-h-[calc(100vh-4rem)]">
        {/* Back navigation */}
        <div className="border-b border-white/5 bg-background/95 backdrop-blur-sm sticky top-14 z-30">
          <div className="container mx-auto px-4 py-3">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/feed">
                <ArrowLeft className="h-4 w-4" />
                Back to Archive
              </Link>
            </Button>
          </div>
        </div>

        {/* Header */}
        <header className="py-12 sm:py-16 border-b border-white/5">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="animate-fade-up space-y-6">
              
              {/* Category & Tags Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                  {getCategoryIcon(submission.category)}
                  {submission.category.replace(/_/g, ' ')}
                </span>
                {submission.score && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    submission.score === 'MASTERWORK'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                      : submission.score === 'FEATURED_STANDARD'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                  }`}>
                    {submission.score.replace(/_/g, ' ')}
                  </span>
                )}
                {submission.tags && submission.tags.map((t) => (
                  <span key={t.tag.name} className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                    #{t.tag.name}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {submission.title}
              </h1>

              {/* Excerpt */}
              {submission.excerpt && (
                <p className="text-lg sm:text-xl text-muted-foreground italic leading-relaxed border-l-2 border-primary/30 pl-4">
                  "{submission.excerpt}"
                </p>
              )}

              {/* Author & Meta Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {submission.author.avatarUrl ? (
                      <img 
                        src={submission.author.avatarUrl} 
                        alt={submission.author.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <Link to={`/author/${submission.author.id}`} className="font-semibold text-foreground text-sm hover:text-primary transition-colors">
                    {submission.author.name}
                  </Link>
                </div>

                <span className="text-white/10">·</span>

                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={submission.publishedAt || submission.createdAt}>
                    {formatDate(submission.publishedAt || submission.createdAt)}
                  </time>
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* Content body */}
        <div className="py-12 sm:py-16 border-b border-white/5">
          <div className="container mx-auto px-4 max-w-3xl">
            <div 
              className={`prose prose-invert prose-lg max-w-none font-serif text-foreground leading-relaxed whitespace-pre-wrap ${
                submission.category === 'POETRY' ? 'italic text-center font-display text-xl sm:text-2xl space-y-2' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(submission.body) }}
            />
          </div>
        </div>

        {/* Author Bio Section */}
        <div className="py-12 bg-card/20">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-white/5">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                {submission.author.avatarUrl ? (
                  <img 
                    src={submission.author.avatarUrl} 
                    alt={submission.author.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                  About <Link to={`/author/${submission.author.id}`} className="hover:text-primary transition-colors">{submission.author.name}</Link>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {submission.author.bio || 'Core member of The Midnight Quill writing community.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Related Pieces Section */}
        {relatedPieces.length > 0 && (
          <div className="py-12 border-t border-white/5 bg-card/5">
            <div className="container mx-auto px-4 max-w-3xl space-y-6">
              <h3 className="font-display text-lg font-bold text-foreground">
                You might also sit with these
              </h3>
              <div className="space-y-4">
                {relatedPieces.map((piece, index) => (
                  <PieceCard key={piece.id} piece={piece} index={index} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        {submission.comments && submission.comments.length > 0 && (
          <div className="py-12 border-t border-white/5">
            <div className="container mx-auto px-4 max-w-3xl">
              <h3 className="font-display text-lg font-bold text-foreground mb-6">
                Discussion ({submission.comments.length})
              </h3>
              <div className="space-y-4">
                {submission.comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-card rounded-lg border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{comment.author.name}</span>
                      <span>·</span>
                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {comment.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </article>
    </Layout>
  );
}

import { Link } from 'react-router-dom';
import { Feather, BookOpen, BookMarked } from 'lucide-react';

export interface PieceCardProps {
  piece: {
    id: string;
    title: string;
    excerpt: string | null;
    category: 'POETRY' | 'PROSE' | 'SPOKEN_WORD_SCRIPT' | 'ESSAY' | 'OTHER' | string;
    publishedAt: string;
    author: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
    tags?: {
      tag: {
        name: string;
      };
    }[];
  };
  index?: number;
}

export function PieceCard({ piece, index = 0 }: PieceCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Pending';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
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

  return (
    <Link
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
                    referrerPolicy="no-referrer"
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
  );
}

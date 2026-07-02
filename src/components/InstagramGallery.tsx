import { useEffect, useState } from 'react';
import { Loader2, Instagram, ArrowUpRight } from 'lucide-react';

interface IGHighlight {
  id: string;
  imageUrl: string;
  caption: string | null;
  linkUrl: string;
}

export function InstagramGallery() {
  const [highlights, setHighlights] = useState<IGHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInstagram() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/content/instagram`);
        const data = await res.json();
        if (res.ok) {
          setHighlights(data.highlights || []);
        }
      } catch (err) {
        console.error('Error fetching Instagram highlights:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchInstagram();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (highlights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {highlights.slice(0, 9).map((hl, index) => (
          <a
            key={hl.id}
            href={hl.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group block rounded-lg overflow-hidden border border-white/5 bg-card/45 aspect-square hover:border-primary/20 transition-all duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Curated Post Image */}
            {hl.imageUrl && (
              <img
                src={hl.imageUrl}
                alt={hl.caption || 'Instagram Post'}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-50 group-hover:opacity-70"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}

            {/* Subtle gradient backdrop to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10 opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Fallback pattern when image is loading or missing */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950/10 via-background to-rose-950/10 flex items-center justify-center opacity-30">
              <Instagram className="h-10 w-10 text-muted-foreground/20" />
            </div>

            {/* Curated Post Details overlay */}
            <div className="absolute inset-x-0 bottom-0 p-5 z-20 flex flex-col justify-end gap-3 h-full">
              <div className="flex items-center justify-between text-xs text-primary font-semibold tracking-wider uppercase">
                <span className="flex items-center gap-1">
                  <Instagram className="h-3.5 w-3.5" />
                  @the_midnight_quilll
                </span>
                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              {hl.caption && (
                <p className="text-sm text-foreground line-clamp-3 leading-relaxed font-display font-medium">
                  {hl.caption}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <a
          href="https://www.instagram.com/the_midnight_quilll/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 border border-white/5 bg-white/5 px-4 py-2 rounded-lg"
        >
          <Instagram className="h-4 w-4" />
          View More on Instagram
        </a>
      </div>
    </div>
  );
}
export default InstagramGallery;

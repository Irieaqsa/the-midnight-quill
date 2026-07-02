import { useEffect, useState } from 'react';
import { Loader2, ArrowUpRight } from 'lucide-react';

interface SubstackItem {
  title: string;
  link: string;
  pubDate: string;
  excerpt: string;
  author: string;
}

export function SubstackFeed() {
  const [items, setItems] = useState<SubstackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubstack() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/content/substack`);
        const data = await res.json();
        if (res.ok) {
          setItems(data.items || []);
        }
      } catch (err) {
        console.error('Error fetching Substack RSS:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubstack();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <a
          key={index}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 bg-card rounded-lg border border-white/5 hover:border-primary/20 transition-all duration-300 flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">
              Substack Article
            </span>
            <h4 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
              {item.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {item.excerpt.replace(/<[^>]*>/g, '')}
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-white/5 mt-4 pt-3 text-[11px] text-muted-foreground">
            <span>By {item.author}</span>
            <span className="flex items-center gap-1 group-hover:text-foreground transition-colors">
              {formatDate(item.pubDate)}
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}

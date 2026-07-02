import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Loader2, Headphones, Play, Calendar } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  description: string;
  spotifyUrl: string;
  publishedAt: string;
}

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEpisodes() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/content/podcast`);
        const data = await res.json();
        if (res.ok) {
          setEpisodes(data.episodes || []);
        }
      } catch (err) {
        console.error('Error fetching podcast episodes:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEpisodes();
  }, []);

  const getEmbedUrl = (url: string) => {
    // Convert open.spotify.com/episode/ID to open.spotify.com/embed/episode/ID
    try {
      const match = url.match(/episode\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        return `https://open.spotify.com/embed/episode/${match[1]}?utm_source=generator&theme=0`;
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  };

  return (
    <Layout>
      <SEOHead 
        title="The Road Which Is Taken — Podcast"
        description="Listen to The Midnight Quill's official podcast on Spotify. Spoken word scripts, poetry, and raw conversations."
      />
      
      <div className="min-h-[calc(100vh-4rem)] container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-up">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
              <Headphones className="h-6 w-6" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
              The Road Which Is Taken
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              The official podcast of The Midnight Quill. An auditory journey into raw voices, spoken-word recitations, and unfiltered conversations about poetry and survival.
            </p>
          </div>

          {/* Episode List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : episodes.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-lg border border-white/5 text-muted-foreground">
              No podcast episodes published yet. Tune in soon!
            </div>
          ) : (
            <div className="space-y-8">
              {episodes.map((ep, index) => {
                const embedUrl = getEmbedUrl(ep.spotifyUrl);
                return (
                  <div
                    key={ep.id}
                    className="p-6 bg-card rounded-lg border border-white/5 hover:border-primary/10 transition-all duration-300 space-y-5 animate-fade-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="flex items-center gap-1 text-xs text-primary font-semibold tracking-wider uppercase mb-1">
                          <Play className="h-3 w-3 fill-current" />
                          Featured Episode
                        </span>
                        <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">
                          {ep.title}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Released {new Date(ep.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {ep.description}
                    </p>

                    {/* Spotify Player Embed */}
                    {embedUrl ? (
                      <div className="w-full">
                        <iframe
                          src={embedUrl}
                          width="100%"
                          height="152"
                          frameBorder="0"
                          allowFullScreen={false}
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="rounded-xl border border-white/5 shadow-md"
                        />
                      </div>
                    ) : (
                      <a
                        href={ep.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        Listen on Spotify →
                      </a>
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

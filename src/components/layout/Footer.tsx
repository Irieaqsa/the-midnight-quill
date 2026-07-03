import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Instagram, Send, Sparkles, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'site-footer' }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Subscribed successfully!');
        setEmail('');
      } else {
        toast.error(data.error || 'Subscription failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not connect to the newsletter service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative border-t border-white/5 bg-background/30 backdrop-blur-sm py-16 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo & Identity */}
          <div className="flex flex-col gap-4">
            <span className="font-display text-xl font-semibold text-foreground tracking-tight">
              The Midnight Quill
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A literary sanctuary for raw, human expression. Strikingly authentic, strictly zero-AI.
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                <MapPin className="h-3.5 w-3.5" />
                Bhubaneswar, India
              </span>
              <a 
                href="https://ngl.link/midnightquill" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-primary hover:underline self-start"
              >
                Send Anonymous Feedback (NGL)
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Sanctuary
            </span>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About & Manifesto</Link>
              <Link to="/feed" className="hover:text-foreground transition-colors">Writing Archive</Link>
              <Link to="/podcast" className="hover:text-foreground transition-colors">Podcast</Link>
              <Link to="/team" className="hover:text-foreground transition-colors">Team Members</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            </div>
          </div>

          {/* Social Platforms */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Connect
            </span>
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <a 
                href="https://www.instagram.com/the_midnight_quilll/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Instagram className="h-4 w-4 text-pink-500" />
                Instagram
              </a>
              <a 
                href="https://substack.com/@themidnightquilll?r=8ata8u&utm_campaign=profile&utm_medium=profile-page" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                Substack
              </a>
              <a 
                href="https://open.spotify.com/show/5tqK5feXRLmO10ZmQAvD3L" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <svg className="h-4 w-4 text-green-500 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.892-.982-.336.076-.67-.137-.747-.473-.077-.337.137-.67.473-.748 3.856-.88 7.15-.502 9.814 1.13.295.18.387.563.207.86zm1.224-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.183-.412.125-.845-.108-.97-.52-.125-.413.108-.847.52-.972 3.667-1.11 8.23-.574 11.34 1.34.366.226.486.707.26 1.074zm.106-2.833C14.792 8.87 9.61 8.7 6.616 9.61c-.48.145-.98-.13-1.127-.61-.146-.48.13-.98.61-1.128 3.473-1.053 9.183-.86 12.79 1.28.433.256.574.815.317 1.248-.256.434-.814.575-1.247.318z"/>
                </svg>
                Spotify Podcast
              </a>
            </div>
          </div>

          {/* Newsletter Subscribe */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Newsletter
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Subscribe to receive weekly prompts, featured publications, and community essays.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 mt-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-foreground text-sm rounded-lg"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="cta-primary" disabled={loading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 mt-16 pt-8">
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} The Midnight Quill. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/40">
            Made by humans for humans. Raw & Authentically Human.
          </p>
        </div>
      </div>
    </footer>
  );
}

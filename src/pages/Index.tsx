import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PenLine, BookOpen, ArrowRight, Sparkles, Users } from 'lucide-react';
import { OurImpact } from '@/components/OurImpact';
import { SubstackFeed } from '@/components/SubstackFeed';
import { InstagramGallery } from '@/components/InstagramGallery';

export default function Index() {
  const { user, loading } = useAuth();

  return (
    <Layout>
      <SEOHead />
      <div className="landing-page min-h-[calc(100vh-4rem)] flex flex-col">
        {/* Hero Section */}
        <section className="relative flex-1 flex items-center justify-center px-4 py-20 sm:py-32 overflow-hidden">
          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl opacity-15 animate-float" style={{ animationDelay: '2s' }} />
          
          <div className="relative max-w-4xl mx-auto text-center z-10">
            {/* Pill Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-fade-up">
              <span className="landing-pill">
                <Sparkles className="h-3.5 w-3.5" />
                The Midnight Quill
              </span>
              <span className="landing-pill">
                <Users className="h-3.5 w-3.5" />
                A Zero-AI Literary Community
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] mb-6 animate-fade-up text-foreground" style={{ animationDelay: '100ms' }}>
              The Midnight
              <br />
              <span className="landing-gradient-text">Quill</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4 animate-fade-up leading-relaxed" style={{ animationDelay: '200ms' }}>
              A literary sanctuary for raw, human emotional expression.
            </p>

            {/* Supporting Description */}
            <p className="text-sm sm:text-base text-muted-foreground/70 max-w-xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '300ms' }}>
              No algorithms, no scoring, no AI writing. Every word here is authentic and human-crafted.
            </p>

            {/* CTA Buttons */}
            {!loading && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '400ms' }}>
                {user ? (
                  <>
                    <Button size="lg" className="cta-primary gap-2 group" asChild>
                      <Link to="/write">
                        <PenLine className="h-4 w-4" />
                        Submit Your Work
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="cta-secondary gap-2" asChild>
                      <Link to="/feed">
                        <BookOpen className="h-4 w-4" />
                        Browse Archive
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" className="cta-primary gap-2 group" asChild>
                      <Link to="/auth?mode=signup">
                        Submit Your Work
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="cta-secondary gap-2" asChild>
                      <Link to="/feed">
                        <BookOpen className="h-4 w-4" />
                        Browse Archive
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 sm:py-28 border-t border-white/5">
          <div className="container relative mx-auto px-4 z-10">
            <div className="grid sm:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
              {/* Feature 1 */}
              <div className="landing-feature-card animate-fade-up" style={{ animationDelay: '100ms' }}>
                <div className="landing-feature-icon">
                  <PenLine className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  Authentic & Human-Written
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Strict zero-AI-writing policy. Every submission undergoes human attestation and editorial review.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="landing-feature-card animate-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="landing-feature-icon">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  Editorial Mentorship
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Receive feedback and curation from core team members. Selected pieces are featured in our podcast and Substack.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="landing-feature-card animate-fade-up" style={{ animationDelay: '300ms' }}>
                <div className="landing-feature-icon">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  The Road Which Is Taken
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our community podcast on Spotify where editors and guest casting voices perform readings of accepted spoken-word scripts and poetry.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Impact Section */}
        <section className="relative py-20 border-t border-white/5 bg-background/25">
          <div className="container relative mx-auto px-4 z-10">
            <div className="text-center mb-12 animate-fade-up">
              <h2 className="font-display text-3xl font-semibold text-foreground mb-3">Our Impact</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                A growing circle of creative individuals working together to celebrate the spoken and written word.
              </p>
            </div>
            <OurImpact />
          </div>
        </section>

        {/* Substack Feed Section */}
        <section className="relative py-20 border-t border-white/5">
          <div className="container relative mx-auto px-4 z-10">
            <div className="text-center mb-12 animate-fade-up">
              <h2 className="font-display text-3xl font-semibold text-foreground mb-3">From the Substack</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Dive deeper with weekly essays, member highlights, and featured prompts.
              </p>
            </div>
            <SubstackFeed />
          </div>
        </section>

        {/* Instagram Highlights Section */}
        <section className="relative py-20 border-t border-white/5 bg-background/25">
          <div className="container relative mx-auto px-4 z-10">
            <div className="text-center mb-12 animate-fade-up">
              <h2 className="font-display text-3xl font-semibold text-foreground mb-3">Curated Highlights</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Artistic verses, quotes, and visual reels from our active Instagram feed.
              </p>
            </div>
            <InstagramGallery />
          </div>
        </section>

      </div>
    </Layout>
  );
}

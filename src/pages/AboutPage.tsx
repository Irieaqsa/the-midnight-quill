import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { ShieldCheck, Heart, Users, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <Layout>
      <SEOHead 
        title="Our Story & Manifesto — The Midnight Quill"
        description="Read about The Midnight Quill's founding values, history, and our strict zero-AI honor declaration."
      />
      
      <div className="min-h-[calc(100vh-4rem)] container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-16">
          
          {/* Hero Manifesto */}
          <div className="text-center space-y-6 animate-fade-up">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
              The Manifesto
            </h1>
            <p className="text-xl text-primary font-display font-medium italic">
              "We write because we must. Not because an algorithm told us to."
            </p>
            <div className="w-16 h-[1px] bg-primary/30 mx-auto mt-6" />
          </div>

          {/* Core Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
            <div className="p-6 bg-card rounded-lg border border-white/5 space-y-3">
              <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Zero-AI Policy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every line, spacing, and metered verse on TMQ is 100% human-crafted. We strictly forbid any generative AI text, metaphor suggestions, or automated rephrasing.
              </p>
            </div>

            <div className="p-6 bg-card rounded-lg border border-white/5 space-y-3">
              <div className="p-2.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 w-fit">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Raw Expression</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We value raw emotions and unfiltered human experiences. Art doesn't need to be perfect or machine-optimized; it needs to be honest.
              </p>
            </div>

            <div className="p-6 bg-card rounded-lg border border-white/5 space-y-3">
              <div className="p-2.5 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Active Roster</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                What started as a small Bhubaneswar circle in July 2025 has grown into a community of 29 dedicated members across writing, design, and performance.
              </p>
            </div>

            <div className="p-6 bg-card rounded-lg border border-white/5 space-y-3">
              <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">The Spoken Word</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Through our audio podcast, "The Road Which Is Taken", we bring scripts and poetry to life, maintaining a legacy of traditional performance recitation.
              </p>
            </div>
          </div>

          {/* Founding Story */}
          <div className="p-8 bg-card rounded-lg border border-white/5 space-y-6 animate-fade-up">
            <h2 className="font-display text-2xl font-bold text-foreground">Our Story</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                In July 2025, three friends—Imran Ali, Ritashree Das, and Shagnik Bhattacharya—gathered in Bhubaneswar with a shared frustration. The internet was becoming flooded with synthetic, machine-generated poetry. Meters were technically perfect, metaphors were mathematically optimized, but the soul was missing.
              </p>
              <p>
                They founded <strong>The Midnight Quill (TMQ)</strong> as a rebellion. It wasn't designed as a software-as-a-service or a polished publishing tool. It was built as a sanctuary—a virtual notebook where writers could submit their raw verses and trust that everything they read was written by another human heart.
              </p>
              <p>
                Today, TMQ has expanded to 29 writers, crafters, scriptwriters, and designers, but the core promise remains unchanged: <strong>100% human, 100% raw, 100% authentic.</strong>
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4 animate-fade-up">
            <h3 className="font-display text-xl font-semibold text-foreground">Have a piece you'd like to share?</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Register an account, sign our Zero-AI declaration, and send your piece to the editors.
            </p>
            <div className="flex justify-center gap-3">
              <Button asChild variant="outline">
                <Link to="/feed">Browse Archive</Link>
              </Button>
              <Button asChild className="cta-primary">
                <Link to="/write">Submit Your Work</Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

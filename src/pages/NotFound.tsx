import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Home, BookOpen, ArrowLeft, Feather } from 'lucide-react';

export default function NotFound() {
  return (
    <Layout>
      <SEOHead 
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
      />
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-up">
          {/* Decorative icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-8">
            <Feather className="h-10 w-10 text-muted-foreground" />
          </div>
          
          {/* Error code */}
          <p className="text-6xl font-display font-bold text-ink mb-4">404</p>
          
          {/* Title */}
          <h1 className="font-display text-2xl sm:text-3xl font-medium text-foreground mb-3">
            Page not found
          </h1>
          
          {/* Description */}
          <p className="text-muted-foreground mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back to exploring great writing.
          </p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="outline" asChild className="w-full sm:w-auto gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto gap-2">
              <Link to="/feed">
                <BookOpen className="h-4 w-4" />
                Browse Feed
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

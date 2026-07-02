import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, FileQuestion, Home, RefreshCw, AlertTriangle, Search } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-up">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-6">
        {icon || <BookOpen className="h-7 w-7 text-muted-foreground" />}
      </div>
      <h2 className="font-display text-2xl font-medium text-foreground mb-2">
        {title}
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        {description}
      </p>
      {action && (
        action.href ? (
          <Button asChild>
            <Link to={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}

// Pre-configured empty states for common scenarios
export function NoPosts({ filterType }: { filterType?: 'article' | 'poetry' | 'all' }) {
  const typeLabel = filterType === 'article' ? 'articles' : filterType === 'poetry' ? 'poetry' : 'posts';
  
  return (
    <EmptyState
      icon={<BookOpen className="h-7 w-7 text-muted-foreground" />}
      title={`No ${typeLabel} yet`}
      description={
        filterType && filterType !== 'all'
          ? `No ${typeLabel} have been published yet. Check back soon or browse all content.`
          : 'Be the first to share your writing with the world.'
      }
      action={{ label: 'Start Writing', href: '/write' }}
    />
  );
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="h-7 w-7 text-muted-foreground" />}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search terms.`}
    />
  );
}

export function PostNotFound() {
  return (
    <EmptyState
      icon={<FileQuestion className="h-7 w-7 text-muted-foreground" />}
      title="Post not found"
      description="This post may have been removed, unpublished, or never existed. Let's get you back on track."
      action={{ label: 'Browse Feed', href: '/feed' }}
    />
  );
}

export function ProfileNotFound() {
  return (
    <EmptyState
      icon={<FileQuestion className="h-7 w-7 text-muted-foreground" />}
      title="Author not found"
      description="This profile doesn't exist or may have been removed."
      action={{ label: 'Browse Feed', href: '/feed' }}
    />
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  description = 'We encountered an unexpected error. Please try again.',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-up">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="font-display text-2xl font-medium text-foreground mb-2">
        {title}
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        {description}
      </p>
      <div className="flex items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        <Button asChild>
          <Link to="/" className="gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
}

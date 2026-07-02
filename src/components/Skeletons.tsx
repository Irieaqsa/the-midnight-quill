import { Skeleton } from '@/components/ui/skeleton';

export function PostCardSkeleton() {
  return (
    <div className="py-8 border-b border-border/30 -mx-4 px-4">
      <div className="flex flex-col gap-3">
        {/* Type badge */}
        <Skeleton className="h-4 w-16" />
        
        {/* Title */}
        <Skeleton className="h-7 w-3/4" />
        
        {/* Excerpt */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Meta */}
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Back nav */}
      <div className="border-b border-border py-3">
        <div className="container mx-auto px-4">
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      
      {/* Header */}
      <header className="py-12 sm:py-16 border-b border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-6">
            {/* Type badge */}
            <Skeleton className="h-8 w-24 rounded-full" />
            
            {/* Title */}
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
            
            {/* Excerpt */}
            <Skeleton className="h-6 w-2/3" />
            
            {/* Meta */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <div className="py-12 sm:py-16 border-b border-border">
        <div className="container mx-auto px-4 max-w-3xl space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col items-center text-center mb-12">
          <Skeleton className="w-24 h-24 rounded-full mb-6" />
          <Skeleton className="h-8 w-48 mb-3" />
          <Skeleton className="h-5 w-64 mb-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-6 w-40 mb-6" />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-1">
      {[...Array(5)].map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

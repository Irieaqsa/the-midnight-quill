import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagBadgesProps {
  tags: Tag[];
  linkable?: boolean;
  size?: 'sm' | 'default';
  className?: string;
  onTagClick?: (e: React.MouseEvent) => void;
}

export function TagBadges({ tags, linkable = true, size = 'default', className, onTagClick }: TagBadgesProps) {
  if (tags.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map(tag => (
        linkable ? (
          <Link
            key={tag.id}
            to={`/feed?tag=${tag.slug}`}
            onClick={onTagClick}
            className="group"
          >
            <Badge 
              variant="ink"
              className={cn(
                "cursor-pointer group-hover:scale-105 transition-transform duration-200",
                size === 'sm' && "text-[10px] px-2 py-0.5"
              )}
            >
              {tag.name}
            </Badge>
          </Link>
        ) : (
          <Badge 
            key={tag.id}
            variant="ink"
            className={cn(
              size === 'sm' && "text-[10px] px-2 py-0.5"
            )}
          >
            {tag.name}
          </Badge>
        )
      ))}
    </div>
  );
}

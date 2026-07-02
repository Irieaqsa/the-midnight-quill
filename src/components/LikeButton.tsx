import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLike } from '@/hooks/useLike';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface LikeButtonProps {
  postId: string;
  initialLikeCount?: number;
  size?: 'sm' | 'default';
  showCount?: boolean;
  className?: string;
}

export function LikeButton({ 
  postId, 
  initialLikeCount = 0, 
  size = 'default',
  showCount = true,
  className 
}: LikeButtonProps) {
  const { isLiked, likeCount, toggleLike, isLoading, canLike } = useLike({ 
    postId, 
    initialLikeCount 
  });
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canLike) {
      navigate('/auth');
      return;
    }
    
    // Trigger animation
    if (!isLiked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
    }
    
    toggleLike();
  };

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'h-8 px-2' : 'h-9 px-3';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        buttonSize,
        'gap-1.5 rounded-full',
        isLiked 
          ? 'text-coral hover:text-coral/80 hover:bg-coral/10' 
          : 'text-muted-foreground hover:text-coral hover:bg-coral/10',
        className
      )}
    >
      <Heart 
        className={cn(
          iconSize,
          'transition-all duration-300',
          isLiked && 'fill-current',
          isAnimating && 'animate-heart-pop'
        )} 
      />
      {showCount && (
        <span className={cn(
          'tabular-nums transition-all duration-200',
          size === 'sm' ? 'text-xs' : 'text-sm',
          isAnimating && 'scale-110'
        )}>
          {likeCount}
        </span>
      )}
    </Button>
  );
}

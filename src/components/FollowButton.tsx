import { useFollow } from '@/hooks/useFollow';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, UserCheck } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string | undefined;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function FollowButton({ 
  targetUserId, 
  variant = 'outline',
  size = 'sm',
  className = ''
}: FollowButtonProps) {
  const { isFollowing, isLoading, isUpdating, canFollow, toggleFollow } = useFollow(targetUserId);

  if (!canFollow || isLoading) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? 'ghost' : variant}
      size={size}
      onClick={toggleFollow}
      disabled={isUpdating}
      className={`gap-1.5 transition-colors ${className}`}
    >
      {isUpdating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      <span>{isFollowing ? 'Following' : 'Follow'}</span>
    </Button>
  );
}

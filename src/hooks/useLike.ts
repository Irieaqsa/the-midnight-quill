import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseLikeOptions {
  postId: string;
  initialLikeCount?: number;
}

export function useLike({ postId, initialLikeCount = 0 }: UseLikeOptions) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has liked this post
  useEffect(() => {
    async function checkLikeStatus() {
      if (!user || !postId) return;

      try {
        const { data, error } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setIsLiked(!!data);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    }

    checkLikeStatus();
  }, [user, postId]);

  // Fetch current like count
  useEffect(() => {
    async function fetchLikeCount() {
      if (!postId) return;

      try {
        const { count, error } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);

        if (error) throw error;
        setLikeCount(count || 0);
      } catch (error) {
        console.error('Error fetching like count:', error);
      }
    }

    fetchLikeCount();
  }, [postId]);

  // Subscribe to real-time updates for this post's likes
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`likes-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLikeCount((prev) => prev + 1);
            // Check if this is the current user's like
            if (user && (payload.new as any).user_id === user.id) {
              setIsLiked(true);
            }
          } else if (payload.eventType === 'DELETE') {
            setLikeCount((prev) => Math.max(0, prev - 1));
            // Check if this was the current user's like
            if (user && (payload.old as any).user_id === user.id) {
              setIsLiked(false);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, user]);

  const toggleLike = useCallback(async () => {
    if (!user || !postId || isLoading) return;

    setIsLoading(true);

    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        
        // Optimistic update (real-time will confirm)
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) {
          // Handle duplicate like error gracefully
          if (error.code === '23505') {
            setIsLiked(true);
            return;
          }
          throw error;
        }
        
        // Optimistic update (real-time will confirm)
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setIsLiked(!isLiked);
    } finally {
      setIsLoading(false);
    }
  }, [user, postId, isLiked, isLoading]);

  return {
    isLiked,
    likeCount,
    toggleLike,
    isLoading,
    canLike: !!user,
  };
}

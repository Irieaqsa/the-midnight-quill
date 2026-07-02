import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useFollow(targetUserId: string | undefined) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if current user follows target user
  useEffect(() => {
    async function checkFollowStatus() {
      if (!user || !targetUserId || user.id === targetUserId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .maybeSingle();

        if (error) throw error;
        setIsFollowing(!!data);
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkFollowStatus();
  }, [user, targetUserId]);

  const follow = useCallback(async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId,
        });

      if (error) throw error;
      setIsFollowing(true);
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [user, targetUserId]);

  const unfollow = useCallback(async () => {
    if (!user || !targetUserId) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;
      setIsFollowing(false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [user, targetUserId]);

  const toggleFollow = useCallback(async () => {
    if (isFollowing) {
      await unfollow();
    } else {
      await follow();
    }
  }, [isFollowing, follow, unfollow]);

  // Don't show follow button for own profile
  const canFollow = user && targetUserId && user.id !== targetUserId;

  return {
    isFollowing,
    isLoading,
    isUpdating,
    canFollow,
    follow,
    unfollow,
    toggleFollow,
  };
}

// Hook to get follower and following counts for a user using secure RPC functions
export function useFollowCounts(userId: string | undefined) {
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const [followersRes, followingRes] = await Promise.all([
          supabase.rpc('get_follower_count', { target_user_id: userId }),
          supabase.rpc('get_following_count', { target_user_id: userId }),
        ]);

        if (followersRes.error) throw followersRes.error;
        if (followingRes.error) throw followingRes.error;

        setFollowerCount(followersRes.data || 0);
        setFollowingCount(followingRes.data || 0);
      } catch (error) {
        console.error('Error fetching follow counts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCounts();
  }, [userId]);

  return { followerCount, followingCount, isLoading };
}

// Hook to get list of followed user IDs (for feed filtering)
export function useFollowedAuthors() {
  const { user } = useAuth();
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFollowedAuthors() {
      if (!user) {
        setFollowedIds([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        if (error) throw error;
        setFollowedIds(data?.map(f => f.following_id) || []);
      } catch (error) {
        console.error('Error fetching followed authors:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFollowedAuthors();
  }, [user]);

  return { followedIds, isLoading };
}

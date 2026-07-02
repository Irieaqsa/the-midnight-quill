import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  post_id: string;
  profiles: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export function useComments(postId: string, postAuthorId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        author_id,
        post_id,
        profiles:author_id (
          display_name,
          username,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data || []);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, fetchComments]);

  const addComment = async (content: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment.",
        variant: "destructive"
      });
      return false;
    }

    if (!content.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write something before posting.",
        variant: "destructive"
      });
      return false;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        content: content.trim()
      });

    setSubmitting(false);

    if (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Comment posted",
      description: "Your comment has been added."
    });
    return true;
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Comment deleted",
      description: "The comment has been removed."
    });
    return true;
  };

  const canDeleteComment = (commentAuthorId: string) => {
    if (!user) return false;
    // User can delete if they're the comment author OR the post author
    return user.id === commentAuthorId || user.id === postAuthorId;
  };

  return {
    comments,
    loading,
    submitting,
    addComment,
    deleteComment,
    canDeleteComment
  };
}

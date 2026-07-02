import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export function usePostTags(postId: string | null) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all available tags
  const fetchAllTags = useCallback(async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, slug')
      .order('name');

    if (error) {
      console.error('Error fetching tags:', error);
    } else {
      setAllTags(data || []);
    }
  }, []);

  // Fetch tags for the current post
  const fetchPostTags = useCallback(async () => {
    if (!postId) {
      setTags([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('post_tags')
      .select(`
        tag_id,
        tags (
          id,
          name,
          slug
        )
      `)
      .eq('post_id', postId);

    if (error) {
      console.error('Error fetching post tags:', error);
    } else {
      const postTags = (data || [])
        .map(pt => pt.tags)
        .filter((tag): tag is Tag => tag !== null);
      setTags(postTags);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchAllTags();
  }, [fetchAllTags]);

  useEffect(() => {
    fetchPostTags();
  }, [fetchPostTags]);

  // Add a tag to the post
  const addTag = async (tagName: string): Promise<boolean> => {
    if (!postId) return false;

    const normalizedName = tagName.trim().toLowerCase();
    const slug = normalizedName.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    if (!slug) return false;

    // Check if tag already exists on post
    if (tags.some(t => t.slug === slug)) return false;

    try {
      // Find or create the tag
      let tag: Tag;
      const existing = allTags.find(t => t.slug === slug);
      
      if (existing) {
        tag = existing;
      } else {
        const { data, error } = await supabase
          .from('tags')
          .insert({ name: normalizedName, slug })
          .select()
          .single();

        if (error) throw error;
        tag = data;
        setAllTags(prev => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
      }

      // Add to post
      const { error: linkError } = await supabase
        .from('post_tags')
        .insert({ post_id: postId, tag_id: tag.id });

      if (linkError) throw linkError;

      setTags(prev => [...prev, tag]);
      return true;
    } catch (error) {
      console.error('Error adding tag:', error);
      return false;
    }
  };

  // Remove a tag from the post
  const removeTag = async (tagId: string): Promise<boolean> => {
    if (!postId) return false;

    try {
      const { error } = await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', postId)
        .eq('tag_id', tagId);

      if (error) throw error;

      setTags(prev => prev.filter(t => t.id !== tagId));
      return true;
    } catch (error) {
      console.error('Error removing tag:', error);
      return false;
    }
  };

  return {
    tags,
    allTags,
    loading,
    addTag,
    removeTag,
    refreshTags: fetchPostTags
  };
}

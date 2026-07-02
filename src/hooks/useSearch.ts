import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SearchPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  post_type: string;
  author_name: string | null;
}

interface SearchTag {
  id: string;
  name: string;
  slug: string;
}

interface SearchAuthor {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface SearchResults {
  posts: SearchPost[];
  tags: SearchTag[];
  authors: SearchAuthor[];
}

export function useSearch(query: string, debounceMs: number = 300) {
  const [results, setResults] = useState<SearchResults>({ posts: [], tags: [], authors: [] });
  const [isLoading, setIsLoading] = useState(false);

  // Debounce the query
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ posts: [], tags: [], authors: [] });
      return;
    }

    const searchAll = async () => {
      setIsLoading(true);
      const normalizedQuery = debouncedQuery.toLowerCase().trim();

      try {
        // Search posts - title and content
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            excerpt,
            content,
            post_type,
            profiles:author_id(display_name)
          `)
          .eq('status', 'published')
          .or(`title.ilike.%${normalizedQuery}%,content.ilike.%${normalizedQuery}%`)
          .limit(10);

        // Search tags
        const { data: tags } = await supabase
          .from('tags')
          .select('id, name, slug')
          .ilike('name', `%${normalizedQuery}%`)
          .limit(10);

        // Search authors
        const { data: authors } = await supabase
          .from('profiles')
          .select('id, display_name, username, avatar_url, bio')
          .or(`display_name.ilike.%${normalizedQuery}%,username.ilike.%${normalizedQuery}%`)
          .limit(10);

        // Process and sort results - prioritize exact matches
        const sortedPosts = (posts || [])
          .map(p => ({
            id: p.id,
            title: p.title,
            excerpt: p.excerpt,
            content: p.content,
            post_type: p.post_type,
            author_name: (p.profiles as { display_name: string | null })?.display_name || null,
          }))
          .sort((a, b) => {
            const aExact = a.title.toLowerCase() === normalizedQuery ? -1 : 0;
            const bExact = b.title.toLowerCase() === normalizedQuery ? -1 : 0;
            if (aExact !== bExact) return aExact - bExact;
            
            const aStarts = a.title.toLowerCase().startsWith(normalizedQuery) ? -1 : 0;
            const bStarts = b.title.toLowerCase().startsWith(normalizedQuery) ? -1 : 0;
            return aStarts - bStarts;
          })
          .slice(0, 5);

        const sortedTags = (tags || [])
          .sort((a, b) => {
            const aExact = a.name.toLowerCase() === normalizedQuery ? -1 : 0;
            const bExact = b.name.toLowerCase() === normalizedQuery ? -1 : 0;
            if (aExact !== bExact) return aExact - bExact;
            
            const aStarts = a.name.toLowerCase().startsWith(normalizedQuery) ? -1 : 0;
            const bStarts = b.name.toLowerCase().startsWith(normalizedQuery) ? -1 : 0;
            return aStarts - bStarts;
          })
          .slice(0, 5);

        const sortedAuthors = (authors || [])
          .sort((a, b) => {
            const aName = (a.display_name || a.username || '').toLowerCase();
            const bName = (b.display_name || b.username || '').toLowerCase();
            
            const aExact = aName === normalizedQuery ? -1 : 0;
            const bExact = bName === normalizedQuery ? -1 : 0;
            if (aExact !== bExact) return aExact - bExact;
            
            const aStarts = aName.startsWith(normalizedQuery) ? -1 : 0;
            const bStarts = bName.startsWith(normalizedQuery) ? -1 : 0;
            return aStarts - bStarts;
          })
          .slice(0, 5);

        setResults({
          posts: sortedPosts,
          tags: sortedTags,
          authors: sortedAuthors,
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    searchAll();
  }, [debouncedQuery]);

  const hasResults = results.posts.length > 0 || results.tags.length > 0 || results.authors.length > 0;

  return { results, isLoading, hasResults };
}

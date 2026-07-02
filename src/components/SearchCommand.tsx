import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Hash, User, Search, Loader2 } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useSearch } from '@/hooks/useSearch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const [query, setQuery] = useState('');
  const { results, isLoading, hasResults } = useSearch(query);
  const navigate = useNavigate();

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const handleSelect = (type: 'post' | 'tag' | 'author', value: string) => {
    onOpenChange(false);
    switch (type) {
      case 'post':
        navigate(`/post/${value}`);
        break;
      case 'tag':
        navigate(`/feed?tag=${value}`);
        break;
      case 'author':
        navigate(`/author/${value}`);
        break;
    }
  };

  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getContentPreview = (content: string, maxLength: number = 100) => {
    const text = stripHtml(content);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <CommandInput
        placeholder="Search posts, tags, authors..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && query && !hasResults && (
          <CommandEmpty>No results found for "{query}"</CommandEmpty>
        )}

        {!isLoading && !query && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
            Start typing to search...
          </div>
        )}

        {!isLoading && hasResults && (
          <>
            {results.posts.length > 0 && (
              <CommandGroup heading="Posts">
                {results.posts.map((post) => (
                  <CommandItem
                    key={post.id}
                    value={`post-${post.id}`}
                    onSelect={() => handleSelect('post', post.id)}
                    className="cursor-pointer"
                  >
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate">{post.title}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {post.author_name && `by ${post.author_name} · `}
                        {getContentPreview(post.excerpt || post.content, 60)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.tags.length > 0 && (
              <CommandGroup heading="Tags">
                {results.tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={`tag-${tag.id}`}
                    onSelect={() => handleSelect('tag', tag.slug)}
                    className="cursor-pointer"
                  >
                    <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{tag.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.authors.length > 0 && (
              <CommandGroup heading="Authors">
                {results.authors.map((author) => (
                  <CommandItem
                    key={author.id}
                    value={`author-${author.id}`}
                    onSelect={() => handleSelect('author', author.id)}
                    className="cursor-pointer"
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={author.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {(author.display_name || author.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium">
                        {author.display_name || author.username || 'Unknown'}
                      </span>
                      {author.bio && (
                        <span className="text-xs text-muted-foreground truncate">
                          {author.bio.substring(0, 50)}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

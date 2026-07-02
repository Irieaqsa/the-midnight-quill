import { useState, useRef, KeyboardEvent } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagInputProps {
  tags: Tag[];
  allTags: Tag[];
  onAddTag: (tagName: string) => Promise<boolean>;
  onRemoveTag: (tagId: string) => Promise<boolean>;
  disabled?: boolean;
}

export function TagInput({ tags, allTags, onAddTag, onRemoveTag, disabled }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = allTags.filter(tag => 
    !tags.some(t => t.id === tag.id) &&
    tag.name.includes(inputValue.toLowerCase())
  ).slice(0, 5);

  const handleAddTag = async (tagName: string) => {
    if (!tagName.trim() || isAdding) return;
    
    setIsAdding(true);
    const success = await onAddTag(tagName);
    if (success) {
      setInputValue('');
    }
    setIsAdding(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onRemoveTag(tags[tags.length - 1].id);
    }
  };

  const handleRemove = async (tagId: string) => {
    await onRemoveTag(tagId);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <TagIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Tags</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-md border border-border bg-background min-h-[42px]">
        {/* Current tags */}
        {tags.map(tag => (
          <Badge 
            key={tag.id} 
            variant="secondary"
            className="gap-1 pr-1"
          >
            {tag.name}
            <button
              type="button"
              onClick={() => handleRemove(tag.id)}
              disabled={disabled}
              className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Add tag input */}
        <Popover open={isOpen && filteredSuggestions.length > 0} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="flex-1 min-w-[120px]">
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsOpen(true)}
                placeholder={tags.length === 0 ? "Add tags..." : "Add more..."}
                disabled={disabled || isAdding}
                className="h-7 border-0 bg-transparent focus-visible:ring-0 p-0 text-sm placeholder:text-muted-foreground/50"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[200px] p-1" 
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="space-y-1">
              {filteredSuggestions.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    handleAddTag(tag.name);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors"
                >
                  {tag.name}
                </button>
              ))}
              {inputValue && !filteredSuggestions.some(t => t.name === inputValue.toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => {
                    handleAddTag(inputValue);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors flex items-center gap-2 text-primary"
                >
                  <Plus className="h-3 w-3" />
                  Create "{inputValue}"
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Press Enter to add a tag. Tags help readers discover your work.
      </p>
    </div>
  );
}

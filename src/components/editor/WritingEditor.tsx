import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import HardBreak from '@tiptap/extension-hard-break';
import { EditorToolbar } from './EditorToolbar';
import { useEffect, useCallback, useMemo } from 'react';

interface WritingEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  isPoetry?: boolean;
}

export function WritingEditor({ 
  content, 
  onChange, 
  placeholder = "Begin writing...",
  isPoetry = false 
}: WritingEditorProps) {
  // Configure hard break for poetry-friendly line breaks
  const hardBreakExtension = useMemo(() => 
    HardBreak.configure({
      keepMarks: true,
    }).extend({
      addKeyboardShortcuts() {
        return {
          // Enter creates a hard break in poetry mode
          Enter: () => {
            if (isPoetry) {
              return this.editor.commands.setHardBreak();
            }
            return false;
          },
          // Shift+Enter always creates hard break
          'Shift-Enter': () => this.editor.commands.setHardBreak(),
        };
      },
    }),
    [isPoetry]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: false, // We're using our custom one
        heading: {
          levels: [1, 2, 3],
        },
      }),
      hardBreakExtension,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update poetry mode dynamically
  useEffect(() => {
    if (editor) {
      // Force re-render of keyboard shortcuts by updating extensions
      editor.setOptions({
        editorProps: {
          attributes: {
            class: `prose prose-lg max-w-none focus:outline-none min-h-[300px] px-4 py-3 ${isPoetry ? 'poetry-mode' : ''}`,
          },
        },
      });
    }
  }, [isPoetry, editor]);

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <EditorToolbar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="editor-content"
      />
    </div>
  );
}

// Utility to count words from HTML content
export function countWords(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!text) return 0;
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

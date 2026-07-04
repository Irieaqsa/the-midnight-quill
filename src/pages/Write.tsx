import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { WritingEditor, countWords } from '@/components/editor/WritingEditor';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Send, 
  Loader2, 
  Clock, 
  FileText,
  ArrowLeft,
  Check,
  ShieldCheck
} from 'lucide-react';

export default function Write() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState<string>('POETRY');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [aiDeclaration, setAiDeclaration] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(!!editId);

  // Revisions States
  const [revisions, setRevisions] = useState<any[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<any | null>(null);

  const fetchRevisions = async () => {
    if (!editId) return;
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/submissions/${editId}/revisions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRevisions(data.revisions || []);
      }
    } catch (err) {
      console.error('Error loading revisions:', err);
    }
  };

  const handleRestoreRevision = async (revId: string) => {
    if (!confirm('Are you sure you want to restore this revision? It will overwrite your current editor text.')) return;
    const token = localStorage.getItem('tmq_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/submissions/${editId}/revisions/${revId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTitle(data.revision.title);
        setContent(data.revision.body);
        setSelectedRevision(null);
        toast({
          title: 'Restored!',
          description: 'Piece restored to selected revision snapshot.',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error restoring',
        description: 'Failed to restore revision.',
        variant: 'destructive',
      });
    }
  };

  // Background Auto-Save Loop
  useEffect(() => {
    if (!editId || !title.trim() || !content.trim()) return;

    const timer = setTimeout(async () => {
      const token = localStorage.getItem('tmq_token');
      const submissionData = {
        title,
        body: content,
        excerpt,
        category,
        tags,
        aiDeclaration: true,
      };

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/submissions/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(submissionData),
        });
        if (res.ok) {
          console.log('Draft auto-saved.');
          fetchRevisions();
        }
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    }, 10000); // 10s debounce

    return () => clearTimeout(timer);
  }, [title, content, excerpt, category, tags, editId]);

  // Calculate word count
  const wordCount = countWords(content);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load existing submission if editing
  useEffect(() => {
    async function loadSubmission() {
      if (!editId || !user) return;

      const token = localStorage.getItem('tmq_token');
      setIsInitialLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/submissions/${editId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        
        if (res.ok && data.submission) {
          setTitle(data.submission.title);
          setContent(data.submission.body);
          setExcerpt(data.submission.excerpt || '');
          setCategory(data.submission.category);
          setAiDeclaration(data.submission.aiDeclaration);
          if (data.submission.tags) {
            setTags(data.submission.tags.map((t: any) => t.tag.name));
          }
        } else {
          toast({
            title: 'Submission not found',
            description: 'Could not load your submission.',
            variant: 'destructive',
          });
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error loading submission:', error);
      } finally {
        setIsInitialLoading(false);
      }
    }

    loadSubmission();
    fetchRevisions();
  }, [editId, user, navigate, toast]);

  // Add Tag
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Submit piece handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please add a title before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: 'Content required',
        description: 'Please add some content before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!aiDeclaration) {
      toast({
        title: 'Attestation required',
        description: 'You must confirm that this is your original work without AI assistance.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('tmq_token');
      const submissionData = {
        title,
        body: content,
        excerpt,
        category,
        tags,
        aiDeclaration: true,
      };

      const endpoint = editId 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/submissions/${editId}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/submissions`;
      
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'Submitted!',
          description: editId ? 'Your submission has been updated.' : 'Your work has been submitted to the editors.',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Submission failed',
          description: data.error || 'An error occurred during submission.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting piece:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to connect to the server.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isInitialLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        {/* Top bar */}
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Back button */}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>

              {/* Center: Status indicators */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
                </span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="cta-primary gap-1.5"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Submit Piece</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Editor area */}
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="space-y-6 animate-fade-up">
            
            {/* Category selection */}
            <div>
              <Label htmlFor="category" className="text-sm font-medium mb-2 block text-muted-foreground">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="w-full bg-card border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POETRY">Poetry</SelectItem>
                  <SelectItem value="PROSE">Prose</SelectItem>
                  <SelectItem value="SPOKEN_WORD_SCRIPT">Spoken Word Script</SelectItem>
                  <SelectItem value="ESSAY">Essay</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <Input
                type="text"
                placeholder="Title of your piece"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl sm:text-3xl font-display font-semibold h-auto py-3 border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary bg-transparent placeholder:text-muted-foreground/30 text-foreground"
              />
            </div>

            {/* Excerpt */}
            <div>
              <Input
                type="text"
                placeholder="Add a short teaser or summary (optional)"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="text-base italic border-0 border-b border-border/50 rounded-none focus-visible:ring-0 focus-visible:border-primary bg-transparent placeholder:text-muted-foreground/30 text-muted-foreground"
              />
            </div>

            {/* Content editor */}
            <div className="min-h-[300px]">
              <WritingEditor
                content={content}
                onChange={setContent}
                placeholder={category === 'POETRY' 
                  ? "Let your verses flow... (Enter creates line breaks)"
                  : "Begin your story..."
                }
                isPoetry={category === 'POETRY'}
              />
              {category === 'POETRY' && (
                <p className="text-xs text-muted-foreground/75 mt-2">
                  💡 Poetry mode: Press Enter for line breaks, Shift+Enter for new paragraphs.
                </p>
              )}
            </div>

            {/* Tags Input */}
            <div className="pt-4 border-t border-white/5">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    #{tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="text-primary hover:text-foreground text-[10px]"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <Input
                type="text"
                placeholder="Add tags (press Enter or comma to save)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="bg-card border-white/5"
              />
            </div>

            {/* Mandatory Zero-AI attestation check */}
            <div className="flex items-start space-x-3 p-4 bg-primary/5 border border-primary/10 rounded-lg mt-6">
              <Checkbox 
                id="ai-declaration" 
                checked={aiDeclaration} 
                onCheckedChange={(checked) => setAiDeclaration(!!checked)}
                className="mt-0.5 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <div className="grid gap-1.5 leading-none">
                <label 
                  htmlFor="ai-declaration" 
                  className="text-sm font-semibold text-foreground flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Zero-AI Honor Declaration
                </label>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  I solemnly declare that this piece was fully written and composed by myself. No part of this text, theme, or metered spacing was generated, modified, or assisted by generative AI models.
                </p>
              </div>
            </div>

            {/* Revision History Section (only if editing an existing piece) */}
            {editId && revisions.length > 0 && (
              <div className="p-6 bg-card rounded-lg border border-white/5 mt-8 space-y-4 animate-fade-up">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Clock className="h-5 w-5" />
                  <h3 className="font-display text-lg">Revision History</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select a version to preview and restore it. Versions are auto-saved every 5 minutes of editing:
                </p>

                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Left: Revisions list */}
                  <div className="sm:col-span-1 border-r border-white/5 pr-4 max-h-[250px] overflow-y-auto space-y-1.5">
                    {revisions.map((rev) => (
                      <button
                        key={rev.id}
                        type="button"
                        onClick={async () => {
                          const token = localStorage.getItem('tmq_token');
                          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/submissions/${editId}/revisions/${rev.id}`, {
                            headers: { 'Authorization': `Bearer ${token}` },
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setSelectedRevision(data.revision);
                          }
                        }}
                        className={`w-full text-left p-2.5 rounded text-xs transition-smooth ${
                          selectedRevision?.id === rev.id 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {new Date(rev.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </button>
                    ))}
                  </div>

                  {/* Right: Revision Preview */}
                  <div className="sm:col-span-2 pl-2 space-y-3 flex flex-col justify-between min-h-[200px]">
                    {selectedRevision ? (
                      <>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground text-sm leading-tight">
                            Preview: {selectedRevision.title}
                          </h4>
                          <div className="text-xs text-muted-foreground border border-white/5 p-3 rounded bg-black/25 max-h-[180px] overflow-y-auto font-serif whitespace-pre-wrap">
                            {selectedRevision.body.replace(/<[^>]*>/g, '') /* Strip HTML tags for preview */}
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          size="sm" 
                          className="cta-primary mt-2" 
                          onClick={() => handleRestoreRevision(selectedRevision.id)}
                        >
                          Restore This Version
                        </Button>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground p-6">
                        Click a timestamp to preview past content
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
}

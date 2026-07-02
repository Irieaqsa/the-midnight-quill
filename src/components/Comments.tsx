import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Trash2, MessageCircle, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentsProps {
  postId: string;
  postAuthorId: string;
}

export function Comments({ postId, postAuthorId }: CommentsProps) {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    comments, 
    loading, 
    submitting, 
    addComment, 
    deleteComment, 
    canDeleteComment 
  } = useComments(postId, postAuthorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addComment(newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const getDisplayName = (profile: { display_name: string | null; username: string | null } | null) => {
    if (!profile) return 'Anonymous';
    return profile.display_name || profile.username || 'Anonymous';
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[100px] resize-none"
            disabled={submitting}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={submitting || !newComment.trim()}
              size="sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Comment'
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
          <p className="text-muted-foreground mb-3">
            Sign in to join the conversation
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => {
            const displayName = getDisplayName(comment.profiles);
            return (
              <div 
                key={comment.id} 
                className="group rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {comment.profiles?.avatar_url ? (
                        <User className="h-4 w-4" />
                      ) : (
                        getInitials(displayName)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {canDeleteComment(comment.author_id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(comment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="mt-1.5 text-sm text-foreground whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

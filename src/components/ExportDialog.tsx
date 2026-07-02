import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileDown, Loader2, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';

interface PostWithTags {
  id: string;
  title: string;
  content: string;
  post_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  post_tags: {
    tags: {
      name: string;
    };
  }[];
}

export function ExportDialog() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<'markdown' | 'pdf' | null>(null);
  const [exportComplete, setExportComplete] = useState<'markdown' | 'pdf' | null>(null);

  const fetchUserPosts = async (): Promise<PostWithTags[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        post_type,
        status,
        created_at,
        updated_at,
        published_at,
        post_tags (
          tags (
            name
          )
        )
      `)
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    return data as PostWithTags[];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stripHtml = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const exportAsMarkdown = async () => {
    setIsExporting('markdown');
    setExportComplete(null);

    try {
      const posts = await fetchUserPosts();

      if (posts.length === 0) {
        toast({
          title: 'No content to export',
          description: 'You haven\'t created any writing yet.',
          variant: 'destructive',
        });
        return;
      }

      let markdown = `# My Writing Collection\n\n`;
      markdown += `Exported on ${formatDate(new Date().toISOString())}\n\n`;
      markdown += `Total pieces: ${posts.length}\n\n`;
      markdown += `---\n\n`;

      posts.forEach((post, index) => {
        const tags = post.post_tags?.map(pt => pt.tags?.name).filter(Boolean) || [];
        
        markdown += `## ${post.title || 'Untitled'}\n\n`;
        markdown += `**Type:** ${post.post_type}\n`;
        markdown += `**Status:** ${post.status}\n`;
        markdown += `**Created:** ${formatDate(post.created_at)}\n`;
        markdown += `**Last Updated:** ${formatDate(post.updated_at)}\n`;
        if (post.published_at) {
          markdown += `**Published:** ${formatDate(post.published_at)}\n`;
        }
        if (tags.length > 0) {
          markdown += `**Tags:** ${tags.join(', ')}\n`;
        }
        markdown += `\n`;
        markdown += stripHtml(post.content);
        markdown += `\n\n`;
        
        if (index < posts.length - 1) {
          markdown += `---\n\n`;
        }
      });

      // Create and download file
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-writing-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportComplete('markdown');
      toast({
        title: 'Export complete',
        description: `Successfully exported ${posts.length} piece${posts.length === 1 ? '' : 's'} as Markdown.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  const exportAsPdf = async () => {
    setIsExporting('pdf');
    setExportComplete(null);

    try {
      const posts = await fetchUserPosts();

      if (posts.length === 0) {
        toast({
          title: 'No content to export',
          description: 'You haven\'t created any writing yet.',
          variant: 'destructive',
        });
        return;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper to add new page if needed
      const checkNewPage = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };

      // Title page
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.text('My Writing Collection', pageWidth / 2, 60, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.text(`Exported on ${formatDate(new Date().toISOString())}`, pageWidth / 2, 75, { align: 'center' });
      pdf.text(`Total pieces: ${posts.length}`, pageWidth / 2, 85, { align: 'center' });

      // Content pages
      posts.forEach((post, index) => {
        pdf.addPage();
        yPosition = margin;

        const tags = post.post_tags?.map(pt => pt.tags?.name).filter(Boolean) || [];

        // Title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        const titleLines = pdf.splitTextToSize(post.title || 'Untitled', contentWidth);
        pdf.text(titleLines, margin, yPosition);
        yPosition += titleLines.length * 8 + 5;

        // Metadata
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        
        const metadata = [
          `Type: ${post.post_type} | Status: ${post.status}`,
          `Created: ${formatDate(post.created_at)}`,
          `Updated: ${formatDate(post.updated_at)}`,
        ];
        
        if (post.published_at) {
          metadata.push(`Published: ${formatDate(post.published_at)}`);
        }
        
        if (tags.length > 0) {
          metadata.push(`Tags: ${tags.join(', ')}`);
        }

        metadata.forEach(line => {
          checkNewPage(6);
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });

        yPosition += 5;
        pdf.setTextColor(0, 0, 0);

        // Content
        pdf.setFontSize(11);
        const content = stripHtml(post.content);
        const contentLines = pdf.splitTextToSize(content, contentWidth);

        contentLines.forEach((line: string) => {
          checkNewPage(6);
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });
      });

      // Download
      pdf.save(`my-writing-${new Date().toISOString().split('T')[0]}.pdf`);

      setExportComplete('pdf');
      toast({
        title: 'Export complete',
        description: `Successfully exported ${posts.length} piece${posts.length === 1 ? '' : 's'} as PDF.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="group p-6 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-soft transition-smooth text-left w-full">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-secondary mb-4 group-hover:bg-primary/10 transition-base">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-1">
            Export My Writing
          </h3>
          <p className="text-sm text-muted-foreground">
            Download all your work
          </p>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Export Your Writing</DialogTitle>
          <DialogDescription>
            Download all your writing including titles, content, timestamps, and tags. Your data belongs to you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 px-4"
            onClick={exportAsMarkdown}
            disabled={isExporting !== null}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
              {isExporting === 'markdown' ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : exportComplete === 'markdown' ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <FileText className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="text-left">
              <div className="font-medium">Markdown (.md)</div>
              <div className="text-sm text-muted-foreground">
                Plain text, easy to read and edit
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 px-4"
            onClick={exportAsPdf}
            disabled={isExporting !== null}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
              {isExporting === 'pdf' ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : exportComplete === 'pdf' ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <FileDown className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="text-left">
              <div className="font-medium">PDF Document (.pdf)</div>
              <div className="text-sm text-muted-foreground">
                Formatted, ready to print or share
              </div>
            </div>
          </Button>
        </div>
        <div className="pt-4 border-t border-border mt-4">
          <p className="text-xs text-muted-foreground text-center">
            Your export is private and secure. No watermarks or tracking.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

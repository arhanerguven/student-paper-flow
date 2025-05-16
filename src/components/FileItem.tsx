
import { useState } from 'react';
import { Document } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { File, MoreHorizontal, Download, Trash, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import MarkdownViewer from './MarkdownViewer';

interface FileItemProps {
  document: Document;
  onDelete: (id: string) => void;
}

export default function FileItem({ document, onDelete }: FileItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isSendingToN8n, setIsSendingToN8n] = useState(false);
  const [extractedText, setExtractedText] = useState<{ content: string; fileName: string } | null>(null);

  const fileSize = (): string => {
    const size = document.size;
    if (size < 1024) {
      return `${size} bytes`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // If we have a storageKey, remove the file from Supabase storage
      if (document.storageKey) {
        const { error } = await supabase.storage
          .from('course_pdfs')
          .remove([document.storageKey]);
          
        if (error) {
          throw error;
        }
      }
      
      // Remove the document from local state
      onDelete(document.id);
      toast.success(`${document.name} has been deleted`);
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete the file');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    // Open the file URL in a new tab for download
    if (document.url) {
      window.open(document.url, '_blank');
    } else {
      toast.error("Download link not available");
    }
  };

  const handleExtractText = async () => {
    if (!document.url) {
      toast.error("File URL is not available");
      return;
    }

    setIsConverting(true);
    toast.info("Extracting text from PDF...", { duration: 10000 });

    try {
      // Get the authentication headers correctly
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      // Use the constant from the client file instead of accessing the protected property
      const response = await fetch('https://wlkiguhcafvkccinwvbm.supabase.co/functions/v1/convert-pdf-to-markdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsa2lndWhjYWZ2a2NjaW53dmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNTgyOTQsImV4cCI6MjA2MjgzNDI5NH0.MvTtquF_A0DMp8hxK3-stqIQIGf2JhdiZ13fPmSrrZo',
        },
        body: JSON.stringify({
          pdfUrl: document.url,
          fileName: document.name
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error("Could not parse error response as JSON:", errorText);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        throw new Error(errorData.error || `Failed to extract text: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.text || data.text.trim() === '') {
        toast.error('No text could be extracted from this PDF');
        return;
      }
      
      setExtractedText({
        content: data.text,
        fileName: data.fileName
      });
      toast.success('Text extracted from PDF successfully');
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      toast.error(`Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleSendToN8n = async () => {
    if (!extractedText) {
      toast.error("No extracted text available. Please extract text first.");
      return;
    }
    
    const n8nWebhookUrl = localStorage.getItem('n8nWebhookUrl');
    if (!n8nWebhookUrl) {
      toast.error("n8n webhook URL is not configured. Please set it in the dashboard.");
      return;
    }
    
    setIsSendingToN8n(true);
    toast.info("Sending to n8n for RAG processing...");
    
    try {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Required for cross-origin calls
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: document.name,
          extractedText: extractedText.content,
          documentUrl: document.url,
          documentId: document.id,
          uploadTime: document.uploadDate.toISOString(),
        }),
      });
      
      toast.success('Successfully sent to n8n for RAG processing');
    } catch (error) {
      console.error('Error sending to n8n:', error);
      toast.error('Failed to send to n8n for RAG processing');
    } finally {
      setIsSendingToN8n(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow animate-fade-in">
        <CardContent className="p-4 flex items-center">
          <div className="p-2 bg-primary/10 rounded-md mr-4">
            <File className="h-8 w-8 text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-base truncate" title={document.name}>
              {document.name}
            </h3>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{fileSize()}</span>
              <span>{formatDistanceToNow(document.uploadDate, { addSuffix: true })}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
                <Download className="mr-2 h-4 w-4" />
                <span>Download</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleExtractText} 
                className="cursor-pointer"
                disabled={isConverting}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>{isConverting ? 'Extracting text...' : 'Extract Text'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete} 
                className="cursor-pointer text-destructive focus:text-destructive"
                disabled={isDeleting}
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
      
      {extractedText && (
        <div className="mt-4">
          <MarkdownViewer 
            markdown={extractedText.content} 
            fileName={extractedText.fileName} 
            onClose={() => setExtractedText(null)}
            onSendToN8n={handleSendToN8n}
            isSendingToN8n={isSendingToN8n}
          />
        </div>
      )}
    </>
  );
}

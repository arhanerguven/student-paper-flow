
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Copy, X, Send } from 'lucide-react';
import { toast } from 'sonner';

interface MarkdownViewerProps {
  markdown: string;
  fileName: string;
  onClose: () => void;
  onSendToN8n?: () => void;
  isSendingToN8n?: boolean;
}

export default function MarkdownViewer({ 
  markdown, 
  fileName, 
  onClose, 
  onSendToN8n,
  isSendingToN8n = false
}: MarkdownViewerProps) {
  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${fileName}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown)
      .then(() => toast.success('Markdown copied to clipboard'))
      .catch(() => toast.error('Failed to copy markdown'));
  };

  const n8nConfigured = !!localStorage.getItem('n8nWebhookUrl');

  return (
    <Card className="p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{fileName}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {onSendToN8n && n8nConfigured && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSendToN8n}
              disabled={isSendingToN8n}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSendingToN8n ? 'Sending...' : 'Send to n8n'}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
      <div className="border rounded-md p-4 bg-muted/30 h-[400px] overflow-auto">
        <pre className="whitespace-pre-wrap font-mono text-sm">{markdown}</pre>
      </div>
    </Card>
  );
}

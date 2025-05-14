
import { useState, useEffect } from 'react';
import FileUploader from './FileUploader';
import DocumentList from './DocumentList';
import { Document, WebhookSettings } from '@/lib/types';
import { toast } from 'sonner';

interface DashboardProps {
  webhookSettings?: WebhookSettings;
}

export default function Dashboard({ webhookSettings }: DashboardProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState<string>('');

  // Load documents and n8n webhook URL from localStorage on component mount
  useEffect(() => {
    const savedDocuments = localStorage.getItem('documents');
    if (savedDocuments) {
      try {
        // Parse the saved documents and convert string dates back to Date objects
        const parsedDocs = JSON.parse(savedDocuments).map((doc: any) => ({
          ...doc,
          uploadDate: new Date(doc.uploadDate)
        }));
        setDocuments(parsedDocs);
      } catch (e) {
        console.error('Error parsing saved documents:', e);
      }
    }

    const savedN8nUrl = localStorage.getItem('n8nWebhookUrl');
    if (savedN8nUrl) {
      setN8nWebhookUrl(savedN8nUrl);
    }
  }, []);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  // Save n8n webhook URL to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('n8nWebhookUrl', n8nWebhookUrl);
  }, [n8nWebhookUrl]);

  const handleFileUpload = async (document: Document, extractedText?: string) => {
    // Add the document to the list
    setDocuments(prev => [document, ...prev]);
    
    // If text was extracted and n8n webhook URL is configured, send the text to n8n
    if (extractedText && n8nWebhookUrl) {
      try {
        await sendToN8n(extractedText, document);
        toast.success('Document sent to n8n for RAG processing');
      } catch (error) {
        console.error('Failed to send document to n8n:', error);
        toast.error('Failed to send document to n8n');
      }
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const sendToN8n = async (text: string, document: Document) => {
    if (!n8nWebhookUrl) return;
    
    try {
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Required for cross-origin calls
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: document.name,
          extractedText: text,
          documentUrl: document.url,
          documentId: document.id,
          uploadTime: document.uploadDate.toISOString(),
        }),
      });
      
      console.log('Sent document to n8n for RAG processing');
      return true;
    } catch (error) {
      console.error('Error sending to n8n:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <label htmlFor="n8nWebhook" className="block text-sm font-medium mb-2">
          n8n Webhook URL for RAG Processing
        </label>
        <div className="flex gap-2">
          <input 
            id="n8nWebhook"
            type="text" 
            value={n8nWebhookUrl} 
            onChange={(e) => setN8nWebhookUrl(e.target.value)}
            placeholder="https://your-n8n-instance.com/webhook/..."
            className="flex-1 px-3 py-2 border rounded-md text-sm"
          />
          <Button 
            onClick={() => {
              localStorage.setItem('n8nWebhookUrl', n8nWebhookUrl);
              toast.success('n8n webhook URL saved');
            }}
            size="sm"
          >
            Save
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Enter the n8n webhook URL to automatically send extracted text for RAG processing
        </p>
      </div>
      
      <FileUploader 
        onFileUpload={handleFileUpload} 
        webhookUrl={webhookSettings?.enabled ? webhookSettings.url : undefined}
      />
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
        <DocumentList 
          documents={documents}
          onDeleteDocument={handleDeleteDocument}
        />
      </div>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';
import { Document } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function DocumentChat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState<string>('');

  // Load document and webhook URL from localStorage
  useEffect(() => {
    const savedDocuments = localStorage.getItem('documents');
    if (savedDocuments && id) {
      try {
        const documents: Document[] = JSON.parse(savedDocuments).map((doc: any) => ({
          ...doc,
          uploadDate: new Date(doc.uploadDate)
        }));
        
        const foundDocument = documents.find(doc => doc.id === id);
        if (foundDocument) {
          setDocument(foundDocument);
        }
      } catch (e) {
        console.error('Error parsing saved documents:', e);
      }
    }

    const savedN8nUrl = localStorage.getItem('n8nWebhookUrl');
    if (savedN8nUrl) {
      setN8nWebhookUrl(savedN8nUrl);
    }
  }, [id]);

  if (!document) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="max-w-3xl mx-auto text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Document not found</h2>
            <Button onClick={() => navigate('/')}>Return to dashboard</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold mb-2">Chat with: {document.name}</h1>
            <p className="text-muted-foreground">
              Ask questions about this document using the chat interface below
            </p>
          </div>

          {n8nWebhookUrl ? (
            <ChatInterface 
              webhookUrl={n8nWebhookUrl} 
              documentTitle={document.name} 
            />
          ) : (
            <div className="p-8 text-center border rounded-md">
              <h3 className="font-medium mb-4">n8n webhook URL not configured</h3>
              <p className="mb-4">
                Please configure the n8n webhook URL in the dashboard settings 
                to enable chat functionality.
              </p>
              <Button onClick={() => navigate('/')}>
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

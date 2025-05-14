
import { useState, useEffect } from 'react';
import FileUploader from './FileUploader';
import DocumentList from './DocumentList';
import { Document, WebhookSettings } from '@/lib/types';

interface DashboardProps {
  webhookSettings?: WebhookSettings;
}

export default function Dashboard({ webhookSettings }: DashboardProps) {
  const [documents, setDocuments] = useState<Document[]>([]);

  // Load documents from localStorage on component mount
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
  }, []);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  const handleFileUpload = (document: Document) => {
    setDocuments(prev => [document, ...prev]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <div className="space-y-6">
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

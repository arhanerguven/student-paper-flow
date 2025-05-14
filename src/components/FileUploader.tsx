
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Document } from '@/lib/types';

interface FileUploaderProps {
  onFileUpload: (document: Document) => void;
  webhookUrl?: string;
}

export default function FileUploader({ onFileUpload, webhookUrl }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFile = async (file: File) => {
    // Only accept PDFs
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted');
      return;
    }
    
    setIsUploading(true);

    try {
      // Create a document object
      // In a real app, this would be integrated with your backend
      const newDocument: Document = {
        id: `doc-${Date.now().toString(36)}${Math.random().toString(36).substr(2)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
      };

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // If webhook URL is defined, call it
      if (webhookUrl) {
        try {
          // In a production app, this would be handled by your backend
          await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors', // Required for cross-origin calls from browser
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename: file.name,
              fileType: file.type,
              fileSize: file.size,
              uploadTime: new Date().toISOString()
            }),
          });
          console.log('Webhook triggered');
        } catch (error) {
          console.error('Error triggering webhook:', error);
          // Continue processing even if webhook fails
        }
      }

      onFileUpload(newDocument);
      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      toast.error('Error uploading file');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile(file);
      // Reset the input so the same file can be uploaded again
      e.target.value = '';
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card
      className={`border-2 border-dashed p-8 text-center ${
        isDragging ? 'file-drop-active' : ''
      } transition-colors`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center">
        <div className="mb-4 p-4 rounded-full bg-primary/10">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Upload Course PDF</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop your PDF file here, or click to select
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <Button 
          onClick={handleButtonClick}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Select File'}
        </Button>
      </div>
    </Card>
  );
}

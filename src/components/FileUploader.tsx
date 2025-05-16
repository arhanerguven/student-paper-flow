
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Document } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

interface FileUploaderProps {
  onFileUpload: (document: Document, extractedText?: string) => void;
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
    toast.info("Uploading and processing file...", { duration: 10000 });

    try {
      // Generate a unique storage path for this file
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      console.log('Uploading file to Supabase:', filePath);
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('course_pdfs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('Upload successful, getting public URL');

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('course_pdfs')
        .getPublicUrl(filePath);

      // Create a document object
      const newDocument: Document = {
        id: `doc-${Date.now().toString(36)}${Math.random().toString(36).substr(2)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        url: publicUrl,
        storageKey: filePath,
      };

      // Automatically extract text from the PDF
      console.log('Automatically extracting text from PDF');
      try {
        // Get the authentication headers from Supabase client
        const { apikey, authorization } = supabase.auth.headers();
        
        const extractionResponse = await fetch('https://wlkiguhcafvkccinwvbm.supabase.co/functions/v1/convert-pdf-to-markdown', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': apikey || '',
            'Authorization': authorization || '',
          },
          body: JSON.stringify({
            pdfUrl: publicUrl,
            fileName: file.name
          })
        });
        
        if (!extractionResponse.ok) {
          const errorText = await extractionResponse.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            console.error("Could not parse error response as JSON:", errorText);
            throw new Error(`Error ${extractionResponse.status}: ${extractionResponse.statusText}`);
          }
          
          throw new Error(errorData.error || `Failed to extract text: ${extractionResponse.statusText}`);
        }
        
        const extractionData = await extractionResponse.json();
        
        if (extractionData.text && extractionData.text.trim() !== '') {
          // If we have extracted text, pass it along with the document
          onFileUpload(newDocument, extractionData.text);
          toast.success(`${file.name} uploaded and text extracted successfully`);
        } else {
          // If no text could be extracted, just pass the document
          onFileUpload(newDocument);
          toast.warning(`${file.name} uploaded, but no text could be extracted`);
        }
      } catch (extractionError) {
        console.error('Error extracting text:', extractionError);
        // Even if extraction fails, still upload the document
        onFileUpload(newDocument);
        toast.warning(`${file.name} uploaded, but text extraction failed: ${extractionError.message}`);
      }

      // If webhook URL is defined, call it
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename: file.name,
              fileType: file.type,
              fileSize: file.size,
              uploadTime: new Date().toISOString(),
              fileUrl: publicUrl
            }),
          });
          console.log('Webhook triggered');
        } catch (error) {
          console.error('Error triggering webhook:', error);
          // Continue processing even if webhook fails
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error uploading file: ${errorMessage}`);
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
        isDragging ? 'border-primary bg-primary/5' : ''
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

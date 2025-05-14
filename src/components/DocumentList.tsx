
import { useState } from 'react';
import { Document } from '@/lib/types';
import FileItem from './FileItem';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DocumentListProps {
  documents: Document[];
  onDeleteDocument: (id: string) => void;
}

export default function DocumentList({ documents, onDeleteDocument }: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {documents.length === 0 ? (
            "No documents uploaded yet."
          ) : (
            "No documents match your search."
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map(document => (
            <FileItem 
              key={document.id} 
              document={document} 
              onDelete={onDeleteDocument}
            />
          ))}
        </div>
      )}
    </div>
  );
}

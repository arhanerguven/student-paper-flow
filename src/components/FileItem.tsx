
import { useState } from 'react';
import { Document } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { File, MoreHorizontal, Download, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface FileItemProps {
  document: Document;
  onDelete: (id: string) => void;
}

export default function FileItem({ document, onDelete }: FileItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = () => {
    setIsDeleting(true);
    // In a real app, you'd make an API call here
    setTimeout(() => {
      onDelete(document.id);
      toast.success(`${document.name} has been deleted`);
      setIsDeleting(false);
    }, 500);
  };

  const handleDownload = () => {
    // In a real app with backend, this would download the actual file
    if (document.url) {
      window.open(document.url, '_blank');
    } else {
      toast.error("Download link not available");
    }
  };

  return (
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
  );
}

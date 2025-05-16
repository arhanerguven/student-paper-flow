
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings, X } from 'lucide-react';
import { toast } from 'sonner';

interface ChatSettings {
  pineconeEnvironment: string;
  pineconeIndexName: string;
}

const ChatPage = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [chatSettings] = useState<ChatSettings>({
    pineconeEnvironment: 'us-east1-aws',
    pineconeIndexName: 'egitimdb',
  });
  const [keysAvailable] = useState(true);

  const toggleSettings = () => setShowSettings(!showSettings);

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex-1 container py-4 flex flex-col overflow-hidden relative">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Chat Assistant</h1>
          <Button variant="ghost" size="icon" onClick={toggleSettings}>
            <Settings size={20} />
          </Button>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Chat with the AI assistant about your course materials
        </p>
        
        {showSettings && (
          <Card className="p-4 mb-4 animate-in fade-in-50">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Chat Settings</h2>
              <Button variant="ghost" size="icon" onClick={toggleSettings}>
                <X size={18} />
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Using external chat API at: <strong>example-77lt.onrender.com</strong>
              </p>
            </div>
          </Card>
        )}
        
        <div className="flex-1 border rounded-lg overflow-hidden flex flex-col">
          <ChatInterface 
            chatSettings={chatSettings}
            keysAvailable={keysAvailable} 
          />
        </div>
      </main>
    </div>
  );
};

export default ChatPage;


import { useState } from 'react';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, X } from 'lucide-react';

interface ChatSettings {
  openaiApiKey: string;
  pineconeApiKey: string;
  pineconeEnvironment: string;
  pineconeIndexName: string;
}

const ChatPage = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [chatSettings, setChatSettings] = useState<ChatSettings>(() => {
    // Try to load settings from localStorage
    const saved = localStorage.getItem('chatSettings');
    return saved ? JSON.parse(saved) : {
      openaiApiKey: '',
      pineconeApiKey: '',
      pineconeEnvironment: '',
      pineconeIndexName: '',
    };
  });

  const handleSettingChange = (key: keyof ChatSettings, value: string) => {
    const newSettings = { ...chatSettings, [key]: value };
    setChatSettings(newSettings);
    localStorage.setItem('chatSettings', JSON.stringify(newSettings));
  };

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
              <h2 className="text-lg font-semibold">API Settings</h2>
              <Button variant="ghost" size="icon" onClick={toggleSettings}>
                <X size={18} />
              </Button>
            </div>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                <Input 
                  id="openaiApiKey"
                  type="password" 
                  placeholder="sk-..." 
                  value={chatSettings.openaiApiKey}
                  onChange={(e) => handleSettingChange('openaiApiKey', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pineconeApiKey">Pinecone API Key</Label>
                <Input 
                  id="pineconeApiKey"
                  type="password" 
                  placeholder="..." 
                  value={chatSettings.pineconeApiKey}
                  onChange={(e) => handleSettingChange('pineconeApiKey', e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="pineconeEnvironment">Pinecone Environment</Label>
                  <Input 
                    id="pineconeEnvironment"
                    placeholder="gcp-starter" 
                    value={chatSettings.pineconeEnvironment}
                    onChange={(e) => handleSettingChange('pineconeEnvironment', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="pineconeIndexName">Pinecone Index Name</Label>
                  <Input 
                    id="pineconeIndexName"
                    placeholder="your-index" 
                    value={chatSettings.pineconeIndexName}
                    onChange={(e) => handleSettingChange('pineconeIndexName', e.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Your API keys are stored locally in your browser and are only sent to your backend server.
              </p>
            </div>
          </Card>
        )}
        
        <div className="flex-1 border rounded-lg overflow-hidden flex flex-col">
          <ChatInterface chatSettings={chatSettings} />
        </div>
      </main>
    </div>
  );
};

export default ChatPage;

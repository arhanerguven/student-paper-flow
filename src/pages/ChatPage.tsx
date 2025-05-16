
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [keysAvailable, setKeysAvailable] = useState(false);

  // Check for API keys from Supabase on component mount
  useEffect(() => {
    const checkApiKeys = async () => {
      try {
        setIsLoadingKeys(true);
        const { data, error } = await supabase.functions.invoke('get-api-keys');
        
        if (error) {
          console.error('Error checking API keys:', error);
          toast.error('Failed to check API keys: ' + error.message);
          setKeysAvailable(false);
          return;
        }
        
        if (data && data.keysAvailable) {
          setKeysAvailable(true);
          // Update environment and index name from server while keeping local keys for fallback
          setChatSettings(prev => ({
            ...prev,
            pineconeEnvironment: data.pineconeEnvironment,
            pineconeIndexName: data.pineconeIndexName,
          }));
          toast.success('Using API keys from server configuration');
        } else {
          const missingKeys = data?.missingKeys || [];
          if (missingKeys.length > 0) {
            toast.warning(`Missing API keys on server: ${missingKeys.join(', ')}`);
          } else {
            toast.warning('API keys not configured on server');
          }
          setKeysAvailable(false);
        }
      } catch (error) {
        console.error('Error checking API keys:', error);
        toast.error('Failed to connect to server');
        setKeysAvailable(false);
      } finally {
        setIsLoadingKeys(false);
      }
    };
    
    checkApiKeys();
  }, []);

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
        
        {isLoadingKeys && (
          <p className="text-muted-foreground mb-4">Checking for API keys...</p>
        )}

        {!isLoadingKeys && keysAvailable && (
          <p className="text-green-500 mb-4">API keys configured on server</p>
        )}
        
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
                  placeholder={keysAvailable ? "Using server configuration" : "sk-..."} 
                  value={chatSettings.openaiApiKey}
                  onChange={(e) => handleSettingChange('openaiApiKey', e.target.value)}
                  disabled={keysAvailable}
                />
              </div>
              <div>
                <Label htmlFor="pineconeApiKey">Pinecone API Key</Label>
                <Input 
                  id="pineconeApiKey"
                  type="password" 
                  placeholder={keysAvailable ? "Using server configuration" : "..."} 
                  value={chatSettings.pineconeApiKey}
                  onChange={(e) => handleSettingChange('pineconeApiKey', e.target.value)}
                  disabled={keysAvailable}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="pineconeEnvironment">Pinecone Environment</Label>
                  <Input 
                    id="pineconeEnvironment"
                    placeholder={keysAvailable ? chatSettings.pineconeEnvironment : "gcp-starter"} 
                    value={chatSettings.pineconeEnvironment}
                    onChange={(e) => handleSettingChange('pineconeEnvironment', e.target.value)}
                    disabled={keysAvailable}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="pineconeIndexName">Pinecone Index Name</Label>
                  <Input 
                    id="pineconeIndexName"
                    placeholder={keysAvailable ? chatSettings.pineconeIndexName : "your-index"} 
                    value={chatSettings.pineconeIndexName}
                    onChange={(e) => handleSettingChange('pineconeIndexName', e.target.value)}
                    disabled={keysAvailable}
                  />
                </div>
              </div>
              {keysAvailable ? (
                <p className="text-sm text-muted-foreground">
                  Using API keys configured on the server.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your API keys are stored locally in your browser and are only sent to your backend server.
                </p>
              )}
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

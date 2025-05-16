
import { useState, useEffect, useRef } from 'react';
import { SendIcon, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  apiKey?: string;
}

const ChatInterface = ({ apiKey }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(!apiKey);
  const [tempApiKey, setTempApiKey] = useState('');

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Trigger MathJax rendering after messages are updated
    setTimeout(() => {
      if (window.renderMath) {
        window.renderMath();
      }
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Check if API key is available
    if (!apiKey && !tempApiKey) {
      setShowApiKeyPrompt(true);
      toast.error("OpenAI API key is required");
      return;
    }

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey || tempApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            ...messages, 
            userMessage
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from OpenAI');
      }

      const data = await response.json();
      const assistantMessage = { 
        role: 'assistant' as const, 
        content: data.choices[0].message.content 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to communicate with OpenAI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const saveApiKey = () => {
    if (tempApiKey) {
      localStorage.setItem('openai_api_key', tempApiKey);
      setShowApiKeyPrompt(false);
      toast.success('API key saved');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {showApiKeyPrompt ? (
        <Card className="p-4 mb-4">
          <h3 className="font-medium mb-2">Enter your OpenAI API Key</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your API key will be stored locally in your browser.
          </p>
          <div className="flex gap-2">
            <Textarea 
              value={tempApiKey} 
              onChange={(e) => setTempApiKey(e.target.value)} 
              placeholder="sk-..." 
              className="flex-1"
            />
            <Button onClick={saveApiKey}>Save</Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                <div>
                  <Bot className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>Ask me anything! I can render math like $E=mc^2$ too.</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    msg.role === 'assistant' ? 'bg-muted/50 rounded-lg p-3' : 'p-2'
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-10 flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="self-end"
              >
                {isLoading ? (
                  <div className="animate-spin">⟳</div>
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;

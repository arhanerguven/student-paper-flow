
import { useState, useEffect, useRef } from 'react';
import { SendIcon, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Declare the renderMath function on window
declare global {
  interface Window {
    renderMath?: () => void;
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call our secure Supabase edge function instead of OpenAI directly
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          messages: [...messages, userMessage] 
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get response from server');
      }

      const assistantMessage = { 
        role: 'assistant' as const, 
        content: data.choices[0].message.content 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling chat function:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to communicate with the chat service');
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

  return (
    <div className="flex flex-col h-full">
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
    </div>
  );
};

export default ChatInterface;

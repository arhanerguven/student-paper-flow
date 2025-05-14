
import { useState } from 'react';
import { ChatContainer, Message } from '@n8n/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import '@n8n/chat/styles.css';

interface ChatInterfaceProps {
  webhookUrl: string;
  documentTitle?: string;
}

export default function ChatInterface({ webhookUrl, documentTitle }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I can help you with questions about ${documentTitle || 'your documents'}. What would you like to know?`,
      role: 'assistant',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    if (!webhookUrl) {
      toast.error("Please configure the n8n webhook URL first.");
      return;
    }

    // Add the user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Send the message to n8n webhook
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Required for cross-origin calls
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          documentTitle: documentTitle,
          timestamp: new Date().toISOString(),
          type: 'chat_message',
        }),
      });
      
      // In a real implementation, we would get a response from the webhook
      // Here we're simulating a response since we're using no-cors
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I've received your message. In a complete integration, I would provide a response from your n8n workflow. To get actual responses, configure your n8n workflow to process messages and return responses.",
          role: 'assistant',
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message to n8n:', error);
      toast.error('Failed to send message to n8n webhook');
      setIsLoading(false);
    }
    
    setInputValue('');
  };

  return (
    <div className="flex flex-col bg-white border rounded-md h-[500px]">
      <div className="p-4 border-b">
        <h3 className="font-medium">Chat with {documentTitle || 'your documents'}</h3>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <ChatContainer messages={messages} />
      </div>
      
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about your document..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
}

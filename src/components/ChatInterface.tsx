
import { useState, useEffect, useRef } from 'react';
import { SendIcon, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChatSettings, Message } from '@/types/chat';
import { sendChatMessage } from '@/services/chatService';
import GPTOutput from './GPTOutput';

interface ChatInterfaceProps {
  chatSettings: ChatSettings;
  keysAvailable: boolean;
}

const ChatInterface = ({ chatSettings, keysAvailable }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Error parsing saved chat history:', error);
      }
    }
  }, []);

  // Save chat history to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log("Sending message to chat service");
      // Send message using the chat service
      const response = await sendChatMessage(
        userMessage.content,
        messages,
        chatSettings,
        keysAvailable
      );
      
      console.log("Received response from chat service");
      const assistantMessage = { 
        role: 'assistant' as const, 
        content: response 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling chat API:', error);
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

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
    toast.success('Chat history cleared');
  };

  const showLatexExample = () => {
    const exampleLatex = "Here are some LaTeX examples:\n\nInline math: $x^2 + y^2 = z^2$\n\nDisplay math: $$\\frac{d}{dx}x^2 = 2x$$\n\nMore complex: $$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$";
    setInput(exampleLatex);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground h-full flex items-center justify-center">
            <div>
              <Bot className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p className="mb-4">Ask me anything about your documents! I can render math like $E=mc^2$ too.</p>
              <Button variant="outline" size="sm" onClick={showLatexExample}>
                Show LaTeX Example
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearChat}
                className="text-xs"
              >
                Clear Chat
              </Button>
            </div>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${
                  msg.role === 'assistant' ? 'bg-muted/50 rounded-lg p-3' : 'p-2'
                }`}
              >
                <div className={`p-1.5 rounded-md ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="text-sm w-full">
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <GPTOutput markdown={msg.content} />
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
          </>
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

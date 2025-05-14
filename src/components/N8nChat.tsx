
import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

interface N8nChatProps {
  webhookUrl?: string;
}

export default function N8nChat({ webhookUrl }: N8nChatProps) {
  useEffect(() => {
    if (!webhookUrl) return;
    
    // Initialize chat with the webhook URL
    const chatInstance = createChat({
      webhookUrl: webhookUrl
    });
    
    // Clean up function to destroy chat when component unmounts or URL changes
    return () => {
      if (chatInstance && typeof chatInstance.destroy === 'function') {
        chatInstance.destroy();
      }
    };
  }, [webhookUrl]);

  // The chat component is injected into the DOM by the createChat function
  // We just need to return an empty fragment
  return null;
}

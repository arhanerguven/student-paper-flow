
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import { WebhookSettings } from '@/lib/types';

const Index = () => {
  const [webhookSettings, setWebhookSettings] = useState<WebhookSettings>({
    url: '',
    enabled: false
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('webhookSettings');
    if (savedSettings) {
      try {
        setWebhookSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error parsing saved webhook settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('webhookSettings', JSON.stringify(webhookSettings));
    
    // Update the chat widget's webhook URL when it changes
    try {
      const chatWidget = document.querySelector('n8n-chat');
      if (chatWidget && webhookSettings.url) {
        // @ts-ignore - The webhookUrl property exists on the n8n-chat custom element
        chatWidget.webhookUrl = webhookSettings.url;
      }
    } catch (e) {
      console.error('Error updating chat widget webhook URL:', e);
    }
  }, [webhookSettings]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-2xl font-bold mb-2">Course Documents</h1>
        <p className="text-muted-foreground mb-6">
          Upload and manage your course PDFs
        </p>
        
        <Dashboard webhookSettings={webhookSettings} />
      </main>
    </div>
  );
};

export default Index;

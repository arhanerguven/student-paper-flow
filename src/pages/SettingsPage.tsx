
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Settings from '@/components/Settings';
import { WebhookSettings } from '@/lib/types';

export default function SettingsPage() {
  const DEFAULT_WEBHOOK_URL = 'https://n8n-sjzi.onrender.com/webhook/fc9c7042-c726-4598-b39e-c5abf67fced6/chat';
  const [webhookSettings, setWebhookSettings] = useState<WebhookSettings>({
    url: DEFAULT_WEBHOOK_URL,
    enabled: true
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
    } else {
      // If no settings found, save the default ones
      localStorage.setItem('webhookSettings', JSON.stringify(webhookSettings));
    }
  }, []);

  const handleSaveWebhook = (settings: WebhookSettings) => {
    setWebhookSettings(settings);
    localStorage.setItem('webhookSettings', JSON.stringify(settings));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <Settings 
            webhookSettings={webhookSettings} 
            onSaveWebhook={handleSaveWebhook} 
          />
        </div>
      </main>
    </div>
  );
}

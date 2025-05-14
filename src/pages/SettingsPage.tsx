
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Settings from '@/components/Settings';
import { WebhookSettings } from '@/lib/types';

export default function SettingsPage() {
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

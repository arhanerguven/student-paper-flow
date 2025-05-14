
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WebhookSettings } from '@/lib/types';
import { toast } from 'sonner';

interface SettingsProps {
  webhookSettings: WebhookSettings;
  onSaveWebhook: (settings: WebhookSettings) => void;
}

export default function Settings({ webhookSettings, onSaveWebhook }: SettingsProps) {
  const DEFAULT_WEBHOOK_URL = 'https://n8n-sjzi.onrender.com/webhook/fc9c7042-c726-4598-b39e-c5abf67fced6/chat';
  const [url, setUrl] = useState(webhookSettings.url || DEFAULT_WEBHOOK_URL);
  const [enabled, setEnabled] = useState(webhookSettings.enabled);
  const [isSaving, setIsSaving] = useState(false);

  // Set default webhook URL if none is provided
  useEffect(() => {
    if (!webhookSettings.url && !url) {
      setUrl(DEFAULT_WEBHOOK_URL);
    }
  }, [webhookSettings.url, url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      onSaveWebhook({ url, enabled });
      toast.success('Webhook settings saved');
      setIsSaving(false);
    }, 500);
  };

  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const isFormValid = enabled ? isValidUrl(url) : true;

  return (
    <form onSubmit={handleSubmit}>
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>n8n Webhook Settings</CardTitle>
          <CardDescription>
            Configure the n8n webhook that will be triggered when a new document is uploaded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://n8n-sjzi.onrender.com/webhook/fc9c7042-c726-4598-b39e-c5abf67fced6/chat"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter the full URL of your n8n webhook endpoint
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="webhook-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor="webhook-enabled">Enable webhook processing</Label>
          </div>
          
          {enabled && !isValidUrl(url) && (
            <p className="text-sm text-destructive">
              Please enter a valid URL
            </p>
          )}
          
          <Button 
            type="submit"
            className="w-full"
            disabled={!isFormValid || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

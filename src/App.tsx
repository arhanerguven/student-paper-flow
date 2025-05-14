
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import N8nChat from "./components/N8nChat";
import { WebhookSettings } from "@/lib/types";

const queryClient = new QueryClient();

const App = () => {
  const [webhookSettings, setWebhookSettings] = useState<WebhookSettings>({
    url: '',
    enabled: false
  });

  // Load webhook settings from localStorage on mount
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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        {webhookSettings.enabled && webhookSettings.url && (
          <N8nChat webhookUrl={webhookSettings.url} />
        )}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;


export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  url: string; // URL from Supabase storage
  storageKey?: string; // Storage path in Supabase
}

export interface WebhookSettings {
  url: string;
  enabled: boolean;
}

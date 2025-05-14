
export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  url?: string;
}

export interface WebhookSettings {
  url: string;
  enabled: boolean;
}


export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSettings {
  openaiApiKey: string;
  pineconeApiKey: string;
  pineconeEnvironment: string;
  pineconeIndexName: string;
}

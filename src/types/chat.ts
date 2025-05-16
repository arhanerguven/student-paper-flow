
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSettings {
  pineconeEnvironment: string;
  pineconeIndexName: string;
}

export interface ApiChatMessage {
  role: string;
  content: string;
}

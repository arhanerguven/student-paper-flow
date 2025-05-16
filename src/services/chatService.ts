
import { Message } from '@/types/chat';

export interface ChatSettings {
  openaiApiKey: string;
  pineconeApiKey: string;
  pineconeEnvironment: string;
  pineconeIndexName: string;
}

export interface ChatResponse {
  response: string;
  chat_history: Array<{ role: string; content: string }>;
}

export const sendChatMessage = async (
  message: string,
  chatHistory: Message[],
  chatSettings: ChatSettings,
  keysAvailable: boolean
): Promise<string> => {
  // Prepare the request body based on whether server-side keys are available
  let requestBody = {};
  
  if (keysAvailable) {
    // When using server-side keys, we still need to include environment and index
    requestBody = {
      message: message.trim(),
      chat_history: chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      pinecone_environment: chatSettings.pineconeEnvironment,
      pinecone_index_name: chatSettings.pineconeIndexName
    };
  } else {
    // When using client-side keys, include all API keys
    requestBody = {
      message: message.trim(),
      openai_api_key: chatSettings.openaiApiKey,
      pinecone_api_key: chatSettings.pineconeApiKey,
      pinecone_environment: chatSettings.pineconeEnvironment,
      pinecone_index_name: chatSettings.pineconeIndexName,
      chat_history: chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    };
  }

  // Call the external API
  const response = await fetch('https://example-77lt.onrender.com/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  // Handle non-OK responses
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error ${response.status}: ${JSON.stringify(errorData.detail || response.statusText)}`);
  }

  // Parse and return the response
  const data: ChatResponse = await response.json();
  return data.response;
};

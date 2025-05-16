
import { Message, ChatSettings, ApiChatMessage } from '@/types/chat';

export interface ChatResponse {
  response: string;
  chat_history: ApiChatMessage[];
}

export const sendChatMessage = async (
  message: string,
  chatHistory: Message[],
  chatSettings: ChatSettings,
  keysAvailable: boolean
): Promise<string> => {
  try {
    console.log("Sending chat message with keysAvailable:", keysAvailable);
    
    if (!keysAvailable) {
      throw new Error("Server API keys are not available.");
    }
    
    const requestBody: Record<string, any> = {
      message: message.trim(),
      chat_history: chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      pinecone_index_name: chatSettings.pineconeIndexName
    };
    
    console.log("Sending request to chat API", { 
      url: 'https://example-77lt.onrender.com/chat',
      bodyKeys: Object.keys(requestBody) 
    });

    // Call the external API
    const response = await fetch('https://example-77lt.onrender.com/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    console.log("Received response", { 
      status: response.status, 
      ok: response.ok 
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.error("Could not parse error response as JSON:", errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const errorMessage = errorData.detail || errorData.error || response.statusText;
      console.error("API error details:", errorData);
      throw new Error(`Error ${response.status}: ${errorMessage}`);
    }

    // Parse and return the response
    const data: ChatResponse = await response.json();
    return data.response;
  } catch (error) {
    console.error("Chat service error:", error);
    throw error;
  }
};

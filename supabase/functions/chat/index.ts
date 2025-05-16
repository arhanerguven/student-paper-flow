
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Chat function called");
    
    // Get API keys from environment variables
    const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');
    const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY');
    const PINECONE_ENVIRONMENT = Deno.env.get('PINECONE_ENVIRONMENT');
    const PINECONE_INDEX_NAME = Deno.env.get('PINECONE_INDEX_NAME');
    
    // Validate required keys
    if (!OPENAI_KEY) {
      console.error("Missing OpenAI API key in server environment");
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured on server' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!PINECONE_API_KEY) {
      console.error("Missing Pinecone API key in server environment");
      return new Response(
        JSON.stringify({ error: 'Pinecone API key not configured on server' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!PINECONE_ENVIRONMENT) {
      console.error("Missing Pinecone environment in server environment");
      return new Response(
        JSON.stringify({ error: 'Pinecone environment not configured on server' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!PINECONE_INDEX_NAME) {
      console.error("Missing Pinecone index name in server environment");
      return new Response(
        JSON.stringify({ error: 'Pinecone index name not configured on server' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get request data
    const requestData = await req.json();
    const { message, chat_history = [] } = requestData;
    
    console.log("Request validation passed, calling OpenAI");
    
    // Format messages for OpenAI
    const messages = [
      ...chat_history,
      { role: "user", content: message }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ error: 'OpenAI API error', detail: errorData }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;
    
    console.log("Successfully received response from OpenAI");
    
    // Update chat history with both user message and assistant response
    const updatedChatHistory = [
      ...chat_history,
      { role: "user", content: message },
      { role: "assistant", content: assistantResponse }
    ];

    return new Response(
      JSON.stringify({ 
        response: assistantResponse, 
        chat_history: updatedChatHistory 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

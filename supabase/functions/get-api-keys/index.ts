
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API keys from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const pineconeApiKey = Deno.env.get('PINECONE_API_KEY');
    const pineconeEnvironment = Deno.env.get('PINECONE_ENVIRONMENT');
    const pineconeIndexName = Deno.env.get('PINECONE_INDEX_NAME');
    
    // Check if all required keys are available
    if (!openaiApiKey || !pineconeApiKey || !pineconeEnvironment || !pineconeIndexName) {
      const missingKeys = [];
      if (!openaiApiKey) missingKeys.push('OPENAI_API_KEY');
      if (!pineconeApiKey) missingKeys.push('PINECONE_API_KEY');
      if (!pineconeEnvironment) missingKeys.push('PINECONE_ENVIRONMENT');
      if (!pineconeIndexName) missingKeys.push('PINECONE_INDEX_NAME');
      
      return new Response(
        JSON.stringify({ 
          error: `Missing API keys: ${missingKeys.join(', ')}`,
          keysAvailable: false
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Return success response with available keys
    return new Response(
      JSON.stringify({ 
        keysAvailable: true,
        pineconeEnvironment,
        pineconeIndexName
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in get-api-keys function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message, keysAvailable: false }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

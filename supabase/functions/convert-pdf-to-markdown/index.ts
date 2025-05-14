
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
    const { pdfUrl, fileName } = await req.json();
    
    if (!pdfUrl) {
      return new Response(
        JSON.stringify({ error: 'PDF URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing PDF: ${fileName}`);

    // Extract text directly with Mistral API
    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
    if (!mistralApiKey) {
      throw new Error('Mistral API key is not configured');
    }

    // Call Mistral API for OCR and conversion
    const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mistralApiKey}`,
      },
      body: JSON.stringify({
        model: 'open-mistral-7b',
        messages: [
          {
            role: 'system',
            content: 'You are a PDF to Markdown converter. Extract all text content from the provided PDF and format it in clean Markdown format. Focus on preserving headings, lists, tables, and paragraphs structure.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Convert this PDF to well-formatted Markdown. Preserve the document structure.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: pdfUrl
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    if (!mistralResponse.ok) {
      const errorData = await mistralResponse.text();
      console.error('Mistral API error:', errorData);
      throw new Error(`Mistral API error: ${mistralResponse.statusText}`);
    }

    const result = await mistralResponse.json();
    const markdownContent = result.choices[0].message.content;
    
    return new Response(
      JSON.stringify({ 
        markdown: markdownContent,
        fileName: fileName.replace('.pdf', '.md')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in convert-pdf-to-markdown function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

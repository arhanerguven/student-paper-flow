
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MistralClient } from "npm:@mistralai/mistralai";

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

    // Get Mistral API key
    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
    if (!mistralApiKey) {
      throw new Error('Mistral API key is not configured');
    }

    // Initialize Mistral client - using MistralClient instead of Mistral
    const client = new MistralClient(mistralApiKey);

    // Process the PDF document using OCR
    const ocrResponse = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: pdfUrl
      },
      includeImageBase64: false
    });

    // Convert the extracted text to Markdown format
    const chatResponse = await client.chatCompletions.create({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: "You are a PDF to Markdown converter. Convert the extracted text from a PDF into well-formatted Markdown, preserving headings, lists, tables, and paragraph structure."
        },
        {
          role: "user",
          content: `Convert this extracted text from a PDF document into clean, well-formatted Markdown:\n\n${ocrResponse.text}`
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    });

    const markdownContent = chatResponse.choices[0].message.content;
    
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

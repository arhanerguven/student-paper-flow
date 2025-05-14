
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Mistral } from "npm:@mistralai/mistralai";

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
    console.log(`PDF URL: ${pdfUrl}`);

    // Get Mistral API key
    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
    if (!mistralApiKey) {
      throw new Error('Mistral API key is not configured');
    }

    // Initialize Mistral client using the correct import and initialization
    const client = new Mistral({apiKey: mistralApiKey});

    // Process the PDF document using OCR only
    const ocrResponse = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: pdfUrl
      },
      includeImageBase64: false // Set to true if you want the base64 images
    });
    
    // Log the response structure to help debug
    console.log("OCR Response structure:", Object.keys(ocrResponse));
    
    if (!ocrResponse.text && ocrResponse.pages) {
      // If text is empty but pages exist, try to extract from pages
      console.log("Text property empty, trying to extract from pages");
      const extractedText = ocrResponse.pages.map(page => 
        page.markdown || page.text || ""
      ).join("\n\n");
      
      return new Response(
        JSON.stringify({ 
          text: extractedText,
          fileName: fileName.replace('.pdf', '.txt')
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        text: ocrResponse.text || "No text could be extracted from this PDF",
        fileName: fileName.replace('.pdf', '.txt')
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

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VisualData {
  title: string;
  subtitle: string;
  cta: string;
  backgroundImage: string;
  logo: string;
  style?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const getHtmlTemplate = (data: VisualData): string => {
  const primaryColor = data.colors?.primary || '#FFD600';
  const secondaryColor = data.colors?.secondary || '#1a4c7a';
  const accentColor = data.colors?.accent || '#ff6b9d';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1080, initial-scale=1.0" />
  <style>
    * {
      margin: 0;
      padding: 0;
      font-family: "Cormorant Garamond", "Arial", sans-serif;
    }
    body {
      width: 1080px;
      height: 1920px;
      position: relative;
      background-size: cover;
      background-position: center;
      background-image: url('${data.backgroundImage}');
    }

    .overlay {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(26, 76, 122, 0.4) 0%, rgba(212, 175, 55, 0.3) 100%);
      position: absolute;
      top: 0;
      left: 0;
    }

    .logo {
      position: absolute;
      top: 60px;
      left: 60px;
      height: 120px;
      max-width: 300px;
      object-fit: contain;
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
    }

    .content {
      position: absolute;
      top: 35%;
      width: 100%;
      text-align: center;
      color: white;
      padding: 0 80px;
    }

    h1 {
      font-size: 84px;
      font-weight: bold;
      text-shadow: 3px 3px 6px rgba(0,0,0,0.7);
      line-height: 1.1;
      margin-bottom: 30px;
      background: linear-gradient(45deg, ${primaryColor}, ${accentColor});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    h2 {
      font-size: 48px;
      margin-top: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
      font-weight: 400;
      color: white;
      margin-bottom: 60px;
    }

    .cta {
      margin-top: 80px;
      font-size: 42px;
      background: linear-gradient(45deg, ${primaryColor}, ${accentColor});
      color: ${data.style === 'naturel' ? '#2d4a2b' : '#000'};
      display: inline-block;
      padding: 25px 50px;
      border-radius: 60px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      border: 3px solid rgba(255,255,255,0.3);
      transition: all 0.3s ease;
    }

    .decorative-element {
      position: absolute;
      top: 20%;
      right: 5%;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, ${primaryColor}40, transparent);
      border-radius: 50%;
      opacity: 0.6;
    }

    .bottom-decoration {
      position: absolute;
      bottom: 10%;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, transparent, ${primaryColor}, ${accentColor}, transparent);
    }
  </style>
</head>
<body>
  <div class="overlay"></div>
  <img class="logo" src="${data.logo}" />
  <div class="decorative-element"></div>
  <div class="content">
    <h1>${data.title}</h1>
    <h2>${data.subtitle}</h2>
    <div class="cta">${data.cta}</div>
  </div>
  <div class="bottom-decoration"></div>
</body>
</html>`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎨 Visual Renderer called');
    
    const { visualData } = await req.json();
    console.log('📋 Visual data received:', {
      title: visualData?.title || 'No title',
      subtitle: visualData?.subtitle || 'No subtitle',
      hasBackground: !!visualData?.backgroundImage,
      hasLogo: !!visualData?.logo
    });

    if (!visualData) {
      throw new Error('Missing visual data');
    }

    // Generate HTML with the template
    const html = getHtmlTemplate(visualData);
    console.log('✅ HTML template generated');

    // For now, return the HTML content since we need to integrate actual Puppeteer
    // In production, this would use Puppeteer to generate the image
    const mockImageUrl = `data:text/html;base64,${btoa(html)}`;
    
    console.log('🖼️ Visual rendered successfully');

    return new Response(JSON.stringify({ 
      success: true,
      imageUrl: mockImageUrl,
      html: html,
      message: 'Visual HTML template generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in visual-renderer:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração do servidor em falta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL:', formattedUrl);

    // Step 1: Scrape the recipe page
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok || !scrapeData.success) {
      console.error('Firecrawl error:', scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: 'Não foi possível extrair o conteúdo da página' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = scrapeData.data?.markdown || scrapeData.markdown;
    if (!markdown) {
      return new Response(
        JSON.stringify({ success: false, error: 'Conteúdo vazio extraído da página' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraped content length:', markdown.length);

    // Step 2: Process with AI to extract and translate recipe
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração de IA em falta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Tu és um assistente especializado em receitas culinárias. A tua tarefa é extrair informação de receitas e traduzi-las para Português de Portugal (PT-PT, não Português do Brasil).

IMPORTANTE: Utiliza sempre Português de Portugal com as seguintes características:
- "cozinhar" em vez de "cozinhar" com sotaque brasileiro
- "frigorífico" em vez de "geladeira"
- "chávena" em vez de "xícara"
- "sumo" em vez de "suco"
- "pequeno-almoço" em vez de "café da manhã"
- "fiambre" em vez de "presunto"
- "natas" em vez de "creme de leite"
- "manteiga" em vez de "manteiga" (já é igual)
- Utiliza terminologia culinária portuguesa

Extrai a receita do texto fornecido e devolve um objeto JSON com a seguinte estrutura:
{
  "title": "Nome da receita em PT-PT",
  "description": "Breve descrição da receita em PT-PT",
  "servings": número de pessoas (número inteiro),
  "prepTime": "tempo de preparação (ex: '15 min')",
  "cookTime": "tempo de cozedura (ex: '30 min')",
  "ingredients": [
    {"name": "nome do ingrediente em PT-PT", "quantity": número, "unit": "unidade em PT-PT"}
  ],
  "instructions": ["passo 1 em PT-PT", "passo 2 em PT-PT", ...]
}

Para os ingredientes, extrai sempre a quantidade como número (ex: 2, 0.5, 1.5) e a unidade separadamente (ex: "colheres de sopa", "g", "ml", "unidade").
Se a quantidade não for clara, utiliza 1 como valor predefinido.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extrai e traduz esta receita para Português de Portugal:\n\n${markdown.substring(0, 15000)}` }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_recipe',
              description: 'Extrai os dados estruturados da receita',
              parameters: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  servings: { type: 'number' },
                  prepTime: { type: 'string' },
                  cookTime: { type: 'string' },
                  ingredients: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        quantity: { type: 'number' },
                        unit: { type: 'string' }
                      },
                      required: ['name', 'quantity', 'unit']
                    }
                  },
                  instructions: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                },
                required: ['title', 'servings', 'ingredients', 'instructions']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_recipe' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Limite de pedidos excedido. Tente novamente mais tarde.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Créditos de IA esgotados.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao processar receita com IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Extract the recipe from the tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'extract_recipe') {
      console.error('No valid tool call in AI response');
      return new Response(
        JSON.stringify({ success: false, error: 'Não foi possível extrair a receita do conteúdo' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipe = JSON.parse(toolCall.function.arguments);
    console.log('Recipe extracted:', recipe.title);

    return new Response(
      JSON.stringify({ success: true, recipe }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-recipe:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

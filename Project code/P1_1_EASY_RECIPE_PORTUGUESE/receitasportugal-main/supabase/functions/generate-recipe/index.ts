import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function getCorsHeaders(req: Request) {
  // Echo requested headers so browsers don't block the call when supabase-js adds
  // extra headers (e.g. x-supabase-client-platform).
  const requested = req.headers.get('Access-Control-Request-Headers');

  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      requested || 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
  } as const;
}

type RecipeIngredient = {
  name: string;
  quantity: number;
  unit: string;
};

type ExtractedRecipe = {
  title: string;
  description?: string;
  servings: number;
  prepTime?: string;
  cookTime?: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  sourceUrl?: string | null;
};

function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function normalizeRecipe(candidate: any): ExtractedRecipe | null {
  if (!candidate || typeof candidate !== 'object') return null;
  if (typeof candidate.title !== 'string' || !candidate.title.trim()) return null;
  if (typeof candidate.servings !== 'number' || !Number.isFinite(candidate.servings)) return null;
  if (!Array.isArray(candidate.ingredients) || candidate.ingredients.length === 0) return null;
  if (!Array.isArray(candidate.instructions) || candidate.instructions.length === 0) return null;

  const ingredients: RecipeIngredient[] = candidate.ingredients
    .filter((i: any) => i && typeof i === 'object')
    .map((i: any) => ({
      name: String(i.name ?? '').trim(),
      quantity: Number(i.quantity ?? 0),
      unit: String(i.unit ?? '').trim(),
    }))
    .filter((i: RecipeIngredient) => i.name && Number.isFinite(i.quantity) && i.unit);

  if (ingredients.length === 0) return null;

  const instructions = candidate.instructions
    .map((s: any) => String(s ?? '').trim())
    .filter(Boolean);
  if (instructions.length === 0) return null;

  const recipe: ExtractedRecipe = {
    title: candidate.title.trim(),
    servings: candidate.servings,
    ingredients,
    instructions,
  };

  if (typeof candidate.description === 'string' && candidate.description.trim()) {
    recipe.description = candidate.description.trim();
  }
  if (typeof candidate.prepTime === 'string' && candidate.prepTime.trim()) {
    recipe.prepTime = candidate.prepTime.trim();
  }
  if (typeof candidate.cookTime === 'string' && candidate.cookTime.trim()) {
    recipe.cookTime = candidate.cookTime.trim();
  }

  return recipe;
}

function extractRecipeFromAiResponse(aiData: any): ExtractedRecipe | null {
  const msg = aiData?.choices?.[0]?.message;
  if (!msg) return null;

  // 1) Preferred: tool_calls (OpenAI-compatible)
  const toolCall = msg?.tool_calls?.[0];
  const fnName = toolCall?.function?.name;
  const fnArgs = toolCall?.function?.arguments;
  if (fnName === 'extract_recipe' && typeof fnArgs === 'string') {
    const parsed = safeJsonParse(fnArgs);
    return normalizeRecipe(parsed);
  }

  // 2) Some gateways/models still return function_call
  const fc = msg?.function_call;
  if (fc?.name === 'extract_recipe' && typeof fc?.arguments === 'string') {
    const parsed = safeJsonParse(fc.arguments);
    return normalizeRecipe(parsed);
  }

  // 3) Fallback: content contains JSON
  if (typeof msg?.content === 'string') {
    const parsed = safeJsonParse(msg.content);
    return normalizeRecipe(parsed);
  }

  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  try {
    const body = await req.json();
    const idea = typeof body?.idea === 'string' ? body.idea : '';

    if (!idea.trim() || idea.trim().length > 120) {
      return new Response(
        JSON.stringify({ success: false, error: 'Ideia de receita é obrigatória' }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching recipes for:', idea);

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração do servidor em falta' }),
        { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Search and scrape in one call
    const searchQuery = `receita ${idea}`;
    console.log('Searching web for:', searchQuery);

    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 3,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true,
        },
      }),
    });

    const searchData = await searchResponse.json();
    console.log('Search response status:', searchResponse.status);

    if (!searchResponse.ok) {
      console.error('Firecrawl search error:', JSON.stringify(searchData));
      return new Response(
        JSON.stringify({ success: false, error: 'Não foi possível pesquisar receitas: ' + (searchData.error || searchResponse.status) }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    const results = searchData.data || [];
    console.log('Found results:', results.length);

    if (results.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nenhuma receita encontrada para esta pesquisa' }),
        { status: 404, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // Find the best result with content
    let bestResult = null;
    for (const result of results) {
      if (result.markdown && result.markdown.length > 200) {
        bestResult = result;
        console.log('Using result from:', result.url);
        break;
      }
    }

    if (!bestResult) {
      // Use whatever we have
      bestResult = results[0];
      console.log('Using first result:', bestResult?.url);
    }

    if (!bestResult?.markdown) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nenhuma receita com conteúdo encontrada' }),
        { status: 404, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    console.log('Content length:', bestResult.markdown.length);

    // Step 2: Process with AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração de IA em falta' }),
        { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    const baseSystemPrompt = `Extrai a receita do texto e traduz para Português de Portugal (PT-PT, não brasileiro).
Usa: frigorífico, chávena, sumo, natas, coentros, pimento, courgette, lume, tacho.
Devolve JSON estruturado.`;

    const strictSystemPrompt = `${baseSystemPrompt}
Responde EXCLUSIVAMENTE usando a ferramenta extract_recipe. Não escrevas texto fora da ferramenta.`;

    const markdownSnippet = bestResult.markdown.substring(0, 8000);

    const tools = [
      {
        type: 'function',
        function: {
          name: 'extract_recipe',
          description: 'Extrai receita',
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
              instructions: { type: 'array', items: { type: 'string' } }
            },
            required: ['title', 'servings', 'ingredients', 'instructions']
          }
        }
      }
    ];

    let recipe: ExtractedRecipe | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      console.log('Calling AI gateway... attempt', attempt + 1);

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          temperature: 0,
          messages: [
            { role: 'system', content: attempt === 0 ? baseSystemPrompt : strictSystemPrompt },
            { role: 'user', content: `Extrai e traduz esta receita para PT-PT:\n\n${markdownSnippet}` }
          ],
          tools,
          tool_choice: { type: 'function', function: { name: 'extract_recipe' } }
        }),
      });

      console.log('AI response status:', aiResponse.status);

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI gateway error:', errorText);

        if (aiResponse.status === 429) {
          return new Response(
            JSON.stringify({ success: false, error: 'Limite de pedidos excedido. Tente novamente mais tarde.' }),
            { status: 429, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
          );
        }
        if (aiResponse.status === 402) {
          return new Response(
            JSON.stringify({ success: false, error: 'Créditos de IA esgotados.' }),
            { status: 402, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao processar receita' }),
          { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
        );
      }

      const aiData = await aiResponse.json();
      recipe = extractRecipeFromAiResponse(aiData);
      if (recipe) break;

      console.warn('AI did not return a valid extract_recipe tool call; retrying with stricter prompt.');
      // Small debug (avoid huge logs)
      try {
        const msg = aiData?.choices?.[0]?.message;
        console.warn('AI message keys:', msg ? Object.keys(msg) : 'no_message');
      } catch {
        // ignore
      }
    }

    if (!recipe) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não foi possível extrair a receita' }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    recipe.sourceUrl = bestResult.url || null;
    console.log('Recipe extracted:', recipe.title);

    return new Response(
      JSON.stringify({ success: true, recipe }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import Header from '@/components/Header';
import RecipeSearch from '@/components/RecipeSearch';
import RecipeCard, { Recipe } from '@/components/RecipeCard';
import SavedRecipes from '@/components/SavedRecipes';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [refreshSaved, setRefreshSaved] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session?.user) {
        navigate('/auth');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSaveRecipe = useCallback(async (recipeToSave: Recipe) => {
    if (!user) return;

    const { error } = await supabase.from('recipes').insert([
      {
        user_id: user.id,
        title: recipeToSave.title,
        description: recipeToSave.description ?? null,
        servings: recipeToSave.servings,
        prep_time: recipeToSave.prepTime ?? null,
        cook_time: recipeToSave.cookTime ?? null,
        ingredients: recipeToSave.ingredients as any,
        instructions: recipeToSave.instructions,
        source_url: recipeToSave.sourceUrl ?? null,
      },
    ]);

    if (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: 'Erro ao guardar',
        description: 'Não foi possível guardar a receita. Tente novamente.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Receita guardada!',
        description: 'A receita foi adicionada à sua coleção.',
      });
      setRecipe(null);
      setRefreshSaved((c) => c + 1);
    }
  }, [user, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            Bem-vindo à sua cozinha digital
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Pesquisamos receitas na internet e traduzimos automaticamente
            para Português de Portugal, com calculadora de ingredientes.
          </p>
        </div>

        <RecipeSearch onRecipeFound={setRecipe} />

        {recipe && (
          <div className="max-w-2xl mx-auto">
            <RecipeCard recipe={recipe} onSave={handleSaveRecipe} />
          </div>
        )}

        {!recipe && (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
              <span className="text-4xl">🍳</span>
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">
              Nenhuma receita ainda
            </h3>
            <p className="text-muted-foreground">
              Pesquise uma receita acima para começar a cozinhar!
            </p>
          </div>
        )}

        <SavedRecipes refreshTrigger={refreshSaved} />
      </main>
    </div>
  );
};

export default Index;

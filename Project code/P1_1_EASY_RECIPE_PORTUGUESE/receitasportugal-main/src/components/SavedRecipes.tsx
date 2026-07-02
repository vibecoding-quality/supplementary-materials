import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RecipeCard, { Recipe } from './RecipeCard';
import { BookOpen, Loader2 } from 'lucide-react';

interface SavedRecipesProps {
  refreshTrigger?: number;
  onDelete?: () => void;
}

const SavedRecipes = ({ refreshTrigger, onDelete }: SavedRecipesProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as receitas guardadas.',
        variant: 'destructive',
      });
    } else {
      const mapped: Recipe[] = (data || []).map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description ?? undefined,
        servings: r.servings,
        prepTime: r.prep_time ?? undefined,
        cookTime: r.cook_time ?? undefined,
        ingredients: (r.ingredients as any[]) || [],
        instructions: r.instructions || [],
        sourceUrl: r.source_url ?? undefined,
      }));
      setRecipes(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecipes();
  }, [refreshTrigger]);

  const handleDelete = async (recipeId: string) => {
    const { error } = await supabase.from('recipes').delete().eq('id', recipeId);
    if (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a receita.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Receita removida',
        description: 'A receita foi removida da sua coleção.',
      });
      setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      onDelete?.();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (recipes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-display font-semibold text-foreground">
          A minha coleção ({recipes.length})
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isSaved
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default SavedRecipes;

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RecipeSearchProps {
  onRecipeFound: (recipe: any) => void;
}

const RecipeSearch = ({ onRecipeFound }: RecipeSearchProps) => {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idea.trim()) {
      toast({
        title: 'Ideia em falta',
        description: 'Por favor, descreva a receita que deseja.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: { idea: idea.trim() },
      });

      if (error) {
        throw error;
      }

      if (data.success && data.recipe) {
        onRecipeFound(data.recipe);
        toast({
          title: 'Receita criada!',
          description: 'A sua receita foi gerada com sucesso.',
        });
      } else {
        throw new Error(data.error || 'Não foi possível gerar a receita.');
      }
    } catch (error: any) {
      console.error('Error generating recipe:', error);
      toast({
        title: 'Erro ao gerar receita',
        description: error.message || 'Não foi possível gerar a receita. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Bacalhau à Brás',
    'Frango assado com batatas',
    'Arroz de marisco',
    'Caldo verde',
  ];

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleGenerate} className="recipe-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Pesquisar Receita
            </h2>
            <p className="text-sm text-muted-foreground">
              Pesquisamos na internet e traduzimos para Português de Portugal
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Ex: prato de peixe grelhado com legumes..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-warm hover:opacity-90 transition-opacity min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                A criar...
              </>
            ) : (
              'Criar'
            )}
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-sm text-muted-foreground">Sugestões:</span>
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="secondary"
            size="sm"
            onClick={() => setIdea(suggestion)}
            disabled={loading}
            className="text-xs"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RecipeSearch;

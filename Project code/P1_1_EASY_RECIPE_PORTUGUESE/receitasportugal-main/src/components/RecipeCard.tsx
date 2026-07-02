import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Users, Clock, ChefHat, UtensilsCrossed, ScrollText, ExternalLink, Bookmark, Trash2, Loader2 } from 'lucide-react';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id?: string;
  title: string;
  description?: string;
  servings: number;
  prepTime?: string;
  cookTime?: string;
  ingredients: Ingredient[];
  instructions: string[];
  sourceUrl?: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  isSaved?: boolean;
  onSave?: (recipe: Recipe) => Promise<void>;
  onDelete?: (recipeId: string) => Promise<void>;
}

const RecipeCard = ({ recipe, isSaved = false, onSave, onDelete }: RecipeCardProps) => {
  const [guests, setGuests] = useState(recipe.servings || 4);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ratio = guests / (recipe.servings || 4);

  const formatQuantity = (quantity: number) => {
    const adjusted = quantity * ratio;
    if (adjusted === Math.floor(adjusted)) {
      return adjusted.toString();
    }
    return adjusted.toFixed(1).replace(/\.0$/, '');
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(recipe);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !recipe.id) return;
    setDeleting(true);
    try {
      await onDelete(recipe.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="recipe-card animate-fade-in">
      {/* Header */}
      <div className="p-6 bg-gradient-warm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold text-primary-foreground mb-2">
              {recipe.title}
            </h2>
            {recipe.description && (
              <p className="text-primary-foreground/80 text-sm">
                {recipe.description}
              </p>
            )}
          </div>
          {/* Save/Delete button */}
          {isSaved && onDelete ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
              className="shrink-0 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              title="Remover da coleção"
            >
              {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            </Button>
          ) : onSave ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              disabled={saving}
              className="shrink-0 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              title="Guardar na coleção"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bookmark className="w-5 h-5" />}
            </Button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          {recipe.prepTime && (
            <div className="flex items-center gap-2 text-primary-foreground/90 text-sm">
              <Clock className="w-4 h-4" />
              <span>Prep: {recipe.prepTime}</span>
            </div>
          )}
          {recipe.cookTime && (
            <div className="flex items-center gap-2 text-primary-foreground/90 text-sm">
              <ChefHat className="w-4 h-4" />
              <span>Cozinhar: {recipe.cookTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Guest Slider */}
      <div className="p-6 bg-secondary/30">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <Label className="text-foreground font-medium">
            Número de pessoas: <span className="text-primary font-bold">{guests}</span>
          </Label>
        </div>
        <Slider
          value={[guests]}
          onValueChange={(value) => setGuests(value[0])}
          min={1}
          max={20}
          step={1}
          className="guest-slider"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>1 pessoa</span>
          <span>20 pessoas</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Ingredients */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <UtensilsCrossed className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-display font-semibold text-foreground">
              Ingredientes
            </h3>
          </div>
          <div className="grid gap-2">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-item animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                <span className="font-semibold text-primary min-w-[60px]">
                  {formatQuantity(ingredient.quantity)} {ingredient.unit}
                </span>
                <span className="text-foreground">{ingredient.name}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Instructions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ScrollText className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-display font-semibold text-foreground">
              Modo de Preparação
            </h3>
          </div>
          <div className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-4 animate-slide-in" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="step-number shrink-0">
                  {index + 1}
                </div>
                <p className="text-foreground leading-relaxed pt-1">
                  {instruction}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Source URL */}
        {recipe.sourceUrl && (
          <>
            <Separator />
            <div className="flex items-center justify-center">
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ver receita original
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;

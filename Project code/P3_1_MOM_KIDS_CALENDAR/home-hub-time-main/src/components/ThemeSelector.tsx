import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Palette, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const themes = [
  { id: "default", name: "Vaikimisi", colors: ["hsl(12,76%,61%)", "hsl(35,80%,60%)"], emoji: "🌟", icon: "⭐" },
  { id: "ocean", name: "Ookean", colors: ["hsl(200,85%,50%)", "hsl(180,70%,55%)"], emoji: "🌊", icon: "🐬" },
  { id: "forest", name: "Mets", colors: ["hsl(145,55%,45%)", "hsl(120,45%,50%)"], emoji: "🌲", icon: "🦊" },
  { id: "sunset", name: "Päikeseloojang", colors: ["hsl(25,90%,55%)", "hsl(350,75%,60%)"], emoji: "🌅", icon: "☀️" },
  { id: "galaxy", name: "Galaktika", colors: ["hsl(270,70%,55%)", "hsl(320,65%,55%)"], emoji: "🚀", icon: "🌌" },
  { id: "berry", name: "Marjad", colors: ["hsl(330,70%,55%)", "hsl(280,60%,55%)"], emoji: "🫐", icon: "🍇" },
  { id: "spiderman", name: "Ämblik-kangelane", colors: ["hsl(0,80%,50%)", "hsl(210,90%,40%)"], emoji: "🕷️", icon: "🕸️" },
  { id: "disney", name: "Disney maagia", colors: ["hsl(280,80%,55%)", "hsl(45,100%,50%)"], emoji: "🏰", icon: "✨" },
  { id: "frozen", name: "Lumekuninganna", colors: ["hsl(200,90%,70%)", "hsl(220,80%,85%)"], emoji: "❄️", icon: "⛄" },
  { id: "kpop", name: "K-POP staar", colors: ["hsl(330,90%,60%)", "hsl(280,80%,65%)"], emoji: "💜", icon: "🎤" },
  { id: "anime", name: "Anime", colors: ["hsl(350,85%,55%)", "hsl(40,100%,50%)"], emoji: "🌸", icon: "⚔️" },
  { id: "football", name: "Jalgpall", colors: ["hsl(120,60%,40%)", "hsl(35,90%,45%)"], emoji: "⚽", icon: "🏆" },
  { id: "basketball", name: "Korvpall", colors: ["hsl(25,95%,55%)", "hsl(0,0%,15%)"], emoji: "🏀", icon: "🔥" },
  { id: "gaming", name: "Mängimine", colors: ["hsl(270,100%,50%)", "hsl(150,100%,45%)"], emoji: "🎮", icon: "👾" },
];

interface ThemeSelectorProps {
  userId: string;
  onThemeChange?: (theme: string) => void;
}

export const ThemeSelector = ({ userId, onThemeChange }: ThemeSelectorProps) => {
  const [currentTheme, setCurrentTheme] = useState("default");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTheme = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("theme")
        .eq("user_id", userId)
        .maybeSingle();

      if (data?.theme) {
        setCurrentTheme(data.theme);
        applyTheme(data.theme);
        onThemeChange?.(data.theme);
      }
    };

    fetchTheme();
  }, [userId, onThemeChange]);

  const applyTheme = (themeId: string) => {
    document.documentElement.className = document.documentElement.className
      .split(" ")
      .filter((c) => !c.startsWith("theme-"))
      .join(" ");

    if (themeId !== "default") {
      document.documentElement.classList.add(`theme-${themeId}`);
    }
  };

  const selectTheme = async (themeId: string) => {
    setLoading(true);
    
    // Apply immediately for instant feedback
    applyTheme(themeId);
    setCurrentTheme(themeId);
    onThemeChange?.(themeId);

    // Save to database
    const { error } = await supabase
      .from("profiles")
      .update({ theme: themeId as any })
      .eq("user_id", userId);

    setLoading(false);

    if (error) {
      toast({
        title: "Teema salvestamine ebaõnnestus",
        description: "Palun proovi uuesti",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Teema uuendatud! 🎨",
        description: `Nüüd kasutad ${themes.find(t => t.id === themeId)?.name} teemat`,
      });
      setOpen(false);
    }
  };

  const currentThemeData = themes.find((t) => t.id === currentTheme);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="w-5 h-5" />
          <span className="absolute -bottom-1 -right-1 text-sm">
            {currentThemeData?.emoji}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-primary" />
            Vali oma teema!
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 max-h-[60vh] overflow-y-auto pr-2">
          {themes.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => selectTheme(theme.id)}
                disabled={loading}
                className={`relative p-3 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 bg-card ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/30 shadow-lg"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {/* Large Theme Icon */}
                <div
                  className="w-full h-16 rounded-lg mb-2 flex items-center justify-center text-4xl shadow-inner"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors[0]} 0%, ${theme.colors[1]} 100%)`,
                  }}
                >
                  <span className="drop-shadow-lg">{theme.emoji}</span>
                </div>
                
                {/* Theme Name with decorative icons */}
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm">{theme.icon}</span>
                  <span className="font-semibold text-sm">{theme.name}</span>
                  <span className="text-sm">{theme.icon}</span>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Vali teema, mis teeb sulle naeratuse! {currentThemeData?.emoji}
        </p>
      </DialogContent>
    </Dialog>
  );
};

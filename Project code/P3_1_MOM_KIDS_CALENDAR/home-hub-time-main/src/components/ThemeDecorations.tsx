import spidermanBg from "@/assets/themes/spiderman-bg.jpg";
import disneyBg from "@/assets/themes/disney-bg.jpg";
import frozenBg from "@/assets/themes/frozen-bg.jpg";
import kpopBg from "@/assets/themes/kpop-bg.jpg";
import animeBg from "@/assets/themes/anime-bg.jpg";
import footballBg from "@/assets/themes/football-bg.jpg";
import basketballBg from "@/assets/themes/basketball-bg.jpg";
import gamingBg from "@/assets/themes/gaming-bg.jpg";
import oceanBg from "@/assets/themes/ocean-bg.jpg";
import forestBg from "@/assets/themes/forest-bg.jpg";
import sunsetBg from "@/assets/themes/sunset-bg.jpg";
import galaxyBg from "@/assets/themes/galaxy-bg.jpg";
import berryBg from "@/assets/themes/berry-bg.jpg";

interface ThemeDecorationsProps {
  theme: string;
}

const themeBackgrounds: Record<string, string> = {
  spiderman: spidermanBg,
  disney: disneyBg,
  frozen: frozenBg,
  kpop: kpopBg,
  anime: animeBg,
  football: footballBg,
  basketball: basketballBg,
  gaming: gamingBg,
  ocean: oceanBg,
  forest: forestBg,
  sunset: sunsetBg,
  galaxy: galaxyBg,
  berry: berryBg,
};

const themeNames: Record<string, string> = {
  ocean: "🌊 Ocean Adventure",
  forest: "🌲 Forest Explorer",
  sunset: "🌅 Sunset Dreams",
  galaxy: "🚀 Galaxy Explorer",
  berry: "🫐 Berry Sweet",
  spiderman: "🕷️ Spider-Hero Mode",
  disney: "🏰 Disney Magic",
  frozen: "❄️ Frozen Kingdom",
  kpop: "💜 K-POP Star",
  anime: "🌸 Anime World",
  football: "⚽ Football Champion",
  basketball: "🏀 Basketball Star",
  gaming: "🎮 Gaming Legend",
};

export const ThemeDecorations = ({ theme }: ThemeDecorationsProps) => {
  const backgroundImage = themeBackgrounds[theme];

  // Don't show background for default theme
  if (!backgroundImage || theme === "default") return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Full background image - much more visible now */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          opacity: 0.85,
        }}
      />
      {/* Very subtle gradient overlay - only at the very bottom for content readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, transparent 60%, hsl(var(--background) / 0.3) 85%, hsl(var(--background) / 0.5) 100%)',
        }}
      />
    </div>
  );
};

export const ThemeBanner = ({ theme }: ThemeDecorationsProps) => {
  if (theme === "default") return null;

  const themeName = themeNames[theme];
  if (!themeName) return null;

  const emoji = themeName.split(' ')[0];

  return (
    <div className="gradient-warm text-primary-foreground py-3 px-4 text-center font-bold flex items-center justify-center gap-3 shadow-xl">
      <span className="animate-bounce text-xl">{emoji}</span>
      <span className="tracking-wide text-base">{themeName.slice(themeName.indexOf(' ') + 1)}</span>
      <span className="animate-bounce text-xl" style={{ animationDelay: "0.15s" }}>{emoji}</span>
    </div>
  );
};

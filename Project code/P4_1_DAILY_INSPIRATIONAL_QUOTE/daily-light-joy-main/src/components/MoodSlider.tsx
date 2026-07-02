import { useState } from "react";

interface MoodSliderProps {
  onMoodSelect: (mood: number) => void;
}

export function MoodSlider({ onMoodSelect }: MoodSliderProps) {
  const [mood, setMood] = useState(5);
  const [hasSelected, setHasSelected] = useState(false);

  const handleSubmit = () => {
    setHasSelected(true);
    onMoodSelect(mood);
  };

  const getMoodEmoji = (value: number) => {
    if (value <= 2) return "😔";
    if (value <= 4) return "😐";
    if (value <= 6) return "🙂";
    if (value <= 8) return "😊";
    return "😄";
  };

  const getMoodLabel = (value: number) => {
    if (value <= 2) return "Struggling";
    if (value <= 4) return "Could be better";
    if (value <= 6) return "Okay";
    if (value <= 8) return "Good";
    return "Wonderful";
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-medium text-foreground">
          How do you feel today?
        </h2>
        <p className="text-sm text-muted-foreground">
          Rate your mood from 1 to 10
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>1</span>
          <span className="text-2xl transition-transform duration-200" style={{ transform: `scale(${1 + (mood / 20)})` }}>
            {getMoodEmoji(mood)}
          </span>
          <span>10</span>
        </div>

        <input
          type="range"
          min="1"
          max="10"
          value={mood}
          onChange={(e) => setMood(parseInt(e.target.value))}
          className="mood-slider"
        />

        <div className="text-center">
          <span className="text-3xl font-bold text-foreground">{mood}</span>
          <p className="text-sm text-muted-foreground mt-1">{getMoodLabel(mood)}</p>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={hasSelected}
        className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium
                   hover:opacity-90 transition-all duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-lg shadow-primary/20"
      >
        {hasSelected ? "Loading your inspiration..." : "Get Today's Inspiration"}
      </button>
    </div>
  );
}

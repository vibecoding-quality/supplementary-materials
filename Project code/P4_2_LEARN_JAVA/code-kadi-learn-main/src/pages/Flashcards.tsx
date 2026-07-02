import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GradientBackground } from '@/components/layout/GradientBackground';
import { Navbar } from '@/components/layout/Navbar';
import { Flashcard } from '@/components/flashcards/Flashcard';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ChevronLeft, ChevronRight, RotateCcw, Shuffle, Bookmark, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface FlashcardData {
  id: string;
  question: string;
  answer: string;
  code_example: string | null;
  difficulty: string;
  topic_id: string;
}

interface Topic {
  id: string;
  title: string;
}

interface SavedCard {
  flashcard_id: string;
  saved_for_later: boolean;
}

export default function Flashcards() {
  const { user, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>(searchParams.get('topic') || 'all');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState({ reviewed: 0, correct: 0 });
  const [savedCards, setSavedCards] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'all' | 'saved'>('all');

  useEffect(() => {
    if (user) {
      fetchTopics();
      fetchFlashcards();
      fetchSavedCards();
      startSession();
    }
  }, [user, selectedTopic]);

  useEffect(() => {
    // Reset index when switching view modes
    setCurrentIndex(0);
  }, [viewMode]);

  const startSession = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('study_sessions')
      .insert({
        user_id: user.id,
        topic_id: selectedTopic !== 'all' ? selectedTopic : null,
        session_type: 'flashcard'
      })
      .select('id')
      .single();
    
    if (data) {
      setSessionId(data.id);
    }
  };

  const fetchTopics = async () => {
    const { data } = await supabase
      .from('java_topics')
      .select('id, title')
      .order('order_index');
    
    if (data) {
      setTopics(data);
    }
  };

  const fetchFlashcards = async () => {
    setIsLoading(true);
    
    let query = supabase.from('flashcards').select('*');
    
    if (selectedTopic && selectedTopic !== 'all') {
      query = query.eq('topic_id', selectedTopic);
    }
    
    const { data } = await query;
    
    if (data) {
      setFlashcards(data);
      setCurrentIndex(0);
    }
    
    setIsLoading(false);
  };

  const fetchSavedCards = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('flashcard_progress')
      .select('flashcard_id, saved_for_later')
      .eq('user_id', user.id)
      .eq('saved_for_later', true);
    
    if (data) {
      setSavedCards(new Set(data.map(d => d.flashcard_id)));
    }
  };

  const handleTopicChange = (value: string) => {
    setSelectedTopic(value);
    if (value === 'all') {
      searchParams.delete('topic');
    } else {
      searchParams.set('topic', value);
    }
    setSearchParams(searchParams);
    setStats({ reviewed: 0, correct: 0 });
    setViewMode('all');
  };

  const handleToggleSave = async (flashcardId: string) => {
    if (!user) return;
    
    const isCurrentlySaved = savedCards.has(flashcardId);
    
    // Optimistic update
    const newSavedCards = new Set(savedCards);
    if (isCurrentlySaved) {
      newSavedCards.delete(flashcardId);
    } else {
      newSavedCards.add(flashcardId);
    }
    setSavedCards(newSavedCards);
    
    // Update database
    const { error } = await supabase.from('flashcard_progress').upsert({
      user_id: user.id,
      flashcard_id: flashcardId,
      saved_for_later: !isCurrentlySaved,
      times_reviewed: 0,
      times_correct: 0,
      mastery_level: 0
    }, {
      onConflict: 'user_id,flashcard_id'
    });
    
    if (error) {
      // Revert on error
      setSavedCards(savedCards);
      toast.error('Failed to save card');
    } else {
      toast.success(isCurrentlySaved ? 'Removed from saved' : 'Saved for later!');
    }
  };

  const handleCorrect = async () => {
    const displayCards = viewMode === 'saved' 
      ? flashcards.filter(f => savedCards.has(f.id))
      : flashcards;
    const currentCard = displayCards[currentIndex];
    
    // Update progress
    await supabase.from('flashcard_progress').upsert({
      user_id: user!.id,
      flashcard_id: currentCard.id,
      times_reviewed: 1,
      times_correct: 1,
      last_reviewed: new Date().toISOString(),
      mastery_level: 1
    }, {
      onConflict: 'user_id,flashcard_id'
    });

    setStats(prev => ({ 
      reviewed: prev.reviewed + 1, 
      correct: prev.correct + 1 
    }));

    goToNext();
  };

  const handleIncorrect = async () => {
    const displayCards = viewMode === 'saved' 
      ? flashcards.filter(f => savedCards.has(f.id))
      : flashcards;
    const currentCard = displayCards[currentIndex];
    
    await supabase.from('flashcard_progress').upsert({
      user_id: user!.id,
      flashcard_id: currentCard.id,
      times_reviewed: 1,
      times_correct: 0,
      last_reviewed: new Date().toISOString(),
      mastery_level: 0
    }, {
      onConflict: 'user_id,flashcard_id'
    });

    setStats(prev => ({ 
      reviewed: prev.reviewed + 1, 
      correct: prev.correct 
    }));

    goToNext();
  };

  const goToNext = () => {
    const displayCards = viewMode === 'saved' 
      ? flashcards.filter(f => savedCards.has(f.id))
      : flashcards;
      
    if (currentIndex < displayCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast.success(`Session complete! ${stats.correct + 1}/${stats.reviewed + 1} correct`);
      updateSession();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    toast.success('Cards shuffled!');
  };

  const resetDeck = () => {
    setCurrentIndex(0);
    setStats({ reviewed: 0, correct: 0 });
  };

  const updateSession = async () => {
    if (sessionId) {
      await supabase
        .from('study_sessions')
        .update({
          ended_at: new Date().toISOString(),
          cards_reviewed: stats.reviewed + 1,
          cards_correct: stats.correct + 1
        })
        .eq('id', sessionId);
    }
  };

  if (loading) {
    return (
      <GradientBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GradientBackground>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Filter cards based on view mode
  const displayCards = viewMode === 'saved' 
    ? flashcards.filter(f => savedCards.has(f.id))
    : flashcards;
    
  const currentCard = displayCards[currentIndex];
  const progress = displayCards.length > 0 ? ((currentIndex + 1) / displayCards.length) * 100 : 0;
  const savedCount = flashcards.filter(f => savedCards.has(f.id)).length;

  return (
    <GradientBackground>
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Flashcards</h1>
          <p className="text-muted-foreground">Test your Java knowledge</p>
        </div>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'all' | 'saved')} className="mb-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              All Cards ({flashcards.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Saved for Later ({savedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
          <Select value={selectedTopic} onValueChange={handleTopicChange}>
            <SelectTrigger className="w-[200px] bg-background/50">
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {topics.map(topic => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={shuffleCards}>
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle
            </Button>
            <Button variant="outline" size="sm" onClick={resetDeck}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {viewMode === 'saved' ? 'Saved Cards Progress' : 'Progress'}
            </span>
            <span>{displayCards.length > 0 ? currentIndex + 1 : 0} / {displayCards.length}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full progress-gradient transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : displayCards.length === 0 ? (
          <Card className="glass-card border-border/30 p-12 text-center">
            {viewMode === 'saved' ? (
              <>
                <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No saved flashcards yet.</p>
                <p className="text-sm text-muted-foreground">
                  Mark cards as "Save for Later" when studying to review them here!
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setViewMode('all')}
                >
                  View All Cards
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">No flashcards found for this topic.</p>
            )}
          </Card>
        ) : currentCard ? (
          <div className="animate-fade-in">
            <Flashcard
              question={currentCard.question}
              answer={currentCard.answer}
              codeExample={currentCard.code_example}
              difficulty={currentCard.difficulty}
              isSavedForLater={savedCards.has(currentCard.id)}
              onCorrect={handleCorrect}
              onIncorrect={handleIncorrect}
              onToggleSave={() => handleToggleSave(currentCard.id)}
            />
          </div>
        ) : null}

        {/* Navigation */}
        {displayCards.length > 0 && (
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={goToNext}
              disabled={currentIndex >= displayCards.length - 1}
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Session Stats */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Session: {stats.correct}/{stats.reviewed} correct
        </div>
      </main>
    </GradientBackground>
  );
}

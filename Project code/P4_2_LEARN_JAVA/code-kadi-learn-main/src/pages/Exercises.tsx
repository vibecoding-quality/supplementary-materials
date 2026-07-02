import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GradientBackground } from '@/components/layout/GradientBackground';
import { Navbar } from '@/components/layout/Navbar';
import { CodeEditor } from '@/components/exercises/CodeEditor';
import { supabase } from '@/integrations/supabase/client';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  title: string;
  description: string;
  starter_code: string | null;
  expected_output: string | null;
  hints: string[] | null;
  difficulty: string;
  topic_id: string;
}

interface Topic {
  id: string;
  title: string;
}

export default function Exercises() {
  const { user, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>(searchParams.get('topic') || 'all');
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchTopics();
      fetchExercises();
      fetchCompletedExercises();
    }
  }, [user, selectedTopic]);

  const fetchTopics = async () => {
    const { data } = await supabase
      .from('java_topics')
      .select('id, title')
      .order('order_index');
    
    if (data) {
      setTopics(data);
    }
  };

  const fetchExercises = async () => {
    setIsLoading(true);
    
    let query = supabase.from('exercises').select('*');
    
    if (selectedTopic && selectedTopic !== 'all') {
      query = query.eq('topic_id', selectedTopic);
    }
    
    const { data } = await query;
    
    if (data) {
      setExercises(data);
      setCurrentIndex(0);
    }
    
    setIsLoading(false);
  };

  const fetchCompletedExercises = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('exercise_attempts')
      .select('exercise_id')
      .eq('user_id', user.id)
      .eq('is_correct', true);
    
    if (data) {
      setCompletedExercises(new Set(data.map(d => d.exercise_id)));
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
  };

  const handleSubmit = async (code: string) => {
    const currentExercise = exercises[currentIndex];
    
    // Create session
    await supabase.from('study_sessions').insert({
      user_id: user!.id,
      topic_id: currentExercise.topic_id,
      session_type: 'exercise',
      ended_at: new Date().toISOString()
    });

    // Record attempt
    await supabase.from('exercise_attempts').insert({
      user_id: user!.id,
      exercise_id: currentExercise.id,
      submitted_code: code,
      is_correct: true,
      feedback: 'Code submitted successfully'
    });

    setCompletedExercises(prev => new Set([...prev, currentExercise.id]));
    toast.success('Exercise submitted! Check the expected output to verify your solution.');
  };

  const goToNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
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

  const currentExercise = exercises[currentIndex];
  const isCompleted = currentExercise && completedExercises.has(currentExercise.id);

  return (
    <GradientBackground>
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Code Exercises</h1>
          <p className="text-muted-foreground">Practice writing Java code</p>
        </div>

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

          <div className="text-sm text-muted-foreground">
            Exercise {currentIndex + 1} of {exercises.length}
          </div>
        </div>

        {/* Exercise List Dots */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {exercises.map((exercise, index) => (
            <button
              key={exercise.id}
              onClick={() => setCurrentIndex(index)}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                transition-all-smooth
                ${index === currentIndex 
                  ? 'bg-primary text-white scale-110' 
                  : completedExercises.has(exercise.id)
                    ? 'bg-success/20 text-success border border-success/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              {completedExercises.has(exercise.id) ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </button>
          ))}
        </div>

        {/* Exercise */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : exercises.length === 0 ? (
          <Card className="glass-card border-border/30 p-12 text-center">
            <p className="text-muted-foreground">No exercises found for this topic.</p>
          </Card>
        ) : currentExercise ? (
          <div className="animate-fade-in">
            {isCompleted && (
              <div className="mb-4 flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">You've completed this exercise</span>
              </div>
            )}
            <CodeEditor
              title={currentExercise.title}
              description={currentExercise.description}
              starterCode={currentExercise.starter_code}
              expectedOutput={currentExercise.expected_output}
              hints={currentExercise.hints}
              difficulty={currentExercise.difficulty}
              onSubmit={handleSubmit}
            />
          </div>
        ) : null}

        {/* Navigation */}
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
            disabled={currentIndex >= exercises.length - 1}
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </main>
    </GradientBackground>
  );
}

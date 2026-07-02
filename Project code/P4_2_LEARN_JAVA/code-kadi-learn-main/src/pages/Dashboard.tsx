import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GradientBackground } from '@/components/layout/GradientBackground';
import { Navbar } from '@/components/layout/Navbar';
import { ProgressCard } from '@/components/dashboard/ProgressCard';
import { TopicCard } from '@/components/dashboard/TopicCard';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Code, Target, Zap, Loader2 } from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  description: string | null;
  category: string;
  order_index: number;
}

interface Stats {
  totalTopics: number;
  topicsMastered: number;
  totalFlashcards: number;
  flashcardsReviewed: number;
  totalExercises: number;
  exercisesCompleted: number;
  streak: number;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTopics: 0,
    topicsMastered: 0,
    totalFlashcards: 0,
    flashcardsReviewed: 0,
    totalExercises: 0,
    exercisesCompleted: 0,
    streak: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch topics
      const { data: topicsData } = await supabase
        .from('java_topics')
        .select('*')
        .order('order_index');

      if (topicsData) {
        setTopics(topicsData);
      }

      // Fetch flashcard counts
      const { count: flashcardCount } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true });

      // Fetch exercise counts
      const { count: exerciseCount } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true });

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('flashcard_progress')
        .select('*')
        .eq('user_id', user?.id);

      // Fetch user exercise attempts
      const { data: attemptsData } = await supabase
        .from('exercise_attempts')
        .select('exercise_id, is_correct')
        .eq('user_id', user?.id)
        .eq('is_correct', true);

      const uniqueExercisesCompleted = new Set(attemptsData?.map(a => a.exercise_id)).size;

      setStats({
        totalTopics: topicsData?.length || 0,
        topicsMastered: progressData?.filter(p => p.mastery_level >= 4).length || 0,
        totalFlashcards: flashcardCount || 0,
        flashcardsReviewed: progressData?.length || 0,
        totalExercises: exerciseCount || 0,
        exercisesCompleted: uniqueExercisesCompleted,
        streak: 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
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

  return (
    <GradientBackground>
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{user.email?.split('@')[0] || 'Kadi'}</span>! ☕
          </h1>
          <p className="text-muted-foreground">
            Continue your Java learning journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ProgressCard
            title="Topics Mastered"
            value={stats.topicsMastered}
            total={stats.totalTopics}
            icon={Target}
            gradient="primary"
          />
          <ProgressCard
            title="Flashcards Studied"
            value={stats.flashcardsReviewed}
            total={stats.totalFlashcards}
            icon={BookOpen}
            gradient="secondary"
          />
          <ProgressCard
            title="Exercises Completed"
            value={stats.exercisesCompleted}
            total={stats.totalExercises}
            icon={Code}
            gradient="success"
          />
          <ProgressCard
            title="Day Streak"
            value={stats.streak}
            total={30}
            icon={Zap}
            gradient="primary"
          />
        </div>

        {/* Topics Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Java Topics</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, index) => (
              <div 
                key={topic.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TopicCard
                  id={topic.id}
                  title={topic.title}
                  description={topic.description}
                  category={topic.category}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </GradientBackground>
  );
}

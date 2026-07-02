import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GradientBackground } from '@/components/layout/GradientBackground';
import { Navbar } from '@/components/layout/Navbar';
import { StudySessionCard } from '@/components/history/StudySessionCard';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Loader2, Calendar, BookOpen, Code, TrendingUp } from 'lucide-react';
import { format, subDays, isAfter, startOfDay } from 'date-fns';

interface StudySession {
  id: string;
  session_type: string;
  started_at: string;
  ended_at: string | null;
  cards_reviewed: number | null;
  cards_correct: number | null;
  java_topics: { title: string } | null;
}

interface DailyStats {
  date: string;
  flashcards: number;
  exercises: number;
}

export default function History() {
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      // Fetch study sessions
      const { data: sessionsData } = await supabase
        .from('study_sessions')
        .select(`
          id,
          session_type,
          started_at,
          ended_at,
          cards_reviewed,
          cards_correct,
          java_topics (title)
        `)
        .eq('user_id', user?.id)
        .order('started_at', { ascending: false })
        .limit(50);

      if (sessionsData) {
        setSessions(sessionsData);
        
        // Calculate daily stats for last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), i);
          const dayStart = startOfDay(date);
          
          const daysSessions = sessionsData.filter(s => {
            const sessionDate = startOfDay(new Date(s.started_at));
            return sessionDate.getTime() === dayStart.getTime();
          });

          return {
            date: format(date, 'EEE'),
            flashcards: daysSessions.filter(s => s.session_type === 'flashcard').length,
            exercises: daysSessions.filter(s => s.session_type === 'exercise').length
          };
        }).reverse();

        setDailyStats(last7Days);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
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

  const totalFlashcardSessions = sessions.filter(s => s.session_type === 'flashcard').length;
  const totalExerciseSessions = sessions.filter(s => s.session_type === 'exercise').length;
  const maxBarValue = Math.max(...dailyStats.map(d => d.flashcards + d.exercises), 1);

  return (
    <GradientBackground>
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Study History</h1>
          <p className="text-muted-foreground">Track your learning progress over time</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="glass-card border-border/30 p-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalFlashcardSessions}</p>
                <p className="text-sm text-muted-foreground">Flashcard Sessions</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-border/30 p-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalExerciseSessions}</p>
                <p className="text-sm text-muted-foreground">Exercise Sessions</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-border/30 p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sessions.length}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Chart */}
        <Card className="glass-card border-border/30 p-6 mb-8 animate-fade-in">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Last 7 Days Activity
          </h3>
          
          <div className="flex items-end gap-2 h-32">
            {dailyStats.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5" style={{ height: '100px' }}>
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t"
                    style={{ 
                      height: `${((day.flashcards + day.exercises) / maxBarValue) * 100}%`,
                      minHeight: day.flashcards + day.exercises > 0 ? '4px' : '0'
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.date}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-secondary" />
              <span className="text-muted-foreground">Flashcards</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span className="text-muted-foreground">Exercises</span>
            </div>
          </div>
        </Card>

        {/* Session List */}
        <div>
          <h3 className="font-semibold mb-4">Recent Sessions</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <Card className="glass-card border-border/30 p-12 text-center">
              <p className="text-muted-foreground">No study sessions yet. Start learning!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div 
                  key={session.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <StudySessionCard
                    sessionType={session.session_type}
                    topicTitle={session.java_topics?.title}
                    startedAt={session.started_at}
                    endedAt={session.ended_at}
                    cardsReviewed={session.cards_reviewed || 0}
                    cardsCorrect={session.cards_correct || 0}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </GradientBackground>
  );
}

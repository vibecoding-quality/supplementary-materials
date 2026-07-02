import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GradientBackground } from '@/components/layout/GradientBackground';
import { Button } from '@/components/ui/button';
import { Coffee, BookOpen, Code, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <GradientBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GradientBackground>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <GradientBackground>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gradient">JavaQuest</span>
            </div>
            <Link to="/auth">
              <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                Sign In
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="max-w-3xl animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">Made for Kadi with ❤️ by Matthias</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Master <span className="text-gradient">Java</span> with
              <br />
              Interactive Learning
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Learn Java step by step with flashcards, code exercises, and progress tracking. 
              From variables to advanced OOP concepts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-secondary to-primary hover:opacity-90 animate-pulse-glow text-lg px-8"
                >
                  Start Learning
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full">
            <div className="glass-card border border-border/30 rounded-xl p-6 text-left animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Flashcards</h3>
              <p className="text-sm text-muted-foreground">
                Review core concepts with interactive flashcards. Flip to reveal answers and track mastery.
              </p>
            </div>

            <div className="glass-card border border-border/30 rounded-xl p-6 text-left animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Code Exercises</h3>
              <p className="text-sm text-muted-foreground">
                Practice writing real Java code with guided exercises and helpful hints.
              </p>
            </div>

            <div className="glass-card border border-border/30 rounded-xl p-6 text-left animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                See your learning history and track improvement over time across all topics.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Built with Lovable • 12 Java Topics • 25+ Flashcards • 7+ Exercises
          </p>
        </footer>
      </div>
    </GradientBackground>
  );
}

import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Leaf, Droplets, Calendar, Bell, ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-plants.jpg';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Leaf,
      title: '50+ Plant Species',
      description: 'Choose from a curated catalog of popular houseplants or add your own.'
    },
    {
      icon: Droplets,
      title: 'Smart Care Reminders',
      description: 'Never forget to water or fertilize with intelligent scheduling.'
    },
    {
      icon: Calendar,
      title: 'Track Care History',
      description: 'Log watering, fertilizing, and repotting to optimize plant health.'
    },
    {
      icon: Bell,
      title: 'Personalized Tips',
      description: 'Get care advice tailored to your plants and growing conditions.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 hero-overlay" />
        
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-full mb-6 animate-fade-in">
            <Leaf className="h-4 w-4" />
            <span className="text-sm font-medium">Your Plant Care Companion</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif text-primary-foreground mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Keep Your Plants <br />
            <span className="italic">Thriving</span>
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            Track watering schedules, get personalized care reminders, and help your houseplants flourish with Plantwise.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6 gap-2"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-background leaf-pattern">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Everything Your Plants Need</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Plantwise makes plant care simple with smart reminders, care tracking, and personalized advice.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="text-center p-6 rounded-2xl bg-card glass-card animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif mb-4">Ready to Grow?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of plant lovers who are keeping their green friends happy and healthy.
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => navigate('/auth')}
            className="text-lg px-8 py-6 gap-2"
          >
            Start Your Plant Journey
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-background">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-serif font-semibold">Plantwise</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Plantwise. Made with 💚 for plant lovers.
          </p>
        </div>
      </footer>
    </div>
  );
}

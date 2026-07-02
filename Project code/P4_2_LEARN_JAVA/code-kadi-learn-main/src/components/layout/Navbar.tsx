import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Code, 
  History, 
  LayoutDashboard, 
  LogOut,
  Coffee
} from 'lucide-react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/flashcards', label: 'Flashcards', icon: BookOpen },
    { path: '/exercises', label: 'Exercises', icon: Code },
    { path: '/history', label: 'History', icon: History },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-card border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary transition-all-smooth group-hover:scale-105">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gradient hidden sm:block">JavaQuest</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all-smooth
                  ${isActive(path) 
                    ? 'bg-primary/20 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:block">{label}</span>
              </Link>
            ))}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:block">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

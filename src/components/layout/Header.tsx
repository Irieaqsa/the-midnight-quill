import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, BookOpen, PenLine, LayoutDashboard, User, Search, ArrowRight, Info, Headphones, Users, Lightbulb } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SearchCommand } from '@/components/SearchCommand';

export function Header() {
  const { user, signOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [spotlightActive, setSpotlightActive] = useState(() => localStorage.getItem('tmq_spotlight') === 'true');
  const location = useLocation();

  const toggleSpotlight = () => {
    const nextVal = !spotlightActive;
    setSpotlightActive(nextVal);
    localStorage.setItem('tmq_spotlight', String(nextVal));
    window.dispatchEvent(new CustomEvent('tmq-spotlight-toggle', { detail: nextVal }));
  };

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) => (
    <Link
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
        isActive(to) 
          ? "text-primary bg-primary/10" 
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo - Left */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group min-w-[80px] text-foreground font-display font-semibold tracking-tight"
          >
            <img src="/logo.jpg" alt="TMQ Logo" className="h-6 w-6 rounded-md object-cover border border-white/10" />
            <span className="text-xl group-hover:text-primary transition-colors duration-200">
              TMQ
            </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-1">
              <NavLink to="/about">
                About
              </NavLink>
              <NavLink to="/feed" icon={BookOpen}>
                Archive
              </NavLink>
              <NavLink to="/podcast">
                Podcast
              </NavLink>
              <NavLink to="/team">
                Team
              </NavLink>
              {user && (
                <NavLink to="/dashboard" icon={LayoutDashboard}>
                  Dashboard
                </NavLink>
              )}
              {user && (user.role === 'EDITOR' || user.role === 'ADMIN') && (
                <NavLink to="/admin/submissions" icon={Users}>
                  Admin Panel
                </NavLink>
              )}
              <NavLink to="/write" icon={PenLine}>
                Submit
              </NavLink>
              
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-smooth ml-2 text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10"
              >
                <Search className="h-4 w-4" />
                <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>

              <button
                onClick={toggleSpotlight}
                className={cn(
                  "p-2 rounded-lg transition-smooth text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 flex items-center justify-center border",
                  spotlightActive ? "text-primary bg-primary/10 border-primary/20" : "border-transparent"
                )}
                title="Toggle Spotlight Mode"
              >
                <Lightbulb className={cn("h-4 w-4", spotlightActive && "fill-primary")} />
              </button>
            </div>
          </nav>

          {/* Auth section - Right */}
          <div className="hidden md:flex items-center gap-3 min-w-[80px] justify-end">
            {loading ? (
              <div className="h-9 w-20 bg-white/5 animate-pulse rounded-lg" />
            ) : user ? (
              <>
                <Link 
                  to={`/author/${user.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-smooth text-muted-foreground hover:text-foreground hover:bg-white/5"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">Profile</span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild 
                  className="text-muted-foreground hover:text-foreground hover:bg-white/5"
                >
                  <Link to="/auth">Login</Link>
                </Button>
                <Button 
                  size="sm" 
                  asChild 
                  className="cta-primary gap-1.5 group"
                >
                  <Link to="/auth?mode=signup">
                    Start Writing
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={toggleSpotlight}
              className={cn(
                "p-2 rounded-lg transition-smooth text-muted-foreground hover:text-foreground hover:bg-white/5",
                spotlightActive && "text-primary"
              )}
              aria-label="Toggle Spotlight"
            >
              <Lightbulb className={cn("h-5 w-5", spotlightActive && "fill-primary")} />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg transition-smooth text-muted-foreground hover:text-foreground hover:bg-white/5"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="p-2 rounded-lg transition-smooth text-foreground hover:bg-white/5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fade-in">
            <div className="flex flex-col gap-1">
              {/* Nav links */}
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-base",
                  isActive('/about') 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5"
                )}
              >
                <Info className="h-4 w-4" />
                About
              </Link>

              <Link
                to="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-base",
                  isActive('/feed') 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5"
                )}
              >
                <BookOpen className="h-4 w-4" />
                Archive
              </Link>

              <Link
                to="/podcast"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-base",
                  isActive('/podcast') 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5"
                )}
              >
                <Headphones className="h-4 w-4" />
                Podcast
              </Link>

              <Link
                to="/team"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-base",
                  isActive('/team') 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5"
                )}
              >
                <Users className="h-4 w-4" />
                Team
              </Link>

              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md transition-base",
                    isActive('/dashboard') 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}

              {user && (user.role === 'EDITOR' || user.role === 'ADMIN') && (
                <Link
                  to="/admin/submissions"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md transition-base",
                    isActive('/admin/submissions') 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  <Users className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}

              <Link
                to="/write"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-base",
                  isActive('/write') 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5"
                )}
              >
                <PenLine className="h-4 w-4" />
                Submit
              </Link>

              {/* Divider */}
              <div className="my-2 border-t border-white/10" />

              {/* Auth */}
              {loading ? (
                <div className="h-10 w-full bg-white/5 animate-pulse rounded-md" />
              ) : user ? (
                <>
                  <Link
                    to={`/author/${user.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md transition-base text-muted-foreground hover:bg-white/5"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="justify-start gap-2 text-muted-foreground hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="justify-start text-muted-foreground hover:bg-white/5"
                  >
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    className="cta-primary"
                  >
                    <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                      Start Writing
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Command Dialog */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}

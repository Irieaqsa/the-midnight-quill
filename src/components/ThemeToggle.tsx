import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useCallback } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = useCallback(() => {
    const html = document.documentElement;
    
    // Add transitioning class for smooth color transitions
    html.classList.add('transitioning');
    
    // Toggle theme
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    
    // Remove transitioning class after animation completes
    setTimeout(() => {
      html.classList.remove('transitioning');
    }, 450);
  }, [resolvedTheme, setTheme]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" disabled>
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-lg hover:bg-secondary group btn-tactile"
      onClick={handleToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-all duration-300 group-hover:rotate-45 group-hover:text-amber" />
      ) : (
        <Moon className="h-4 w-4 transition-all duration-300 group-hover:-rotate-12 group-hover:text-ink" />
      )}
    </Button>
  );
}

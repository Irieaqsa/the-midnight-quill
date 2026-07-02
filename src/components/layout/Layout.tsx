import { ReactNode, useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingParticles } from '@/components/FloatingParticles';
import { useSpotlightEffect } from '@/hooks/useSpotlightEffect';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [spotlightActive, setSpotlightActive] = useState(() => localStorage.getItem('tmq_spotlight') === 'true');

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const active = (e as CustomEvent).detail;
      setSpotlightActive(active);
    };
    window.addEventListener('tmq-spotlight-toggle', handleToggle);
    return () => window.removeEventListener('tmq-spotlight-toggle', handleToggle);
  }, []);

  // Initialize canvas ref via the custom hook with cool silver glow color and active state
  const canvasRef = useSpotlightEffect({
    spotlightSize: 220,
    spotlightIntensity: 0.88,
    fadeSpeed: 0.07,
    glowColor: '210, 215, 225', // Silver glow tone
    pulseSpeed: 2400,
    active: spotlightActive
  });

  return (
    <div className="min-h-screen app-container flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 app-bg pointer-events-none" />
      <div className="fixed inset-0 app-grid opacity-[0.02] pointer-events-none" />
      <FloatingParticles />

      {/* Full-screen Spotlight Overlay Canvas */}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none z-40 transition-opacity duration-300 ${
          spotlightActive ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ mixBlendMode: 'normal' }}
      />
      
      <Header />
      <main className="relative pt-14 md:pt-16 z-10 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

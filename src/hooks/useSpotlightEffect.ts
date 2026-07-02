import { useEffect, useRef, useState } from 'react';

interface SpotlightConfig {
  spotlightSize?: number;
  spotlightIntensity?: number;
  fadeSpeed?: number;
  glowColor?: string; // e.g., '255, 255, 255'
  pulseSpeed?: number;
  active?: boolean;
}

export const useSpotlightEffect = (config: SpotlightConfig = {}) => {
  const {
    spotlightSize = 220,
    spotlightIntensity = 0.9,
    fadeSpeed = 0.08,
    glowColor = '255, 255, 255',
    pulseSpeed = 2200,
    active = false,
  } = config;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const spotlightPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const animationFrame = useRef<number | null>(null);
  const [, setIsHovered] = useState(false);

  useEffect(() => {
    // If not active, do not bind listeners or start loop
    if (!active) {
      // Clear canvas if it exists
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const render = () => {
      if (!canvas || !ctx) return;

      // Smooth position interpolation (lerp)
      spotlightPos.current.x = lerp(
        spotlightPos.current.x,
        targetPos.current.x,
        fadeSpeed
      );
      spotlightPos.current.y = lerp(
        spotlightPos.current.y,
        targetPos.current.y,
        fadeSpeed
      );

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create dark overlay
      ctx.fillStyle = 'rgba(10, 10, 10, 0.88)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate breathing pulse scale
      const pulseScale =
        1 + 0.08 * Math.sin((Date.now() / pulseSpeed) * Math.PI * 2);
      const currentSpotlightSize = spotlightSize * pulseScale;

      // Create spotlight gradient (cutout)
      const gradient = ctx.createRadialGradient(
        spotlightPos.current.x,
        spotlightPos.current.y,
        0,
        spotlightPos.current.x,
        spotlightPos.current.y,
        currentSpotlightSize
      );

      gradient.addColorStop(0, `rgba(${glowColor}, ${spotlightIntensity})`);
      gradient.addColorStop(
        0.5,
        `rgba(${glowColor}, ${spotlightIntensity * 0.4})`
      );
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      // Cutout effect
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        spotlightPos.current.x,
        spotlightPos.current.y,
        currentSpotlightSize,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Soft silver outer glow
      ctx.globalCompositeOperation = 'source-over';
      const glowGradient = ctx.createRadialGradient(
        spotlightPos.current.x,
        spotlightPos.current.y,
        0,
        spotlightPos.current.x,
        spotlightPos.current.y,
        currentSpotlightSize * 1.15
      );
      glowGradient.addColorStop(0, `rgba(${glowColor}, 0.08)`);
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(
        spotlightPos.current.x,
        spotlightPos.current.y,
        currentSpotlightSize * 1.15,
        0,
        Math.PI * 2
      );
      ctx.fill();

      animationFrame.current = requestAnimationFrame(render);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [spotlightSize, spotlightIntensity, fadeSpeed, glowColor, pulseSpeed, active]);

  return canvasRef;
};

export default useSpotlightEffect;

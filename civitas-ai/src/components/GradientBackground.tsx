import React, { useEffect, useRef } from 'react';

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'mesh' | 'aurora' | 'real-estate' | 'modern';
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  children, 
  className = '',
  variant = 'modern'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (variant !== 'modern' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Set canvas size
    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Animated gradient orbs with real estate themed colors
    class GradientOrb {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      radius: number;
      baseRadius: number;
      color: string;
      pulsePhase: number;
      
      constructor(x: number, y: number, radius: number, color: string) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.radius = radius;
        this.baseRadius = radius;
        this.color = color;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }
      
      update(time: number) {
        // Smooth movement towards target
        this.x += (this.targetX - this.x) * 0.02;
        this.y += (this.targetY - this.y) * 0.02;
        
        // Gentle pulsing
        this.radius = this.baseRadius + Math.sin(time * 0.001 + this.pulsePhase) * 20;
        
        // Occasionally change target
        if (Math.random() < 0.002) {
          this.targetX = Math.random() * window.innerWidth;
          this.targetY = Math.random() * window.innerHeight;
        }
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color.replace(/[\d.]+\)$/g, '0.05)'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
      }
    }

    // Real Estate Copilot Palette - Ultra Minimal, Subtle Depth
    const orbs = [
      new GradientOrb(window.innerWidth * 0.15, window.innerHeight * 0.2, 650, 'rgba(21, 46, 95, 0.02)'), // Navy (Trust)
      new GradientOrb(window.innerWidth * 0.85, window.innerHeight * 0.3, 600, 'rgba(26, 166, 183, 0.025)'), // Teal (Tech)
      new GradientOrb(window.innerWidth * 0.5, window.innerHeight * 0.75, 750, 'rgba(77, 182, 229, 0.02)'), // Cyan (Data)
      new GradientOrb(window.innerWidth * 0.1, window.innerHeight * 0.7, 500, 'rgba(255, 122, 69, 0.015)'), // Coral (Subtle)
      new GradientOrb(window.innerWidth * 0.9, window.innerHeight * 0.6, 550, 'rgba(21, 46, 95, 0.015)'), // Navy (Depth)
    ];

    let startTime = Date.now();
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    const animate = () => {
      const currentTime = Date.now() - startTime;
      
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      // Draw a base wash - Transparent as CSS handles the gradient
      ctx.fillStyle = 'rgba(0, 0, 0, 0.0)'; 
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      orbs.forEach((orb, index) => {
        // Subtle parallax effect based on mouse position
        const parallaxX = (mouseX - window.innerWidth / 2) * (0.01 + index * 0.005);
        const parallaxY = (mouseY - window.innerHeight / 2) * (0.01 + index * 0.005);
        
        // Apply parallax to the orb's drawing position (not its logical position)
        const originalX = orb.x;
        const originalY = orb.y;
        
        orb.x += parallaxX;
        orb.y += parallaxY;
        
        orb.update(currentTime);
        orb.draw(ctx);
        
        // Reset position for next frame logic
        orb.x = originalX;
        orb.y = originalY;
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant]);

  // Modern LLM + Real Estate variant
  if (variant === 'modern') {
    return (
      <div className={`min-h-screen w-full relative overflow-hidden ${className}`}>
        {/* Base - Calm Warm Neutral with Subtle Gradient */}
        <div 
          className="absolute inset-0 transition-colors duration-500"
          style={{
            background: `
              linear-gradient(to bottom, #FAF5F0 0%, #F7F2EC 100%)
            `
          }}
        />
        
        {/* Subtle Line-Art Roofline Silhouette - Bottom Edge Only */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-24 opacity-[0.08] pointer-events-none"
          style={{
            background: `
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 80' preserveAspectRatio='none'%3E%3Cpath d='M0,80 L0,75 L60,75 L80,55 L100,75 L180,75 L200,60 L220,75 L300,75 L330,50 L360,75 L440,75 L460,65 L480,75 L580,75 L600,58 L620,75 L720,75 L745,62 L770,75 L860,75 L880,68 L900,75 L1000,75 L1020,63 L1040,75 L1120,75 L1140,70 L1160,75 L1200,75 L1200,80 Z' stroke='%23152E5F' stroke-width='1.5' fill='none' opacity='1'/%3E%3C/svg%3E")
              bottom center no-repeat
            `,
            backgroundSize: '100% 100%'
          }}
        />
        
        {/* Minimal Blueprint Grid - Top Right Corner Only */}
        <div 
          className="absolute top-0 right-0 w-64 h-64 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(21, 46, 95, 0.4) 0.5px, transparent 0.5px),
              linear-gradient(90deg, rgba(21, 46, 95, 0.4) 0.5px, transparent 0.5px)
            `,
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(circle at top right, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle at top right, black 0%, transparent 70%)'
          }}
        />
        
        {/* Subtle Blueprint Icons - Corners */}
        <div className="absolute top-8 left-8 opacity-[0.06] pointer-events-none">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#152E5F" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div className="absolute bottom-8 right-8 opacity-[0.06] pointer-events-none">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#152E5F" strokeWidth="1.5">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        </div>

        {/* Animated canvas layer - Ultra Subtle Orbs for Depth */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ 
            filter: 'blur(140px)',
            opacity: 0.3
          }}
        />

        {/* Remove floating particles for cleaner look */}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Keyframe animations */}
        <style>{`
          @keyframes float-ambient {
            0% {
              transform: translateY(0) translateX(0);
              opacity: 0;
            }
            20% { opacity: 0.5; }
            80% { opacity: 0.5; }
            100% {
              transform: translateY(-100px) translateX(${Math.random() * 40 - 20}px);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  // Fallback for other variants
  const gradientStyles = {
    default: {
      background: 'linear-gradient(135deg, hsl(220, 50%, 16%) 0%, hsl(230, 40%, 22%) 100%)',
    },
    subtle: {
      background: 'linear-gradient(135deg, hsl(220, 20%, 13%) 0%, hsl(230, 25%, 16%) 50%, hsl(240, 20%, 14%) 100%)',
    },
    mesh: {
      background: 'hsl(220, 15%, 13%)',
    },
    aurora: {
      background: 'linear-gradient(135deg, #1a2540 0%, #222230 50%, #1a2540 100%)',
    },
    'real-estate': {
      background: 'linear-gradient(135deg, #152035 0%, #243050 25%, #1a3055 50%, #243050 75%, #152035 100%)',
    },
    modern: {
      background: 'linear-gradient(135deg, #151830 0%, #252845 100%)',
    }
  };

  return (
    <div className={`min-h-screen w-full relative overflow-hidden ${className}`}>
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0"
          style={gradientStyles[variant]}
        />
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
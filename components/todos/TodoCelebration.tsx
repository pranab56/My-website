"use client";

import gsap from 'gsap';
import { CheckCircle2, PartyPopper, Sparkles, Star, Trophy } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface TodoCelebrationProps {
  show: boolean;
}

export default function TodoCelebration({ show }: TodoCelebrationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const trophyRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      // Entrance Animation
      const tl = gsap.timeline();

      tl.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      )
        .fromTo(contentRef.current,
          { scale: 0.5, opacity: 0, y: 50 },
          { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" },
          "-=0.3"
        )
        .fromTo(trophyRef.current,
          { rotateY: 180, scale: 0 },
          { rotateY: 0, scale: 1, duration: 1, ease: "back.out(1.7)" },
          "-=0.5"
        )
        .fromTo(messageRef.current?.children || [],
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power3.out" },
          "-=0.5"
        );

      // Floating animation for trophy
      gsap.to(trophyRef.current, {
        y: -15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Particle animation
      if (particlesRef.current) {
        const particles = Array.from(particlesRef.current.children);
        particles.forEach((p) => {
          gsap.set(p, {
            x: '50%',
            y: '50%',
            opacity: 1,
            scale: gsap.utils.random(0.5, 1.5),
            backgroundColor: gsap.utils.random(['#fbbf24', '#f59e0b', '#3b82f6', '#10b981', '#ec4899'])
          });

          gsap.to(p, {
            x: `${gsap.utils.random(-300, 300)}%`,
            y: `${gsap.utils.random(-300, 300)}%`,
            opacity: 0,
            rotate: gsap.utils.random(0, 360),
            duration: gsap.utils.random(1.5, 3.5),
            repeat: -1,
            ease: "power2.out",
            delay: gsap.utils.random(0, 2)
          });
        });
      }
    }
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden pointer-events-none"
    >
      {/* Dynamic Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-2xl" />

      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div
        ref={contentRef}
        className="relative max-w-xl w-full bg-card/40 backdrop-blur-xl border border-white/10 rounded-xl p-12 shadow-[0_32px_128px_rgba(0,0,0,0.4)] flex flex-col items-center text-center overflow-hidden pointer-events-auto"
      >
        {/* Particle Container */}
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="absolute w-2 h-2 rounded-full" />
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-12 left-12 text-primary/30">
          <PartyPopper size={56} className="animate-bounce" />
        </div>
        <div className="absolute bottom-12 right-12 text-accent/30">
          <Sparkles size={56} className="animate-pulse" />
        </div>

        {/* Trophy Section */}
        <div ref={trophyRef} className="relative z-10 mb-10 p-10 bg-gradient-to-tr from-primary/20 via-primary/5 to-accent/20 rounded-full shadow-[inset_0_2px_20px_rgba(255,255,255,0.1)] border border-white/10">
          <div className="relative">
            <Trophy className="w-16 h-16 text-primary drop-shadow-[0_0_25px_rgba(var(--primary-rgb),0.6)]" />
            <div className="absolute -top-3 -right-3 bg-profit text-white p-2.5 rounded-full shadow-xl border-4 border-card/40">
              <CheckCircle2 size={24} className="stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Message Section */}
        <div ref={messageRef} className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-black italic tracking-tighter text-foreground leading-tight drop-shadow-sm">
              MISSION <span className="text-primary not-italic">ACCOMPLISHED</span>
            </h2>
            <div className="flex flex-col items-center space-y-3">
              <p className="text-xl font-semibold text-primary opacity-80">
                Elite Discipline Unlocked
              </p>
              <div className="h-1.5 w-32 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
            </div>
          </div>

          <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed text-lg font-medium opacity-90 italic">
            &quot;Every single victory today is a testament to your professional edge. Keep this momentum alive!&quot;
          </p>

          <div className="flex items-center justify-center gap-6 pt-8">
            <div className="flex -space-x-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center backdrop-blur-md shadow-lg transform hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-primary fill-primary" />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-black uppercase tracking-widest text-primary/60 leading-none">Status</span>
              <span className="text-sm font-black uppercase tracking-widest text-primary">Daily Perfect Score</span>
            </div>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -bottom-24 inset-x-0 h-48 bg-primary/20 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}

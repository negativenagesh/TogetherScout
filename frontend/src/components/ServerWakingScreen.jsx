import React, { useState, useEffect } from 'react';

const TIPS = [
  "Once awake, all subsequent requests will be lightning fast.",
  "We are analyzing thousands of founders and companies.",
  "Warming up the AI models for your queries...",
  "Grabbing a coffee for the server... almost there!"
];

export default function ServerWakingScreen() {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');
  const [tipIndex, setTipIndex] = useState(0);
  const [isFadingTip, setIsFadingTip] = useState(false);

  // Simulate progress moving up over ~30-40 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        // Slow down as it gets closer to 100
        const increment = prev < 60 ? 2 : prev < 85 ? 0.8 : 0.2;
        const next = prev + increment;
        return next > 99 ? 99 : next; // Cap at 99 until actually ready
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Animate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFadingTip(true);
      setTimeout(() => {
        setTipIndex(prev => (prev + 1) % TIPS.length);
        setIsFadingTip(false);
      }, 500); // Wait for fade out before changing text
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Background ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none opacity-50 animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none opacity-70"></div>
      
      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl flex flex-col items-center text-center transform transition-all animate-in fade-in zoom-in-95 duration-1000 ease-out">
        
        {/* Animated Icon */}
        <div className="relative mb-8 mt-2">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-40 animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="relative w-24 h-24 rounded-[1.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center backdrop-blur-md overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-50">
            {/* Spinning core */}
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(59,130,246,0.5)_360deg)] animate-spin" style={{ animationDuration: '3s' }}></div>
            
            <svg className="w-10 h-10 text-blue-300 relative z-10 animate-[spin_4s_linear_infinite]" fill="none" viewBox="0 0 24 24">
              <path className="opacity-75" fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
              <path fill="currentColor" d="M12 6c-3.31 0-6 2.69-6 6h2c0-2.21 1.79-4 4-4v-2z"></path>
            </svg>
            <div className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping z-20"></div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight font-sans">
          Waking up servers<span className="inline-block w-6 text-left">{dots}</span>
        </h2>
        <p className="text-gray-400 text-sm mb-10 leading-relaxed max-w-[280px]">
          Free cloud providers put inactive servers to sleep. It takes ~30s to spin back up.
        </p>

        {/* Progress Bar Container */}
        <div className="w-full space-y-3">
          <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Spinning up
            </span>
            <span className="text-white/90">{Math.floor(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ width: `${progress}%`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>

        {/* Dynamic Tips Carousel */}
        <div className="mt-8 pt-6 border-t border-white/10 w-full h-20 flex items-start justify-center">
          <div className={`flex items-start gap-3 text-left transition-opacity duration-500 ${isFadingTip ? 'opacity-0' : 'opacity-100'}`}>
            <div className="mt-0.5 p-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 shadow-sm shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-400/90 leading-relaxed font-medium pt-0.5">
              {TIPS[tipIndex]}
            </p>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}

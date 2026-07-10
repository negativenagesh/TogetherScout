import React from 'react';

export default function BuyMeCoffee() {
  return (
    <div className="flex flex-col items-center gap-1 group translate-y-1">
      <a 
        href="https://buymeacoffee.com/subrahmanya.gaonkar" 
        target="_blank" 
        rel="noreferrer"
        className="relative flex items-center justify-center p-2 md:p-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-[#FFDD00] hover:border-[#FFDD00] hover:text-black transition-all duration-300 text-gray-300 shadow-lg group-hover:scale-105"
        title="Buy me a coffee"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5 md:w-5 md:h-5 transition-colors"
        >
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      </a>
      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#FFDD00] transition-colors duration-300">
        Donate
      </span>
    </div>
  );
}

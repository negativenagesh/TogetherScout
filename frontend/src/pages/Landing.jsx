import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function Landing() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8; // Slow down slightly for elegance
    }
  }, []);

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="relative bg-black text-white selection:bg-white selection:text-black h-screen w-full overflow-y-auto snap-y snap-mandatory scroll-smooth">
      {/* Top right GitHub icon */}
      <div className="fixed top-6 right-6 md:top-8 md:right-8 z-50">
        <a href="https://github.com/negativenagesh" target="_blank" rel="noreferrer" className="p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300 flex items-center justify-center group">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6 group-hover:text-black transition-colors"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
        </a>
      </div>

      {/* Fixed Video Background */}
      <div className="fixed inset-0 z-0">
        <video 
          ref={videoRef}
          src="/videos/landing-bg.mp4" 
          className="w-full h-full object-cover opacity-50 mix-blend-screen"
          autoPlay 
          loop 
          muted 
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black"></div>
        {/* Subtle noise/blur filter for text legibility */}
        <div className="absolute inset-0 backdrop-blur-[2px]"></div>
      </div>

      {/* Main Scrolling Content (Snaps) */}
      <div className="relative z-10 h-full w-full">
        
        {/* HERO SECTION */}
        <section className="h-screen w-full flex flex-col items-center justify-center px-6 text-center snap-start relative">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <span className="text-xs uppercase tracking-widest font-bold text-gray-300">The Ultimate VC Intelligence Engine</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="font-display text-5xl md:text-8xl font-black tracking-tighter mb-4 leading-[1] text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 uppercase">
              <span className="block font-italiana text-6xl md:text-8xl text-white normal-case tracking-normal mb-4 opacity-90 drop-shadow-2xl">TogetherScout</span>
              Quantify The <br/>
              <span className="font-serif italic text-6xl md:text-9xl text-white font-normal lowercase tracking-normal">Unquantifiable.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl text-lg md:text-xl mb-12 font-medium">
              TogetherScout radically transforms how Venture Capitalists discover and assess elite startups. Powered by AI agents, designed for pure speed.
            </motion.p>

            <motion.div variants={fadeUp}>
              <Link 
                to="/companies"
                className="group relative inline-flex items-center justify-center px-12 py-5 font-bold text-black bg-white rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 border border-white"
              >
                <div className="absolute inset-0 w-full h-full bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative flex items-center gap-3 text-lg mix-blend-difference text-white uppercase tracking-widest">
                  Enter Directory
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* MARQUEE (Snaps slightly before engine) */}
        <div className="w-full bg-white text-black py-4 overflow-hidden border-y border-gray-800 flex items-center snap-center">
          <div className="whitespace-nowrap animate-marquee font-display font-black text-2xl uppercase tracking-widest flex w-[200%]">
            <span className="w-1/2">AI-DRIVEN THESIS • 10-POINT METRIC SCORING • YC BATCH ANALYSIS • DEEP WEB SCRAPING • REAL-TIME EVALUATIONS • </span>
            <span className="w-1/2">AI-DRIVEN THESIS • 10-POINT METRIC SCORING • YC BATCH ANALYSIS • DEEP WEB SCRAPING • REAL-TIME EVALUATIONS • </span>
          </div>
        </div>

        {/* SECTION 1: The Engine */}
        <section className="h-screen w-full flex items-center justify-center py-24 px-6 md:px-20 max-w-7xl mx-auto snap-start">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full"
          >
            <div className="space-y-6">
              <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-6xl font-black uppercase leading-none">
                The <span className="font-serif italic text-white font-normal lowercase">Intelligence</span> Engine
              </motion.h2>
              <motion.div variants={fadeUp} className="w-20 h-1 bg-white"></motion.div>
              <motion.p variants={fadeUp} className="text-gray-400 text-lg leading-relaxed">
                TogetherScout does not just list startups. It utilizes advanced agentic workflows to synthesize millions of fragmented data points into a single, actionable conviction score.
              </motion.p>
              <motion.p variants={fadeUp} className="text-gray-400 text-lg leading-relaxed">
                Our AI instantly cross-references team velocity, deep founder context, and market signals, cutting your due diligence time from weeks to milliseconds.
              </motion.p>
            </div>
            
            <motion.div variants={fadeUp} className="relative flex items-center justify-center w-full aspect-square md:aspect-auto md:h-full">
              <img src="/image.png" alt="Intelligence Grid" className="w-full h-full object-contain opacity-95 mix-blend-screen drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
            </motion.div>
          </motion.div>
        </section>

        {/* SECTION 2: Metrics */}
        <section className="min-h-screen w-full flex flex-col justify-center py-24 px-6 md:px-20 max-w-7xl mx-auto snap-start">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            variants={staggerContainer}
            className="w-full"
          >
            <motion.div variants={fadeUp} className="mb-10">
               <h2 className="font-display text-4xl md:text-6xl font-black uppercase leading-none mt-2">
                 Metrics That <span className="font-serif italic text-white font-normal lowercase">Matter.</span>
               </h2>
            </motion.div>
            
            <div className="space-y-12">
              {/* FOUNDER METRICS */}
              <div>
                <motion.h3 variants={fadeUp} className="font-serif italic text-2xl text-gray-400 mb-6 border-b border-white/10 pb-2">Founder Intelligence</motion.h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { title: "Domain Expertise", desc: "Deep market alignment & lived experience." },
                    { title: "Technical Capability", desc: "Engineering velocity, GitHub scale." },
                    { title: "Previous Exits", desc: "Prior startup track record & ROI." },
                    { title: "Academic Pedigree", desc: "Academic rigor and university backing." },
                    { title: "Resilience & Grit", desc: "Persistence through past failures." },
                    { title: "Founder-Market Fit", desc: "Why this exact team for this problem." },
                    { title: "Leadership & Vision", desc: "Ability to attract elite talent & capital." },
                    { title: "Execution Speed", desc: "Pace of shipping and iterations." },
                    { title: "Strategic Network", desc: "Connections to pivotal ecosystems." },
                    { title: "YC Batch Prestige", desc: "Historical batch momentum metrics." },
                  ].map((m, i) => (
                    <motion.div key={i} variants={fadeUp} className="bg-black/60 border border-white/10 backdrop-blur-xl p-5 rounded-xl hover:-translate-y-2 transition-transform duration-300">
                      <h4 className="font-display text-sm md:text-base font-black uppercase mb-3 text-white">{m.title}</h4>
                      <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{m.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* STARTUP METRICS */}
              <div>
                <motion.h3 variants={fadeUp} className="font-serif italic text-2xl text-gray-400 mb-6 border-b border-white/10 pb-2">Startup Trajectory</motion.h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { title: "Market Size", desc: "TAM/SAM/SOM opportunity scale." },
                    { title: "Team / Founders", desc: "Collective founding team strength." },
                    { title: "Traction", desc: "Revenue, users, or key growth signals." },
                    { title: "Moat / Defensibility", desc: "IP, network effects, switching costs." },
                    { title: "Business Model", desc: "Unit economics and revenue clarity." },
                    { title: "Product", desc: "Product maturity and differentiation." },
                    { title: "Timing", desc: "Market readiness and macro tailwinds." },
                    { title: "Go-to-Market", desc: "Distribution strategy and channel fit." },
                    { title: "Risks", desc: "Key vulnerabilities and failure modes." },
                    { title: "Capital Efficiency", desc: "Burn rate vs. milestone velocity." },
                  ].map((m, i) => (
                    <motion.div key={i} variants={fadeUp} className="bg-black/60 border border-white/10 backdrop-blur-xl p-5 rounded-xl hover:-translate-y-2 transition-transform duration-300">
                      <h4 className="font-display text-sm md:text-base font-black uppercase mb-3 text-white">{m.title}</h4>
                      <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{m.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* FINAL CTA */}
        <section className="h-[50vh] w-full flex flex-col items-center justify-center px-6 text-center border-t border-white/10 bg-black/80 backdrop-blur-xl snap-end">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-7xl font-black uppercase mb-10">
              Ready to find the <br/>
              <span className="font-serif italic font-normal text-gray-400 lowercase">Next Unicorn?</span>
            </motion.h2>
            <motion.div variants={fadeUp}>
              <Link 
                to="/companies"
                className="inline-flex items-center justify-center px-16 py-6 font-bold text-white bg-transparent border-2 border-white rounded-full transition-all hover:bg-white hover:text-black hover:scale-105"
              >
                <span className="text-xl uppercase tracking-widest font-display">Begin Scouting</span>
              </Link>
            </motion.div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import BuyMeCoffee from '../components/BuyMeCoffee';
import { API_BASE_URL } from '../config';

export default function Landing() {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0; 
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, []); // Only set initial state

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted && volume === 0) {
        videoRef.current.volume = 0.5;
        setVolume(0.5);
      }
    }
  };

  const increaseVolume = () => {
    if (videoRef.current) {
      const newVol = Math.min(1, videoRef.current.volume + 0.2);
      videoRef.current.volume = newVol;
      setVolume(newVol);
      if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const decreaseVolume = () => {
    if (videoRef.current) {
      const newVol = Math.max(0, videoRef.current.volume - 0.2);
      videoRef.current.volume = newVol;
      setVolume(newVol);
      if (newVol <= 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

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
      
      {/* Fixed Video Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
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
      
      {/* Top Left Logo */}
      <div className="fixed top-6 left-6 md:top-8 md:left-8 z-50">
        <Link to="/" className="text-3xl md:text-4xl font-italiana tracking-tighter text-white hover:opacity-80 transition-opacity drop-shadow-lg">
          TogetherScout
        </Link>
      </div>

      {/* Top right Action Icons */}
      <div className="fixed top-6 right-6 md:top-8 md:right-8 z-50 flex items-center gap-4">
        <BuyMeCoffee />
        <div className="flex items-center gap-2">
          <a href="https://github.com/negativenagesh" target="_blank" rel="noreferrer" className="p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300 flex items-center justify-center group" title="GitHub">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 group-hover:text-black transition-colors"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
          </a>
          <a href="https://x.com/_subrahmanya_" target="_blank" rel="noreferrer" className="p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300 flex items-center justify-center group" title="X (Twitter)">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:text-black transition-colors"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://www.instagram.com/subrahmanya_gaonkar/" target="_blank" rel="noreferrer" className="p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300 flex items-center justify-center group" title="Instagram">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:text-black transition-colors"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
          </a>
          <a href="https://www.linkedin.com/in/subrahmanya-gaonkar/" target="_blank" rel="noreferrer" className="p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300 flex items-center justify-center group" title="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:text-black transition-colors"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>
      </div>

      {/* Main Scrolling Content (Snaps) */}
      <div className="relative z-10 h-full w-full">
        
        {/* HERO SECTION */}
        <section className="h-screen w-full flex flex-col items-center justify-start pt-20 pb-8 px-6 text-center snap-start relative">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-col items-center w-full max-w-6xl mx-auto h-full"
          >
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300">The Ultimate VC Intelligence Engine</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-5xl font-black tracking-tighter mb-2 leading-[1] text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 uppercase">
              Quantify The <br/>
              <span className="font-serif italic text-5xl md:text-6xl text-white font-normal lowercase tracking-normal">Unquantifiable.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl text-sm md:text-base mb-4 font-medium">
              TogetherScout radically transforms how Venture Capitalists discover and assess elite startups. Powered by AI agents, designed for pure speed.
            </motion.p>
            
            <motion.div variants={fadeUp} className="mb-6">
              <Link 
                to="/companies"
                className="group relative inline-flex items-center justify-center px-6 py-2.5 font-bold text-black bg-white rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 border border-white"
              >
                <div className="absolute inset-0 w-full h-full bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative flex items-center gap-2 text-sm mix-blend-difference text-white uppercase tracking-widest">
                  Enter Directory
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
            </motion.div>

            {/* Inline Video Player */}
            <motion.div variants={fadeUp} className="w-full relative rounded-2xl overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] group flex-grow flex min-h-0">
              <video 
                ref={videoRef}
                src={`${API_BASE_URL}/api/video/launch`}
                className="w-full h-full object-cover rounded-2xl bg-black"
                autoPlay 
                loop 
                playsInline
                muted={isMuted}
              />
              
              {/* Social Icons Overlay (Always Visible, Top Right) */}
              <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
                {/* X (Twitter) Button */}
                <a 
                  href="https://x.com/_subrahmanya_/status/2076227680085954980?s=20" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 bg-black/50 text-white hover:bg-white/20 rounded-full transition-colors flex items-center justify-center backdrop-blur-md border border-white/10"
                  title="View on X"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                
                {/* Instagram Button */}
                <a 
                  href="https://www.instagram.com/reel/DarqhcSTEPE/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 bg-black/50 text-white hover:bg-white/20 rounded-full transition-colors flex items-center justify-center backdrop-blur-md border border-white/10"
                  title="Watch on Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
              
              {/* Custom Controls Overlay (Bottom Right, Hover Only) */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/70 backdrop-blur-md p-2 rounded-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={toggleMute}
                  className="p-1.5 text-white hover:bg-white/20 rounded-full transition-colors flex items-center gap-2"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>

                <div className="w-px h-5 bg-white/20 mx-1"></div>

                <div className="flex flex-row items-center gap-1">
                  <button onClick={decreaseVolume} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors" title="Volume Down">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 10h4l5-5v14l-5-5H6v-4z" />
                    </svg>
                  </button>
                  <div className="w-8 h-1 bg-white/20 rounded-full overflow-hidden mx-1">
                    <div className="h-full bg-white transition-all duration-200" style={{ width: `${volume * 100}%` }}></div>
                  </div>
                  <button onClick={increaseVolume} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors" title="Volume Up">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6 10h4l5-5v14l-5-5H6v-4z" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* MARQUEE */}
        <div className="w-full bg-white text-black py-4 overflow-hidden border-y border-gray-800 flex items-center snap-center relative z-20">
          <div className="whitespace-nowrap animate-marquee font-display font-black text-2xl uppercase tracking-widest flex w-[200%]">
            <span className="w-1/2">AI-DRIVEN THESIS • 10-POINT METRIC SCORING • YC BATCH ANALYSIS • DEEP WEB SCRAPING • REAL-TIME EVALUATIONS • </span>
            <span className="w-1/2">AI-DRIVEN THESIS • 10-POINT METRIC SCORING • YC BATCH ANALYSIS • DEEP WEB SCRAPING • REAL-TIME EVALUATIONS • </span>
          </div>
        </div>

        {/* SECTION 1: The Engine */}
        <section className="min-h-screen w-full flex items-center justify-center py-24 px-6 md:px-20 max-w-7xl mx-auto snap-start">
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

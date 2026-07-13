import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Companies from './pages/Companies';
import Founders from './pages/Founders';
import Landing from './pages/Landing';
import { API_BASE_URL } from './config';
import BuyMeCoffee from './components/BuyMeCoffee';
import TogetherRadar from './components/TogetherRadar';
import SettingsModal from './components/SettingsModal';
import { getFingerprint } from './utils/fingerprint';
import ServerWakingScreen from './components/ServerWakingScreen';

function Layout({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const [serverStatus, setServerStatus] = useState('waking');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [radarWidth, setRadarWidth] = useState(420);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      const mainEl = document.getElementById('main-container');
      if (!mainEl) return;
      const rightEdge = mainEl.getBoundingClientRect().right;
      let newWidth = rightEdge - e.clientX - 16; // 16px for padding/gap
      if (newWidth < 300) newWidth = 300;
      if (newWidth > 800) newWidth = 800;
      setRadarWidth(newWidth);
    };
    const handleMouseUp = () => setIsDragging(false);
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    let isMounted = true;
    
    // Ping the backend health check route
    fetch(`${API_BASE_URL}/api/health`)
      .then(res => {
        if (isMounted) setServerStatus('ready');
      })
      .catch(err => {
        if (isMounted) setServerStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Send tracking data silently in the background
    const fingerprint = getFingerprint(location.pathname);
    fetch(`${API_BASE_URL}/api/audit/page_view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fingerprint)
    }).catch(() => {}); // Fail silently
  }, [location.pathname]);
  
  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {serverStatus === 'waking' && !isLanding && (
        <ServerWakingScreen />
      )}
      <header className="border-b border-border bg-background p-4 flex justify-between items-center z-40 flex-shrink-0">
        <Link to="/" className="text-3xl font-italiana tracking-tighter text-foreground flex items-center gap-2 hover:opacity-80 transition-opacity">
          TogetherScout
        </Link>
        <div id="header-banner-portal" className="flex-grow flex justify-center px-4 max-w-2xl hidden md:flex z-50"></div>
        <nav className="flex gap-4 font-bold text-sm tracking-wide uppercase items-center">
          <div className="flex items-center gap-3 mr-2">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest animate-pulse hidden md:inline-block">
              Add your API Keys to continue smoothly →
            </span>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <Link to="/companies" className="px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300">
            Companies
          </Link>
          <Link to="/founders" className="px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300">
            Founders
          </Link>
          <div className="flex items-center gap-4 ml-2 border-l border-white/10 pl-6">
            <BuyMeCoffee />
            <div className="flex items-center gap-2">
              <a href="https://github.com/negativenagesh" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300" title="GitHub">
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
              </a>
              <a href="https://x.com/_subrahmanya_" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300" title="X (Twitter)">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.instagram.com/subrahmanya_gaonkar/" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300" title="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
              <a href="https://www.linkedin.com/in/subrahmanya-gaonkar/" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300" title="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </nav>
      </header>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <main id="main-container" className={`flex-grow flex w-full max-w-[1800px] mx-auto p-4 gap-6 overflow-hidden ${isDragging ? 'select-none pointer-events-none' : ''}`}>
        <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar pr-2 pointer-events-auto">
          {children}
        </div>
        {!isLanding && (
          <div className="hidden xl:flex h-full pb-4 relative pointer-events-auto" style={{ width: radarWidth }}>
            {/* Drag Handle */}
            <div 
              className="absolute -left-5 top-1/2 -translate-y-1/2 w-4 h-16 cursor-ew-resize flex items-center justify-center z-50 group"
              onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
            >
              <div className={`w-1 h-full rounded-full transition-colors ${isDragging ? 'bg-purple-500' : 'bg-white/10 group-hover:bg-white/30'}`} />
            </div>
            
            <div className="w-full h-full">
              <TogetherRadar />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/founders" element={<Founders />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

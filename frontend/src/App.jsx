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
    
    // Ping the backend health check route immediately
    fetch(`${API_BASE_URL}/`)
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
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-500 px-4 py-2 text-sm text-center flex items-center justify-center gap-2 z-50 animate-in fade-in slide-in-from-top-4 duration-500 flex-shrink-0">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Using free Render server. Waking up backend from sleep (may take up to 50s)...
        </div>
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
            <a href="https://github.com/negativenagesh" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
            </a>
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

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Companies from './pages/Companies';
import Founders from './pages/Founders';
import Landing from './pages/Landing';
import { API_BASE_URL } from './config';
import BuyMeCoffee from './components/BuyMeCoffee';
import TogetherRadar from './components/TogetherRadar';

function Layout({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const [serverStatus, setServerStatus] = useState('waking');

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
      <main className="flex-grow flex w-full max-w-[1800px] mx-auto p-4 gap-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar pr-2">
          {children}
        </div>
        {!isLanding && (
          <div className="w-[420px] flex-shrink-0 h-full hidden xl:block pb-4">
            <TogetherRadar />
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

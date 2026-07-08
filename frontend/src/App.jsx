import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Companies from './pages/Companies';
import Founders from './pages/Founders';
import Landing from './pages/Landing';

function Layout({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-background p-4 flex justify-between items-center sticky top-0 z-10">
        <Link to="/" className="text-3xl font-italiana tracking-tighter text-foreground flex items-center gap-2 hover:opacity-80 transition-opacity">
          TogetherScout
        </Link>
        <nav className="flex gap-4 font-bold text-sm tracking-wide uppercase items-center">
          <Link to="/companies" className="px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300">
            Companies
          </Link>
          <Link to="/founders" className="px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300">
            Founders
          </Link>
          <a href="https://github.com/negativenagesh" target="_blank" rel="noreferrer" className="p-2 ml-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-gray-300">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
          </a>
        </nav>
      </header>
      <main className="flex-grow p-6 md:p-8 w-full max-w-7xl mx-auto">
        {children}
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

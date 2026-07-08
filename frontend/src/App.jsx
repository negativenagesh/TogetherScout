import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Companies from './pages/Companies';
import Founders from './pages/Founders';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-background p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="text-xl font-black tracking-tighter text-foreground flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-sm"></div>
          TogetherScout
        </div>
        <nav className="flex gap-6 font-medium text-sm text-muted-foreground">
          <Link to="/companies" className="hover:text-foreground transition-colors">Companies</Link>
          <Link to="/founders" className="hover:text-foreground transition-colors">Founders</Link>
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
          <Route path="/" element={<Companies />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/founders" element={<Founders />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

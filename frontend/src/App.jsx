import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Companies from './pages/Companies';
import Founders from './pages/Founders';
import FounderProfile from './pages/FounderProfile';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card text-card-foreground p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm backdrop-blur-md bg-opacity-90">
        <div className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">TogetherScout</div>
        <nav className="flex gap-6 font-medium">
          <Link to="/companies" className="hover:text-blue-400 transition-colors">Companies</Link>
          <Link to="/founders" className="hover:text-blue-400 transition-colors">Founders</Link>
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
          <Route path="/founders/:id" element={<FounderProfile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Founders() {
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/founders/')
      .then(r => r.json())
      .then(data => {
        setFounders(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-10 animate-pulse text-muted-foreground">Loading founders...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Founder Directory</h1>
        <div className="text-sm text-muted-foreground">{founders.length} Results</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {founders.map(founder => (
          <div key={founder.id} className="bg-card rounded-lg border border-border p-6 hover:border-foreground transition-all duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg">
                {founder.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{founder.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs uppercase tracking-wider font-semibold text-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">{founder.role}</span>
                  {founder.diaspora_flag && <span className="text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded">Diaspora</span>}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed">{founder.bio}</p>
            
            <Link 
              to={`/founders/${founder.id}`} 
              className="block text-center w-full bg-transparent hover:bg-foreground hover:text-background text-foreground font-medium py-2 rounded-md transition-colors border border-border"
            >
              View Profile & Evaluate
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

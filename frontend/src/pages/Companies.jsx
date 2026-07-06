import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/companies/')
      .then(r => r.json())
      .then(data => {
        setCompanies(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handleClassify = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/companies/${id}/classify`, {
        method: 'POST'
      });
      const updated = await res.json();
      setCompanies(companies.map(c => c.id === id ? updated : c));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="text-center p-10 animate-pulse text-muted-foreground">Loading companies...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Companies Directory</h1>
        <div className="text-sm text-muted-foreground">{companies.length} Results</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="col-span-1 p-4 bg-card rounded-lg border border-border space-y-6">
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Filters</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-600 bg-gray-800" />
                <span>US-India Corridor</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-600 bg-gray-800" />
                <span>Hiring Now</span>
              </label>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Fit Score</h3>
            <input type="range" className="w-full accent-blue-500" />
          </div>
        </div>

        {/* Grid */}
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {companies.map(company => (
            <div key={company.id} className="bg-card rounded-lg border border-border p-5 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 group flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{company.name}</h2>
                {company.together_fit_score !== null && (
                  <span className="bg-blue-500/10 text-blue-400 font-bold px-2.5 py-1 rounded-full text-xs border border-blue-500/20">
                    {company.together_fit_score} Fit
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{company.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md">{company.batch}</span>
                <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md">{company.source}</span>
                {company.us_india_relevance_flag && (
                  <span className="bg-orange-500/10 text-orange-400 text-xs px-2 py-1 rounded-md border border-orange-500/20">US-India</span>
                )}
              </div>

              {company.together_fit_rationale && (
                <div className="mt-auto bg-black/40 p-3 rounded-md text-xs text-gray-300 border border-gray-800 italic">
                  "{company.together_fit_rationale}"
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <button 
                  onClick={() => handleClassify(company.id)}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"
                >
                  {company.together_fit_score !== null ? 'Re-Classify' : 'Run Autopsy'}
                </button>
                <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">Website ↗</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

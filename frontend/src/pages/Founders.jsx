import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../config';

const BATCHES = ["W27", "F26", "S26", "P26", "W26", "F25", "S25", "P25", "W25", "F24", "S24", "W24", "S23", "W23", "S22", "W22", "S21", "W21", "S20", "W20", "S19", "W19", "S18", "W18", "S17", "W17", "S16", "W16", "S15", "W15", "S14", "W14", "S13", "W13", "S12", "W12", "S11", "W11", "S10", "W10", "S09", "W09", "S08", "W08", "S07", "W07", "S06", "W06", "S05"];
const INDUSTRIES = ["B2B", "Consumer", "Healthcare", "Fintech", "Industrials", "Real Estate and Construction", "Education", "Government"];
const ROLES = ["Founder", "CEO", "CTO", "Co-Founder", "COO"];

export default function Founders() {
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  const [filters, setFilters] = useState({
    batches: [],
    industries: [],
    roles: [],
  });

  const [evaluating, setEvaluating] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [expandedEval, setExpandedEval] = useState(null);
  const [bios, setBios] = useState({});

  useEffect(() => {
    founders.forEach(founder => {
      setBios(prev => {
        if (prev[founder.id] !== undefined) return prev;
        
        if (founder.company_slug) {
          fetch(`${API_BASE_URL}/api/companies/founders/bio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: String(founder.id),
              first_name: founder.first_name || "",
              last_name: founder.last_name || "",
              company_slug: founder.company_slug || "",
              current_company: founder.current_company || ""
            })
          }).then(res => res.json()).then(data => {
            setBios(current => ({ ...current, [founder.id]: data || null }));
          }).catch(e => console.error(e));
        }
        
        return { ...prev, [founder.id]: null }; 
      });
    });
  }, [founders]);

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) 
        ? prev[key].filter(i => i !== value)
        : [...prev[key], value]
    }));
    setPage(0);
    setFounders([]);
  };

  const fetchFounders = useCallback(async () => {
    setLoading(true);
    
    // Construct Algolia filters
    let filterString = [];
    
    // Default filter for public users
    filterString.push('_tags:"ycdc_public"');
    
    if (filters.batches.length > 0) {
      filterString.push(`(${filters.batches.map(b => `batches:"${b}"`).join(' OR ')})`);
    }
    if (filters.industries.length > 0) {
      filterString.push(`(${filters.industries.map(i => `yc_parent_industries:"${i}"`).join(' OR ')})`);
    }
    if (filters.roles.length > 0) {
      filterString.push(`(${filters.roles.map(r => `yc_titles:"${r}"`).join(' OR ')})`);
    }

    const payload = {
      params: new URLSearchParams({
        query: search,
        hitsPerPage: 18,
        page: page,
        filters: filterString.join(' AND ')
      }).toString()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/companies/founders_yc_search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (page === 0) {
        setFounders(data.hits);
      } else {
        setFounders(prev => [...prev, ...data.hits]);
      }
      
      setHasMore(data.page < data.nbPages - 1);
      setTotalResults(data.nbHits);
    } catch (error) {
      console.error("Error fetching founders:", error);
    }
    setLoading(false);
  }, [filters, search, page]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (page === 0) fetchFounders();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, filters, fetchFounders, page]);

  useEffect(() => {
    if (page > 0) fetchFounders();
  }, [page, fetchFounders]);

  const handleAutopsy = async (founder) => {
    setEvaluating(prev => ({ ...prev, [founder.id]: true }));
    
    // Map algolia format to backend model
    const founderModel = {
      id: String(founder.id),
      first_name: founder.first_name || "",
      last_name: founder.last_name || "",
      avatar_thumb: founder.avatar_thumb || "",
      current_company: founder.current_company || "",
      company_slug: founder.company_slug || "",
      current_title: founder.current_title || "",
      yc_industries: founder.yc_parent_industries || [],
      yc_titles: founder.yc_titles || [],
      batches: founder.batches || []
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/companies/founders/${founder.id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(founderModel)
      });
      
      if (!res.ok) throw new Error('Evaluation failed');
      const data = await res.json();
      
      setEvaluations(prev => ({ ...prev, [founder.id]: data.evaluation }));
      setExpandedEval({ ...founderModel, evaluation: data.evaluation });
    } catch (e) {
      console.error(e);
      alert("AI Autopsy Failed. Check console.");
    } finally {
      setEvaluating(prev => ({ ...prev, [founder.id]: false }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* NVIDIA Evaluation Banner */}
      {Object.values(evaluating).some(Boolean) && document.getElementById('header-banner-portal') && createPortal(
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 duration-300 w-full whitespace-nowrap shadow-[0_0_15px_rgba(59,130,246,0.15)]">
          <svg className="animate-spin h-4 w-4 text-blue-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Using free NVIDIA LLM endpoint. Please be patient...
        </div>,
        document.getElementById('header-banner-portal')
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Founders Directory</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Sidebar Filters */}
        <div className="col-span-1 p-4 bg-card rounded-lg border border-border space-y-6 sticky top-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Batches</h3>
            <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {BATCHES.map(b => (
                <label key={b} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
                  <input type="checkbox" checked={filters.batches.includes(b)} onChange={() => toggleArrayFilter('batches', b)} className="rounded border-gray-600 bg-gray-800" />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Industry</h3>
            <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {INDUSTRIES.map(i => (
                <label key={i} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
                  <input type="checkbox" checked={filters.industries.includes(i)} onChange={() => toggleArrayFilter('industries', i)} className="rounded border-gray-600 bg-gray-800" />
                  <span>{i}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Role</h3>
            <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {ROLES.map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
                  <input type="checkbox" checked={filters.roles.includes(r)} onChange={() => toggleArrayFilter('roles', r)} className="rounded border-gray-600 bg-gray-800" />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Area */}
        <div className="col-span-1 md:col-span-3 flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4">
            <input 
              type="text"
              placeholder="Search founders by name or company..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
                setFounders([]);
              }}
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
            />
            <div className="text-sm font-medium whitespace-nowrap text-muted-foreground px-4 py-3 bg-card border border-border rounded-lg">
              {totalResults} Results
            </div>
          </div>

          {loading && founders.length === 0 ? (
             <div className="text-center p-10 animate-pulse text-muted-foreground">Finding exceptional founders...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {founders.map(founder => (
                  <div key={founder.id} className="bg-card rounded-lg border border-border p-5 hover:border-foreground transition-all duration-200 group flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                      {founder.avatar_thumb ? (
                        <img src={founder.avatar_thumb} alt={founder.first_name} className="w-16 h-16 rounded-full bg-gray-800 object-cover border border-gray-700" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-400 text-xl border border-gray-700">
                          {founder.first_name?.charAt(0)}{founder.last_name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <a href={`https://www.ycombinator.com/founders/${founder.url_slug}`} target="_blank" rel="noreferrer" className="text-lg font-bold group-hover:text-white transition-colors">
                          {founder.first_name} {founder.last_name}
                        </a>
                        <p className="text-sm text-gray-400">
                          {founder.yc_titles?.[0] || 'Founder'} at <span className="text-white font-medium">{founder.current_company}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {bios[founder.id]?.twitter_url && (
                          <a href={bios[founder.id].twitter_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Twitter / X">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          </a>
                        )}
                        {bios[founder.id]?.linkedin_url && (
                          <a href={bios[founder.id].linkedin_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors" title="LinkedIn">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      {bios[founder.id] === undefined ? (
                         <div className="animate-pulse h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                      ) : bios[founder.id]?.founder_bio ? (
                         <p className="text-sm text-gray-400 line-clamp-4 whitespace-pre-line">{bios[founder.id].founder_bio}</p>
                      ) : null}
                    </div>
                    
                    <div className="mt-auto flex flex-col gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {founder.batches && founder.batches.map(b => (
                          <span key={b} className="bg-secondary text-secondary-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                            {b}
                          </span>
                        ))}
                        {founder.yc_parent_industries && founder.yc_parent_industries.map((ind, idx) => (
                          <span key={idx} className="bg-blue-900/40 text-blue-300 border border-blue-800/50 text-[10px] uppercase px-2 py-0.5 rounded">
                            {ind}
                          </span>
                        ))}
                      </div>

                      {evaluations[founder.id] && (
                        <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mt-2 text-gray-300">
                          <div className="flex items-center justify-between mb-2">
                            <span className="bg-white text-black font-extrabold px-2 py-1 rounded text-xs">Fit: {evaluations[founder.id].overall_score}/100</span>
                            <button 
                              onClick={() => setExpandedEval({...founder, evaluation: evaluations[founder.id]})}
                              className="text-[10px] uppercase font-bold text-gray-400 hover:text-white transition-colors bg-gray-900 border border-gray-700 px-2 py-1 rounded"
                            >
                              View Details ↗
                            </button>
                          </div>
                          <div className="text-xs italic text-gray-400 truncate">
                            {evaluations[founder.id].metrics_breakdown[0]?.metric_name}: {evaluations[founder.id].metrics_breakdown[0]?.score}/10
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                      <button 
                        onClick={() => handleAutopsy(founder)}
                        disabled={evaluating[founder.id]}
                        className="text-xs bg-foreground hover:bg-white text-background font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full text-center cursor-pointer"
                        title="Run an AI evaluation on this founder"
                      >
                        {evaluating[founder.id] ? 'Evaluating Founder...' : (evaluations[founder.id] ? 'Re-Evaluate' : 'Run Founder AI Autopsy')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center mt-6 mb-10">
                  <button 
                    onClick={() => setPage(p => p + 1)}
                    disabled={loading}
                    className="bg-secondary border border-border text-foreground hover:bg-black transition-colors px-6 py-2 rounded-full text-sm font-medium"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Full Screen Evaluation Modal */}
      {expandedEval && expandedEval.evaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setExpandedEval(null)}
          />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-start">
              <div className="flex items-center gap-4">
                {expandedEval.avatar_thumb && (
                  <img src={expandedEval.avatar_thumb} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-700" />
                )}
                <div>
                  <h2 className="text-2xl font-bold">{expandedEval.first_name} {expandedEval.last_name} Autopsy</h2>
                  <p className="text-muted-foreground mt-1 text-sm">{expandedEval.current_title || expandedEval.yc_titles?.[0]} at {expandedEval.current_company}</p>
                </div>
              </div>
              <button 
                onClick={() => setExpandedEval(null)}
                className="text-muted-foreground hover:text-white p-1 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-background rounded-b-xl">
              <div className="flex items-center gap-4 bg-black/40 p-5 rounded-lg border border-gray-800">
                <div className="bg-white text-black font-black text-4xl px-6 py-4 rounded">
                  {expandedEval.evaluation.overall_score}<span className="text-gray-400 text-xl">/100</span>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="italic text-gray-200 text-lg leading-relaxed font-semibold">
                    Overall Conviction Score
                  </div>
                  <div className="text-gray-400 text-sm mt-1 max-w-lg leading-snug">
                    {expandedEval.evaluation.overall_rationale}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expandedEval.evaluation.metrics_breakdown.map((metric, idx) => (
                  <div key={idx} className="bg-card border border-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-white">{metric.metric_name}</h4>
                      <span className={`font-bold px-2 py-1 rounded text-xs ${metric.score >= 8 ? 'bg-green-900/30 text-green-400' : metric.score >= 5 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}>
                        {metric.score}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{metric.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

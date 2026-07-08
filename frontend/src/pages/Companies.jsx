import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const BATCHES = [
  "Winter 2027", "Fall 2026", "Summer 2026", "Spring 2026", "Winter 2026",
  "Fall 2025", "Summer 2025", "Spring 2025", "Winter 2025",
  "Fall 2024", "Summer 2024", "Winter 2024", 
  "Summer 2023", "Winter 2023", 
  "Summer 2022", "Winter 2022", 
  "Summer 2021", "Winter 2021", 
  "Summer 2020", "Winter 2020", 
  "Summer 2019", "Winter 2019", 
  "Summer 2018", "Winter 2018", 
  "Summer 2017", "Winter 2017", 
  "Summer 2016", "Winter 2016", 
  "Summer 2015", "Winter 2015", 
  "Summer 2014", "Winter 2014", 
  "Summer 2013", "Winter 2013", 
  "Summer 2012", "Winter 2012", 
  "Summer 2011", "Winter 2011", 
  "Summer 2010", "Winter 2010", 
  "Summer 2009", "Winter 2009", 
  "Summer 2008", "Winter 2008", 
  "Summer 2007", "Winter 2007", 
  "Summer 2006", "Winter 2006", 
  "Summer 2005"
];

const INDUSTRIES = [
  "B2B", "Consumer", "Healthcare", "Fintech", "Industrials", 
  "Real Estate and Construction", "Education", "Government"
];

const REGIONS = [
  "America / Canada", "Remote", "Europe", "South Asia", 
  "Latin America", "Southeast Asia", "Africa", "Middle East and North Africa"
];

const TS_INDUSTRIES = [
  "Artificial Intelligence", "Analytics", "Biotech", "Collaboration", "Consumer", 
  "Crypto", "Cybersecurity", "Data Science", "E-Commerce", "EdTech", 
  "Enterprise Software", "FinTech", "Gaming", "Hardware", "Healthcare", 
  "Marketplace", "Media", "Retail", "SaaS", "Sales", "Space", "Sustainability"
];

const TS_SIZES = [
  "1-10 employees", "11-50 employees", "51-100 employees", "101-200 employees", 
  "201-500 employees", "501-1000 employees", "1001-5000 employees", "5000+ employees"
];

const TS_FOUNDED = ["2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011"];

const TS_STAGES = [
  "Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Series D", 
  "Series E", "Series F", "Series G", "Series H", "Series I", "Post-IPO", "Unknown"
];

export default function Companies() {
  const [activeSource, setActiveSource] = useState("YC"); // "YC" | "TopStartups"
  
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [evaluations, setEvaluations] = useState({});
  const [evaluating, setEvaluating] = useState({});
  const [expandedEval, setExpandedEval] = useState(null);
  
  const [filters, setFilters] = useState({
    batch: [],
    industry: [],
    regions: [],
    top_company: false,
    nonprofit: false
  });

  const [tsFilters, setTsFilters] = useState({
    hq: "",
    industries: [],
    company_size: [],
    founded_year: [],
    funding_round: []
  });

  // Reset page when filters, search, or source change
  useEffect(() => {
    setPage(0);
    setCompanies([]);
  }, [filters, tsFilters, search, activeSource]);

  useEffect(() => {
    if (activeSource === "YC") {
      fetchYC();
    } else {
      fetchTopStartups();
    }
  }, [filters, tsFilters, search, page, activeSource]);

  const fetchYC = () => {
    const facetFilters = [];
    if (filters.batch.length > 0) facetFilters.push(filters.batch.map(b => `batch:${b}`));
    if (filters.industry.length > 0) facetFilters.push(filters.industry.map(i => `industry:${i}`));
    if (filters.regions.length > 0) facetFilters.push(filters.regions.map(r => `regions:${r}`));
    if (filters.top_company) facetFilters.push(["top_company:true"]);
    if (filters.nonprofit) facetFilters.push(["nonprofit:true"]);

    const params = new URLSearchParams();
    params.append('query', search);
    params.append('hitsPerPage', '42'); // Multiple of 3 for nice rows
    params.append('page', page.toString());
    if (facetFilters.length > 0) {
      params.append('facetFilters', JSON.stringify(facetFilters));
    }

    setLoading(true);
    fetch(`${API_BASE_URL}/api/companies/yc_search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: params.toString() })
    })
      .then(r => r.json())
      .then(data => {
        setCompanies(prev => page === 0 ? (data.hits || []) : [...prev, ...(data.hits || [])]);
        setHasMore(data.page < data.nbPages - 1);
        setTotalResults(data.nbHits || 0);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  const fetchTopStartups = () => {
    setLoading(true);
    
    // TopStartups uses 1-indexed pages
    const currentTsPage = page + 1;
    
    fetch(`${API_BASE_URL}/api/companies/topstartups_search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        filters: {
          hq: tsFilters.hq,
          industries: tsFilters.industries,
          company_size: tsFilters.company_size,
          founded_year: tsFilters.founded_year,
          funding_round: tsFilters.funding_round
        },
        page: currentTsPage
      })
    })
      .then(r => r.json())
      .then(data => {
        setCompanies(prev => currentTsPage === 1 ? (data.companies || []) : [...prev, ...(data.companies || [])]);
        setHasMore(data.has_more);
        // TopStartups API doesn't return total count currently, just hide it
        setTotalResults("-");
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  const handleAutopsy = async (company) => {
    setEvaluating(prev => ({ ...prev, [company.id]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/companies/evaluate_external`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: company.name,
          one_liner: company.one_liner || "",
          description: company.long_description || company.one_liner || "",
          slug: company.slug || "",
          website: company.website || ""
        })
      });
      const data = await res.json();
      setEvaluations(prev => ({ ...prev, [company.id]: data }));
    } catch (e) {
      console.error(e);
    }
    setEvaluating(prev => ({ ...prev, [company.id]: false }));
  };

  const toggleArrayFilter = (type, value) => {
    setFilters(prev => {
      const current = prev[type];
      if (current.includes(value)) {
        return { ...prev, [type]: current.filter(item => item !== value) };
      }
      return { ...prev, [type]: [...current, value] };
    });
  };

  const toggleBooleanFilter = (type) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const toggleTsArrayFilter = (type, value) => {
    setTsFilters(prev => {
      const current = prev[type];
      if (current.includes(value)) {
        return { ...prev, [type]: current.filter(item => item !== value) };
      }
      return { ...prev, [type]: [...current, value] };
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* NVIDIA Evaluation Banner */}
      {Object.values(evaluating).some(Boolean) && (
        <div className="fixed top-0 left-0 w-full bg-blue-500/10 border-b border-blue-500/20 text-blue-400 px-4 py-3 text-sm font-medium text-center flex items-center justify-center gap-3 z-[100] backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500 shadow-lg">
          <svg className="animate-spin h-5 w-5 text-blue-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Using free NVIDIA LLM endpoint. Please be patient as the AI Autopsy completes...
        </div>
      )}

      {/* Source Toggle & Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Companies Directory</h1>
        
        <div className="flex p-1 bg-black/40 border border-border rounded-lg shadow-inner">
          <button
            onClick={() => setActiveSource("YC")}
            className={`px-6 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
              activeSource === "YC" 
              ? "bg-foreground text-background shadow-md" 
              : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Y Combinator
          </button>
          <button
            onClick={() => setActiveSource("TopStartups")}
            className={`px-6 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
              activeSource === "TopStartups" 
              ? "bg-foreground text-background shadow-md" 
              : "text-muted-foreground hover:text-foreground"
            }`}
          >
            TopStartups.io
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Sidebar Filters */}
        <div className="col-span-1 p-4 bg-card rounded-lg border border-border space-y-6 sticky top-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          {activeSource === "YC" ? (
            <>
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Highlights</h3>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" checked={filters.top_company} onChange={() => toggleBooleanFilter('top_company')} className="rounded border-gray-600 bg-gray-800" />
                    <span>💎 Top Companies</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" checked={filters.nonprofit} onChange={() => toggleBooleanFilter('nonprofit')} className="rounded border-gray-600 bg-gray-800" />
                    <span>Nonprofit</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Batch</h3>
                <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {BATCHES.map(b => (
                    <label key={b} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
                      <input type="checkbox" checked={filters.batch.includes(b)} onChange={() => toggleArrayFilter('batch', b)} className="rounded border-gray-600 bg-gray-800" />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Industry</h3>
                <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {INDUSTRIES.map(ind => (
                    <label key={ind} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
                      <input type="checkbox" checked={filters.industry.includes(ind)} onChange={() => toggleArrayFilter('industry', ind)} className="rounded border-gray-600 bg-gray-800" />
                      <span>{ind}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Region</h3>
                <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {REGIONS.map(reg => (
                    <label key={reg} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
                      <input type="checkbox" checked={filters.regions.includes(reg)} onChange={() => toggleArrayFilter('regions', reg)} className="rounded border-gray-600 bg-gray-800" />
                      <span>{reg}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">HQ Location</h3>
                <input 
                  type="text" 
                  value={tsFilters.hq}
                  onChange={(e) => setTsFilters(prev => ({ ...prev, hq: e.target.value }))}
                  placeholder="Any city, country or Remote"
                  className="w-full bg-black/40 border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 text-white"
                />
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Industry</h3>
                <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {TS_INDUSTRIES.map(ind => (
                    <label key={ind} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
                      <input type="checkbox" checked={tsFilters.industries.includes(ind)} onChange={() => toggleTsArrayFilter('industries', ind)} className="rounded border-gray-600 bg-gray-800" />
                      <span>{ind}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Stage</h3>
                <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {TS_STAGES.map(stage => (
                    <label key={stage} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
                      <input type="checkbox" checked={tsFilters.funding_round.includes(stage)} onChange={() => toggleTsArrayFilter('funding_round', stage)} className="rounded border-gray-600 bg-gray-800" />
                      <span>{stage}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Size</h3>
                <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {TS_SIZES.map(size => (
                    <label key={size} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
                      <input type="checkbox" checked={tsFilters.company_size.includes(size)} onChange={() => toggleTsArrayFilter('company_size', size)} className="rounded border-gray-600 bg-gray-800" />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Founded</h3>
                <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {TS_FOUNDED.map(year => (
                    <label key={year} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
                      <input type="checkbox" checked={tsFilters.founded_year.includes(year)} onChange={() => toggleTsArrayFilter('founded_year', year)} className="rounded border-gray-600 bg-gray-800" />
                      <span>{year}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
          
        </div>

        {/* Grid Area */}
        <div className="col-span-1 md:col-span-3 flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4">
            <input 
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
            />
            {activeSource === "YC" && (
              <div className="text-sm font-medium whitespace-nowrap text-muted-foreground px-4 py-3 bg-card border border-border rounded-lg">
                {totalResults} Results
              </div>
            )}
          </div>

          {loading && companies.length === 0 ? (
             <div className="text-center p-10 animate-pulse text-muted-foreground">Hunting for unicorns...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {companies.map(company => (
                  <div key={company.id} className="bg-card rounded-lg border border-border p-5 hover:border-foreground transition-all duration-200 group flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      {company.small_logo_thumb_url ? (
                        <img src={company.small_logo_thumb_url} alt={company.name} className="w-12 h-12 rounded bg-white object-contain p-1" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center font-bold text-gray-500">
                          {company.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        {activeSource === "YC" && company.slug ? (
                          <a href={`https://www.ycombinator.com/companies/${company.slug}`} target="_blank" rel="noreferrer" className="text-lg font-bold group-hover:text-white transition-colors">
                            {company.name}
                          </a>
                        ) : (
                          <a href={company.website || "#"} target="_blank" rel="noreferrer" className="text-lg font-bold group-hover:text-white transition-colors">
                            {company.name}
                          </a>
                        )}
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{company.all_locations || "Remote"}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{company.one_liner || company.long_description}</p>
                    
                    {activeSource === "TopStartups" && (
                      <div className="mb-4">
                        {company.founders_text && (
                          <p className="text-xs text-muted-foreground mb-2">
                            <span className="font-semibold text-gray-300">Founders:</span> {company.founders_text}
                          </p>
                        )}
                        {company.team_size && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-gray-300">Size:</span> {company.team_size}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-auto flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {company.batch && (
                          <span className="bg-secondary text-secondary-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                            {activeSource === "YC" ? `Y ${company.batch}` : company.batch}
                          </span>
                        )}
                        {activeSource === "TopStartups" && company.all_industries ? (
                          company.all_industries.map((ind, idx) => (
                            <span key={idx} className="bg-secondary text-secondary-foreground text-[10px] uppercase px-2 py-0.5 rounded">
                              {ind}
                            </span>
                          ))
                        ) : company.industry && (
                          <span className="bg-secondary text-secondary-foreground text-[10px] uppercase px-2 py-0.5 rounded">
                            {company.industry}
                          </span>
                        )}
                        {activeSource === "TopStartups" && company.investors && company.investors.map((inv, idx) => (
                          <span key={`inv-${idx}`} className="bg-blue-900/50 text-blue-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                            {inv}
                          </span>
                        ))}
                        {evaluations[company.id]?.us_india_relevance_flag && (
                          <span className="bg-foreground text-background font-medium text-[10px] uppercase px-2 py-0.5 rounded">
                            US-India
                          </span>
                        )}
                      </div>

                      {evaluations[company.id] && (
                        <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mt-4 text-gray-300">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="bg-white text-black font-extrabold px-2 py-1 rounded text-xs">Fit: {evaluations[company.id].together_fit_score}/100</span>
                              <button 
                                onClick={() => setExpandedEval(company)}
                                className="text-[10px] uppercase font-bold text-gray-400 hover:text-white transition-colors bg-gray-900 border border-gray-700 px-2 py-1 rounded"
                              >
                                View Details ↗
                              </button>
                            </div>
                            <span className="text-xs italic opacity-90 leading-relaxed mt-2 line-clamp-3">"{evaluations[company.id].together_fit_rationale}"</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                      <button 
                        onClick={() => handleAutopsy(company)}
                        disabled={evaluating[company.id]}
                        className="text-xs bg-foreground hover:bg-white text-background font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Run an AI evaluation on this company"
                      >
                        {evaluating[company.id] ? 'Evaluating...' : (evaluations[company.id] ? 'Re-Evaluate' : 'Run AI Autopsy')}
                      </button>
                      <div className="flex gap-3 items-center">
                        {company.linkedin_url && (
                          <a href={company.linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-blue-400 transition-colors">LinkedIn ↗</a>
                        )}
                        {company.jobs_url && (
                          <a href={company.jobs_url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-green-400 transition-colors">Jobs ↗</a>
                        )}
                        {company.website && (
                          <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Website ↗</a>
                        )}
                      </div>
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
      {expandedEval && evaluations[expandedEval.id] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setExpandedEval(null)}
          />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  {expandedEval.small_logo_thumb_url && (
                     <img src={expandedEval.small_logo_thumb_url} alt="" className="w-8 h-8 rounded bg-white object-contain p-1" />
                  )}
                  {expandedEval.name} Autopsy
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">{expandedEval.one_liner}</p>
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
                <div className="bg-white text-black font-black text-3xl px-5 py-3 rounded">
                  {evaluations[expandedEval.id].together_fit_score}<span className="text-gray-400 text-lg">/100</span>
                </div>
                <div className="italic text-gray-300 text-sm leading-relaxed">
                  "{evaluations[expandedEval.id].together_fit_rationale}"
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(evaluations[expandedEval.id].metrics || []).map((m, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-lg p-5 flex gap-4 hover:border-gray-500 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-black flex items-center justify-center font-bold border border-gray-700 text-base shadow-inner">
                      {m.score}/10
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-100 uppercase tracking-wide text-xs mb-1.5">{m.name}</h4>
                      <p className="text-gray-400 text-xs leading-relaxed">{m.reason}</p>
                    </div>
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

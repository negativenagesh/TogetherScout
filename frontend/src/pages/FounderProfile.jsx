import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function FounderProfile() {
  const { id } = useParams();
  const [founder, setFounder] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [trace, setTrace] = useState([]);
  const traceEndRef = useRef(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/founders/${id}`)
      .then(r => r.json())
      .then(data => {
        setFounder(data);
        setLoading(false);
      });
      
    // Fetch existing eval if any
    fetch(`http://localhost:8000/api/founders/${id}/evaluation`)
      .then(r => {
        if (r.ok) return r.json();
        return null;
      })
      .then(data => {
        if (data) setEvaluation(data);
      });
  }, [id]);

  useEffect(() => {
    if (traceEndRef.current) {
      traceEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [trace]);

  const runEvaluation = () => {
    setRunning(true);
    setTrace([]);
    setEvaluation(null);

    const source = new EventSource(`http://localhost:8000/api/founders/${id}/evaluate_stream`);

    source.onmessage = (event) => {
      if (event.data === '[DONE]') {
        source.close();
        setRunning(false);
        return;
      }
      
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'step') {
          setTrace(prev => [...prev, data.content]);
        } else if (data.type === 'result') {
          setEvaluation(data.content);
        } else if (data.type === 'error') {
          setTrace(prev => [...prev, `ERROR: ${data.content}`]);
          source.close();
          setRunning(false);
        }
      } catch (e) {
        console.error("Failed to parse event", e);
      }
    };
    
    source.onerror = (err) => {
      console.error("EventSource failed:", err);
      source.close();
      setRunning(false);
    };
  };

  if (loading || !founder) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Link to="/founders" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to Founders</Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Details */}
        <div className="col-span-1 space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="w-20 h-20 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-3xl mb-4">
              {founder.name.charAt(0)}
            </div>
            <h1 className="text-2xl font-bold mb-1">{founder.name}</h1>
            <div className="text-muted-foreground font-medium capitalize text-sm mb-4">{founder.role} Role</div>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {founder.bio}
            </p>
            
            <div className="space-y-3 border-t border-border pt-4">
              {founder.github_url && (
                <a href={founder.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                  GitHub Profile
                </a>
              )}
            </div>

            <button 
              onClick={runEvaluation} 
              disabled={running}
              className={`mt-6 w-full py-3 rounded-md font-bold transition-all ${running ? 'bg-foreground/50 text-background cursor-not-allowed' : 'bg-foreground hover:bg-white text-background'}`}
            >
              {running ? 'Running Evaluation...' : 'Run Agentic Evaluation'}
            </button>
          </div>
        </div>

        {/* Evaluation Output & Trace */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          {/* Agent Trace */}
          {(running || trace.length > 0) && (
            <div className="bg-background border border-border rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto shadow-inner relative">
              <div className="absolute top-0 right-0 bg-secondary text-[10px] px-2 py-1 rounded-bl text-muted-foreground border-b border-l border-border">AGENT TRACE</div>
              <div className="space-y-2 mt-4">
                {trace.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-foreground">❯</span>
                    <span className="text-muted-foreground">{t}</span>
                  </div>
                ))}
                {running && (
                  <div className="flex gap-3 animate-pulse">
                    <span className="text-foreground">❯</span>
                    <span className="text-muted-foreground">Agent is thinking...</span>
                  </div>
                )}
                <div ref={traceEndRef} />
              </div>
            </div>
          )}

          {/* Final Scorecard */}
          {evaluation && (
            <div className="bg-card border border-border rounded-lg p-6 shadow-xl animate-in fade-in zoom-in-95 duration-500">
              <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Final Scorecard</h3>
                  <div className="text-sm text-muted-foreground">Rubric: {evaluation.rubric_used.substring(0, 50)}...</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-foreground">{evaluation.overall_score}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Score</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-4">Dimension Scores</h4>
                  <div className="space-y-3">
                    {Object.entries(evaluation.dimension_scores || {}).map(([dim, score]) => (
                      <div key={dim}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{dim}</span>
                          <span className="font-bold">{score}/10</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div className="bg-foreground h-2 rounded-full" style={{ width: `${(score/10)*100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-2">Rationale</h4>
                    <p className="text-sm italic text-muted-foreground leading-relaxed border-l-2 border-foreground pl-3">"{evaluation.rationale}"</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-2">Recommendation</h4>
                    <div className="inline-block px-4 py-2 rounded-lg font-bold text-sm bg-foreground text-background border border-border">
                      {evaluation.recommendation}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                {evaluation.evidence && evaluation.evidence.length > 0 && (
                  <div className="bg-secondary/30 p-4 rounded text-sm">
                    <h4 className="font-semibold text-green-400 mb-2">Positive Evidence</h4>
                    <ul className="list-disc pl-4 space-y-1 text-gray-300">
                      {evaluation.evidence.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
                {evaluation.risk_flags && evaluation.risk_flags.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/10 p-4 rounded text-sm">
                    <h4 className="font-semibold text-red-400 mb-2">Risk Flags</h4>
                    <ul className="list-disc pl-4 space-y-1 text-gray-300">
                      {evaluation.risk_flags.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

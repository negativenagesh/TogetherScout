import { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { marked } from 'marked';

const EXAMPLE_QUERIES = [
  "Find me 3 stealth startups where the founders recently left OpenAI within the last 12 months.",
  "Are there any stealth AI agents startups founded by former Google DeepMind researchers?",
  "Find me stealth biotech startups that recently raised over $2,000,000 according to SEC Form D filings.",
  "Are there any stealth companies founded by alumni of Anthropic working on LLM alignment?",
  "Search for Y Combinator alumni who are currently building a stealth startup in the climate tech space.",
  "Find me stealth startups in the cybersecurity sector that filed a trademark recently.",
  "Look for ex-Tesla engineers who have started a stealth autonomous driving company.",
];

export default function TogetherRadar() {
  const [query, setQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  const [activeModel, setActiveModel] = useState('gemini');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showDeepseekKey, setShowDeepseekKey] = useState(false);

  useEffect(() => {
    const savedGemini = localStorage.getItem('gemini_api_key');
    const savedDeepseek = localStorage.getItem('deepseek_api_key');
    const savedActive = localStorage.getItem('active_model');
    if (savedGemini) setGeminiKey(savedGemini);
    if (savedDeepseek) setDeepseekKey(savedDeepseek);
    if (savedActive) setActiveModel(savedActive);
  }, []);

  const saveSettings = () => {
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('deepseek_api_key', deepseekKey);
    localStorage.setItem('active_model', activeModel);
    setIsSettingsOpen(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    const currentQuery = text;
    setQuery('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: currentQuery }]);
    setIsRunning(true);
    
    // Add initial assistant message for streaming updates
    setMessages(prev => [...prev, { role: 'assistant', status: 'Starting process...', logs: [], summary: '', candidates: [] }]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/radar/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: currentQuery,
          gemini_api_key: geminiKey || null,
          deepseek_api_key: deepseekKey || null,
          active_model: activeModel
        })
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Parse SSE format
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;
            
            try {
              const event = JSON.parse(dataStr);
              
              setMessages(prev => {
                const newMessages = [...prev];
                // Deep clone the last message so React detects the state mutation
                const lastMsg = { ...newMessages[newMessages.length - 1] };
                
                if (event.type === 'status') {
                  lastMsg.status = event.data;
                } else if (event.type === 'log') {
                  const existingLogIndex = (lastMsg.logs || []).findIndex(l => l.id && event.data.id && l.id === event.data.id);
                  if (existingLogIndex >= 0) {
                    const newLogs = [...lastMsg.logs];
                    newLogs[existingLogIndex] = event.data;
                    lastMsg.logs = newLogs;
                  } else {
                    lastMsg.logs = [...(lastMsg.logs || []), event.data];
                  }
                } else if (event.type === 'candidates') {
                  lastMsg.candidates = event.data;
                } else if (event.type === 'stream_chunk') {
                  lastMsg.summary = (lastMsg.summary || '') + event.data;
                } else if (event.type === 'error') {
                  lastMsg.error = event.data;
                }
                
                newMessages[newMessages.length - 1] = lastMsg;
                return newMessages;
              });
              
            } catch (e) {
              console.error("Error parsing SSE JSON:", e, dataStr);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        lastMsg.error = "Connection failed.";
        return newMessages;
      });
    } finally {
      setIsRunning(false);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg) lastMsg.status = null; // Hide status when done
        return newMessages;
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-black border border-border rounded-xl shadow-2xl overflow-hidden relative">
      <div className="bg-card border-b border-border p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold font-italiana tracking-wide flex items-center gap-2">
          TogetherRadar
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="ml-2 text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </h2>
      </div>

      {isSettingsOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold font-italiana tracking-wide mb-4 text-white">API Key Settings</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Default LLM is <code className="text-magenta-400 font-mono">stepfun-ai/step-3.7-flash</code> from the free NVIDIA endpoint, which is very slow due to free usage limits. Add your own DeepSeek or Gemini API key to avoid limits. Only one key is required.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Deepseek API Key</label>
                <div className="relative">
                  <input
                    type={showDeepseekKey ? "text" : "password"}
                    value={deepseekKey}
                    onChange={(e) => setDeepseekKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white pr-10 focus:outline-none focus:border-blue-500"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowDeepseekKey(!showDeepseekKey)}
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                  >
                    {showDeepseekKey ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a9.953 9.953 0 015.71-1.59c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Gemini API Key</label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white pr-10 focus:outline-none focus:border-blue-500"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                  >
                    {showGeminiKey ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a9.953 9.953 0 015.71-1.59c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {geminiKey && deepseekKey && (
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Active Model</label>
                  <div className="flex rounded-lg overflow-hidden border border-gray-700 text-sm">
                    <button 
                      type="button"
                      onClick={() => setActiveModel('deepseek')}
                      className={`flex-1 py-1.5 transition-colors ${activeModel === 'deepseek' ? 'bg-blue-600 text-white font-bold' : 'bg-black/50 text-gray-400 hover:bg-gray-800'}`}
                    >
                      Deepseek
                    </button>
                    <button 
                      type="button"
                      onClick={() => setActiveModel('gemini')}
                      className={`flex-1 py-1.5 transition-colors ${activeModel === 'gemini' ? 'bg-purple-600 text-white font-bold' : 'bg-black/50 text-gray-400 hover:bg-gray-800'}`}
                    >
                      Gemini
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Both keys provided. Choose which model to use.</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveSettings}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-white text-black hover:bg-gray-200 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-start text-center p-4 pt-6">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-1 font-italiana tracking-wide">Uncover Hidden Gems</h3>
            <p className="text-muted-foreground text-[10px] mb-4 max-w-xs leading-relaxed">Ask me to find stealth startups, specific founders, or signals across the web using our multi-agent discovery engine.</p>
            
            <div className="flex flex-col gap-1 w-full max-w-sm opacity-80 hover:opacity-100 transition-opacity">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-1.5 text-center font-italiana">Example Queries</p>
              <div className="grid grid-cols-1 gap-1 max-h-[35vh] overflow-y-auto custom-scrollbar pr-1">
                {EXAMPLE_QUERIES.map((eq, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(eq)}
                    className="w-full text-left bg-gradient-to-r from-white/5 to-transparent hover:from-white/10 hover:to-white/5 border border-white/5 rounded p-1.5 text-[9px] leading-tight text-gray-400 font-mono tracking-wide transition-all duration-300 hover:border-white/20 hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`${
                msg.role === 'user' 
                  ? 'bg-gray-800/80 text-gray-200 p-2.5 rounded-lg text-[12px] leading-relaxed border border-gray-700/50 self-end max-w-[85%] font-sans drop-shadow-sm' 
                  : 'max-w-[90%] rounded-2xl px-5 py-3 bg-card border border-border w-full'
              }`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <div className="space-y-4">
                    {/* Status indicator */}
                    {msg.status && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full w-fit animate-pulse">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {msg.status}
                      </div>
                    )}
                    
                    {/* Logs */}
                    {msg.logs && msg.logs.length > 0 && (
                      <div className="space-y-2 border-l-2 border-gray-700 pl-3">
                        {msg.logs.map((log, lidx) => (
                          <div key={lidx} className="text-xs text-gray-400">
                            <span className="font-bold text-magenta-400">[{log.agent_name}]</span> called <span className="font-bold text-green-400">{log.tool_name}</span>
                            <details className="mt-1 opacity-70 group">
                              <summary className="cursor-pointer hover:text-white transition-colors list-none flex items-center gap-1">
                                <svg className="w-3 h-3 group-open:rotate-90 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                <span className="truncate flex-1">↳ {log.result}</span>
                              </summary>
                              <div className="mt-2 p-2 bg-black/40 rounded border border-white/5 whitespace-pre-wrap font-mono text-[10px] text-gray-300 max-h-40 overflow-y-auto custom-scrollbar">
                                {log.result === 'Running...' ? (
                                  <span className="text-blue-400 animate-pulse inline-flex items-center gap-1">
                                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Running...
                                  </span>
                                ) : (
                                  log.result
                                )}
                              </div>
                            </details>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Candidates */}
                    {msg.candidates && msg.candidates.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-bold mb-2 uppercase tracking-wide text-gray-500">Candidates Evaluated</h4>
                        <div className="grid gap-2">
                          {msg.candidates.map((cand, cidx) => (
                            <div key={cidx} className="bg-black/50 border border-gray-800 p-3 rounded-lg flex items-center justify-between">
                              <span className="font-bold">{cand.name}</span>
                              <span className={`text-xs px-2 py-1 rounded font-bold ${
                                cand.confidence_score > 70 ? 'bg-green-900/30 text-green-400' :
                                cand.confidence_score > 40 ? 'bg-yellow-900/30 text-yellow-400' :
                                'bg-red-900/30 text-red-400'
                              }`}>
                                Score: {cand.confidence_score}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {msg.summary && (
                      <div className="mt-4 prose prose-invert max-w-none text-[12px] font-sans text-gray-300 leading-relaxed prose-th:p-1 prose-td:p-1 prose-table:border prose-table:border-white/10 prose-th:bg-white/5 prose-th:text-[11px] prose-td:text-[11px]"
                           dangerouslySetInnerHTML={{ 
                             __html: marked.parse(msg.summary)
                           }} 
                      />
                    )}
                    
                    {/* Error */}
                    {msg.error && (
                      <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                        {msg.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-card border-t border-border">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(query); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isRunning}
            placeholder="Type your stealth search query..."
            className="flex-1 bg-black/50 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-500 text-white disabled:opacity-50 transition-colors"
          />
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setIsRunning(false);
              setQuery('');
            }}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isRunning || !query.trim()}
            className="bg-foreground text-background px-4 py-2 rounded-lg font-bold disabled:opacity-50 transition-opacity hover:opacity-90"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

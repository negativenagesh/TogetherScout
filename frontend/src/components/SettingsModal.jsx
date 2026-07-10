import { useState, useEffect } from 'react';

export default function SettingsModal({ isOpen, onClose }) {
  const [geminiKey, setGeminiKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  const [activeModel, setActiveModel] = useState('gemini');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showDeepseekKey, setShowDeepseekKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedGemini = localStorage.getItem('gemini_api_key') || '';
      const savedDeepseek = localStorage.getItem('deepseek_api_key') || '';
      const savedActive = localStorage.getItem('active_model') || 'gemini';
      setGeminiKey(savedGemini);
      setDeepseekKey(savedDeepseek);
      setActiveModel(savedActive);
    }
  }, [isOpen]);

  const saveSettings = () => {
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('deepseek_api_key', deepseekKey);
    localStorage.setItem('active_model', activeModel);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" style={{ position: 'fixed' }}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
        <h3 className="text-xl font-bold font-italiana tracking-wide mb-4 text-white">API Key Settings</h3>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          Default LLM is <code className="text-magenta-400 font-mono">stepfun-ai/step-3.7-flash</code> from the free NVIDIA endpoint, which is very slow. Add your own DeepSeek or Gemini API key to avoid limits. <strong className="text-white">The keys will be used globally across TogetherRadar, Founder Evaluator, and Accelerator Autopsy tools.</strong> Only one key is required.
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
            onClick={onClose}
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
  );
}

import React, { useState, useEffect } from 'react';
import { Aperture, Sparkles, Layers, History, Settings, Thermometer, Wind, Eye } from 'lucide-react';
import { OutfitParams, GeneratedResult, OutfitSpec } from './types';
import { INITIAL_PARAMS, MOCK_HISTORY } from './constants';
import { generateOutfitSpecification, generateOutfitImage } from './services/geminiService';
import { JsonViewer } from './components/JsonViewer';
import { HiddenLayer } from './components/HiddenLayer';

const App: React.FC = () => {
  const [params, setParams] = useState<OutfitParams>(INITIAL_PARAMS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSpec, setCurrentSpec] = useState<OutfitSpec | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedResult[]>(MOCK_HISTORY);
  
  // The Reveal State
  const [showHiddenLayer, setShowHiddenLayer] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImage(null);
    setCurrentSpec(null);

    try {
      // 1. Generate Structure (FIBO Simulation)
      const spec = await generateOutfitSpecification(params);
      setCurrentSpec(spec);

      // 2. Generate Image
      const imageUrl = await generateOutfitImage(spec);
      setGeneratedImage(imageUrl);

      // Save to history
      const newResult: GeneratedResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        params: { ...params },
        spec,
        imageUrl
      };
      setHistory(prev => [newResult, ...prev]);

    } catch (error) {
      console.error("Workflow failed", error);
      alert("System overload. Please refine parameters.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-900/10 rounded-full blur-[120px]"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 border-b border-white/5 backdrop-blur-md bg-black/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-700 flex items-center justify-center shadow-[0_0_15px_rgba(217,119,6,0.5)]">
             <Aperture className="text-black" size={20} />
          </div>
          <span className="font-serif text-xl tracking-widest text-amber-50">AURELIAN'S CLOSET</span>
        </div>
        
        <div className="flex items-center gap-6">
           <button className="text-xs font-mono text-gray-400 hover:text-amber-400 transition-colors uppercase tracking-wider flex items-center gap-2">
              <History size={14} /> Style Log
           </button>
           <button 
             onClick={() => setShowHiddenLayer(!showHiddenLayer)}
             className={`px-4 py-2 rounded-full border transition-all duration-500 flex items-center gap-2 text-xs font-mono tracking-widest uppercase ${showHiddenLayer ? 'border-cyan-500 text-cyan-400 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-white/10 text-gray-400 hover:border-amber-500/50 hover:text-amber-400'}`}
           >
              {showHiddenLayer ? <Eye size={14} /> : <Layers size={14} />}
              {showHiddenLayer ? 'SYSTEM: ACTIVE' : 'SYSTEM: STANDBY'}
           </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 container mx-auto px-4 py-8 h-[calc(100vh-88px)] flex gap-6">
        
        {/* Left Column: Controls & Input */}
        <div className="w-1/4 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-amber-500 font-mono text-xs uppercase tracking-widest mb-6">Parameter Definition</h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase">Occasion</label>
                <input 
                  type="text" 
                  value={params.occasion}
                  onChange={(e) => setParams({...params, occasion: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase">Atmosphere / Weather</label>
                <div className="flex gap-2">
                   <div className="relative w-full">
                    <Thermometer size={14} className="absolute left-3 top-2.5 text-gray-500" />
                    <input 
                      type="text" 
                      value={params.weather}
                      onChange={(e) => setParams({...params, weather: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-colors"
                    />
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase">Emotional Intent</label>
                <input 
                  type="text" 
                  value={params.mood}
                  onChange={(e) => setParams({...params, mood: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase">Style Archetype</label>
                <input 
                  type="text" 
                  value={params.style}
                  onChange={(e) => setParams({...params, style: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-8 w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-bold py-3 px-4 rounded-lg hover:from-amber-500 hover:to-yellow-500 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Fabricating...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Outfit
                </>
              )}
            </button>
          </div>

          {/* Mini History */}
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 overflow-y-auto backdrop-blur-md scrollbar-hide">
             <h3 className="text-gray-500 text-[10px] uppercase tracking-widest mb-4">Recent Curations</h3>
             <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="flex gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
                    <img src={item.imageUrl} className="w-12 h-16 object-cover rounded border border-white/10 group-hover:border-amber-500/30" alt="history" />
                    <div className="flex flex-col justify-center">
                      <span className="text-xs font-medium text-gray-300 group-hover:text-amber-400">{item.params.occasion}</span>
                      <span className="text-[10px] text-gray-600">{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Center: Structured Visual Control (FIBO Engine Visualization) */}
        <div className="w-1/3 flex flex-col gap-4">
           <div className="flex-1 relative">
             <div className="absolute -top-3 left-4 bg-black px-2 text-[10px] font-mono text-amber-500 uppercase z-20">Structured Visual Matrix</div>
             <JsonViewer data={currentSpec} loading={isGenerating} />
           </div>
        </div>

        {/* Right: The Output */}
        <div className="w-5/12 bg-black border border-white/10 rounded-2xl overflow-hidden relative group">
           {generatedImage ? (
             <div className="relative w-full h-full">
               <img src={generatedImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Generated Outfit" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
               <div className="absolute bottom-8 left-8">
                 <h2 className="font-serif text-3xl text-white mb-2 tracking-wide">{currentSpec?.occasion.replace('_', ' ')}</h2>
                 <p className="font-mono text-xs text-amber-400/80 max-w-md">{currentSpec?.description}</p>
               </div>
             </div>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 space-y-4">
               <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center">
                  <Aperture size={40} className="text-white/10" />
               </div>
               <p className="font-serif text-sm tracking-widest uppercase">Awaiting Curation</p>
             </div>
           )}
           
           {/* Loading Overlay */}
           {isGenerating && (
             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="w-full max-w-xs h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 animate-scan w-1/2"></div>
                </div>
                <div className="mt-4 font-mono text-xs text-amber-500 animate-pulse">RENDERING PHOTOREALISTIC TEXTURES</div>
             </div>
           )}
        </div>

      </main>

      {/* THE HIDDEN LAYER */}
      {showHiddenLayer && (
        <HiddenLayer history={history.map(h => h.spec)} />
      )}

    </div>
  );
};

export default App;
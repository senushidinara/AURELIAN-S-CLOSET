import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Brain, Activity, Lock, AlertTriangle } from 'lucide-react';
import { CognitiveAnalysis, OutfitSpec } from '../types';
import { analyzeCognitivePatterns } from '../services/geminiService';

interface HiddenLayerProps {
  history: OutfitSpec[];
}

export const HiddenLayer: React.FC<HiddenLayerProps> = ({ history }) => {
  const [analysis, setAnalysis] = useState<CognitiveAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        if (history.length > 0) {
           const result = await analyzeCognitivePatterns(history);
           setAnalysis(result);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [history]);

  if (loading) {
    return (
      <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
         <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-6"></div>
         <p className="text-cyan-500 font-mono tracking-widest animate-pulse">DECRYPTING COGNITIVE PATTERNS...</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="absolute inset-0 z-40 bg-slate-950 text-cyan-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-cyan-900/50 pb-6">
          <div>
            <h2 className="text-3xl font-light tracking-widest text-cyan-400 font-mono">
              <Brain className="inline-block mr-3 mb-1" size={32} />
              NEURO-AESTHETIC LAYER
            </h2>
            <p className="text-cyan-600/60 mt-2 font-mono text-sm uppercase">Passive Health Monitoring // Analysis Active</p>
          </div>
          <div className="text-right">
             <div className="flex items-center text-rose-500 space-x-2 font-mono text-xs border border-rose-900/30 bg-rose-950/20 px-3 py-1 rounded">
                <Lock size={12} />
                <span>E2E ENCRYPTED</span>
             </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Radar Chart: Current State */}
          <div className="bg-slate-900/50 border border-cyan-900/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-sm font-mono text-cyan-500 uppercase tracking-wider mb-6 flex items-center">
              <Activity className="mr-2" size={16} /> Current Cognitive Profile
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.metrics}>
                  <PolarGrid stroke="#22d3ee" strokeOpacity={0.2} />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#67e8f9', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Cognitive State"
                    dataKey="value"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fill="#06b6d4"
                    fillOpacity={0.3}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#22d3ee' }}
                    itemStyle={{ color: '#22d3ee' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Analysis & Alerts */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-cyan-900/30 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-mono text-cyan-500 uppercase tracking-wider mb-4">Summary</h3>
              <p className="text-lg font-light leading-relaxed text-slate-300">
                {analysis.summary}
              </p>
            </div>

            {analysis.alerts.length > 0 && (
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-6">
                <h3 className="text-sm font-mono text-rose-400 uppercase tracking-wider mb-4 flex items-center">
                  <AlertTriangle className="mr-2" size={16} /> Detected Anomalies
                </h3>
                <ul className="space-y-2">
                  {analysis.alerts.map((alert, i) => (
                    <li key={i} className="text-rose-200 text-sm flex items-start">
                      <span className="mr-2">•</span> {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
               {analysis.metrics.slice(0, 4).map((m, idx) => (
                 <div key={idx} className="bg-slate-900/30 border border-cyan-900/20 p-4 rounded-lg">
                    <div className="text-xs text-cyan-600 mb-1 font-mono uppercase">{m.category}</div>
                    <div className="text-2xl font-bold text-white">{m.value}%</div>
                    <div className={`text-[10px] mt-2 ${m.trend === 'down' ? 'text-rose-400' : 'text-emerald-400'}`}>
                       {m.trend === 'up' ? '▲ IMPROVING' : m.trend === 'down' ? '▼ DECLINING' : '■ STABLE'}
                    </div>
                 </div>
               ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-cyan-900/50 pt-6 text-center text-cyan-900/40 text-xs font-mono">
          AURELIAN NEURO-ENGINE v0.9.1 BETA // MEDICAL DISCLAIMER: INFORMATIONAL ONLY
        </div>
      </div>
    </div>
  );
};
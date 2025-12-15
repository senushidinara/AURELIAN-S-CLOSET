import React from 'react';
import { OutfitSpec } from '../types';

interface JsonViewerProps {
  data: OutfitSpec | null;
  loading: boolean;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4 font-mono text-xs text-green-500/80 p-8 border border-white/5 bg-black/40 backdrop-blur-sm rounded-xl">
        <div className="animate-pulse w-full h-2 bg-green-500/20 rounded"></div>
        <div className="animate-pulse w-3/4 h-2 bg-green-500/20 rounded"></div>
        <div className="animate-pulse w-5/6 h-2 bg-green-500/20 rounded"></div>
        <p className="animate-pulse mt-4 text-center">CONSTRUCTING VISUAL MATRIX...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full w-full flex items-center justify-center text-white/20 font-mono text-sm border border-white/5 bg-black/40 backdrop-blur-sm rounded-xl">
        [AWAITING PARAMETERS]
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden border border-white/10 bg-black/80 backdrop-blur-md rounded-xl p-4 font-mono text-xs text-amber-400/80 shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
      <div className="h-full overflow-y-auto scrollbar-hide">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
      <div className="absolute bottom-2 right-2 text-[10px] text-white/30 uppercase tracking-widest">
        FIBO Structure v2.4
      </div>
    </div>
  );
};
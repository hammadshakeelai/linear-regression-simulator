import React, { useState } from 'react';
import { Target, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { predict } from '../core/linearRegression';

interface PredictionPlaygroundProps {
  w: number;
  b: number;
  xLabel: string;
  yLabel: string;
  onSetTestX?: (x: number) => void;
}

export const PredictionPlayground: React.FC<PredictionPlaygroundProps> = ({
  w,
  b,
  xLabel,
  yLabel,
  onSetTestX,
}) => {
  const [inputX, setInputX] = useState<number>(85);
  const predictedY = predict(inputX, w, b);

  const handleInputChange = (val: number) => {
    setInputX(val);
    onSetTestX?.(val);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Prediction Playground (Test Model)</h3>
            <p className="text-xs text-slate-400">
              Input any custom feature <code className="text-cyan-300 font-mono">x</code> to evaluate hypothesis <code className="text-indigo-300 font-mono">f(x) = wx + b</code>
            </p>
          </div>
        </div>

        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
          Interactive Inference
        </span>
      </div>

      {/* Input / Output Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Input X Box */}
        <div className="sm:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Input Feature: {xLabel} (<code className="text-cyan-400 font-mono">x</code>)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="1"
              value={inputX}
              onChange={(e) => handleInputChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 font-bold"
            />
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            {[60, 75, 85, 95, 100].map((presetVal) => (
              <button
                key={presetVal}
                onClick={() => handleInputChange(presetVal)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                  inputX === presetVal
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {presetVal}
              </button>
            ))}
          </div>
        </div>

        {/* Transition Arrow */}
        <div className="sm:col-span-2 flex justify-center text-slate-500">
          <div className="p-2 rounded-full bg-slate-800/80 border border-slate-700/60">
            <ArrowRight className="w-4 h-4 text-indigo-400" />
          </div>
        </div>

        {/* Predicted Y Result Box */}
        <div className="sm:col-span-5 bg-gradient-to-br from-indigo-950/40 via-slate-950/90 to-slate-900 border border-indigo-500/30 rounded-xl p-3 space-y-1.5 shadow-lg">
          <span className="text-xs font-semibold text-indigo-300 block">
            Predicted Target: {yLabel} (<code className="text-indigo-400 font-mono">ŷ</code>)
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            {predictedY.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            f({inputX}) = ({w.toFixed(3)} · {inputX}) + ({b.toFixed(3)})
          </div>
        </div>
      </div>
    </div>
  );
};

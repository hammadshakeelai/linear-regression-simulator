import React from 'react';
import { Sliders, Sparkles, Shuffle, RotateCcw, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { StepMathDetails } from '../core/linearRegression';

interface ManualControlsProps {
  w: number;
  b: number;
  onUpdateW: (w: number) => void;
  onUpdateB: (b: number) => void;
  onSnapToOptimal: () => void;
  onRandomize: () => void;
  onReset: () => void;
  details: StepMathDetails;
  optimalW: number;
  optimalB: number;
  optimalCost: number;
}

export const ManualControls: React.FC<ManualControlsProps> = ({
  w,
  b,
  onUpdateW,
  onUpdateB,
  onSnapToOptimal,
  onRandomize,
  onReset,
  details,
  optimalW,
  optimalB,
  optimalCost,
}) => {
  // Determine slider ranges based on optimal values or current values
  const wCenter = optimalW || 0;
  const bCenter = optimalB || 0;
  const wDelta = Math.max(Math.abs(wCenter) * 2, 5);
  const bDelta = Math.max(Math.abs(bCenter) * 2, 50);

  const wMin = parseFloat((wCenter - wDelta).toFixed(2));
  const wMax = parseFloat((wCenter + wDelta).toFixed(2));
  const bMin = parseFloat((bCenter - bDelta).toFixed(2));
  const bMax = parseFloat((bCenter + bDelta).toFixed(2));

  // Closeness to optimal fit ratio
  const costRatio = optimalCost > 0 ? (details.jwb - optimalCost) / optimalCost : details.jwb;
  const fitScore = Math.max(0, Math.min(100, Math.round(100 / (1 + costRatio))));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Title & Mode Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Part 1: Manual Parameter Tuning</h2>
            <p className="text-xs text-slate-400">
              Drag sliders or enter weights to manually adjust the slope & intercept
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onSnapToOptimal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition shadow-sm"
            title="Instantly snap line to optimal Ordinary Least Squares solution"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Snap to Optimal</span>
          </button>

          <button
            onClick={onRandomize}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
            title="Randomize parameters"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={onReset}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
            title="Reset to 0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Parameter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Slope (w) Control */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Weight / Slope (<code className="text-indigo-400 font-mono">w</code>)
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.01"
                value={w}
                onChange={(e) => onUpdateW(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-right text-indigo-300 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={wMin}
            max={wMax}
            step="0.01"
            value={w}
            onChange={(e) => onUpdateW(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Min: {wMin}</span>
            <span className="text-slate-400">Optimal: {optimalW.toFixed(3)}</span>
            <span>Max: {wMax}</span>
          </div>

          {/* Fine Tuning Buttons */}
          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              onClick={() => onUpdateW(parseFloat((w - 0.1).toFixed(3)))}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
            >
              -0.1
            </button>
            <button
              onClick={() => onUpdateW(parseFloat((w - 0.01).toFixed(3)))}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
            >
              -0.01
            </button>
            <button
              onClick={() => onUpdateW(parseFloat((w + 0.01).toFixed(3)))}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
            >
              +0.01
            </button>
            <button
              onClick={() => onUpdateW(parseFloat((w + 0.1).toFixed(3)))}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
            >
              +0.1
            </button>
          </div>
        </div>

        {/* Intercept / Bias (b) Control */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Bias / Intercept (<code className="text-cyan-400 font-mono">b</code>)
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                value={b}
                onChange={(e) => onUpdateB(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-right text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={bMin}
            max={bMax}
            step="0.1"
            value={b}
            onChange={(e) => onUpdateB(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Min: {bMin}</span>
            <span className="text-slate-400">Optimal: {optimalB.toFixed(3)}</span>
            <span>Max: {bMax}</span>
          </div>

          {/* Fine Tuning Buttons */}
          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              onClick={() => onUpdateB(parseFloat((b - 1).toFixed(2)))}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
            >
              -1.0
            </button>
            <button
              onClick={() => onUpdateB(parseFloat((b - 0.1).toFixed(2)))}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
            >
              -0.1
            </button>
            <button
              onClick={() => onUpdateB(parseFloat((b + 0.1).toFixed(2)))}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
            >
              +0.1
            </button>
            <button
              onClick={() => onUpdateB(parseFloat((b + 1).toFixed(2)))}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
            >
              +1.0
            </button>
          </div>
        </div>
      </div>

      {/* Closeness Quality Bar */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {fitScore >= 90 ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : fitScore >= 50 ? (
            <TrendingUp className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <div>
            <div className="text-xs font-semibold text-slate-200">
              Manual Fit Accuracy:{' '}
              <span
                className={`font-mono font-bold ${
                  fitScore >= 90
                    ? 'text-emerald-400'
                    : fitScore >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {fitScore}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {fitScore >= 95
                ? 'Excellent! Your manual weights are exceptionally close to the optimal line.'
                : fitScore >= 70
                ? 'Good fit! Fine tune w and b to minimize squared errors further.'
                : 'High error. Adjust slope and bias to bring the line through the center of data points.'}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full sm:w-48 bg-slate-800 h-2.5 rounded-full overflow-hidden shrink-0">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              fitScore >= 90 ? 'bg-emerald-500' : fitScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${fitScore}%` }}
          />
        </div>
      </div>

      {/* Real-time Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Notebook Cost J(w,b) */}
        <div className="bg-slate-950/80 border border-indigo-500/20 rounded-xl p-3 shadow-inner">
          <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Cost J(w,b)</span>
            <span className="text-[10px] text-indigo-400 font-mono">1/(2m)Σe²</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-indigo-300 truncate">
            {details.jwb.toFixed(4)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Optimal: {optimalCost.toFixed(4)}
          </div>
        </div>

        {/* MSE */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 shadow-inner">
          <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Mean Sq. Error</span>
            <span className="text-[10px] text-slate-500 font-mono">MSE</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-200 truncate">
            {details.mse.toFixed(4)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            RMSE: {details.rmse.toFixed(3)}
          </div>
        </div>

        {/* MAE */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 shadow-inner">
          <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Mean Abs Error</span>
            <span className="text-[10px] text-slate-500 font-mono">MAE</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-200 truncate">
            {details.mae.toFixed(4)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Avg distance from line
          </div>
        </div>

        {/* R^2 Score */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 shadow-inner">
          <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>R² Variance</span>
            <span className="text-[10px] text-slate-500 font-mono">R²</span>
          </div>
          <div
            className={`text-base sm:text-lg font-bold font-mono truncate ${
              details.r2 >= 0.8
                ? 'text-emerald-400'
                : details.r2 >= 0.4
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {details.r2.toFixed(4)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {details.r2 >= 0.8 ? 'Strong Correlation' : 'Weak Correlation'}
          </div>
        </div>
      </div>
    </div>
  );
};

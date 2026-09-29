import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Zap,
  Gauge,
  SlidersHorizontal,
  Flame,
  CheckCircle,
  Volume2,
  VolumeX,
  Activity,
} from 'lucide-react';
import { StepMathDetails } from '../core/linearRegression';

export type OptimizerType = 'batch' | 'sgd' | 'minibatch' | 'momentum';

interface TrainingControlsProps {
  isTraining: boolean;
  onTogglePlay: () => void;
  onStepOnce: () => void;
  onStepBatch: (steps: number) => void;
  onResetWeights: () => void;
  epoch: number;
  maxEpochs: number;
  onUpdateMaxEpochs: (n: number) => void;
  alpha: number;
  onUpdateAlpha: (alpha: number) => void;
  delayMs: number;
  onUpdateDelayMs: (ms: number) => void;
  stepsPerTick: number;
  onUpdateStepsPerTick: (steps: number) => void;
  standardize: boolean;
  onToggleStandardize: () => void;
  details: StepMathDetails;
  initialCost: number;
  converged: boolean;
  optimizerType?: OptimizerType;
  onUpdateOptimizerType?: (type: OptimizerType) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const TrainingControls: React.FC<TrainingControlsProps> = ({
  isTraining,
  onTogglePlay,
  onStepOnce,
  onStepBatch,
  onResetWeights,
  epoch,
  maxEpochs,
  onUpdateMaxEpochs,
  alpha,
  onUpdateAlpha,
  delayMs,
  onUpdateDelayMs,
  stepsPerTick,
  onUpdateStepsPerTick,
  standardize,
  onToggleStandardize,
  details,
  initialCost,
  converged,
  optimizerType = 'batch',
  onUpdateOptimizerType,
  soundEnabled = false,
  onToggleSound,
}) => {
  // Pre-configured alpha presets
  const alphaPresets = [0.0001, 0.001, 0.005, 0.01, 0.05, 0.1];

  // Error reduction percentage
  const costReduction =
    initialCost > 0
      ? Math.max(0, Math.min(100, ((initialCost - details.jwb) / initialCost) * 100))
      : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header and Live Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border transition ${
              isTraining
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse'
                : converged
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Part 2: Gradient Descent Optimizer
              </h2>
              {isTraining ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold uppercase tracking-wider animate-pulse">
                  Training Live
                </span>
              ) : converged ? (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Converged
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-semibold uppercase tracking-wider">
                  Paused
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Slow & steady gradient descent updating <code className="font-mono text-indigo-400">w</code> & <code className="font-mono text-cyan-400">b</code> while minimizing cost
            </p>
          </div>
        </div>

        {/* Epoch Counter Badge */}
        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 font-mono">
          <span className="text-xs text-slate-400">Epoch:</span>
          <span className="text-sm font-bold text-white">{epoch.toLocaleString()}</span>
          <span className="text-xs text-slate-600">/ {maxEpochs.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Playback Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          {/* Play / Pause Toggle */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg ${
              isTraining
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {isTraining ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isTraining ? 'Pause Training' : 'Start Descent'}</span>
          </button>

          {/* Step 1 Epoch */}
          <button
            onClick={onStepOnce}
            disabled={isTraining}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-50 transition border border-slate-700/60"
            title="Perform exactly 1 gradient descent update step"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step (1)</span>
          </button>

          {/* Step 10 Epochs */}
          <button
            onClick={() => onStepBatch(10)}
            disabled={isTraining}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-50 transition border border-slate-700/60"
            title="Advance 10 epochs"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step (10)</span>
          </button>

          {/* Reset Weights */}
          <button
            onClick={onResetWeights}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700/60"
            title="Reset training parameters to initial values"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sonification Sound Toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className={`p-2.5 rounded-xl border transition ${
                soundEnabled
                  ? 'bg-indigo-500/20 text-cyan-300 border-indigo-500/40 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700/60'
              }`}
              title={soundEnabled ? 'Mute Sonification Tone' : 'Enable Gradient Descent Sonification Tone'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Error Reduction Meter */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Cost Reduction</div>
            <div className="text-sm font-bold font-mono text-emerald-400">
              {costReduction.toFixed(1)}%
            </div>
          </div>
          <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${costReduction}%` }}
            />
          </div>
        </div>
      </div>

      {/* Optimizer Selection Bar */}
      {onUpdateOptimizerType && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-300">Optimizer Mode:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {(
              [
                { id: 'batch', label: 'Batch GD (Full m)', desc: 'Andrew Ng notebook formulation' },
                { id: 'sgd', label: 'SGD (1 Sample)', desc: 'Stochastic single sample' },
                { id: 'minibatch', label: 'Mini-Batch (50%)', desc: 'Mini-batch sampling' },
                { id: 'momentum', label: 'Momentum (β=0.9)', desc: 'Accelerated descent' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => onUpdateOptimizerType(opt.id)}
                title={opt.desc}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
                  optimizerType === opt.id
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hyperparameter Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Learning Rate (Alpha) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              Learning Rate (<code className="text-indigo-400 font-mono">α</code>)
            </label>
            <input
              type="number"
              step="0.0001"
              value={alpha}
              onChange={(e) => onUpdateAlpha(parseFloat(e.target.value) || 0.0001)}
              className="w-20 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-right text-indigo-300 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1 pt-1">
            {alphaPresets.map((val) => (
              <button
                key={val}
                onClick={() => onUpdateAlpha(val)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                  alpha === val
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          {alpha > 0.1 && (
            <div className="text-[10px] text-amber-400 flex items-center gap-1">
              <Flame className="w-3 h-3 shrink-0" />
              <span>Large alpha may cause exploding gradients.</span>
            </div>
          )}
        </div>

        {/* Animation Speed / Pacing */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              Animation Pacing
            </label>
            <span className="text-xs font-mono text-cyan-300">{delayMs} ms/step</span>
          </div>

          <input
            type="range"
            min="10"
            max="400"
            step="10"
            value={delayMs}
            onChange={(e) => onUpdateDelayMs(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Fast (10ms)</span>
            <span>Smooth (100ms)</span>
            <span>Steady (400ms)</span>
          </div>
        </div>

        {/* Steps Per Animation Frame & Feature Normalization */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Feature Scaling (Z-Score)</span>
            <button
              onClick={onToggleStandardize}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                standardize
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300'
              }`}
            >
              {standardize ? 'Standardized ON' : 'Raw Values'}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Batch Speed:</span>
            <div className="flex items-center gap-1 font-mono">
              {[1, 5, 20, 50].map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdateStepsPerTick(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    stepsPerTick === s
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Gradient & Parameter Values */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 mb-0.5">Current Slope (w)</div>
          <div className="text-base font-bold font-mono text-indigo-400 truncate">
            {details.w.toFixed(5)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            ∂J/∂w: {details.dj_dw.toFixed(4)}
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 mb-0.5">Current Bias (b)</div>
          <div className="text-base font-bold font-mono text-cyan-400 truncate">
            {details.b.toFixed(5)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            ∂J/∂b: {details.dj_db.toFixed(4)}
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 mb-0.5">Current Cost J(w,b)</div>
          <div className="text-base font-bold font-mono text-amber-400 truncate">
            {details.jwb.toFixed(5)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Initial: {initialCost.toFixed(3)}
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 mb-0.5">R² Explained Variance</div>
          <div
            className={`text-base font-bold font-mono truncate ${
              details.r2 >= 0.8
                ? 'text-emerald-400'
                : details.r2 >= 0.5
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {details.r2.toFixed(4)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            MSE: {details.mse.toFixed(3)}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  FileCode,
  FileSpreadsheet,
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Shuffle,
  RefreshCcw,
} from 'lucide-react';
import { Point, StepMathDetails } from '../core/linearRegression';

interface VSCodeEditorProps {
  w: number;
  b: number;
  alpha: number;
  epochs: number;
  onUpdateW: (w: number) => void;
  onUpdateB: (b: number) => void;
  onUpdateAlpha: (alpha: number) => void;
  onUpdateEpochs: (epochs: number) => void;
  details: StepMathDetails;
  isTraining: boolean;
  onTogglePlay: () => void;
  onStepOnce: () => void;
  onReset: () => void;
  activeLineIndex?: number;
  currentEpoch: number;
  points: Point[];
  onUpdatePoint: (point: Point) => void;
  onAddPoint: (point: Point) => void;
  onRemovePoint: (id: string) => void;
  onSnapToOptimal: () => void;
}

export const VSCodeEditor: React.FC<VSCodeEditorProps> = ({
  w,
  b,
  alpha,
  epochs,
  onUpdateW,
  onUpdateB,
  onUpdateAlpha,
  onUpdateEpochs,
  details,
  isTraining,
  onTogglePlay,
  onStepOnce,
  onReset,
  activeLineIndex,
  currentEpoch,
  points,
  onUpdatePoint,
  onAddPoint,
  onRemovePoint,
  onSnapToOptimal,
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'csv' | 'theory'>('code');
  const [copied, setCopied] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [costFactor, setCostFactor] = useState(2); // 2m vs 1m
  const [printFrequency, setPrintFrequency] = useState(100);

  // Copy full Python code to clipboard
  const handleCopyCode = () => {
    const pythonCode = `# Linear Regression from Scratch using Gradient Descent
# Directly based on Linear_Regression.ipynb
import numpy as np

# Initial Weights & Hyperparameters (All Editable)
w = ${w.toFixed(5)}
b = ${b.toFixed(5)}
alpha = ${alpha}
epochs = ${epochs}

# Training Data (${details.m} samples)
x = np.array([${points.map((p) => p.x).join(', ')}])
y = np.array([${points.map((p) => p.y).join(', ')}])
m = len(x)

# Gradient Descent Optimization Loop
for i in range(epochs):
    total_wxbyx = 0
    total_wxby = 0
    squared_total_wxby = 0

    for j in range(m):
        Xi = x[j]
        Yi = y[j]
        diff = w * Xi + b - Yi
        total_wxbyx += diff * Xi
        total_wxby += diff
        squared_total_wxby += diff ** 2

    # Cost Function J(w, b) = 1/(${costFactor}m) * sum((wx+b-y)^2)
    jwb = (1 / (${costFactor} * m)) * squared_total_wxby

    # Simultaneous Updates
    temp_w = w - alpha * (1 / m) * total_wxbyx
    temp_b = b - alpha * (1 / m) * total_wxby

    w = temp_w
    b = temp_b

    if (i + 1) % ${printFrequency} == 0:
        print(f"Epoch {i+1}: Cost={jwb:.5f}, w={w:.5f}, b={b:.5f}")
`;
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1e1e1e] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs w-full">
      {/* VS Code Window Titlebar */}
      <div className="bg-[#181818] px-3 sm:px-4 py-2 border-b border-[#2d2d2d] flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2 min-w-0">
          {/* Mac / Window control dots */}
          <div className="flex items-center gap-1.5 mr-1 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>
          <span className="text-slate-400 text-[10px] sm:text-[11px] font-sans truncate">
            linear_regression.py
          </span>
          <span className="text-slate-600 text-[10px] font-sans hidden md:inline">
            — Machine-Learning / Programming-for-AI
          </span>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-sans font-medium transition ${
              isTraining
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isTraining ? 'Pause' : 'Run Script'}</span>
          </button>

          <button
            onClick={onStepOnce}
            disabled={isTraining}
            className="px-2 py-1 rounded bg-[#2d2d2d] hover:bg-[#3d3d3d] text-slate-300 disabled:opacity-50 text-[10px] sm:text-[11px] font-sans transition"
            title="Step next epoch (F10)"
          >
            Step
          </button>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#2d2d2d] hover:bg-[#3d3d3d] text-slate-300 text-[10px] sm:text-[11px] font-sans transition"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Tabs */}
      <div className="bg-[#252526] flex items-center border-b border-[#181818] overflow-x-auto text-[11px] font-sans scrollbar-none">
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 border-r border-[#181818] transition shrink-0 ${
            activeTab === 'code'
              ? 'bg-[#1e1e1e] text-white border-t-2 border-t-indigo-500 font-medium'
              : 'text-slate-400 hover:bg-[#2a2d2e] hover:text-slate-300'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-yellow-400" />
          <span>linear_regression.py</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        </button>

        <button
          onClick={() => setActiveTab('csv')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 border-r border-[#181818] transition shrink-0 ${
            activeTab === 'csv'
              ? 'bg-[#1e1e1e] text-white border-t-2 border-t-emerald-500 font-medium'
              : 'text-slate-400 hover:bg-[#2a2d2e] hover:text-slate-300'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>dataset_table.csv ({points.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('theory')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 border-r border-[#181818] transition shrink-0 ${
            activeTab === 'theory'
              ? 'bg-[#1e1e1e] text-white border-t-2 border-t-cyan-500 font-medium'
              : 'text-slate-400 hover:bg-[#2a2d2e] hover:text-slate-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Math_Formulation.md</span>
        </button>
      </div>

      {/* Quick Weight Preset Bar */}
      <div className="bg-[#202020] px-3 py-1.5 border-b border-[#2d2d2d] flex flex-wrap items-center justify-between gap-1.5 text-[10px] sm:text-[11px] font-sans">
        <span className="text-slate-400 font-medium">Quick Weight Actions:</span>
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => {
              onUpdateW(0);
              onUpdateB(0);
            }}
            className="px-2 py-0.5 rounded bg-[#2a2a2a] hover:bg-[#383838] text-slate-300 border border-slate-700/50"
            title="Set w=0, b=0"
          >
            Zeros (w=0, b=0)
          </button>
          <button
            onClick={() => {
              onUpdateW(1);
              onUpdateB(0);
            }}
            className="px-2 py-0.5 rounded bg-[#2a2a2a] hover:bg-[#383838] text-slate-300 border border-slate-700/50"
            title="Set w=1, b=0"
          >
            Unit (w=1, b=0)
          </button>
          <button
            onClick={onSnapToOptimal}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-700/40"
            title="Snap to optimal least-squares solution"
          >
            <Sparkles className="w-3 h-3" />
            <span>Optimal OLS</span>
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      {activeTab === 'code' && (
        <div className="p-3 sm:p-4 bg-[#1e1e1e] overflow-x-auto leading-relaxed text-slate-300 select-text max-h-[380px] overflow-y-auto">
          <table className="w-full border-collapse">
            <tbody>
              {/* Line 1: Comments */}
              <tr className="hover:bg-[#282828]/50">
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">1</td>
                <td className="text-emerald-500 italic">
                  # Linear Regression with Gradient Descent (Every Number is Changeable)
                </td>
              </tr>
              {/* Line 2: Import */}
              <tr className="hover:bg-[#282828]/50">
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">2</td>
                <td>
                  <span className="text-[#c586c0]">import</span>{' '}
                  <span className="text-[#4ec9b0]">numpy</span>{' '}
                  <span className="text-[#c586c0]">as</span> <span className="text-[#9cdcfe]">np</span>
                </td>
              </tr>
              {/* Line 3: Empty */}
              <tr className="hover:bg-[#282828]/50">
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">3</td>
                <td>&nbsp;</td>
              </tr>

              {/* Line 4: Interactive Hyperparameter: w (weight/slope) */}
              <tr className="hover:bg-[#282828]/50 bg-indigo-950/25">
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">4</td>
                <td>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap py-0.5">
                    <span className="text-[#9cdcfe]">w</span>
                    <span className="text-white">=</span>
                    <input
                      type="number"
                      step="0.01"
                      value={w}
                      onChange={(e) => onUpdateW(parseFloat(e.target.value) || 0)}
                      className="w-24 sm:w-28 px-1.5 py-0.5 bg-[#2d2d2d] border border-indigo-500/60 rounded text-indigo-300 font-mono focus:outline-none focus:border-indigo-400 font-semibold"
                    />
                    <span className="text-emerald-500 italic text-[10px] sm:text-[11px]">
                      # Weight / Slope (editable)
                    </span>
                  </div>
                </td>
              </tr>

              {/* Line 5: Interactive Hyperparameter: b (bias/intercept) */}
              <tr className="hover:bg-[#282828]/50 bg-cyan-950/25">
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">5</td>
                <td>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap py-0.5">
                    <span className="text-[#9cdcfe]">b</span>
                    <span className="text-white">=</span>
                    <input
                      type="number"
                      step="0.1"
                      value={b}
                      onChange={(e) => onUpdateB(parseFloat(e.target.value) || 0)}
                      className="w-24 sm:w-28 px-1.5 py-0.5 bg-[#2d2d2d] border border-cyan-500/60 rounded text-cyan-300 font-mono focus:outline-none focus:border-cyan-400 font-semibold"
                    />
                    <span className="text-emerald-500 italic text-[10px] sm:text-[11px]">
                      # Bias / Intercept (editable)
                    </span>
                  </div>
                </td>
              </tr>

              {/* Line 6: Interactive Hyperparameter: alpha */}
              <tr className="hover:bg-[#282828]/50 bg-amber-950/25">
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">6</td>
                <td>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap py-0.5">
                    <span className="text-[#9cdcfe]">alpha</span>
                    <span className="text-white">=</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={alpha}
                      onChange={(e) => onUpdateAlpha(parseFloat(e.target.value) || 0.0001)}
                      className="w-24 sm:w-28 px-1.5 py-0.5 bg-[#2d2d2d] border border-amber-500/60 rounded text-amber-300 font-mono focus:outline-none focus:border-amber-400 font-semibold"
                    />
                    <span className="text-emerald-500 italic text-[10px] sm:text-[11px]">
                      # Learning rate (editable)
                    </span>
                  </div>
                </td>
              </tr>

              {/* Line 7: Interactive Hyperparameter: epochs */}
              <tr className="hover:bg-[#282828]/50 bg-purple-950/25">
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">7</td>
                <td>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap py-0.5">
                    <span className="text-[#9cdcfe]">epochs</span>
                    <span className="text-white">=</span>
                    <input
                      type="number"
                      step="100"
                      value={epochs}
                      onChange={(e) => onUpdateEpochs(parseInt(e.target.value) || 100)}
                      className="w-24 sm:w-28 px-1.5 py-0.5 bg-[#2d2d2d] border border-purple-500/60 rounded text-purple-300 font-mono focus:outline-none focus:border-purple-400 font-semibold"
                    />
                    <span className="text-emerald-500 italic text-[10px] sm:text-[11px]">
                      # Total epochs (editable)
                    </span>
                  </div>
                </td>
              </tr>

              {/* Line 8: m definition */}
              <tr className="hover:bg-[#282828]/50">
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">8</td>
                <td>
                  <span className="text-[#9cdcfe]">m</span> <span className="text-white">=</span>{' '}
                  <span className="text-[#dcdcaa]">len</span>(<span className="text-[#9cdcfe]">x</span>){' '}
                  <span className="text-emerald-500 italic text-[11px]">
                    # Total training examples = <span className="text-white font-bold">{details.m}</span>
                  </span>
                </td>
              </tr>

              {/* Line 9: Loop header */}
              <tr
                className={`hover:bg-[#282828]/50 ${
                  activeLineIndex === 9 ? 'bg-yellow-500/20 border-l-2 border-yellow-400' : ''
                }`}
              >
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">9</td>
                <td>
                  <span className="text-[#c586c0]">for</span>{' '}
                  <span className="text-[#9cdcfe]">i</span>{' '}
                  <span className="text-[#c586c0]">in</span>{' '}
                  <span className="text-[#dcdcaa]">range</span>(
                  <span className="text-[#9cdcfe]">epochs</span>):
                </td>
              </tr>

              {/* Line 10: Accumulators */}
              <tr
                className={`hover:bg-[#282828]/50 ${
                  activeLineIndex === 10 ? 'bg-yellow-500/20 border-l-2 border-yellow-400' : ''
                }`}
              >
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">10</td>
                <td className="pl-4 sm:pl-6">
                  <span className="text-[#9cdcfe]">total_wxbyx</span> <span className="text-white">=</span>{' '}
                  <span className="text-[#b5cea8]">0</span>{' '}
                  <span className="text-slate-500">|</span>{' '}
                  <span className="text-[#9cdcfe]">total_wxby</span> <span className="text-white">=</span>{' '}
                  <span className="text-[#b5cea8]">0</span>
                </td>
              </tr>

              {/* Line 11: Inner loop */}
              <tr
                className={`hover:bg-[#282828]/50 ${
                  activeLineIndex === 11 ? 'bg-yellow-500/20 border-l-2 border-yellow-400' : ''
                }`}
              >
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">11</td>
                <td className="pl-4 sm:pl-6">
                  <span className="text-[#c586c0]">for</span>{' '}
                  <span className="text-[#9cdcfe]">j</span>{' '}
                  <span className="text-[#c586c0]">in</span>{' '}
                  <span className="text-[#dcdcaa]">range</span>(
                  <span className="text-[#9cdcfe]">m</span>):
                </td>
              </tr>

              {/* Line 12: Diff & Accumulate */}
              <tr
                className={`hover:bg-[#282828]/50 ${
                  activeLineIndex === 12 ? 'bg-yellow-500/20 border-l-2 border-yellow-400' : ''
                }`}
              >
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">12</td>
                <td className="pl-8 sm:pl-12">
                  <span className="text-[#9cdcfe]">diff</span> <span className="text-white">=</span>{' '}
                  <span className="text-[#9cdcfe]">w</span> <span className="text-white">*</span>{' '}
                  <span className="text-[#9cdcfe]">x[j]</span> <span className="text-white">+</span>{' '}
                  <span className="text-[#9cdcfe]">b</span> <span className="text-white">-</span>{' '}
                  <span className="text-[#9cdcfe]">y[j]</span>
                </td>
              </tr>

              {/* Line 13: Gradients sum */}
              <tr
                className={`hover:bg-[#282828]/50 ${
                  activeLineIndex === 13 ? 'bg-yellow-500/20 border-l-2 border-yellow-400' : ''
                }`}
              >
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">13</td>
                <td className="pl-8 sm:pl-12">
                  <span className="text-[#9cdcfe]">total_wxbyx</span>{' '}
                  <span className="text-white">+=</span> <span className="text-[#9cdcfe]">diff</span>{' '}
                  <span className="text-white">*</span> <span className="text-[#9cdcfe]">x[j]</span>{' '}
                  <span className="text-slate-500 text-[10px] ml-1 sm:ml-2">
                    (sum: {details.total_wxbyx.toFixed(1)})
                  </span>
                </td>
              </tr>

              {/* Line 14: Cost calculation J(w, b) */}
              <tr
                className={`hover:bg-[#282828]/50 ${
                  activeLineIndex === 14 ? 'bg-yellow-500/20 border-l-2 border-yellow-400' : ''
                }`}
              >
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">14</td>
                <td className="pl-4 sm:pl-6">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[#9cdcfe]">jwb</span>
                    <span className="text-white">=</span>
                    <span>(1 / (</span>
                    <input
                      type="number"
                      min="1"
                      max="2"
                      value={costFactor}
                      onChange={(e) => setCostFactor(parseInt(e.target.value) || 2)}
                      className="w-10 px-1 py-0.5 bg-[#2d2d2d] border border-amber-500/50 rounded text-amber-300 font-mono text-center"
                      title="Cost divisor factor (2 for Stanford 1/2m, 1 for standard MSE)"
                    />
                    <span>* m)) * squared_total_wxby</span>
                    <span className="text-amber-400 font-bold ml-1">
                      → J = {details.jwb.toFixed(4)}
                    </span>
                  </div>
                </td>
              </tr>

              {/* Line 15: Parameter update: w */}
              <tr
                className={`hover:bg-[#282828]/50 ${
                  activeLineIndex === 15 ? 'bg-yellow-500/20 border-l-2 border-yellow-400' : ''
                }`}
              >
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">15</td>
                <td className="pl-4 sm:pl-6">
                  <span className="text-[#9cdcfe]">temp_w</span> <span className="text-white">=</span>{' '}
                  <span className="text-[#9cdcfe]">w</span> <span className="text-white">-</span>{' '}
                  <span className="text-[#9cdcfe]">alpha</span> <span className="text-white">*</span> (
                  <span className="text-[#b5cea8]">1</span> / <span className="text-[#9cdcfe]">m</span>){' '}
                  <span className="text-white">*</span>{' '}
                  <span className="text-[#9cdcfe]">total_wxbyx</span>
                </td>
              </tr>

              {/* Line 16: Parameter update: b */}
              <tr
                className={`hover:bg-[#282828]/50 ${
                  activeLineIndex === 16 ? 'bg-yellow-500/20 border-l-2 border-yellow-400' : ''
                }`}
              >
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">16</td>
                <td className="pl-4 sm:pl-6">
                  <span className="text-[#9cdcfe]">temp_b</span> <span className="text-white">=</span>{' '}
                  <span className="text-[#9cdcfe]">b</span> <span className="text-white">-</span>{' '}
                  <span className="text-[#9cdcfe]">alpha</span> <span className="text-white">*</span> (
                  <span className="text-[#b5cea8]">1</span> / <span className="text-[#9cdcfe]">m</span>){' '}
                  <span className="text-white">*</span>{' '}
                  <span className="text-[#9cdcfe]">total_wxby</span>
                </td>
              </tr>

              {/* Line 17: Commit updates */}
              <tr className="hover:bg-[#282828]/50">
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">17</td>
                <td className="pl-4 sm:pl-6">
                  <span className="text-[#9cdcfe]">w</span>, <span className="text-[#9cdcfe]">b</span>{' '}
                  <span className="text-white">=</span>{' '}
                  <span className="text-[#9cdcfe]">temp_w</span>,{' '}
                  <span className="text-[#9cdcfe]">temp_b</span>
                </td>
              </tr>

              {/* Line 18: Print logging */}
              <tr className="hover:bg-[#282828]/50">
                <td className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-slate-600 select-none">18</td>
                <td className="pl-4 sm:pl-6 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[#c586c0]">if</span> (
                  <span className="text-[#9cdcfe]">i</span> + <span className="text-[#b5cea8]">1</span>) %
                  <input
                    type="number"
                    step="10"
                    value={printFrequency}
                    onChange={(e) => setPrintFrequency(parseInt(e.target.value) || 100)}
                    className="w-14 px-1 py-0.5 bg-[#2d2d2d] border border-slate-700 rounded text-slate-200 font-mono text-center"
                    title="Print terminal every N epochs"
                  />
                  == <span className="text-[#b5cea8]">0</span>: <span className="text-[#dcdcaa]">print</span>(...)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* CSV Table Editor Tab (All numbers in the dataset are directly editable!) */}
      {activeTab === 'csv' && (
        <div className="p-3 bg-[#1e1e1e] overflow-x-auto text-slate-300 max-h-[380px] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-slate-400 font-sans">
              Edit all dataset numbers directly below — changes immediately update the plot & simulator!
            </span>
            <button
              onClick={() => {
                const newId = `p-${Date.now()}`;
                const last = points[points.length - 1];
                onAddPoint({
                  id: newId,
                  x: last ? last.x + 2 : 10,
                  y: last ? last.y + 5 : 50,
                  label: `P${points.length + 1}`,
                });
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-sans font-medium transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>
          </div>

          <table className="w-full text-left border border-slate-800 text-xs">
            <thead className="bg-[#252526] text-slate-400 select-none">
              <tr>
                <th className="p-2 border-b border-slate-800">#</th>
                <th className="p-2 border-b border-slate-800">Label / ID</th>
                <th className="p-2 border-b border-slate-800 text-indigo-400">Feature X (Editable)</th>
                <th className="p-2 border-b border-slate-800 text-cyan-400">Target Y (Editable)</th>
                <th className="p-2 border-b border-slate-800 text-slate-500">Predicted ŷ</th>
                <th className="p-2 border-b border-slate-800 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p, idx) => {
                const pred = w * p.x + b;
                return (
                  <tr key={p.id} className="hover:bg-[#282828] border-b border-slate-800/60">
                    <td className="p-2 text-slate-500 select-none">{idx + 1}</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={p.label || ''}
                        onChange={(e) => onUpdatePoint({ ...p, label: e.target.value })}
                        className="w-20 px-1 py-0.5 bg-[#2d2d2d] border border-slate-700 rounded text-slate-300 font-mono text-xs focus:outline-none focus:border-slate-500"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.5"
                        value={p.x}
                        onChange={(e) =>
                          onUpdatePoint({ ...p, x: parseFloat(e.target.value) || 0 })
                        }
                        className="w-24 px-1.5 py-0.5 bg-[#2d2d2d] border border-indigo-500/50 rounded text-indigo-300 font-mono text-xs focus:outline-none focus:border-indigo-400"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.5"
                        value={p.y}
                        onChange={(e) =>
                          onUpdatePoint({ ...p, y: parseFloat(e.target.value) || 0 })
                        }
                        className="w-24 px-1.5 py-0.5 bg-[#2d2d2d] border border-cyan-500/50 rounded text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </td>
                    <td className="p-2 text-slate-400 font-mono">{pred.toFixed(2)}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => onRemovePoint(p.id)}
                        disabled={points.length <= 2}
                        className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 transition"
                        title="Delete this data sample"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Theory View Tab */}
      {activeTab === 'theory' && (
        <div className="p-4 bg-[#1e1e1e] text-slate-300 space-y-3 font-sans text-xs leading-relaxed select-text max-h-[380px] overflow-y-auto">
          <h4 className="text-sm font-bold text-white">Mathematical Derivation & Gradient Descent</h4>
          <p>
            The linear regression model predicts target values using the linear hypothesis:
            <code className="bg-[#2d2d2d] px-1.5 py-0.5 rounded text-indigo-300 ml-1">f(x) = w·x + b</code>
          </p>
          <p>
            The cost function <code className="text-amber-300 font-mono">J(w, b)</code> calculates the Mean Squared Error with a factor of 1/(2m) to simplify derivative computation:
            <br />
            <code className="block bg-[#252526] p-2 rounded mt-1 text-slate-200 font-mono">
              J(w, b) = 1/(2m) * Σ (w·x_i + b - y_i)²
            </code>
          </p>
          <p>
            Taking partial derivatives with respect to parameters:
            <code className="block bg-[#252526] p-2 rounded mt-1 text-slate-200 font-mono">
              ∂J/∂w = 1/m * Σ (w·x_i + b - y_i)·x_i<br />
              ∂J/∂b = 1/m * Σ (w·x_i + b - y_i)
            </code>
          </p>
          <p>
            Parameter updates at each step:
            <code className="block bg-[#252526] p-2 rounded mt-1 text-indigo-300 font-mono">
              w := w - α · ∂J/∂w<br />
              b := b - α · ∂J/∂b
            </code>
          </p>
        </div>
      )}

      {/* VS Code Interactive Terminal */}
      <div className="border-t border-[#2d2d2d] bg-[#181818]">
        <div
          onClick={() => setShowTerminal(!showTerminal)}
          className="px-3 sm:px-4 py-1.5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer select-none bg-[#202020]"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-300">TERMINAL (Python 3.11 Execution Output)</span>
          </div>
          <span className="text-[10px] text-slate-500">
            {showTerminal ? '▼ Collapse' : '▲ Expand'}
          </span>
        </div>

        {showTerminal && (
          <div className="p-2.5 sm:p-3 bg-[#141414] text-[#cccccc] font-mono text-[10px] sm:text-[11px] h-28 overflow-y-auto space-y-1">
            <div className="text-slate-500">
              PS C:\Users\HP\Documents\antigravity\resilient-noether&gt; python linear_regression.py
            </div>
            <div>
              [WEIGHTS] w: <span className="text-indigo-400">{w.toFixed(5)}</span> | b:{' '}
              <span className="text-cyan-400">{b.toFixed(5)}</span> | alpha: {alpha}
            </div>
            <div className="text-emerald-400">
              Epoch: {currentEpoch} | Cost J(w,b): {details.jwb.toFixed(6)} | w: {details.w.toFixed(5)} | b:{' '}
              {details.b.toFixed(5)}
            </div>
            <div className="text-slate-400">
              Gradients → ∂J/∂w: {details.dj_dw.toFixed(5)} | ∂J/∂b: {details.dj_db.toFixed(5)}
            </div>
            <div className="text-indigo-300">
              Next Update → temp_w = {details.temp_w.toFixed(5)} | temp_b = {details.temp_b.toFixed(5)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

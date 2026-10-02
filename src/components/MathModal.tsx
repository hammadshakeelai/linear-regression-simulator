import React from 'react';
import { X, BookOpen, Check } from 'lucide-react';
import { StepMathDetails } from '../core/linearRegression';

interface MathModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: StepMathDetails;
  alpha: number;
}

export const MathModal: React.FC<MathModalProps> = ({
  isOpen,
  onClose,
  details,
  alpha,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Mathematical Formulation & Theory</h3>
              <p className="text-xs text-slate-400">
                Directly from Stanford CS229 / Andrew Ng & your Linear_Regression.ipynb notebook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
          {/* Section 1: Hypothesis */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-bold text-indigo-300">1. Linear Hypothesis Function</h4>
            <p>
              Given input feature <code className="font-mono text-cyan-300">x</code>, the model predicts{' '}
              <code className="font-mono text-rose-300">ŷ</code> (or{' '}
              <code className="font-mono text-indigo-300">f_w,b(x)</code>) using weight (slope){' '}
              <code className="font-mono text-indigo-400">w</code> and bias (intercept){' '}
              <code className="font-mono text-cyan-400">b</code>:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-sm text-center text-white border border-slate-800">
              f_w,b(x) = w · x + b
            </div>
          </div>

          {/* Section 2: Cost Function J(w,b) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-bold text-amber-300">2. Cost Function (Mean Squared Error / 2m)</h4>
            <p>
              The cost function measures how well our line fits the training examples. We square the difference between predicted values and actual labels:
            </p>
            <div className="p-3 rounded-lg bg-slate-900 font-mono text-sm text-center text-amber-300 border border-slate-800">
              J(w, b) = 1/(2m) · ∑ [ w · x_i + b - y_i ]²
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Note: The 1/2 factor is a mathematical convenience so that when differentiating, the 2 cancels out neatly with 1/2!
            </p>
          </div>

          {/* Section 3: Partial Derivatives */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-bold text-emerald-300">3. Gradients (Partial Derivatives)</h4>
            <p>
              Applying the chain rule to the cost function with respect to <code className="font-mono">w</code> and <code className="font-mono">b</code>:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-slate-400">∂J/∂w (Gradient for slope):</div>
                <div className="text-emerald-400 font-bold">
                  ∂J/∂w = 1/m · ∑ (w·x_i + b - y_i) · x_i
                </div>
                <div className="text-[11px] text-slate-500">
                  Notebook var: <code>total_wxbyx / m</code>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-slate-400">∂J/∂b (Gradient for intercept):</div>
                <div className="text-cyan-400 font-bold">
                  ∂J/∂b = 1/m · ∑ (w·x_i + b - y_i)
                </div>
                <div className="text-[11px] text-slate-500">
                  Notebook var: <code>total_wxby / m</code>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Simultaneous Update */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-bold text-rose-300">4. Simultaneous Parameter Update</h4>
            <p>
              At each epoch, parameters are updated simultaneously in the direction of steepest descent scaled by learning rate <code className="font-mono text-amber-400">α</code>:
            </p>
            <div className="p-3 rounded-lg bg-slate-900 font-mono text-xs text-center space-y-1 border border-slate-800">
              <div className="text-indigo-400">
                temp_w = w - α · (1/m) · total_wxbyx
              </div>
              <div className="text-cyan-400">
                temp_b = b - α · (1/m) · total_wxby
              </div>
              <div className="text-slate-400 pt-1">
                w = temp_w ; b = temp_b
              </div>
            </div>
          </div>

          {/* Section 5: Current Live Calculation Inspector */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-bold text-purple-300">5. Live Variables for Current Frame</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block">m (samples)</span>
                <span className="text-white font-bold">{details.m}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block">total_wxbyx</span>
                <span className="text-emerald-400 font-bold">{details.total_wxbyx.toFixed(2)}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block">total_wxby</span>
                <span className="text-cyan-400 font-bold">{details.total_wxby.toFixed(2)}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block">Current J(w,b)</span>
                <span className="text-amber-400 font-bold">{details.jwb.toFixed(5)}</span>
              </div>
            </div>
          </div>

          {/* Section 6: Feature Scaling & Hessian Geometry */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-bold text-cyan-300">6. Why Feature Scaling Matters (Hessian Conditioning)</h4>
            <p>
              The curvature of the cost surface is dictated by the Hessian matrix:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-xs text-center text-cyan-300 border border-slate-800">
              H = (1/m) · X^T X = [ (1/m)∑x_i² , x̄ ; x̄ , 1 ]
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400">
              <li>
                <strong>Unscaled features (e.g. x ∈ [65, 98])</strong>: The ratio of eigenvalues (condition number κ) is over 10,000! The cost contours form an extremely narrow, steep ravine. Gradient descent oscillates violently in the w direction while making virtually zero progress along b.
              </li>
              <li>
                <strong>Standardized features (Z-Score: z = (x - μ)/σ)</strong>: Eigenvalues are equalized to λ₁ = λ₂ = 1.0 (circular contours). Gradient descent steps point directly at the global minimum, achieving smooth convergence in 25–35 steps!
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
          >
            Got it, Back to Simulator
          </button>
        </div>
      </div>
    </div>
  );
};

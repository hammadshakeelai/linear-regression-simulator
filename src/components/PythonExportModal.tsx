import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode } from 'lucide-react';
import { Point } from '../core/linearRegression';

interface PythonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: Point[];
  w: number;
  b: number;
  alpha: number;
  epochs: number;
  xLabel: string;
  yLabel: string;
}

export const PythonExportModal: React.FC<PythonExportModalProps> = ({
  isOpen,
  onClose,
  points,
  w,
  b,
  alpha,
  epochs,
  xLabel,
  yLabel,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const xArrayStr = `[${points.map((p) => p.x).join(', ')}]`;
  const yArrayStr = `[${points.map((p) => p.y).join(', ')}]`;

  const scriptContent = `"""
Linear Regression Simulator - Exported Python Script
Directly compatible with your Linear_Regression.ipynb workflow.
"""

import numpy as np
import matplotlib.pyplot as plt

# 1. Dataset (${points.length} samples)
# X: ${xLabel}
# Y: ${yLabel}
x = np.array(${xArrayStr}, dtype=float)
y = np.array(${yArrayStr}, dtype=float)
m = len(x)

# 2. Initial Hyperparameters
w = ${w.toFixed(5)}
b = ${b.toFixed(5)}
alpha = ${alpha}
epochs = ${epochs}

print(f"Starting Training: m={m}, initial_w={w:.4f}, initial_b={b:.4f}, alpha={alpha}")

# 3. Gradient Descent Optimization Loop
history_cost = []
for i in range(epochs):
    total_wxbyx = 0
    total_wxby = 0
    squared_total_wxby = 0

    for j in range(m):
        Xi = x[j]
        Yi = y[j]
        diff = (w * Xi + b - Yi)
        total_wxbyx += diff * Xi
        total_wxby += diff
        squared_total_wxby += diff ** 2

    # Cost Function J(w,b)
    jwb = (1 / (2 * m)) * squared_total_wxby
    history_cost.append(jwb)

    if (i + 1) % max(1, epochs // 10) == 0 or i == 0:
        print(f"Epoch {i+1:5d} | Cost: {jwb:.6f} | w: {w:.5f} | b: {b:.5f}")

    # Simultaneous Updates
    temp_w = w - alpha * (1 / m) * total_wxbyx
    temp_b = b - alpha * (1 / m) * total_wxby

    w = temp_w
    b = temp_b

print(f"\\nOptimization Complete! Final w={w:.5f}, Final b={b:.5f}, Final Cost={history_cost[-1]:.6f}")

# 4. Plot Results (Matching your notebook Cell 54)
plt.figure(figsize=(10, 5))

# Subplot 1: Fitted Line
plt.subplot(1, 2, 1)
plt.scatter(x, y, marker='x', c='r', label='Data points (Actual)')
x_line = np.linspace(min(x) - 1, max(x) + 1, 100)
y_line = w * x_line + b
plt.plot(x_line, y_line, label=f'Model: y = {w:.2f}x + {b:.2f}', c='b')
plt.xlabel('${xLabel}')
plt.ylabel('${yLabel}')
plt.title('Linear Regression Model Fit')
plt.legend()
plt.grid(True, linestyle='--', alpha=0.6)

# Subplot 2: Loss Curve
plt.subplot(1, 2, 2)
plt.plot(history_cost, c='g', linewidth=2)
plt.xlabel('Epoch')
plt.ylabel('Cost J(w, b)')
plt.title('Gradient Descent Loss Curve')
plt.grid(True, linestyle='--', alpha=0.6)

plt.tight_layout()
plt.show()
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([scriptContent], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linear_regression_simulator.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export Standalone Python Script</h3>
              <p className="text-xs text-slate-400">
                Run directly in VS Code, Jupyter Notebook, or Google Colab
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

        {/* Code View */}
        <div className="p-4 flex-1 overflow-y-auto bg-[#141414] font-mono text-xs text-slate-300 select-text leading-relaxed">
          <pre>{scriptContent}</pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Preloaded with current {points.length} points and hyperparameters
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download .py</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Activity, TrendingDown, Maximize2 } from 'lucide-react';

export interface LossPoint {
  epoch: number;
  cost: number;
  w: number;
  b: number;
}

interface LossChartProps {
  history: LossPoint[];
  currentEpoch: number;
  currentCost: number;
  onClearHistory?: () => void;
}

export const LossChart: React.FC<LossChartProps> = ({
  history,
  currentEpoch,
  currentCost,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<LossPoint | null>(null);
  const [logScale, setLogScale] = useState(false);

  const width = 600;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 45, left: 60 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Compute domain
  const { minEpoch, maxEpoch, minCost, maxCost } = useMemo(() => {
    if (history.length === 0) {
      return { minEpoch: 0, maxEpoch: 10, minCost: 0, maxCost: 10 };
    }
    const epochs = history.map((h) => h.epoch);
    const costs = history.map((h) => (logScale ? Math.log10(Math.max(h.cost, 1e-6)) : h.cost));

    const minE = Math.min(...epochs);
    const maxE = Math.max(...epochs);
    const minC = Math.min(...costs);
    const maxC = Math.max(...costs);

    const costSpan = Math.max(maxC - minC, 0.001);

    return {
      minEpoch: minE,
      maxEpoch: Math.max(maxE, 10),
      minCost: Math.max(0, minC - costSpan * 0.05),
      maxCost: maxC + costSpan * 0.05,
    };
  }, [history, logScale]);

  // Coordinate transforms
  const toSvgX = (epoch: number) => {
    const ratio = (epoch - minEpoch) / (maxEpoch - minEpoch || 1);
    return padding.left + ratio * innerWidth;
  };

  const toSvgY = (cost: number) => {
    const val = logScale ? Math.log10(Math.max(cost, 1e-6)) : cost;
    const ratio = (val - minCost) / (maxCost - minCost || 1);
    return height - padding.bottom - ratio * innerHeight;
  };

  // Generate SVG path string
  const pathD = useMemo(() => {
    if (history.length === 0) return '';
    return history.reduce((acc, pt, idx) => {
      const x = toSvgX(pt.epoch);
      const y = toSvgY(pt.cost);
      if (idx === 0) return `M ${x} ${y}`;
      return `${acc} L ${x} ${y}`;
    }, '');
  }, [history, minEpoch, maxEpoch, minCost, maxCost, logScale]);

  // Ticks
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let i = 0; i <= 4; i++) {
      ticks.push(minCost + (i / 4) * (maxCost - minCost));
    }
    return ticks;
  }, [minCost, maxCost]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Loss Curve: J(w, b) vs. Epoch</h3>
            <span className="text-[11px] text-slate-400">
              Error decreasing steadily step-by-step
            </span>
          </div>
        </div>

        {/* Log scale toggle */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setLogScale(!logScale)}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition ${
              logScale
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {logScale ? 'Log10 Scale' : 'Linear Scale'}
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full aspect-[2/1] select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <linearGradient id="lossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background grid */}
          <rect
            x={padding.left}
            y={padding.top}
            width={innerWidth}
            height={innerHeight}
            fill="#090d16"
            rx={6}
            className="stroke-slate-800/80"
          />

          {/* Horizontal grid lines */}
          {yTicks.map((val, idx) => {
            const svgY = height - padding.bottom - (idx / 4) * innerHeight;
            return (
              <g key={`y-tick-${idx}`}>
                <line
                  x1={padding.left}
                  y1={svgY}
                  x2={width - padding.right}
                  y2={svgY}
                  stroke="#1e293b"
                  strokeDasharray="2 3"
                />
                <text
                  x={padding.left - 8}
                  y={svgY + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {logScale ? `10^${val.toFixed(1)}` : val.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Area fill under curve */}
          {history.length > 1 && (
            <path
              d={`${pathD} L ${toSvgX(history[history.length - 1].epoch)} ${
                height - padding.bottom
              } L ${toSvgX(history[0].epoch)} ${height - padding.bottom} Z`}
              fill="url(#lossGrad)"
            />
          )}

          {/* Loss line */}
          {history.length > 0 && (
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Active head point */}
          {history.length > 0 && (
            <g>
              <circle
                cx={toSvgX(history[history.length - 1].epoch)}
                cy={toSvgY(history[history.length - 1].cost)}
                r={10}
                fill="#10b981"
                fillOpacity={0.25}
                className="animate-ping"
              />
              <circle
                cx={toSvgX(history[history.length - 1].epoch)}
                cy={toSvgY(history[history.length - 1].cost)}
                r={4.5}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={1.5}
              />
            </g>
          )}

          {/* X axis labels */}
          <text
            x={padding.left + innerWidth / 2}
            y={height - 10}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
            fontWeight="500"
          >
            Epoch (Training Iteration)
          </text>
          <text
            x={-(padding.top + innerHeight / 2)}
            y={18}
            transform="rotate(-90)"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
            fontWeight="500"
          >
            Cost J(w, b)
          </text>
        </svg>

        {/* Hover / Live Stats Tag */}
        <div className="absolute top-2 right-2 bg-slate-950/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono shadow-md backdrop-blur">
          <span className="text-slate-400">Current Cost: </span>
          <span className="text-emerald-400 font-bold">{currentCost.toFixed(5)}</span>
        </div>
      </div>
    </div>
  );
};

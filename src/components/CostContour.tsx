import React, { useMemo } from 'react';
import { Target, Compass } from 'lucide-react';
import { LossPoint } from './LossChart';

interface CostContourProps {
  history: LossPoint[];
  currentW: number;
  currentB: number;
  optimalW: number;
  optimalB: number;
  dj_dw?: number;
  dj_db?: number;
  alpha?: number;
  onSetParameters?: (w: number, b: number) => void;
}

export const CostContour: React.FC<CostContourProps> = ({
  history,
  currentW,
  currentB,
  optimalW,
  optimalB,
  dj_dw,
  dj_db,
  alpha,
  onSetParameters,
}) => {
  const width = 450;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 45, left: 55 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Compute parameter bounds centered around optimal (w, b)
  const bounds = useMemo(() => {
    const allW = [optimalW, currentW, ...history.map((h) => h.w)];
    const allB = [optimalB, currentB, ...history.map((h) => h.b)];

    let minW = Math.min(...allW);
    let maxW = Math.max(...allW);
    let minB = Math.min(...allB);
    let maxB = Math.max(...allB);

    const spanW = Math.max(maxW - minW, 2);
    const spanB = Math.max(maxB - minB, 20);

    return {
      minW: minW - spanW * 0.2,
      maxW: maxW + spanW * 0.2,
      minB: minB - spanB * 0.2,
      maxB: maxB + spanB * 0.2,
    };
  }, [history, currentW, currentB, optimalW, optimalB]);

  // Coordinate transforms
  const toSvgX = (wVal: number) => {
    const ratio = (wVal - bounds.minW) / (bounds.maxW - bounds.minW || 1);
    return padding.left + ratio * innerWidth;
  };

  const toSvgY = (bVal: number) => {
    const ratio = (bVal - bounds.minB) / (bounds.maxB - bounds.minB || 1);
    return height - padding.bottom - ratio * innerHeight;
  };

  // Optimization trajectory path string
  const pathD = useMemo(() => {
    if (history.length === 0) return '';
    return history.reduce((acc, pt, idx) => {
      const x = toSvgX(pt.w);
      const y = toSvgY(pt.b);
      if (idx === 0) return `M ${x} ${y}`;
      return `${acc} L ${x} ${y}`;
    }, '');
  }, [history, bounds]);

  // Generate concentric contour ellipses around (optimalW, optimalB)
  const optSvgX = toSvgX(optimalW);
  const optSvgY = toSvgY(optimalB);

  const contourRings = [
    { rx: 25, ry: 15, stroke: '#312e81', width: 1.5 },
    { rx: 55, ry: 32, stroke: '#3730a3', width: 1.5 },
    { rx: 90, ry: 50, stroke: '#4338ca', width: 1.5 },
    { rx: 130, ry: 72, stroke: '#4f46e5', width: 1 },
    { rx: 175, ry: 95, stroke: '#6366f1', width: 1 },
    { rx: 220, ry: 120, stroke: '#818cf8', width: 0.8 },
  ];

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onSetParameters) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;

    if (
      svgX >= padding.left &&
      svgX <= width - padding.right &&
      svgY >= padding.top &&
      svgY <= height - padding.bottom
    ) {
      const xRatio = (svgX - padding.left) / innerWidth;
      const yRatio = (height - padding.bottom - svgY) / innerHeight;
      const rawW = bounds.minW + xRatio * (bounds.maxW - bounds.minW);
      const rawB = bounds.minB + yRatio * (bounds.maxB - bounds.minB);
      onSetParameters(parseFloat(rawW.toFixed(3)), parseFloat(rawB.toFixed(2)));
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">2D Cost Surface: J(w, b) Contours</h3>
            <span className="text-[11px] text-slate-400">
              Click anywhere to relocate (w, b) • Trajectory into minimum
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>Optimal Minimum ★</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[16/10] select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={`w-full h-full ${onSetParameters ? 'cursor-crosshair' : ''}`}
          onClick={handleSvgClick}
        >
          <defs>
            <radialGradient id="contourGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <marker
              id="gradientArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#fb7185" />
            </marker>
          </defs>

          {/* Plot Background */}
          <rect
            x={padding.left}
            y={padding.top}
            width={innerWidth}
            height={innerHeight}
            fill="url(#contourGrad)"
            rx={6}
            className="stroke-slate-800/80"
          />

          {/* Elliptical Contour Lines */}
          <g>
            {contourRings.map((ring, idx) => (
              <ellipse
                key={idx}
                cx={optSvgX}
                cy={optSvgY}
                rx={ring.rx}
                ry={ring.ry}
                fill="none"
                stroke={ring.stroke}
                strokeWidth={ring.width}
                strokeDasharray="3 3"
                opacity={0.65}
              />
            ))}
          </g>

          {/* Trajectory Path Line */}
          {history.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 2"
              strokeLinecap="round"
            />
          )}

          {/* Trail Points */}
          {history.map((pt, idx) => {
            // Plot every few points to avoid crowding
            if (idx % Math.max(1, Math.floor(history.length / 25)) !== 0 && idx !== history.length - 1) {
              return null;
            }
            return (
              <circle
                key={idx}
                cx={toSvgX(pt.w)}
                cy={toSvgY(pt.b)}
                r={2}
                fill="#f59e0b"
                opacity={0.8}
              />
            );
          })}

          {/* Global Minimum Target Star */}
          <g transform={`translate(${optSvgX}, ${optSvgY})`}>
            <circle r={7} fill="#10b981" fillOpacity={0.2} />
            <circle r={3.5} fill="#10b981" />
            <text
              x={9}
              y={3}
              fill="#10b981"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
            >
              min J
            </text>
          </g>

          {/* Current (w, b) Live Position */}
          <g>
            <circle
              cx={toSvgX(currentW)}
              cy={toSvgY(currentB)}
              r={12}
              fill="#f43f5e"
              fillOpacity={0.25}
              className="animate-ping"
            />
            <circle
              cx={toSvgX(currentW)}
              cy={toSvgY(currentB)}
              r={5}
              fill="#f43f5e"
              stroke="#ffffff"
              strokeWidth={1.5}
            />

            {/* Gradient Descent Step Vector (-α · ∇J) */}
            {typeof dj_dw === 'number' && typeof dj_db === 'number' && (
              <g className="pointer-events-none">
                {(() => {
                  const curSvgX = toSvgX(currentW);
                  const curSvgY = toSvgY(currentB);
                  const stepW = -(alpha || 0.01) * dj_dw;
                  const stepB = -(alpha || 0.01) * dj_db;

                  const targetW = currentW + stepW;
                  const targetB = currentB + stepB;
                  const targetSvgX = toSvgX(targetW);
                  const targetSvgY = toSvgY(targetB);

                  const dx = targetSvgX - curSvgX;
                  const dy = targetSvgY - curSvgY;
                  const len = Math.sqrt(dx * dx + dy * dy);
                  if (len < 1) return null;

                  const scale = Math.min(50, Math.max(16, len)) / len;
                  const endX = curSvgX + dx * scale;
                  const endY = curSvgY + dy * scale;

                  return (
                    <line
                      x1={curSvgX}
                      y1={curSvgY}
                      x2={endX}
                      y2={endY}
                      stroke="#fb7185"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      markerEnd="url(#gradientArrow)"
                    />
                  );
                })()}
              </g>
            )}
          </g>

          {/* X axis labels */}
          <text
            x={padding.left + innerWidth / 2}
            y={height - 10}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
            fontWeight="500"
          >
            Weight / Slope (w)
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
            Bias / Intercept (b)
          </text>
        </svg>

        {/* Floating coordinates tag */}
        <div className="absolute top-2 right-2 bg-slate-950/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono shadow-md backdrop-blur">
          <span className="text-slate-400">Position: </span>
          <span className="text-indigo-400">w={currentW.toFixed(2)}</span>,{' '}
          <span className="text-cyan-400">b={currentB.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

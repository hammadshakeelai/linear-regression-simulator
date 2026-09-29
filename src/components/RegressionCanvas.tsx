import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Point, predict, computeOLS } from '../core/linearRegression';
import { Eye, EyeOff, Plus, Trash2, Crosshair, Sparkles } from 'lucide-react';

interface RegressionCanvasProps {
  points: Point[];
  w: number;
  b: number;
  xLabel: string;
  yLabel: string;
  showResiduals: boolean;
  onToggleResiduals: () => void;
  showOptimalLine: boolean;
  onToggleOptimalLine: () => void;
  onAddPoint: (point: Point) => void;
  onUpdatePoint: (point: Point) => void;
  onRemovePoint: (id: string) => void;
}

export const RegressionCanvas: React.FC<RegressionCanvasProps> = ({
  points,
  w,
  b,
  xLabel,
  yLabel,
  showResiduals,
  onToggleResiduals,
  showOptimalLine,
  onToggleOptimalLine,
  onAddPoint,
  onUpdatePoint,
  onRemovePoint,
}) => {
  const containerRef = useRef<SVGSVGElement | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [draggingPointId, setDraggingPointId] = useState<string | null>(null);

  // SVG dimensions
  const width = 800;
  const height = 500;
  const padding = { top: 40, right: 40, bottom: 60, left: 70 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Compute bounding box with margins
  const bounds = useMemo(() => {
    if (points.length === 0) {
      return { xMin: 0, xMax: 10, yMin: 0, yMax: 10 };
    }

    let minX = Math.min(...points.map((p) => p.x));
    let maxX = Math.max(...points.map((p) => p.x));
    let minY = Math.min(...points.map((p) => p.y));
    let maxY = Math.max(...points.map((p) => p.y));

    // Also include predicted values at bounds so line doesn't get clipped weirdly
    const predMinX = predict(minX, w, b);
    const predMaxX = predict(maxX, w, b);
    minY = Math.min(minY, predMinX, predMaxX);
    maxY = Math.max(maxY, predMinX, predMaxX);

    // Add 15% padding
    const xSpan = Math.max(maxX - minX, 1);
    const ySpan = Math.max(maxY - minY, 1);

    const xMin = Math.floor(minX - xSpan * 0.15);
    const xMax = Math.ceil(maxX + xSpan * 0.15);
    const yMin = Math.floor(minY - ySpan * 0.15);
    const yMax = Math.ceil(maxY + ySpan * 0.15);

    return { xMin, xMax, yMin, yMax };
  }, [points, w, b]);

  // Coordinate transforms
  const toSvgX = useCallback(
    (x: number) => {
      const { xMin, xMax } = bounds;
      const ratio = (x - xMin) / (xMax - xMin || 1);
      return padding.left + ratio * innerWidth;
    },
    [bounds, innerWidth, padding.left]
  );

  const toSvgY = useCallback(
    (y: number) => {
      const { yMin, yMax } = bounds;
      const ratio = (y - yMin) / (yMax - yMin || 1);
      return height - padding.bottom - ratio * innerHeight;
    },
    [bounds, height, innerHeight, padding.bottom]
  );

  const fromSvgCoords = useCallback(
    (svgX: number, svgY: number) => {
      const { xMin, xMax, yMin, yMax } = bounds;
      const xRatio = (svgX - padding.left) / innerWidth;
      const yRatio = (height - padding.bottom - svgY) / innerHeight;
      const rawX = xMin + xRatio * (xMax - xMin);
      const rawY = yMin + yRatio * (yMax - yMin);
      return {
        x: parseFloat(rawX.toFixed(2)),
        y: parseFloat(rawY.toFixed(2)),
      };
    },
    [bounds, height, innerHeight, innerWidth, padding.bottom, padding.left]
  );

  // Compute ticks
  const { xTicks, yTicks } = useMemo(() => {
    const { xMin, xMax, yMin, yMax } = bounds;
    const numTicks = 6;
    const xStep = (xMax - xMin) / numTicks;
    const yStep = (yMax - yMin) / numTicks;

    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i <= numTicks; i++) {
      xs.push(parseFloat((xMin + i * xStep).toFixed(1)));
      ys.push(parseFloat((yMin + i * yStep).toFixed(1)));
    }
    return { xTicks: xs, yTicks: ys };
  }, [bounds]);

  // OLS optimal line
  const ols = useMemo(() => computeOLS(points), [points]);

  // Handle canvas click to add point
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingPointId) return;
    if (e.target !== containerRef.current && (e.target as HTMLElement).tagName !== 'rect') {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if within plotting area
    if (
      clickX >= padding.left &&
      clickX <= width - padding.right &&
      clickY >= padding.top &&
      clickY <= height - padding.bottom
    ) {
      const { x, y } = fromSvgCoords(clickX, clickY);
      const newPoint: Point = {
        id: `point-${Date.now()}`,
        x,
        y,
        label: `P${points.length + 1}`,
      };
      onAddPoint(newPoint);
    }
  };

  // Drag handlers
  const handleMouseDownPoint = (e: React.MouseEvent, p: Point) => {
    e.stopPropagation();
    setDraggingPointId(p.id);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingPointId) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const { x, y } = fromSvgCoords(mouseX, mouseY);
    const existing = points.find((p) => p.id === draggingPointId);
    if (existing) {
      onUpdatePoint({ ...existing, x, y });
    }
  };

  const handleMouseUp = () => {
    setDraggingPointId(null);
  };

  // Mobile Touch drag handlers
  const handleTouchStartPoint = (e: React.TouchEvent, p: Point) => {
    e.stopPropagation();
    setDraggingPointId(p.id);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!draggingPointId || e.touches.length === 0) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const touchX = (touch.clientX - rect.left) * scaleX;
    const touchY = (touch.clientY - rect.top) * scaleY;

    const { x, y } = fromSvgCoords(touchX, touchY);
    const existing = points.find((p) => p.id === draggingPointId);
    if (existing) {
      onUpdatePoint({ ...existing, x, y });
    }
  };

  const handleTouchEnd = () => {
    setDraggingPointId(null);
  };

  // Line points
  const lineP1 = { x: bounds.xMin, y: predict(bounds.xMin, w, b) };
  const lineP2 = { x: bounds.xMax, y: predict(bounds.xMax, w, b) };

  const olsP1 = { x: bounds.xMin, y: predict(bounds.xMin, ols.w, ols.b) };
  const olsP2 = { x: bounds.xMax, y: predict(bounds.xMax, ols.w, ols.b) };

  return (
    <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden flex flex-col">
      {/* Canvas Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-sm font-semibold text-white">2D Feature Coordinate Plane</span>
          <span className="text-xs text-slate-400 font-mono">
            f(x) = {w.toFixed(3)}x {b >= 0 ? `+ ${b.toFixed(3)}` : `- ${Math.abs(b).toFixed(3)}`}
          </span>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={onToggleResiduals}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${
              showResiduals
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            {showResiduals ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Residuals (Errors)</span>
          </button>

          <button
            onClick={onToggleOptimalLine}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${
              showOptimalLine
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimal OLS Line</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full aspect-[16/10] select-none">
        <svg
          ref={containerRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <defs>
            {/* Grid pattern */}
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            <linearGradient id="pointGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Plot background */}
          <rect
            x={padding.left}
            y={padding.top}
            width={innerWidth}
            height={innerHeight}
            fill="#090d16"
            rx={8}
            className="stroke-slate-800/80"
          />

          {/* Grid lines - X */}
          {xTicks.map((val, idx) => {
            const svgX = toSvgX(val);
            return (
              <g key={`x-grid-${idx}`}>
                <line
                  x1={svgX}
                  y1={padding.top}
                  x2={svgX}
                  y2={height - padding.bottom}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <text
                  x={svgX}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Grid lines - Y */}
          {yTicks.map((val, idx) => {
            const svgY = toSvgY(val);
            return (
              <g key={`y-grid-${idx}`}>
                <line
                  x1={padding.left}
                  y1={svgY}
                  x2={width - padding.right}
                  y2={svgY}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <text
                  x={padding.left - 12}
                  y={svgY + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text
            x={padding.left + innerWidth / 2}
            y={height - 12}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="12"
            fontWeight="500"
          >
            {xLabel} (X)
          </text>

          <text
            x={-(padding.top + innerHeight / 2)}
            y={22}
            transform="rotate(-90)"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="12"
            fontWeight="500"
          >
            {yLabel} (Y)
          </text>

          {/* Residual error lines (wx + b - y) */}
          {showResiduals &&
            points.map((p) => {
              const svgX = toSvgX(p.x);
              const svgPointY = toSvgY(p.y);
              const predY = predict(p.x, w, b);
              const svgLineY = toSvgY(predY);
              const diff = Math.abs(predY - p.y);

              // Color based on error magnitude
              const errorColor = diff < 3 ? '#10b981' : diff < 8 ? '#f59e0b' : '#f43f5e';

              return (
                <g key={`res-${p.id}`}>
                  <line
                    x1={svgX}
                    y1={svgPointY}
                    x2={svgX}
                    y2={svgLineY}
                    stroke={errorColor}
                    strokeWidth={1.75}
                    strokeDasharray="4 3"
                    opacity={0.8}
                  />
                  {/* Small anchor dot on the regression line */}
                  <circle cx={svgX} cy={svgLineY} r={2.5} fill={errorColor} opacity={0.7} />
                </g>
              );
            })}

          {/* Optimal OLS Line (if toggled) */}
          {showOptimalLine && (
            <line
              x1={toSvgX(olsP1.x)}
              y1={toSvgY(olsP1.y)}
              x2={toSvgX(olsP2.x)}
              y2={toSvgY(olsP2.y)}
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="6 4"
              opacity={0.75}
            />
          )}

          {/* Current Fitted Regression Line: f(x) = w*x + b */}
          <line
            x1={toSvgX(lineP1.x)}
            y1={toSvgY(lineP1.y)}
            x2={toSvgX(lineP2.x)}
            y2={toSvgY(lineP2.y)}
            stroke="url(#lineGrad)"
            strokeWidth={3.5}
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Data Points */}
          {points.map((p) => {
            const svgX = toSvgX(p.x);
            const svgY = toSvgY(p.y);
            const isHovered = hoveredPoint?.id === p.id;
            const isDragging = draggingPointId === p.id;

            return (
              <g
                key={p.id}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                onMouseDown={(e) => handleMouseDownPoint(e, p)}
                onTouchStart={(e) => handleTouchStartPoint(e, p)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onRemovePoint(p.id);
                }}
                style={{ touchAction: 'none' }}
                className="cursor-grab active:cursor-grabbing transition-transform select-none"
              >
                {/* Outer halo on hover */}
                {(isHovered || isDragging) && (
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r={14}
                    fill="#f43f5e"
                    fillOpacity={0.25}
                    className="animate-ping"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={svgX}
                  cy={svgY}
                  r={isDragging ? 8 : isHovered ? 7 : 5.5}
                  fill="url(#pointGrad)"
                  stroke="#ffffff"
                  strokeWidth={2}
                  className="shadow-lg transition-all"
                />

                {/* Label if present */}
                {p.label && (
                  <text
                    x={svgX}
                    y={svgY - 10}
                    textAnchor="middle"
                    fill="#cbd5e1"
                    fontSize="10"
                    fontWeight="500"
                    pointerEvents="none"
                  >
                    {p.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-950/95 border border-slate-700/80 rounded-xl p-2.5 text-xs shadow-2xl backdrop-blur font-mono space-y-1 transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${(toSvgX(hoveredPoint.x) / width) * 100}%`,
              top: `${(toSvgY(hoveredPoint.y) / height) * 100}%`,
            }}
          >
            <div className="flex items-center justify-between gap-3 text-slate-300 font-sans border-b border-slate-800 pb-1">
              <span className="font-semibold text-rose-400">
                {hoveredPoint.label || 'Data Point'}
              </span>
              <span className="text-[10px] text-slate-500">Right-click to delete</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-400">
              <span>Actual:</span>
              <span className="text-white font-bold">
                ({hoveredPoint.x}, {hoveredPoint.y})
              </span>
            </div>
            <div className="flex justify-between gap-4 text-slate-400">
              <span>Predicted:</span>
              <span className="text-indigo-400 font-bold">
                {predict(hoveredPoint.x, w, b).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-4 text-slate-400">
              <span>Error (diff):</span>
              <span
                className={`font-bold ${
                  Math.abs(predict(hoveredPoint.x, w, b) - hoveredPoint.y) < 3
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {(predict(hoveredPoint.x, w, b) - hoveredPoint.y).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-4 text-slate-400">
              <span>Squared Error:</span>
              <span className="text-amber-400 font-bold">
                {Math.pow(predict(hoveredPoint.x, w, b) - hoveredPoint.y, 2).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Footnote / Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            Data Points: <strong className="text-slate-200">{points.length}</strong>
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">
            Click on canvas to <strong>add points</strong>; Drag points to <strong>reposition</strong>; Right-click to <strong>delete</strong>.
          </span>
        </div>

        {showOptimalLine && (
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <span>OLS Best Fit:</span>
            <span>
              f(x) = {ols.w.toFixed(3)}x {ols.b >= 0 ? `+ ${ols.b.toFixed(3)}` : `- ${Math.abs(ols.b).toFixed(3)}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

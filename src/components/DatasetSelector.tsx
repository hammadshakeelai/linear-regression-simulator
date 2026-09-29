import React, { useRef } from 'react';
import { Database, Upload, Download, Trash2, Plus, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { PRESET_DATASETS, DatasetPreset } from '../data/defaultDatasets';
import { Point } from '../core/linearRegression';

interface DatasetSelectorProps {
  currentPresetId: string;
  onSelectPreset: (preset: DatasetPreset) => void;
  onUploadCsv: (points: Point[], xLabel: string, yLabel: string) => void;
  onAddRandomPoint: () => void;
  onClearPoints: () => void;
  onResetPoints: () => void;
  pointsCount: number;
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  currentPresetId,
  onSelectPreset,
  onUploadCsv,
  onAddRandomPoint,
  onClearPoints,
  onResetPoints,
  pointsCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse uploaded CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) return;

      const header = lines[0].split(',').map((h) => h.trim());
      // Try to find x and y columns or take first 2 numeric columns
      let xColIdx = header.findIndex((h) => ['x', 'attendance', 'study_hours', 'adv', 'advertising'].includes(h.toLowerCase()));
      let yColIdx = header.findIndex((h) => ['y', 'exam_score', 'sale', 'sales', 'score'].includes(h.toLowerCase()));

      if (xColIdx === -1 || yColIdx === -1) {
        xColIdx = 0;
        yColIdx = 1;
      }

      const parsedPoints: Point[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length > Math.max(xColIdx, yColIdx)) {
          const valX = parseFloat(parts[xColIdx]);
          const valY = parseFloat(parts[yColIdx]);
          if (!isNaN(valX) && !isNaN(valY)) {
            parsedPoints.push({
              id: `csv-${i}`,
              x: valX,
              y: valY,
              label: parts[1] && isNaN(parseFloat(parts[1])) ? parts[1] : `P${i}`,
            });
          }
        }
      }

      if (parsedPoints.length > 0) {
        onUploadCsv(
          parsedPoints,
          header[xColIdx] || 'Custom X',
          header[yColIdx] || 'Custom Y'
        );
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
      {/* Preset selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Active Dataset:</span>
        </div>

        <select
          value={currentPresetId}
          onChange={(e) => {
            const found = PRESET_DATASETS.find((p) => p.id === e.target.value);
            if (found) onSelectPreset(found);
          }}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-indigo-500 transition"
        >
          {PRESET_DATASETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
          {currentPresetId === 'custom' && <option value="custom">Custom Dataset (User Points)</option>}
        </select>
      </div>

      {/* Dataset Actions */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700/60 transition"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span>Upload CSV</span>
        </button>

        <button
          onClick={onAddRandomPoint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700/60 transition"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add Point</span>
        </button>

        <button
          onClick={onResetPoints}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700/60 transition"
          title="Reload initial preset points"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <button
          onClick={onClearPoints}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear ({pointsCount})</span>
        </button>
      </div>
    </div>
  );
};

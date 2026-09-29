import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Navbar, SimulatorMode } from './components/Navbar';
import { RegressionCanvas } from './components/RegressionCanvas';
import { ManualControls } from './components/ManualControls';
import { TrainingControls } from './components/TrainingControls';
import { VSCodeEditor } from './components/VSCodeEditor';
import { LossChart, LossPoint } from './components/LossChart';
import { CostContour } from './components/CostContour';
import { DatasetSelector } from './components/DatasetSelector';
import { MathModal } from './components/MathModal';
import { PythonExportModal } from './components/PythonExportModal';
import { AnimatedHeroBanner } from './components/AnimatedHeroBanner';
import { PRESET_DATASETS, DatasetPreset } from './data/defaultDatasets';
import {
  Point,
  computeStepDetails,
  performGradientDescentStep,
  computeOLS,
  computeNormalizationParams,
  normalizePoints,
  denormalizeModel,
} from './core/linearRegression';

export default function App() {
  // Simulator Mode: 'manual' (Part 1) or 'gradient_descent' (Part 2)
  const [mode, setMode] = useState<SimulatorMode>('gradient_descent');

  // Dataset State
  const [currentPreset, setCurrentPreset] = useState<DatasetPreset>(PRESET_DATASETS[0]);
  const [points, setPoints] = useState<Point[]>(PRESET_DATASETS[0].points);
  const [xLabel, setXLabel] = useState(PRESET_DATASETS[0].xLabel);
  const [yLabel, setYLabel] = useState(PRESET_DATASETS[0].yLabel);

  // Model Parameters: w (slope) and b (intercept)
  const [w, setW] = useState<number>(PRESET_DATASETS[0].initialW ?? 1.0);
  const [b, setB] = useState<number>(PRESET_DATASETS[0].initialB ?? 0.0);

  // Training Hyperparameters
  const [alpha, setAlpha] = useState<number>(PRESET_DATASETS[0].suggestedAlpha);
  const [epochs, setEpochs] = useState<number>(1000);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [delayMs, setDelayMs] = useState<number>(40);
  const [stepsPerTick, setStepsPerTick] = useState<number>(1);
  const [standardize, setStandardize] = useState<boolean>(false);
  const [converged, setConverged] = useState<boolean>(false);

  // Canvas visual toggles
  const [showResiduals, setShowResiduals] = useState<boolean>(true);
  const [showOptimalLine, setShowOptimalLine] = useState<boolean>(false);

  // Loss history tracking for charts
  const [lossHistory, setLossHistory] = useState<LossPoint[]>([]);
  const [initialCost, setInitialCost] = useState<number>(0);

  // Active code line for VS Code debugger highlight (11 to 16)
  const [activeCodeLine, setActiveCodeLine] = useState<number | undefined>(undefined);

  // Modals
  const [mathModalOpen, setMathModalOpen] = useState<boolean>(false);
  const [codeModalOpen, setCodeModalOpen] = useState<boolean>(false);

  // Animation frame reference
  const animationRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  // Analytical optimal solution for comparison
  const ols = useMemo(() => computeOLS(points), [points]);
  const optimalDetails = useMemo(() => computeStepDetails(points, ols.w, ols.b, 0), [points, ols]);

  // Current math calculations for (w, b)
  const currentDetails = useMemo(
    () => computeStepDetails(points, w, b, alpha),
    [points, w, b, alpha]
  );

  // Reset loss history when dataset or parameters are manually reset
  const resetLossHistory = useCallback(
    (startW: number, startB: number) => {
      const details = computeStepDetails(points, startW, startB, alpha);
      setLossHistory([{ epoch: 0, cost: details.jwb, w: startW, b: startB }]);
      setInitialCost(details.jwb);
      setCurrentEpoch(0);
      setConverged(false);
    },
    [points, alpha]
  );

  // Initialize loss history on mount or dataset change
  useEffect(() => {
    resetLossHistory(w, b);
  }, [points]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: DatasetPreset) => {
    setIsTraining(false);
    setCurrentPreset(preset);
    setPoints(preset.points);
    setXLabel(preset.xLabel);
    setYLabel(preset.yLabel);
    const initW = preset.initialW ?? 1.0;
    const initB = preset.initialB ?? 0.0;
    setW(initW);
    setB(initB);
    setAlpha(preset.suggestedAlpha);
    resetLossHistory(initW, initB);
  };

  // Upload custom CSV
  const handleUploadCsv = (newPoints: Point[], newXLabel: string, newYLabel: string) => {
    setIsTraining(false);
    setPoints(newPoints);
    setXLabel(newXLabel);
    setYLabel(newYLabel);
    const newOls = computeOLS(newPoints);
    const initW = parseFloat((newOls.w * 0.5).toFixed(2));
    const initB = parseFloat((newOls.b * 0.5).toFixed(2));
    setW(initW);
    setB(initB);
    resetLossHistory(initW, initB);
  };

  // Add random point
  const handleAddRandomPoint = () => {
    if (points.length === 0) return;
    const avgX = points.reduce((acc, p) => acc + p.x, 0) / points.length;
    const avgY = points.reduce((acc, p) => acc + p.y, 0) / points.length;
    const newX = parseFloat((avgX + (Math.random() - 0.5) * avgX * 0.4).toFixed(1));
    const newY = parseFloat((w * newX + b + (Math.random() - 0.5) * 10).toFixed(1));
    const newPt: Point = {
      id: `p-${Date.now()}`,
      x: newX,
      y: newY,
      label: `P${points.length + 1}`,
    };
    setPoints([...points, newPt]);
  };

  // Point modifications
  const handleAddPoint = (pt: Point) => {
    setPoints([...points, pt]);
  };

  const handleUpdatePoint = (updated: Point) => {
    setPoints(points.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleRemovePoint = (id: string) => {
    if (points.length <= 2) return; // Keep at least 2 points
    setPoints(points.filter((p) => p.id !== id));
  };

  // Manual Mode Actions
  const handleSnapToOptimal = () => {
    setW(ols.w);
    setB(ols.b);
    resetLossHistory(ols.w, ols.b);
  };

  const handleRandomizeWeights = () => {
    const newW = parseFloat((ols.w * (0.2 + Math.random() * 1.5)).toFixed(3));
    const newB = parseFloat((ols.b * (0.2 + Math.random() * 1.5)).toFixed(2));
    setW(newW);
    setB(newB);
    resetLossHistory(newW, newB);
  };

  const handleResetWeights = () => {
    const initW = currentPreset.initialW ?? 0;
    const initB = currentPreset.initialB ?? 0;
    setW(initW);
    setB(initB);
    resetLossHistory(initW, initB);
  };

  // Perform single or batch gradient descent step
  const stepGradientDescent = useCallback(
    (numSteps: number = 1) => {
      let curW = w;
      let curB = b;
      let curEpoch = currentEpoch;
      let lastCost = currentDetails.jwb;

      if (standardize) {
        // Standardized feature training: z = (x - mean) / std
        const normParams = computeNormalizationParams(points);
        const normPoints = normalizePoints(points, normParams);

        // Convert current (w, b) to normalized space
        let normW = curW * (normParams.stdX / normParams.stdY);
        let normB = (curB + curW * normParams.meanX - normParams.meanY) / normParams.stdY;

        for (let s = 0; s < numSteps; s++) {
          const stepRes = performGradientDescentStep(normPoints, normW, normB, alpha);
          normW = stepRes.w;
          normB = stepRes.b;
          curEpoch += 1;
        }

        // Convert back to raw display space
        const rawModel = denormalizeModel(normW, normB, normParams);
        curW = rawModel.w;
        curB = rawModel.b;
        const details = computeStepDetails(points, curW, curB, alpha);
        lastCost = details.jwb;
      } else {
        // Pure raw gradient descent directly matching user notebook
        for (let s = 0; s < numSteps; s++) {
          const stepRes = performGradientDescentStep(points, curW, curB, alpha);
          curW = stepRes.w;
          curB = stepRes.b;
          curEpoch += 1;
          lastCost = stepRes.details.jwb;
        }
      }

      setW(curW);
      setB(curB);
      setCurrentEpoch(curEpoch);

      // Check convergence: delta cost < 1e-6
      if (lossHistory.length > 0) {
        const prevCost = lossHistory[lossHistory.length - 1].cost;
        if (Math.abs(prevCost - lastCost) < 1e-6 && curEpoch > 20) {
          setConverged(true);
        }
      }

      // Record to loss history
      setLossHistory((prev) => {
        const next = [...prev, { epoch: curEpoch, cost: lastCost, w: curW, b: curB }];
        // Limit history to 300 points for smooth performance
        if (next.length > 300) {
          return next.filter((_, idx) => idx % 2 === 0 || idx === next.length - 1);
        }
        return next;
      });

      // Highlight code line in debugger box
      setActiveCodeLine((curEpoch % 6) + 11);
    },
    [w, b, currentEpoch, currentDetails, alpha, standardize, points, lossHistory]
  );

  // Gradient Descent Animation Loop
  useEffect(() => {
    if (!isTraining) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    if (currentEpoch >= epochs || converged) {
      setIsTraining(false);
      return;
    }

    const loop = (timestamp: number) => {
      if (timestamp - lastTickTimeRef.current >= delayMs) {
        lastTickTimeRef.current = timestamp;
        stepGradientDescent(stepsPerTick);
      }
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isTraining, currentEpoch, epochs, delayMs, stepsPerTick, converged, stepGradientDescent]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        mode={mode}
        onModeChange={(newMode) => {
          setIsTraining(false);
          setMode(newMode);
        }}
        onOpenMathModal={() => setMathModalOpen(true)}
        onOpenCodeModal={() => setCodeModalOpen(true)}
        onResetAll={handleResetWeights}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Animated Hero Banner with Scatter Plot & Video-like Line Optimization */}
        <AnimatedHeroBanner
          onStartTraining={() => {
            setMode('gradient_descent');
            setIsTraining(true);
          }}
          isTraining={isTraining}
        />

        {/* Dataset Bar */}
        <DatasetSelector
          currentPresetId={currentPreset.id}
          onSelectPreset={handleSelectPreset}
          onUploadCsv={handleUploadCsv}
          onAddRandomPoint={handleAddRandomPoint}
          onClearPoints={() => setPoints([])}
          onResetPoints={() => handleSelectPreset(currentPreset)}
          pointsCount={points.length}
        />

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 2D Coordinate Plane + Controls (Part 1 or Part 2) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 2D Canvas with Points, Regression Line & Error Residuals */}
            <RegressionCanvas
              points={points}
              w={w}
              b={b}
              xLabel={xLabel}
              yLabel={yLabel}
              showResiduals={showResiduals}
              onToggleResiduals={() => setShowResiduals(!showResiduals)}
              showOptimalLine={showOptimalLine}
              onToggleOptimalLine={() => setShowOptimalLine(!showOptimalLine)}
              onAddPoint={handleAddPoint}
              onUpdatePoint={handleUpdatePoint}
              onRemovePoint={handleRemovePoint}
            />

            {/* Mode-Dependent Controller Panel */}
            {mode === 'manual' ? (
              <ManualControls
                w={w}
                b={b}
                onUpdateW={(newW) => {
                  setW(newW);
                  setLossHistory((prev) => [
                    ...prev.slice(-50),
                    {
                      epoch: prev.length,
                      cost: computeStepDetails(points, newW, b, alpha).jwb,
                      w: newW,
                      b,
                    },
                  ]);
                }}
                onUpdateB={(newB) => {
                  setB(newB);
                  setLossHistory((prev) => [
                    ...prev.slice(-50),
                    {
                      epoch: prev.length,
                      cost: computeStepDetails(points, w, newB, alpha).jwb,
                      w,
                      b: newB,
                    },
                  ]);
                }}
                onSnapToOptimal={handleSnapToOptimal}
                onRandomize={handleRandomizeWeights}
                onReset={handleResetWeights}
                details={currentDetails}
                optimalW={ols.w}
                optimalB={ols.b}
                optimalCost={optimalDetails.jwb}
              />
            ) : (
              <TrainingControls
                isTraining={isTraining}
                onTogglePlay={() => setIsTraining(!isTraining)}
                onStepOnce={() => stepGradientDescent(1)}
                onStepBatch={(steps) => stepGradientDescent(steps)}
                onResetWeights={handleResetWeights}
                epoch={currentEpoch}
                maxEpochs={epochs}
                onUpdateMaxEpochs={setEpochs}
                alpha={alpha}
                onUpdateAlpha={setAlpha}
                delayMs={delayMs}
                onUpdateDelayMs={setDelayMs}
                stepsPerTick={stepsPerTick}
                onUpdateStepsPerTick={setStepsPerTick}
                standardize={standardize}
                onToggleStandardize={() => setStandardize(!standardize)}
                details={currentDetails}
                initialCost={initialCost}
                converged={converged}
              />
            )}
          </div>

          {/* Right Column: VS Code Editor Box + Analytics Charts */}
          <div className="lg:col-span-5 space-y-6">
            {/* VS Code Interactive Box (User can change w, b, alpha, epochs right inside) */}
            <VSCodeEditor
              w={w}
              b={b}
              alpha={alpha}
              epochs={epochs}
              onUpdateW={(newW) => setW(newW)}
              onUpdateB={(newB) => setB(newB)}
              onUpdateAlpha={(newA) => setAlpha(newA)}
              onUpdateEpochs={(newE) => setEpochs(newE)}
              details={currentDetails}
              isTraining={isTraining}
              onTogglePlay={() => setIsTraining(!isTraining)}
              onStepOnce={() => stepGradientDescent(1)}
              onReset={handleResetWeights}
              activeLineIndex={activeCodeLine}
              currentEpoch={currentEpoch}
              points={points}
              onUpdatePoint={handleUpdatePoint}
              onAddPoint={handleAddPoint}
              onRemovePoint={handleRemovePoint}
              onSnapToOptimal={handleSnapToOptimal}
            />

            {/* In Gradient Descent Mode, show real-time Loss Curve and 2D Cost Contour */}
            {mode === 'gradient_descent' && (
              <>
                <LossChart
                  history={lossHistory}
                  currentEpoch={currentEpoch}
                  currentCost={currentDetails.jwb}
                />

                <CostContour
                  history={lossHistory}
                  currentW={w}
                  currentB={b}
                  optimalW={ols.w}
                  optimalB={ols.b}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          Linear Regression Simulator & Gradient Descent Lab • Built with React, TypeScript & Tailwind CSS • Grounded in{' '}
          <a
            href="https://github.com/hammadshakeelai/Machine-Learning/blob/main/Programming-for-AI/Linear_Regression.ipynb"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:underline"
          >
            Linear_Regression.ipynb
          </a>
        </p>
      </footer>

      {/* Modals */}
      <MathModal
        isOpen={mathModalOpen}
        onClose={() => setMathModalOpen(false)}
        details={currentDetails}
        alpha={alpha}
      />

      <PythonExportModal
        isOpen={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        points={points}
        w={w}
        b={b}
        alpha={alpha}
        epochs={epochs}
        xLabel={xLabel}
        yLabel={yLabel}
      />
    </div>
  );
}

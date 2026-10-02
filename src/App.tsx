import React, { useState } from 'react';
import { Navbar, SimulatorMode } from './components/Navbar';
import { RegressionCanvas } from './components/RegressionCanvas';
import { ManualControls } from './components/ManualControls';
import { TrainingControls } from './components/TrainingControls';
import { VSCodeEditor } from './components/VSCodeEditor';
import { LossChart } from './components/LossChart';
import { CostContour } from './components/CostContour';
import { DatasetSelector } from './components/DatasetSelector';
import { MathModal } from './components/MathModal';
import { PythonExportModal } from './components/PythonExportModal';
import { AnimatedHeroBanner } from './components/AnimatedHeroBanner';
import { PredictionPlayground } from './components/PredictionPlayground';
import { useLinearRegression } from './hooks/useLinearRegression';
import { AlertTriangle, RefreshCw, Zap } from 'lucide-react';

export default function App() {
  // Simulator Mode: 'manual' (Part 1) or 'gradient_descent' (Part 2)
  const [mode, setMode] = useState<SimulatorMode>('gradient_descent');

  // Canvas visual toggles
  const [showResiduals, setShowResiduals] = useState<boolean>(true);
  const [showErrorSquares, setShowErrorSquares] = useState<boolean>(false);
  const [showOptimalLine, setShowOptimalLine] = useState<boolean>(false);
  const [highlightX, setHighlightX] = useState<number | null>(null);

  // Modals
  const [mathModalOpen, setMathModalOpen] = useState<boolean>(false);
  const [codeModalOpen, setCodeModalOpen] = useState<boolean>(false);

  // Custom Linear Regression Hook (State, Math, Optimization, Audio Sonification)
  const {
    currentPreset,
    points,
    xLabel,
    yLabel,
    selectPreset,
    uploadCsv,
    addPoint,
    updatePoint,
    removePoint,
    addRandomPoint,
    clearPoints,
    w,
    b,
    setW,
    setB,
    alpha,
    setAlpha,
    epochs,
    setEpochs,
    currentEpoch,
    isTraining,
    setIsTraining,
    delayMs,
    setDelayMs,
    stepsPerTick,
    setStepsPerTick,
    standardize,
    setStandardize,
    converged,
    hasDiverged,
    setHasDiverged,
    optimizerType,
    setOptimizerType,
    stepGradientDescent,
    snapToOptimal,
    randomizeWeights,
    resetWeights,
    currentDetails,
    ols,
    optimalDetails,
    lossHistory,
    initialCost,
    soundEnabled,
    setSoundEnabled,
  } = useLinearRegression();

  // Active code line for VS Code debugger highlight (11 to 16)
  const activeCodeLine = isTraining ? ((currentEpoch % 6) + 11) : undefined;

  const handleFixDivergence = () => {
    setStandardize(true);
    setAlpha(0.01);
    resetWeights();
    setHasDiverged(false);
  };

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
        onResetAll={resetWeights}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-8 space-y-6">
        {/* Animated Hero Banner with Scatter Plot & Video-like Line Optimization */}
        <AnimatedHeroBanner
          onStartTraining={() => {
            setMode('gradient_descent');
            setIsTraining(true);
          }}
          isTraining={isTraining}
        />

        {/* Dataset Selector Bar */}
        <DatasetSelector
          currentPresetId={currentPreset.id}
          onSelectPreset={selectPreset}
          onUploadCsv={uploadCsv}
          onAddRandomPoint={addRandomPoint}
          onClearPoints={clearPoints}
          onResetPoints={() => selectPreset(currentPreset)}
          pointsCount={points.length}
        />

        {/* Divergence Warning Circuit Breaker Banner */}
        {hasDiverged && (
          <div className="bg-rose-950/80 border border-rose-600/70 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-rose-200 shadow-xl backdrop-blur animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Gradient Divergence Detected</h4>
                <p className="text-xs text-rose-300">
                  The learning rate (α = {alpha}) is too high for this coordinate scale. Enable Feature Scaling (Z-Score) or reduce α.
                </p>
              </div>
            </div>

            <button
              onClick={handleFixDivergence}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Auto-Fix & Reset</span>
            </button>
          </div>
        )}

        {/* Mode-Dependent Controls Hub */}
        {mode === 'manual' ? (
          <ManualControls
            w={w}
            b={b}
            onUpdateW={setW}
            onUpdateB={setB}
            onSnapToOptimal={snapToOptimal}
            onRandomize={randomizeWeights}
            onReset={resetWeights}
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
            onResetWeights={resetWeights}
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
            optimizerType={optimizerType}
            onUpdateOptimizerType={setOptimizerType}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
          />
        )}

        {/* Dual Synchronized Canvases: Data Space (Left) vs Parameter Space (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Canvas 1: Data Space (Interactive Scatter Plot + Fitted Line) */}
          <div className="flex flex-col">
            <RegressionCanvas
              points={points}
              w={w}
              b={b}
              xLabel={xLabel}
              yLabel={yLabel}
              showResiduals={showResiduals}
              onToggleResiduals={() => setShowResiduals(!showResiduals)}
              showErrorSquares={showErrorSquares}
              onToggleErrorSquares={() => setShowErrorSquares(!showErrorSquares)}
              showOptimalLine={showOptimalLine}
              onToggleOptimalLine={() => setShowOptimalLine(!showOptimalLine)}
              highlightX={highlightX}
              onAddPoint={addPoint}
              onUpdatePoint={updatePoint}
              onRemovePoint={removePoint}
            />
          </div>

          {/* Canvas 2: Parameter Space (2D Cost Contour Surface J(w, b)) */}
          <div className="flex flex-col">
            <CostContour
              history={lossHistory}
              currentW={w}
              currentB={b}
              optimalW={ols.w}
              optimalB={ols.b}
              onSetParameters={(newW, newB) => {
                setW(newW);
                setB(newB);
              }}
            />
          </div>
        </div>

        {/* Interactive Code & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: VS Code Editor Box (Grounded in Notebook) */}
          <div className="lg:col-span-7">
            <VSCodeEditor
              w={w}
              b={b}
              alpha={alpha}
              epochs={epochs}
              onUpdateW={setW}
              onUpdateB={setB}
              onUpdateAlpha={setAlpha}
              onUpdateEpochs={setEpochs}
              details={currentDetails}
              isTraining={isTraining}
              onTogglePlay={() => setIsTraining(!isTraining)}
              onStepOnce={() => stepGradientDescent(1)}
              onReset={resetWeights}
              activeLineIndex={activeCodeLine}
              currentEpoch={currentEpoch}
              points={points}
              onUpdatePoint={updatePoint}
              onAddPoint={addPoint}
              onRemovePoint={removePoint}
              onSnapToOptimal={snapToOptimal}
            />
          </div>

          {/* Right Column: Real-time Loss Curve & Prediction Playground */}
          <div className="lg:col-span-5 space-y-6">
            <LossChart
              history={lossHistory}
              currentEpoch={currentEpoch}
              currentCost={currentDetails.jwb}
            />

            <PredictionPlayground
              w={w}
              b={b}
              xLabel={xLabel}
              yLabel={yLabel}
              onSetTestX={setHighlightX}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-5 px-6 text-center text-xs text-slate-500">
        <p>
          Linear Regression Simulator & Gradient Descent Lab • Benchmarked against Seeing Theory & Stanford CS229 • Grounded in{' '}
          <a
            href="https://github.com/hammadshakeelai/Machine-Learning/blob/main/Programming-for-AI/Linear_Regression.ipynb"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:underline font-semibold"
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

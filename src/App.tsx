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
          onSelectPreset={selectPreset}
          onUploadCsv={uploadCsv}
          onAddRandomPoint={addRandomPoint}
          onClearPoints={clearPoints}
          onResetPoints={() => selectPreset(currentPreset)}
          pointsCount={points.length}
        />

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 2D Coordinate Plane + Controls (Part 1 or Part 2) + Prediction Playground */}
          <div className="lg:col-span-7 space-y-6">
            {/* 2D Canvas with Points, Regression Line, Residuals & Error Squares */}
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

            {/* Mode-Dependent Controller Panel */}
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

            {/* Interactive Prediction Playground */}
            <PredictionPlayground
              w={w}
              b={b}
              xLabel={xLabel}
              yLabel={yLabel}
              onSetTestX={setHighlightX}
            />
          </div>

          {/* Right Column: VS Code Editor Box + Analytics Charts */}
          <div className="lg:col-span-5 space-y-6">
            {/* VS Code Interactive Box (User can change w, b, alpha, epochs right inside) */}
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
                  onSetParameters={(newW, newB) => {
                    setW(newW);
                    setB(newB);
                  }}
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

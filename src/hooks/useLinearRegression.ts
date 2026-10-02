import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Point,
  StepMathDetails,
  computeStepDetails,
  performGradientDescentStep,
  computeOLS,
  computeNormalizationParams,
  normalizePoints,
  denormalizeModel,
  computeStabilityAnalysis,
  StabilityAnalysis,
} from '../core/linearRegression';
import { PRESET_DATASETS, DatasetPreset } from '../data/defaultDatasets';
import { LossPoint } from '../components/LossChart';

export type OptimizerType = 'batch' | 'sgd' | 'minibatch' | 'momentum';

export interface UseLinearRegressionOptions {
  initialPreset?: DatasetPreset;
}

export function useLinearRegression(options?: UseLinearRegressionOptions) {
  const initialPreset = options?.initialPreset ?? PRESET_DATASETS[0];

  // Dataset State
  const [currentPreset, setCurrentPreset] = useState<DatasetPreset>(initialPreset);
  const [points, setPoints] = useState<Point[]>(initialPreset.points);
  const [xLabel, setXLabel] = useState<string>(initialPreset.xLabel);
  const [yLabel, setYLabel] = useState<string>(initialPreset.yLabel);

  // Model Parameters: w (slope) and b (intercept)
  const [w, setW] = useState<number>(initialPreset.initialW ?? 0.0);
  const [b, setB] = useState<number>(initialPreset.initialB ?? 0.0);

  // Optimizer & Hyperparameters
  const [optimizerType, setOptimizerType] = useState<OptimizerType>('batch');
  const [alpha, setAlpha] = useState<number>(initialPreset.suggestedAlpha);
  const [epochs, setEpochs] = useState<number>(1000);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [delayMs, setDelayMs] = useState<number>(35);
  const [stepsPerTick, setStepsPerTick] = useState<number>(1);
  const [standardize, setStandardize] = useState<boolean>(initialPreset.defaultStandardize ?? false);
  const [converged, setConverged] = useState<boolean>(false);
  const [hasDiverged, setHasDiverged] = useState<boolean>(false);
  const [momentumBeta, setMomentumBeta] = useState<number>(0.9);

  // Momentum velocities
  const velocityW = useRef<number>(0);
  const velocityB = useRef<number>(0);

  // Loss History Tracking
  const [lossHistory, setLossHistory] = useState<LossPoint[]>([]);
  const [initialCost, setInitialCost] = useState<number>(0);

  // Audio effects enabled
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Animation frame & timer reference
  const animationRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  // Analytical optimal solution for baseline
  const ols = useMemo(() => computeOLS(points), [points]);
  const optimalDetails = useMemo(() => computeStepDetails(points, ols.w, ols.b, 0), [points, ols]);

  // Current math calculations for (w, b)
  const currentDetails = useMemo(
    () => computeStepDetails(points, w, b, alpha),
    [points, w, b, alpha]
  );

  // Theoretical stability analysis & Lipschitz bound
  const stability = useMemo(
    () => computeStabilityAnalysis(points, alpha, standardize),
    [points, alpha, standardize]
  );

  // Subtle audio tone based on cost (pitch descends with cost)
  const playTrainingChime = useCallback((cost: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      // Pitch mapped: high cost -> higher frequency (800Hz), low cost -> calm resonant low (220Hz)
      const freq = Math.max(180, Math.min(880, 220 + Math.log10(Math.max(cost, 1e-4) + 1) * 150));
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio playback silently ignored if blocked by autoplay policy
    }
  }, [soundEnabled]);

  // Reset loss history when dataset or parameters are reset
  const resetLossHistory = useCallback(
    (startW: number, startB: number) => {
      const details = computeStepDetails(points, startW, startB, alpha);
      setLossHistory([{ epoch: 0, cost: details.jwb, w: startW, b: startB }]);
      setInitialCost(details.jwb);
      setCurrentEpoch(0);
      setConverged(false);
      setHasDiverged(false);
      velocityW.current = 0;
      velocityB.current = 0;
    },
    [points, alpha]
  );

  // Initialize loss history on mount or dataset change
  useEffect(() => {
    resetLossHistory(w, b);
  }, [points]);

  // Handle Preset Selection
  const selectPreset = useCallback((preset: DatasetPreset) => {
    setIsTraining(false);
    setCurrentPreset(preset);
    setPoints(preset.points);
    setXLabel(preset.xLabel);
    setYLabel(preset.yLabel);
    const initW = preset.initialW ?? 0.0;
    const initB = preset.initialB ?? 0.0;
    setW(initW);
    setB(initB);
    setAlpha(preset.suggestedAlpha);
    setStandardize(preset.defaultStandardize ?? false);
    resetLossHistory(initW, initB);
  }, [resetLossHistory]);

  // Upload Custom CSV
  const uploadCsv = useCallback((newPoints: Point[], newXLabel: string, newYLabel: string) => {
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
  }, [resetLossHistory]);

  // Add random data point
  const addRandomPoint = useCallback(() => {
    if (points.length === 0) return;
    const avgX = points.reduce((acc, p) => acc + p.x, 0) / points.length;
    const newX = parseFloat((avgX + (Math.random() - 0.5) * avgX * 0.4).toFixed(1));
    const newY = parseFloat((w * newX + b + (Math.random() - 0.5) * 10).toFixed(1));
    const newPt: Point = {
      id: `p-${Date.now()}`,
      x: newX,
      y: newY,
      label: `P${points.length + 1}`,
    };
    setPoints((prev) => [...prev, newPt]);
  }, [points, w, b]);

  const addPoint = useCallback((pt: Point) => {
    setPoints((prev) => [...prev, pt]);
  }, []);

  const updatePoint = useCallback((updated: Point) => {
    setPoints((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const removePoint = useCallback((id: string) => {
    setPoints((prev) => (prev.length > 2 ? prev.filter((p) => p.id !== id) : prev));
  }, []);

  const clearPoints = useCallback(() => {
    setPoints([]);
  }, []);

  // Snap to OLS Optimal
  const snapToOptimal = useCallback(() => {
    setW(ols.w);
    setB(ols.b);
    resetLossHistory(ols.w, ols.b);
  }, [ols, resetLossHistory]);

  // Randomize weights
  const randomizeWeights = useCallback(() => {
    const newW = parseFloat((ols.w * (0.2 + Math.random() * 1.5)).toFixed(3));
    const newB = parseFloat((ols.b * (0.2 + Math.random() * 1.5)).toFixed(2));
    setW(newW);
    setB(newB);
    resetLossHistory(newW, newB);
  }, [ols, resetLossHistory]);

  // Reset to initial preset weights
  const resetWeights = useCallback(() => {
    const initW = currentPreset.initialW ?? 0;
    const initB = currentPreset.initialB ?? 0;
    setW(initW);
    setB(initB);
    resetLossHistory(initW, initB);
  }, [currentPreset, resetLossHistory]);

  // Perform a Gradient Descent step with support for multiple optimizer variations
  const stepGradientDescent = useCallback(
    (numSteps: number = 1) => {
      let curW = w;
      let curB = b;
      let curEpoch = currentEpoch;
      let lastCost = currentDetails.jwb;

      const normParams = computeNormalizationParams(points);
      const activePoints = standardize ? normalizePoints(points, normParams) : points;

      for (let s = 0; s < numSteps; s++) {
        let sampleSubset: Point[] = activePoints;

        if (optimizerType === 'sgd') {
          // Stochastic: single random sample
          const randIdx = Math.floor(Math.random() * activePoints.length);
          sampleSubset = [activePoints[randIdx]];
        } else if (optimizerType === 'minibatch') {
          // Mini-batch: 3 random samples or half
          const batchSize = Math.max(2, Math.floor(activePoints.length / 2));
          sampleSubset = [...activePoints].sort(() => 0.5 - Math.random()).slice(0, batchSize);
        }

        if (standardize) {
          let normW = curW * (normParams.stdX / normParams.stdY);
          let normB = (curB + curW * normParams.meanX - normParams.meanY) / normParams.stdY;

          const stepRes = performGradientDescentStep(sampleSubset, normW, normB, alpha);

          if (optimizerType === 'momentum') {
            velocityW.current = momentumBeta * velocityW.current + alpha * stepRes.details.dj_dw;
            velocityB.current = momentumBeta * velocityB.current + alpha * stepRes.details.dj_db;
            normW = normW - velocityW.current;
            normB = normB - velocityB.current;
          } else {
            normW = stepRes.w;
            normB = stepRes.b;
          }

          const rawModel = denormalizeModel(normW, normB, normParams);
          curW = rawModel.w;
          curB = rawModel.b;
        } else {
          const stepRes = performGradientDescentStep(sampleSubset, curW, curB, alpha);

          if (optimizerType === 'momentum') {
            velocityW.current = momentumBeta * velocityW.current + alpha * stepRes.details.dj_dw;
            velocityB.current = momentumBeta * velocityB.current + alpha * stepRes.details.dj_db;
            curW = curW - velocityW.current;
            curB = curB - velocityB.current;
          } else {
            curW = stepRes.w;
            curB = stepRes.b;
          }
        }

        curEpoch += 1;
        const details = computeStepDetails(points, curW, curB, alpha);
        lastCost = details.jwb;
      }

      // Circuit breaker: exploding gradients guard
      if (
        !Number.isFinite(curW) ||
        !Number.isFinite(curB) ||
        !Number.isFinite(lastCost) ||
        Math.abs(curW) > 1e9 ||
        Math.abs(curB) > 1e9
      ) {
        setIsTraining(false);
        setHasDiverged(true);
        return;
      }

      setW(curW);
      setB(curB);
      setCurrentEpoch(curEpoch);

      // Play audio chime if enabled
      playTrainingChime(lastCost);

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
        if (next.length > 300) {
          return next.filter((_, idx) => idx % 2 === 0 || idx === next.length - 1);
        }
        return next;
      });
    },
    [
      w,
      b,
      currentEpoch,
      currentDetails,
      points,
      standardize,
      optimizerType,
      alpha,
      momentumBeta,
      playTrainingChime,
      lossHistory,
    ]
  );

  // Animation Loop
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

  return {
    // Dataset
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
    // Weights & Hyperparameters
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
    momentumBeta,
    setMomentumBeta,
    // Actions
    stepGradientDescent,
    snapToOptimal,
    randomizeWeights,
    resetWeights,
    // Analytics & Metrics
    currentDetails,
    ols,
    optimalDetails,
    stability,
    lossHistory,
    initialCost,
    // Sound effects
    soundEnabled,
    setSoundEnabled,
  };
}

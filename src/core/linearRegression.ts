/**
 * Linear Regression Mathematical Core
 * 
 * Directly follows the formulation and naming convention from the user's notebook:
 * - Model: f_wb(x) = w * x + b
 * - Cost: J(w, b) = 1/(2m) * sum((w * x_i + b - y_i)^2)
 * - Gradients:
 *     dJ/dw = 1/m * sum((w * x_i + b - y_i) * x_i)  [total_wxbyx / m]
 *     dJ/db = 1/m * sum((w * x_i + b - y_i))        [total_wxby / m]
 * - Updates:
 *     w := w - alpha * dJ/dw
 *     b := b - alpha * dJ/db
 */

export interface Point {
  id: string;
  x: number;
  y: number;
  label?: string;
}

export interface StepMathDetails {
  total_wxbyx: number;
  total_wxby: number;
  squared_total_wxby: number;
  dj_dw: number;
  dj_db: number;
  jwb: number;
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
  temp_w: number;
  temp_b: number;
  w: number;
  b: number;
  m: number;
}

export interface CostSurfaceData {
  wValues: number[];
  bValues: number[];
  costs: number[][]; // [wIdx][bIdx]
  minCost: number;
  maxCost: number;
  bestW: number;
  bestB: number;
}

/**
 * Predict y for a given x: f_wb(x) = w * x + b
 */
export function predict(x: number, w: number, b: number): number {
  return w * x + b;
}

/**
 * Compute the exact Cost and Gradients as implemented in the notebook
 */
export function computeStepDetails(
  points: Point[],
  w: number,
  b: number,
  alpha: number
): StepMathDetails {
  const m = points.length;
  if (m === 0) {
    return {
      total_wxbyx: 0,
      total_wxby: 0,
      squared_total_wxby: 0,
      dj_dw: 0,
      dj_db: 0,
      jwb: 0,
      mse: 0,
      rmse: 0,
      mae: 0,
      r2: 0,
      temp_w: w,
      temp_b: b,
      w,
      b,
      m: 0,
    };
  }

  let total_wxbyx = 0;
  let total_wxby = 0;
  let squared_total_wxby = 0;
  let absolute_total_wxby = 0;
  let sumY = 0;

  for (let j = 0; j < m; j++) {
    const Xi = points[j].x;
    const Yi = points[j].y;
    sumY += Yi;
    const diff = w * Xi + b - Yi; // (w * Xi + b - Yi)
    total_wxbyx += diff * Xi;
    total_wxby += diff;
    squared_total_wxby += diff * diff;
    absolute_total_wxby += Math.abs(diff);
  }

  // Cost function J(w,b) as in Stanford / Andrew Ng & user's notebook:
  // jwb = (1 / (2 * m)) * squared_total_wxby
  const jwb = (1 / (2 * m)) * squared_total_wxby;
  const mse = (1 / m) * squared_total_wxby;
  const rmse = Math.sqrt(mse);
  const mae = (1 / m) * absolute_total_wxby;

  // Gradients
  const dj_dw = (1 / m) * total_wxbyx;
  const dj_db = (1 / m) * total_wxby;

  // Parameter updates
  const temp_w = w - alpha * dj_dw;
  const temp_b = b - alpha * dj_db;

  // R^2 calculation (Coefficient of determination)
  const meanY = sumY / m;
  let ssTot = 0;
  let ssRes = 0;
  for (let j = 0; j < m; j++) {
    const Yi = points[j].y;
    const yHat = w * points[j].x + b;
    ssTot += (Yi - meanY) ** 2;
    ssRes += (Yi - yHat) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return {
    total_wxbyx,
    total_wxby,
    squared_total_wxby,
    dj_dw,
    dj_db,
    jwb,
    mse,
    rmse,
    mae,
    r2,
    temp_w,
    temp_b,
    w,
    b,
    m,
  };
}

/**
 * Perform a single Gradient Descent step
 */
export function performGradientDescentStep(
  points: Point[],
  w: number,
  b: number,
  alpha: number
): { w: number; b: number; details: StepMathDetails } {
  const details = computeStepDetails(points, w, b, alpha);
  return {
    w: details.temp_w,
    b: details.temp_b,
    details,
  };
}

/**
 * Analytical closed-form Ordinary Least Squares (OLS) solution
 * w = sum((x - meanX)*(y - meanY)) / sum((x - meanX)^2)
 * b = meanY - w * meanX
 */
export function computeOLS(points: Point[]): { w: number; b: number; r2: number } {
  const m = points.length;
  if (m < 2) {
    return { w: 0, b: points[0]?.y ?? 0, r2: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  const meanX = sumX / m;
  const meanY = sumY / m;

  let num = 0;
  let den = 0;
  for (const p of points) {
    const xDiff = p.x - meanX;
    const yDiff = p.y - meanY;
    num += xDiff * yDiff;
    den += xDiff * xDiff;
  }

  if (den === 0) {
    return { w: 0, b: meanY, r2: 0 };
  }

  const w = num / den;
  const b = meanY - w * meanX;

  const details = computeStepDetails(points, w, b, 0);
  return { w, b, r2: details.r2 };
}

/**
 * Generate a 2D Cost Grid for Contour / Surface visualizations
 */
export function generateCostSurface(
  points: Point[],
  centerW: number,
  centerB: number,
  wSpan: number,
  bSpan: number,
  gridResolution: number = 31
): CostSurfaceData {
  const wMin = centerW - wSpan / 2;
  const wMax = centerW + wSpan / 2;
  const bMin = centerB - bSpan / 2;
  const bMax = centerB + bSpan / 2;

  const wValues: number[] = [];
  const bValues: number[] = [];

  for (let i = 0; i < gridResolution; i++) {
    wValues.push(wMin + (i / (gridResolution - 1)) * (wMax - wMin));
    bValues.push(bMin + (i / (gridResolution - 1)) * (bMax - bMin));
  }

  const costs: number[][] = [];
  let minCost = Infinity;
  let maxCost = -Infinity;
  let bestW = centerW;
  let bestB = centerB;

  for (let i = 0; i < gridResolution; i++) {
    const row: number[] = [];
    const currW = wValues[i];
    for (let j = 0; j < gridResolution; j++) {
      const currB = bValues[j];
      const details = computeStepDetails(points, currW, currB, 0);
      const c = details.jwb;
      row.push(c);
      if (c < minCost) {
        minCost = c;
        bestW = currW;
        bestB = currB;
      }
      if (c > maxCost && Number.isFinite(c)) {
        maxCost = c;
      }
    }
    costs.push(row);
  }

  return {
    wValues,
    bValues,
    costs,
    minCost,
    maxCost,
    bestW,
    bestB,
  };
}

/**
 * Standardize features: z = (x - mean) / std
 */
export interface NormalizationParams {
  meanX: number;
  stdX: number;
  meanY: number;
  stdY: number;
}

export function computeNormalizationParams(points: Point[]): NormalizationParams {
  const m = points.length;
  if (m === 0) return { meanX: 0, stdX: 1, meanY: 0, stdY: 1 };

  let sumX = 0;
  let sumY = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  const meanX = sumX / m;
  const meanY = sumY / m;

  let sqSumX = 0;
  let sqSumY = 0;
  for (const p of points) {
    sqSumX += (p.x - meanX) ** 2;
    sqSumY += (p.y - meanY) ** 2;
  }
  const stdX = Math.sqrt(sqSumX / m) || 1;
  const stdY = Math.sqrt(sqSumY / m) || 1;

  return { meanX, stdX, meanY, stdY };
}

export function normalizePoints(points: Point[], params: NormalizationParams): Point[] {
  return points.map((p) => ({
    ...p,
    x: (p.x - params.meanX) / params.stdX,
    y: (p.y - params.meanY) / params.stdY,
  }));
}

/**
 * Convert parameters trained on normalized coordinates back to raw space:
 * y_raw = stdY * y_norm + meanY
 * x_norm = (x_raw - meanX) / stdX
 * => y_raw = stdY * (w_norm * (x_raw - meanX)/stdX + b_norm) + meanY
 * => w_raw = w_norm * (stdY / stdX)
 * => b_raw = meanY + stdY * b_norm - w_raw * meanX
 */
export function denormalizeModel(
  wNorm: number,
  bNorm: number,
  params: NormalizationParams
): { w: number; b: number } {
  const w = wNorm * (params.stdY / params.stdX);
  const b = params.meanY + params.stdY * bNorm - w * params.meanX;
  return { w, b };
}

export interface StabilityAnalysis {
  lambdaMax: number;
  alphaMax: number;
  alphaOptimal: number;
  regime: 'slow' | 'optimal' | 'oscillating' | 'divergent';
  regimeMessage: string;
}

export function computeStabilityAnalysis(
  points: Point[],
  alpha: number,
  standardize: boolean
): StabilityAnalysis {
  const m = points.length;
  if (m < 2) {
    return {
      lambdaMax: 1,
      alphaMax: 1,
      alphaOptimal: 0.1,
      regime: 'optimal',
      regimeMessage: 'Insufficient data points',
    };
  }

  if (standardize) {
    const lambdaMax = 1.0;
    const alphaMax = 2.0;
    const alphaOptimal = 0.1;
    let regime: StabilityAnalysis['regime'] = 'optimal';
    let regimeMessage = 'Stable & isotropic convergence (Z-score active)';

    if (alpha < 0.01) {
      regime = 'slow';
      regimeMessage = 'Slow monotonic descent (try α = 0.05 - 0.1)';
    } else if (alpha > 1.2) {
      regime = 'divergent';
      regimeMessage = 'Exploding divergence risk (α > 1.2)';
    } else if (alpha > 0.8) {
      regime = 'oscillating';
      regimeMessage = 'Damped oscillation around global minimum';
    }

    return { lambdaMax, alphaMax, alphaOptimal, regime, regimeMessage };
  }

  let sumX = 0;
  let sumSqX = 0;
  for (const p of points) {
    sumX += p.x;
    sumSqX += p.x * p.x;
  }
  const meanX = sumX / m;
  const meanSqX = sumSqX / m;
  const varX = Math.max(0.001, meanSqX - meanX * meanX);

  const trH = meanSqX + 1;
  const detH = varX;
  const discriminant = Math.max(0, trH * trH - 4 * detH);
  const lambdaMax = (trH + Math.sqrt(discriminant)) / 2;
  const alphaMax = 2.0 / (lambdaMax || 1);
  const alphaOptimal = 1.0 / (lambdaMax || 1);

  let regime: StabilityAnalysis['regime'] = 'optimal';
  let regimeMessage = 'Optimal learning rate for fast convergence';

  if (alpha >= alphaMax) {
    regime = 'divergent';
    regimeMessage = `Divergence Risk: α ≥ α_max (${alphaMax < 0.001 ? alphaMax.toExponential(2) : alphaMax.toFixed(4)})`;
  } else if (alpha > 0.7 * alphaMax) {
    regime = 'oscillating';
    regimeMessage = `Underdamped Oscillation: α near limit (${alphaMax < 0.001 ? alphaMax.toExponential(2) : alphaMax.toFixed(4)})`;
  } else if (alpha < 0.1 * alphaOptimal) {
    regime = 'slow';
    regimeMessage = 'Very slow progress: consider increasing α';
  }

  return { lambdaMax, alphaMax, alphaOptimal, regime, regimeMessage };
}

import { Point } from '../core/linearRegression';

export interface DatasetPreset {
  id: string;
  name: string;
  description: string;
  xLabel: string;
  yLabel: string;
  suggestedAlpha: number;
  initialW?: number;
  initialB?: number;
  defaultStandardize?: boolean;
  points: Point[];
}

export const PRESET_DATASETS: DatasetPreset[] = [
  {
    id: 'interactive-linear',
    name: 'Intuitive Linear (Seeing Theory Benchmark)',
    description: 'Clean, well-scaled dataset (x in [1, 10], y ≈ 2x + 2). Gradient descent converges smoothly and visibly in 30-40 frames.',
    xLabel: 'Feature (X)',
    yLabel: 'Target (Y)',
    suggestedAlpha: 0.02,
    initialW: 0.0,
    initialB: 0.0,
    defaultStandardize: false,
    points: [
      { id: 'p1', x: 1, y: 3.8, label: 'P1' },
      { id: 'p2', x: 2, y: 5.9, label: 'P2' },
      { id: 'p3', x: 3, y: 8.1, label: 'P3' },
      { id: 'p4', x: 4, y: 9.8, label: 'P4' },
      { id: 'p5', x: 5, y: 12.2, label: 'P5' },
      { id: 'p6', x: 6, y: 14.1, label: 'P6' },
      { id: 'p7', x: 7, y: 16.0, label: 'P7' },
      { id: 'p8', x: 8, y: 17.9, label: 'P8' },
      { id: 'p9', x: 9, y: 20.2, label: 'P9' },
      { id: 'p10', x: 10, y: 22.1, label: 'P10' },
    ],
  },
  {
    id: 'student-attendance',
    name: 'Student Attendance vs Exam Score (student_performance.csv)',
    description: 'From your GitHub repository. Real-world range (x in [65, 98]%). Feature scaling enabled to converge to w ≈ 1.37, b ≈ -37.46 in ~35 steps.',
    xLabel: 'Attendance (%)',
    yLabel: 'Exam Score',
    suggestedAlpha: 0.05,
    initialW: 0.5,
    initialB: 10.0,
    defaultStandardize: true,
    points: [
      { id: 'p1', x: 75, y: 65, label: 'Ali' },
      { id: 'p2', x: 90, y: 88, label: 'Sara' },
      { id: 'p3', x: 70, y: 58, label: 'John' },
      { id: 'p4', x: 95, y: 94, label: 'Ayesha' },
      { id: 'p5', x: 80, y: 73, label: 'Bilal' },
      { id: 'p6', x: 98, y: 96, label: 'Hina' },
      { id: 'p7', x: 65, y: 50, label: 'Omar' },
      { id: 'p8', x: 88, y: 84, label: 'Maryam' },
    ],
  },
  {
    id: 'student-study-hours',
    name: 'Study Hours vs Exam Score (student_performance.csv)',
    description: 'Impact of daily study hours (1-7 hrs) on final exam score. Converges smoothly with alpha=0.01.',
    xLabel: 'Study Hours (hrs/day)',
    yLabel: 'Exam Score',
    suggestedAlpha: 0.01,
    initialW: 5.0,
    initialB: 40.0,
    defaultStandardize: false,
    points: [
      { id: 'p1', x: 1, y: 50, label: 'Omar' },
      { id: 'p2', x: 2, y: 58, label: 'John' },
      { id: 'p3', x: 3, y: 65, label: 'Ali' },
      { id: 'p4', x: 4, y: 73, label: 'Bilal' },
      { id: 'p5', x: 5, y: 84, label: 'Maryam' },
      { id: 'p6', x: 5, y: 88, label: 'Sara' },
      { id: 'p7', x: 6, y: 94, label: 'Ayesha' },
      { id: 'p8', x: 7, y: 96, label: 'Hina' },
    ],
  },
  {
    id: 'advertising-sales',
    name: 'Advertising vs Sales (Notebook Cell 5)',
    description: 'The exact 10-year advertising vs sales dataset from your Linear_Regression.ipynb notebook.',
    xLabel: 'Advertising (x_i)',
    yLabel: 'Sales Units (y_i)',
    suggestedAlpha: 0.005,
    initialW: 2.0,
    initialB: 15.0,
    defaultStandardize: false,
    points: [
      { id: 'p1', x: 9, y: 40, label: 'Year 2' },
      { id: 'p2', x: 10, y: 44, label: 'Year 1' },
      { id: 'p3', x: 11, y: 42, label: 'Year 3' },
      { id: 'p4', x: 11, y: 48, label: 'Year 5' },
      { id: 'p5', x: 12, y: 46, label: 'Year 4' },
      { id: 'p6', x: 12, y: 52, label: 'Year 6' },
      { id: 'p7', x: 13, y: 54, label: 'Year 7' },
      { id: 'p8', x: 13, y: 58, label: 'Year 8' },
      { id: 'p9', x: 14, y: 56, label: 'Year 9' },
      { id: 'p10', x: 15, y: 60, label: 'Year 10' },
    ],
  },
  {
    id: 'outliers-robustness',
    name: 'Outlier Sensitivity (Seeing Theory Classic)',
    description: 'Clean linear trend with one distant outlier. Drag the outlier point to observe how Ordinary Least Squares tilts drastically.',
    xLabel: 'X',
    yLabel: 'Y',
    suggestedAlpha: 0.02,
    initialW: 1.0,
    initialB: 2.0,
    defaultStandardize: false,
    points: [
      { id: 'p1', x: 1, y: 2.5 },
      { id: 'p2', x: 2, y: 4.8 },
      { id: 'p3', x: 3, y: 6.2 },
      { id: 'p4', x: 4, y: 8.9 },
      { id: 'p5', x: 5, y: 10.4 },
      { id: 'p6', x: 6, y: 12.8 },
      { id: 'p7', x: 7, y: 14.1 },
      { id: 'p8', x: 8, y: 16.5 },
      { id: 'p9', x: 9, y: 2.0, label: 'Outlier' },
    ],
  },
];

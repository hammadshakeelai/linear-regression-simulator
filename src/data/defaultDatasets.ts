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
  points: Point[];
}

export const PRESET_DATASETS: DatasetPreset[] = [
  {
    id: 'student-attendance',
    name: 'Student Attendance vs Exam Score',
    description: 'From student_performance.csv in your GitHub repository. Shows positive correlation between attendance percentage and exam score.',
    xLabel: 'Attendance (%)',
    yLabel: 'Exam Score',
    suggestedAlpha: 0.0001,
    initialW: 1.0,
    initialB: 0.0,
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
    name: 'Study Hours vs Exam Score',
    description: 'From student_performance.csv in your GitHub repository. Investigates impact of daily study hours on final exam score.',
    xLabel: 'Study Hours (hrs/day)',
    yLabel: 'Exam Score',
    suggestedAlpha: 0.01,
    initialW: 5.0,
    initialB: 40.0,
    points: [
      { id: 'p1', x: 3, y: 65, label: 'Ali' },
      { id: 'p2', x: 5, y: 88, label: 'Sara' },
      { id: 'p3', x: 2, y: 58, label: 'John' },
      { id: 'p4', x: 6, y: 94, label: 'Ayesha' },
      { id: 'p5', x: 4, y: 73, label: 'Bilal' },
      { id: 'p6', x: 7, y: 96, label: 'Hina' },
      { id: 'p7', x: 1, y: 50, label: 'Omar' },
      { id: 'p8', x: 5, y: 84, label: 'Maryam' },
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
    points: [
      { id: 'p1', x: 10, y: 44, label: 'Year 1' },
      { id: 'p2', x: 9, y: 40, label: 'Year 2' },
      { id: 'p3', x: 11, y: 42, label: 'Year 3' },
      { id: 'p4', x: 12, y: 46, label: 'Year 4' },
      { id: 'p5', x: 11, y: 48, label: 'Year 5' },
      { id: 'p6', x: 12, y: 52, label: 'Year 6' },
      { id: 'p7', x: 13, y: 54, label: 'Year 7' },
      { id: 'p8', x: 13, y: 58, label: 'Year 8' },
      { id: 'p9', x: 14, y: 56, label: 'Year 9' },
      { id: 'p10', x: 15, y: 60, label: 'Year 10' },
    ],
  },
  {
    id: 'clean-linear',
    name: 'Synthetic Clean Linear (y ≈ 2x + 10)',
    description: 'An easy-to-understand dataset with low noise to observe gradient descent converging rapidly to exact integer slope.',
    xLabel: 'Feature (X)',
    yLabel: 'Target (Y)',
    suggestedAlpha: 0.01,
    initialW: 0.5,
    initialB: 2.0,
    points: [
      { id: 'p1', x: 1, y: 12.1 },
      { id: 'p2', x: 2, y: 14.3 },
      { id: 'p3', x: 3, y: 16.0 },
      { id: 'p4', x: 4, y: 18.2 },
      { id: 'p5', x: 5, y: 19.8 },
      { id: 'p6', x: 6, y: 22.4 },
      { id: 'p7', x: 7, y: 24.1 },
      { id: 'p8', x: 8, y: 25.9 },
      { id: 'p9', x: 9, y: 28.2 },
      { id: 'p10', x: 10, y: 30.5 },
    ],
  },
  {
    id: 'outliers-test',
    name: 'Outlier Sensitivity Test',
    description: 'Demonstrates how squared error in J(w,b) penalizes large errors and how high-leverage outliers pull the line.',
    xLabel: 'Input (X)',
    yLabel: 'Output (Y)',
    suggestedAlpha: 0.01,
    initialW: 1.5,
    initialB: 5.0,
    points: [
      { id: 'p1', x: 2, y: 10 },
      { id: 'p2', x: 3, y: 13 },
      { id: 'p3', x: 4, y: 15 },
      { id: 'p4', x: 5, y: 18 },
      { id: 'p5', x: 6, y: 20 },
      { id: 'p6', x: 7, y: 22 },
      { id: 'p7', x: 8, y: 24 },
      { id: 'p8', x: 9, y: 55, label: 'Outlier 1' },
      { id: 'p9', x: 4, y: 45, label: 'Outlier 2' },
    ],
  },
];

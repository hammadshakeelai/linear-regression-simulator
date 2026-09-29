# 📈 Linear Regression Simulator & Gradient Descent Lab

An interactive, high-performance web-based simulator for **Linear Regression** and **Gradient Descent Optimization**. Grounded directly in the mathematical formulation and training logic from [`Linear_Regression.ipynb`](https://github.com/hammadshakeelai/Machine-Learning/blob/main/Programming-for-AI/Linear_Regression.ipynb).

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?style=for-the-badge&logo=github)](https://hammadshakeelai.github.io/linear-regression-simulator/)
![Linear Regression Simulator](https://img.shields.io/badge/Machine%20Learning-Linear%20Regression-6366f1?style=for-the-badge&logo=scikit-learn)
![React](https://img.shields.io/badge/React%2018-TypeScript-38bdf8?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06b6d4?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5.4-8b5cf6?style=for-the-badge&logo=vite)

🌐 **Live Website**: [https://hammadshakeelai.github.io/linear-regression-simulator/](https://hammadshakeelai.github.io/linear-regression-simulator/)

---

## 🚀 Key Features

### 🎛️ Part 1: Manual Parameter Tuning (Interactive Fitting)
- **Live Slope & Intercept Sliders**: Manually adjust weight ($w$) and bias ($b$) with instant visual feedback.
- **Residual Error Visualization**: Dynamic dashed vertical lines connecting each sample $(x_i, y_i)$ to $(x_i, \hat{y}_i)$, color-coded by error magnitude.
- **Fit Quality Score**: Real-time accuracy gauge showing percentage closeness to the theoretical best fit.
- **Instant Metrics**: Live updates for Cost $J(w, b)$, $MSE$, $RMSE$, $MAE$, and $R^2$ variance explained.
- **Snap to Optimal**: One-click snap to the exact closed-form Ordinary Least Squares (OLS) solution.

### ⚡ Part 2: Gradient Descent Optimizer (Slow & Steady Training)
- **Animated Optimization Loop**: Watch the regression line rotate and slide towards optimal convergence frame-by-frame.
- **Playback Controls**: Play, Pause, Step-by-Step (Epoch + 1), Step-Batch (Epoch + 10), and Reset.
- **Customizable Hyperparameters**:
  - Learning Rate ($\alpha$) with presets ($0.0001, 0.001, 0.005, 0.01, 0.05, 0.1$) and safety alerts.
  - Animation speed (from 400ms steady educational pacing to 10ms turbo speed).
  - Feature Standardization ($z = \frac{x - \mu}{\sigma}$) toggle for training on large-scale datasets without exploding gradients.
- **Real-Time Loss Curve**: Dynamic SVG chart tracking cost $J(w, b)$ over epochs with linear and Log10 scales.
- **2D Cost Surface & Contour Map**: Elliptical contour map displaying the trajectory trail taken by $(w, b)$ as it descends into the global minimum.

### 💻 VS Code-Like Interactive Code Box
- **Integrated IDE Panel**: Styled like VS Code with syntax-highlighted Python code directly mirroring your original implementation.
- **In-Code Editable Hyperparameters**: Modify $w$, $b$, $\alpha$, and epochs directly inside the code lines!
- **Line-by-Line Debugger Highlight**: Follows the execution flow of the inner loops and parameter updates in real time.
- **Live Python Terminal**: Displays formatted epoch updates (`Epoch: {i} | Cost: {jwb} | w: {w} | b: {b}`) as training progresses.

### 📊 Dataset Management & Interactive Canvas
- **Preloaded Datasets**:
  - `Student Attendance vs Exam Score` (from `student_performance.csv`)
  - `Study Hours vs Exam Score` (from `student_performance.csv`)
  - `Advertising vs Sales` (10-year dataset from notebook Cell 5)
  - `Clean Linear` & `Noisy Linear` synthetic presets
  - `Outlier Sensitivity Test`
- **Interactive Coordinate Plane**: Click anywhere on the 2D plane to add points, drag points to test model sensitivity, or right-click to delete.
- **Custom CSV Upload**: Drop your own CSV files and automatically parse numeric columns.

---

## 📐 Mathematical Formulation

Directly derived from Stanford CS229 / Andrew Ng and your Jupyter Notebook:

### 1. Hypothesis Function
$$f_{w,b}(x) = w \cdot x + b$$

### 2. Cost Function (Mean Squared Error with $\frac{1}{2m}$)
$$J(w, b) = \frac{1}{2m} \sum_{i=1}^{m} \left(f_{w,b}(x^{(i)}) - y^{(i)}\right)^2 = \frac{1}{2m} \sum_{i=1}^{m} (w \cdot x^{(i)} + b - y^{(i)})^2$$

### 3. Partial Derivatives (Gradients)
$$\frac{\partial J(w,b)}{\partial w} = \frac{1}{m} \sum_{i=1}^{m} (w \cdot x^{(i)} + b - y^{(i)}) \cdot x^{(i)} \quad \text{(Notebook: } \texttt{total\_wxbyx / m}\text{)}$$

$$\frac{\partial J(w,b)}{\partial b} = \frac{1}{m} \sum_{i=1}^{m} (w \cdot x^{(i)} + b - y^{(i)}) \quad \text{(Notebook: } \texttt{total\_wxby / m}\text{)}$$

### 4. Simultaneous Parameter Updates
$$w := w - \alpha \frac{\partial J(w,b)}{\partial w}$$
$$b := b - \alpha \frac{\partial J(w,b)}{\partial b}$$

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Graphics & Visualizations**: High-performance SVG + HTML5 Canvas
- **Bundler & Build Tool**: Vite 5
- **Python Companion**: NumPy, Pandas, Matplotlib

---

## 📦 Project Structure

```
linear-regression-simulator/
├── public/
│   └── student_performance.csv       # Preloaded dataset for download/test
├── src/
│   ├── components/
│   │   ├── Navbar.tsx                # Mode switcher (Part 1 vs Part 2) & actions
│   │   ├── RegressionCanvas.tsx      # 2D coordinate plane with points & residuals
│   │   ├── ManualControls.tsx        # Part 1: w & b sliders, fit score, metrics
│   │   ├── TrainingControls.tsx      # Part 2: Play/pause, step, alpha, pacing
│   │   ├── VSCodeEditor.tsx          # VS Code style editor with debugger highlight
│   │   ├── LossChart.tsx             # Real-time J(w, b) vs epoch loss curve
│   │   ├── CostContour.tsx           # 2D contour landscape & descent path
│   │   ├── DatasetSelector.tsx       # Presets, CSV upload, point manager
│   │   ├── MathModal.tsx             # Formula and derivation inspector
│   │   └── PythonExportModal.tsx     # Standalone Python script exporter
│   ├── core/
│   │   └── linearRegression.ts       # Mathematical engine, OLS, normalization
│   ├── data/
│   │   └── defaultDatasets.ts        # Presets (student_performance, ads, etc.)
│   ├── App.tsx                       # Master application component
│   ├── index.css                     # Tailwind directives
│   └── main.tsx                      # App entry point
├── linear_regression.py              # Standalone Python CLI script matching notebook
├── student_performance.csv           # Original student dataset
├── index.html                        # HTML template
├── package.json                      # Node dependencies & build scripts
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite configuration
└── README.md                         # Project documentation
```

---

## 🏃 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python 3.8+](https://python.org/) (optional, for running offline Python script)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```
The optimized static bundle will be generated in `dist/`.

### 4. Run Companion Python Script
```bash
python linear_regression.py
```
This trains gradient descent on `student_performance.csv` and outputs `regression_result.png`.

---

## 🌐 Deploying to GitHub Pages

1. In `vite.config.ts`, `base: './'` is already configured for relative paths.
2. Build the project:
   ```bash
   npm run build
   ```
3. Push the `dist` folder to your `gh-pages` branch or configure GitHub Actions for automatic deployment.

---

## 🤝 Attribution & Credits

- Original Linear Regression implementation and datasets by [Hammad Shakeel](https://github.com/hammadshakeelai/Machine-Learning).
- Conceptual foundation: Stanford University CS229 / Supervised Machine Learning by Andrew Ng.

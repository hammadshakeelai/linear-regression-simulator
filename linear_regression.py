"""
Linear Regression from Scratch using Gradient Descent
Directly based on: https://github.com/hammadshakeelai/Machine-Learning/blob/main/Programming-for-AI/Linear_Regression.ipynb
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

def main():
    # 1. Load Dataset
    try:
        df = pd.read_csv("student_performance.csv")
        df[['x', 'y']] = df[['attendance', 'exam_score']]
        x = np.array(df['x'], dtype=float)
        y = np.array(df['y'], dtype=float)
        print("Loaded 'student_performance.csv' successfully.")
    except Exception:
        print("Using default attendance vs exam score dataset.")
        x = np.array([75, 90, 70, 95, 80, 98, 65, 88], dtype=float)
        y = np.array([65, 88, 58, 94, 73, 96, 50, 84], dtype=float)

    m = len(x)
    print(f"Number of training samples (m): {m}")

    # 2. Initial Weights & Hyperparameters
    # As found in notebook: w ~ 1.3742, b ~ -37.46
    w = 1.0
    b = 0.0
    alpha = 0.0001
    epochs = 10000

    print(f"Initial: w={w:.4f}, b={b:.4f}, alpha={alpha}, epochs={epochs}")

    # 3. Gradient Descent Optimization Loop
    cost_history = []
    for i in range(epochs):
        total_wxbyx = 0.0
        total_wxby = 0.0
        squared_total_wxby = 0.0

        for j in range(m):
            Xi = x[j]
            Yi = y[j]
            diff = (w * Xi + b - Yi)
            total_wxbyx += diff * Xi
            total_wxby += diff
            squared_total_wxby += diff ** 2

        # Cost J(w,b) = 1/(2m) * sum((wx+b-y)^2)
        jwb = (1.0 / (2.0 * m)) * squared_total_wxby
        cost_history.append(jwb)

        # Simultaneous updates
        temp_w = w - alpha * (1.0 / m) * total_wxbyx
        temp_b = b - alpha * (1.0 / m) * total_wxby

        w = temp_w
        b = temp_b

        if (i + 1) % 1000 == 0 or i == 0:
            print(f"Epoch {i+1:5d} | Cost: {jwb:10.5f} | w: {w:8.5f} | b: {b:8.5f}")

    print("\nTraining Complete!")
    print(f"Final Model: f(x) = {w:.4f} * x + {b:.4f}")
    print(f"Final Cost J(w,b): {cost_history[-1]:.6f}")

    # 4. Matplotlib Plotting (Cell 54 from notebook)
    plt.figure(figsize=(12, 5))

    # Plot Model Fit
    plt.subplot(1, 2, 1)
    plt.scatter(x, y, marker='x', c='r', s=60, label='Actual Data Points')
    x_line = np.linspace(min(x) - 5, max(x) + 5, 100)
    y_line = w * x_line + b
    plt.plot(x_line, y_line, color='blue', linewidth=2, label=f'Model: y = {w:.2f}x + {b:.2f}')
    plt.xlabel('Attendance (%)')
    plt.ylabel('Exam Score')
    plt.title('Linear Regression Model Fit')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.5)

    # Plot Cost History
    plt.subplot(1, 2, 2)
    plt.plot(cost_history, color='green', linewidth=2)
    plt.xlabel('Epoch')
    plt.ylabel('Cost J(w, b)')
    plt.title('Cost Reduction over Iterations')
    plt.grid(True, linestyle='--', alpha=0.5)

    plt.tight_layout()
    plt.savefig('regression_result.png', dpi=150)
    print("Plot saved as 'regression_result.png'.")

if __name__ == "__main__":
    main()

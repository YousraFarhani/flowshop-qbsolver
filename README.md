# FlowShop Qbsolver

A modern web platform for solving **Flow Shop Scheduling Problems** using **Quantum Computing**, **Quantum-Inspired Optimization**, and **Classical Heuristics**.



## 🚀 Project Overview

**FlowShop Qbsolver** bridges the gap between cutting-edge quantum technology and industrial optimization. It provides a clean, intuitive interface to model, solve, and visualize complex flow shop scheduling problems—minimizing **makespan** by leveraging:

- Quantum Annealing
- Quantum-Inspired Solvers
- Classical NEH-based Heuristics


## 🔑 Key Features

- **🔀 Multi-Solver Support**  
  Seamlessly switch between different optimization solvers to solve your FlowShop Instances:
  - 🧊 **D-Wave QBSolv** 
  - 🧠 **LeapHybridSampler** (Quantum Hybrid)
  - 💡 **InfinityQ** (Quantum-Inspired)
  - ⚙️ **Classical NEH Algorithm**

- **🧮 QUBO Formulation Comparison**  
  Analyze and compare multiple QUBO formulations for the flow shop problem.

- **📊 Interactive Visualization**  
  - Dynamic Gantt Charts
  - Comparative solver metrics (makespan, runtime, feasibility)
  - Real-time simulation of job schedules

- **📚 Benchmark Library**  
  Built-in support for **Taillard benchmark instances** for standardized testing.
Taillard, E. (1993). Benchmarks for basic scheduling problems. European Journal of Op-
erational Research, 64(2), 278–285
- **📝 Custom Instance Input**  
  Upload or design your own job-machine matrices and test solver behavior.

 ![Picture](public/picture.png) 

----------

## ⚙️ Technology Stack

### 🔧 Frontend
- **React** with **TypeScript**
- **Tailwind CSS** for modern UI design
- **Recharts** for interactive data visualization

### 🖥️ Backend
- **FastAPI** (Python)
- QUBO formulation libraries
- API integration with:
  - D-Wave Ocean SDK
  - InfinityQ Platform

----------

## 🧭 Getting Started

### 📦 Prerequisites
- **Node.js** and **npm** (Frontend)
- **Python 3.9+** (Backend)
- **D-Wave/InfinityQ account** for quantum solvers

### 🔨 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YousraFarhani/quantum-flowshop-wizard.git
   cd quantum-flowshop-wizard

### Acknowledgements
We gratefully acknowledge the support and contributions of:

- InfinityQ Technology for providing access to their quantum-inspired optimization platform and technical support.
- AutoQUBO for enabling automated QUBO modeling and benchmarking support.
- Qwave Systems for their insights and technical support.
import numpy as np
import time
from autoqubo import SamplingCompiler, Utils
from autoqubo.symbolic import symbolic_matrix, insert_values
from fastapi import HTTPException

def solve_with_auto_qbsolv(job_matrix, params):
    try:
        start_time = time.time()
        
        # Extract parameters
        n = job_matrix.jobs
        m = job_matrix.machines
        pik = np.array(job_matrix.processing_times)
        timeout = params.timeout  # Use timeout parameter (renamed from time_limit)
        
        # Generate symbolic QUBO
        symbolic_pik = symbolic_matrix(n, m, positive=True)
        sym_qubo, offset = SamplingCompiler.generate_qubo(
            lambda x: new_constraint(x), new_constraint, n**2
        )
        
        # Compute costs and modify QUBO
        pairwise_costs = compute_pairwise_costs(pik, n, m)
        for i in range(n):
            for j in range(n):
                if i != j:
                    for p in range(n-1):
                        sym_qubo[i*n + p, j*n + (p+1)] += pairwise_costs[i, j]
        
        # Get explicit QUBO
        explicit_qubo = insert_values(sym_qubo, pik)
        
        # Solve using QBSOLV with timeout parameter
        solutions, energies = Utils.solve(explicit_qubo, offset, timeout=timeout)
        
        # Get best solution
        best_idx = np.argmin(energies)
        best_solution = solutions[best_idx]
        assignment_matrix = np.array(best_solution).reshape(n, n)
        job_order = np.argmax(assignment_matrix, axis=0).tolist()
        
        # Calculate makespan
        C = np.zeros((n, m))
        for i in range(n):
            for j in range(m):
                if i == 0 and j == 0:
                    C[i, j] = pik[job_order[i], j]
                elif i == 0:
                    C[i, j] = C[i, j-1] + pik[job_order[i], j]
                elif j == 0:
                    C[i, j] = C[i-1, j] + pik[job_order[i], j]
                else:
                    C[i, j] = max(C[i-1, j], C[i, j-1]) + pik[job_order[i], j]
        
        execution_time = time.time() - start_time
        
        return {
            "makespan": float(C[n-1, m-1]),
            "sequence": [j + 1 for j in job_order],  # Convert to 1-based indexing
            "energy": float(energies[best_idx]),
            "execution_time": execution_time,
            "num_occurrences": len(solutions),
            "solution_quality": float(1.0 / (1.0 + abs(energies[best_idx])))
        }
    except Exception as e:
        print(f"Error in solve_with_auto_qbsolv: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Constraint function for ensuring valid job assignments
def new_constraint(x):
    """
    Enforces:
    - Each job is assigned exactly once (one-hot encoding for jobs).
    - Each position in the sequence is occupied exactly once.
    - Implicitly respects precedence due to fixed job order.
    """
    n = int(np.sqrt(len(x)))
    X = np.array(x).reshape(n, n)
    job_constraint = np.sum((np.sum(X, axis=1) - 1) ** 2)  # Each job appears once
    position_constraint = np.sum((np.sum(X, axis=0) - 1) ** 2)  # Each position occupied once
    return job_constraint + position_constraint

# Compute pairwise job sequencing costs for a TSP-like approximation.
def compute_pairwise_costs(pik, n, m):
    """
    Computes a cost between job i and job j.
    Here we use a simple no-carryover approximation:
    For each adjacent pair in the sequence, the cost is the sum of absolute differences
    between job i's processing times on machines 2..m and job j's processing times on machines 1..m-1.
    """
    dist = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            if i != j:
                dist[i, j] = np.sum(np.abs(pik[i, 1:m] - pik[j, :m-1]))
    return dist
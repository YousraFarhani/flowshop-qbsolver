import numpy as np
from titanq import Model, Vtype, Target
import time

__all__ = ['solve_with_gupta_qubo']

def compute_d2(pik, n, m):
    # build CT then d2
    CT = [[0]*n for _ in range(n)]
    for j in range(1, m+1):
        CT = [
            [max(CT[u][v], sum(pik[u][:j])) for v in range(n)]
            for u in range(n)
        ]
    return [[CT[u][v] - sum(pik[u]) for v in range(n)] for u in range(n)]

def create_qubo(dmat, n, penalty=2.0):
    size = n * n
    W = np.zeros((size, size), dtype=np.float32)
    b = np.zeros(size, dtype=np.float32)

    # objective weights
    for i in range(n):
        for j in range(n):
            if i == j: continue
            for p_pos in range(n - 1):
                W[i*n + p_pos, j*n + p_pos + 1] += dmat[i][j]

    # bias on last position of each job
    for i in range(n):
        b[i*n + (n - 1)] += penalty

    # constraints: each job exactly once, each position exactly one job
    CW = np.zeros((2*n, size), dtype=np.float32)
    CB = np.zeros((2*n, 2), dtype=np.float32)

    # job→position
    for i in range(n):
        for p_pos in range(n):
            CW[i, i*n + p_pos] = 1
        CB[i] = [1 - 1e-1, 1 + 1e-1]

    # position→job
    for p_pos in range(n):
        for i in range(n):
            CW[n + p_pos, i*n + p_pos] = 1
        CB[n + p_pos] = [1 - 1e-1, 1 + 1e-1]

    return W, b, CW, CB

def calculate_makespan(vec, pik, n, m):
    order = [idx % n for idx, v in enumerate(vec) if v]
    machine_end = [0]*m
    job_end = [0]*n
    for job in order:
        for k in range(m):
            start = machine_end[k] if k == 0 else max(job_end[job], machine_end[k])
            end = start + pik[job][k]
            job_end[job], machine_end[k] = end, end
    return machine_end[-1]

def solve_with_gupta_qubo(job_matrix, params):
    start_time = time.time()
    n = job_matrix.jobs
    m = job_matrix.machines
    pik = job_matrix.processing_times

    # Compute d2 matrix
    d2 = compute_d2(pik, n, m)

    # Create QUBO matrices
    W, b, CW, CB = create_qubo(d2, n)

    # Setup TitanQ Model
    model = Model(api_key="f82cdb04-2a22-4d57-8cdc-2b21bda85020")
    model.add_variable_vector("x", size=n*n, vtype=Vtype.BINARY)
    model.set_objective_matrices(0.5*(W + W.T), b, Target.MINIMIZE)
    model.add_inequality_constraints_matrix(CW, CB)

    # Set optimization parameters
    beta = (1.0 / np.geomspace(params.T_min, params.T_max, params.num_chains)).tolist()
    
    # Get coupling multiplier parameter (default to 0.4 if not provided)
    coupling_multiplier = getattr(params, 'coupling_multiplier', 0.4)
    
    res = model.optimize(
        beta=beta,
        timeout_in_secs=params.timeout,
        num_engines=params.num_engines,
        num_chains=params.num_chains,
        coupling_mult=coupling_multiplier  # Add this line
    )

    # Get best solution
    best_vec = min(res.result_items(), key=lambda x: x[0])[1]
    makespan = calculate_makespan(best_vec, pik, n, m)
    
    # At line 95-105, replace the return statement with:
    # Extract job sequence (add 1 to make it 1-based indexing)
    sequence = [idx % n + 1 for idx, v in enumerate(best_vec) if v]
    
    # At the end of the function:
    execution_time = time.time() - start_time
    
    return {
        "sequence": sequence,
        "makespan": makespan,
        "energy": float(min(res.result_items(), key=lambda x: x[0])[0]),
        "execution_time": execution_time,
        "solution": [int(x) for x in best_vec]  # Convert to regular Python list of integers
    }
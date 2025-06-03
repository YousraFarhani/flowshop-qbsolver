import numpy as np
from titanq import Model, Vtype, Target
import time

def UBX(K, u, v, pik, memo):
    if K == 1: return 0
    if (K,u,v) in memo: return memo[(K,u,v)]
    prev = UBX(K-1, u, v, pik, memo)
    memo[(K,u,v)] = max(0, prev + (pik[u][K-2] - pik[v][K-1]))
    return memo[(K,u,v)]

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

def calculate_makespan(vec, n, m, pik):
    order = [idx % n for idx, v in enumerate(vec) if v]
    machine_end = [0]*m
    job_end = [0]*n
    for job in order:
        for k in range(m):
            start = machine_end[k] if k == 0 else max(job_end[job], machine_end[k])
            end = start + pik[job][k]
            job_end[job], machine_end[k] = end, end
    return machine_end[-1]

def solve_with_mocellin_qubo(job_matrix, params):
    start_time = time.time()
    n = job_matrix.jobs
    m = job_matrix.machines
    pik = job_matrix.processing_times

    # Calculate distance matrix d4
    d4 = [[UBX(m, i, j, pik, {}) for j in range(n)] for i in range(n)]

    # Initialize model
    model = Model(api_key="Your API Key")

    # Create QUBO matrices
    W, b, CW, CB = create_qubo(d4, n)
    model.add_variable_vector("x", size=n*n, vtype=Vtype.BINARY)
    model.set_objective_matrices(0.5*(W+W.T), b, Target.MINIMIZE)
    model.add_inequality_constraints_matrix(CW, CB)

    # Optimization parameters
    beta = (1.0/np.geomspace(params.T_min, params.T_max, params.num_chains)).tolist()
    
    # Get coupling multiplier parameter (default to 0.4 if not provided)
    coupling_multiplier = getattr(params, 'coupling_multiplier', 0.4)
    
    # Solve the model
    results = model.optimize(
        beta=beta,
        timeout_in_secs=params.timeout,
        num_engines=params.num_engines,
        num_chains=params.num_chains,
        coupling_mult=coupling_multiplier  # Add this line
    )

    # Find best solution
    lowest_energy = None
    best_solution = None

    for energy, solution in results.result_items():
        if lowest_energy is None or energy < lowest_energy:
            lowest_energy = energy
            best_solution = solution

    # Extract job sequence
    job_sequence = [
        index % n + 1  # Add 1 to make it 1-based indexing
        for index, value in enumerate(best_solution)
        if value == 1
    ]
# At the end of the function:
    execution_time = time.time() - start_time
    
    return {
        "sequence": job_sequence,
        "makespan": calculate_makespan(best_solution, n, m, pik),
        "energy": float(lowest_energy),
        "execution_time": execution_time,  # Add the actual execution time
        "solution": [int(x) for x in best_solution]  # Convert to regular Python list of integers
    }

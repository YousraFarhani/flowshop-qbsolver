import numpy as np
from titanq import Model, Vtype, Target
import time

def solve_with_position_based_qubo(job_matrix, params):
    start_time = time.time()
    n = job_matrix.jobs
    m = job_matrix.machines
    pik = job_matrix.processing_times

    # Initialize model
    model = Model(api_key="Your API Key")
    x_vars = model.add_variable_vector(name="x_vars", size=n * n, vtype=Vtype.BINARY)

    # Objective function
    weights = np.zeros((n * n, n * n), dtype=np.float32)
    bias = np.zeros(n * n, dtype=np.float32)

    for k in range(m - 1):
        for i in range(n - 1):
            for j in range(n):
                x_i_j = i * n + j
                x_i1_j = (i + 1) * n + j
                weights[x_i1_j, x_i1_j] += pik[j][k]
                weights[x_i_j, x_i_j] -= pik[j][k + 1]

    model.set_objective_matrices(weights, bias, target=Target.MINIMIZE)

    # Constraints
    constraint_weights = np.zeros((2 * n, n * n), dtype=np.float32)
    constraint_bounds = np.zeros((2 * n, 2), dtype=np.float32)
    tolerance = 1e-1

    # Job assignment constraints
    for i in range(n):
        for j in range(n):
            constraint_weights[i, i * n + j] = 1
        constraint_bounds[i] = [1 - tolerance, 1 + tolerance]

    # Position occupancy constraints
    for j in range(n):
        for i in range(n):
            constraint_weights[n + j, i * n + j] = 1
        constraint_bounds[n + j] = [1 - tolerance, 1 + tolerance]

    model.add_inequality_constraints_matrix(constraint_weights, constraint_bounds)

    # Optimization parameters
    beta = (1.0/np.geomspace(params.T_min, params.T_max, params.num_chains)).tolist()
    coupling_multiplier = getattr(params, 'coupling_multiplier', 0.4)
    # Solve the model
    results = model.optimize(
        beta=beta,
        timeout_in_secs=params.timeout,
        num_engines=params.num_engines,
        num_chains=params.num_chains,
        coupling_mult=coupling_multiplier 
    )

    def calculate_makespan(result_vector, n, m, pik):
        """ 
        Calculate the makespan from the result vector. 
        
        Args: 
            result_vector (list): Binary result vector indicating job assignments. 
            n (int): Number of jobs. 
            m (int): Number of machines. 
            pik (list): Processing time matrix, where pik[j][k] is the processing time of job j on machine k. 
        
        Returns: 
            int: The makespan (maximum completion time). 
        """ 
        
        job_order = [
            index % n  # Extract job ID 
            for index, value in enumerate(result_vector) 
            if value == 1
        ]
        
        machine_end_times = [0] * m 
        job_end_times = [0] * n
    
        # Simulate job processing 
        for job in job_order:
            for k in range(m):
                if k == 0:
                    start_time = machine_end_times[k]
                else:
                    start_time = max(job_end_times[job], machine_end_times[k])
                job_end_times[job] = start_time + pik[job][k]
                machine_end_times[k] = job_end_times[job]
        return machine_end_times[-1]

    # Find best solution
    lowest_energy = None
    best_solution = None

    for energy, solution in results.result_items():
        if lowest_energy is None or energy < lowest_energy:
            lowest_energy = energy
            best_solution = solution

        # Extract job sequence and calculate makespan
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

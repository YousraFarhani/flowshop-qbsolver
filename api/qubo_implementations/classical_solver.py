import time
import random
from typing import List, Tuple, Dict, Any

def makespan(seq: List[int], pik: List[List[float]], m: int) -> float:
    """
    Compute the makespan of a given job sequence on m machines.
    seq: permutation of job indices [0 .. n-1]
    pik[j][k]: processing time of job j on machine k
    """
    machine_end = [0] * m
    job_end = [0] * len(pik)
    for job in seq:
        for k in range(m):
            start = machine_end[k] if k == 0 else max(job_end[job], machine_end[k])
            finish = start + pik[job][k]
            job_end[job] = finish
            machine_end[k] = finish
    return machine_end[-1]

def neh(pik: List[List[float]], n: int, m: int) -> Tuple[List[int], float]:
    """
    NEH heuristic:
      1) Sort jobs by descending total processing time.
      2) Build a sequence incrementally by inserting each job at the position
         that yields the lowest partial makespan.
    Returns (sequence, makespan).
    """
    totals = [sum(p) for p in pik]
    sorted_jobs = sorted(range(n), key=lambda j: -totals[j])

    seq = [sorted_jobs[0]]
    for job in sorted_jobs[1:]:
        best_seq, best_mk = None, float("inf")
        for pos in range(len(seq) + 1):
            trial = seq[:pos] + [job] + seq[pos:]
            mk = makespan(trial, pik, m)
            if mk < best_mk:
                best_mk, best_seq = mk, trial
        seq = best_seq
    return seq, best_mk

def local_search_swap(seq: List[int], pik: List[List[float]], m: int) -> Tuple[List[int], float]:
    """
    Pairwise‐swap local search:
      - Try swapping every pair (i, j) in the current sequence.
      - If any swap improves the makespan, accept it immediately and repeat.
      - Stop when no swap yields an improvement.
    """
    current_seq = seq[:]
    current_mk = makespan(current_seq, pik, m)
    improved = True

    while improved:
        improved = False
        for i in range(len(current_seq) - 1):
            for j in range(i + 1, len(current_seq)):
                trial = current_seq[:]
                trial[i], trial[j] = trial[j], trial[i]
                mk = makespan(trial, pik, m)
                if mk < current_mk:
                    current_seq, current_mk = trial, mk
                    improved = True
                    break
            if improved:
                break
    return current_seq, current_mk

def iterated_greedy(seq: List[int], pik: List[List[float]], m: int, k_remove: int, iterations: int, max_time: float, start_time: float) -> Tuple[List[int], float]:
    """
    Iterated Greedy algorithm:
      1) Start with an initial solution (typically from NEH)
      2) Repeat for a specified number of iterations:
         a) Destruction: Remove k jobs randomly from the sequence
         b) Construction: Reinsert the removed jobs using the NEH insertion procedure
         c) Local search: Apply pairwise swap to the new solution
         d) Accept the new solution if it's better than the current best
      3) Return the best solution found
    """
    current_seq = seq[:]
    current_mk = makespan(current_seq, pik, m)
    best_seq = current_seq[:]
    best_mk = current_mk
    
    for i in range(iterations):
        # Check if we've exceeded the time limit
        if time.perf_counter() - start_time > max_time:
            break
            
        # Destruction phase: remove k jobs randomly
        temp_seq = current_seq[:]
        removed_jobs = []
        for _ in range(min(k_remove, len(temp_seq))):
            if not temp_seq:  # Safety check
                break
            idx = random.randint(0, len(temp_seq) - 1)
            removed_jobs.append(temp_seq.pop(idx))
        
        # Construction phase: reinsert using NEH
        for job in removed_jobs:
            best_pos, best_pos_mk = 0, float("inf")
            for pos in range(len(temp_seq) + 1):
                trial = temp_seq[:pos] + [job] + temp_seq[pos:]
                mk = makespan(trial, pik, m)
                if mk < best_pos_mk:
                    best_pos_mk = mk
                    best_pos = pos
            temp_seq.insert(best_pos, job)
        
        # Local search phase
        temp_seq, temp_mk = local_search_swap(temp_seq, pik, m)
        
        # Accept if better
        if temp_mk < best_mk:
            best_seq = temp_seq[:]
            best_mk = temp_mk
            current_seq = temp_seq[:]
            current_mk = temp_mk
    
    return best_seq, best_mk

def solve_with_classical_algorithm(job_matrix: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Solve the flowshop scheduling problem using the NEH heuristic algorithm.
    """
    # Extract job matrix data
    n = job_matrix.jobs
    m = job_matrix.machines
    pik = job_matrix.processing_times
    
    # Get parameters (with defaults)
    timeout = params.get("timeout", 60.0)
    iteration_count = params.get("iteration_count", 10000)
    k_remove = params.get("k_remove", 100)
    
    # Start timing
    start_time = time.perf_counter()
    
    # Run NEH algorithm
    seq, makespan_value = neh(pik, n, m)
    
    # Time allocation: 20% for NEH, 30% for local search, 50% for iterated greedy
    time_elapsed = time.perf_counter() - start_time
    time_remaining = timeout - time_elapsed
    
    # Apply local search to improve the solution if time permits
    if time_remaining > 0.3 * timeout:
        seq, makespan_value = local_search_swap(seq, pik, m)
    
    # Apply iterated greedy if time permits and parameters are provided
    time_elapsed = time.perf_counter() - start_time
    time_remaining = timeout - time_elapsed
    
    if time_remaining > 0.2 * timeout and iteration_count > 0 and k_remove > 0:
        seq, makespan_value = iterated_greedy(seq, pik, m, k_remove, iteration_count, time_remaining, time.perf_counter())
    
    # Calculate execution time
    execution_time = time.perf_counter() - start_time
    
    # Convert sequence to 1-indexed for frontend display
    one_indexed_seq = [j + 1 for j in seq]
    
    # Return results in the same format as other solvers
    return {
        "sequence": one_indexed_seq,
        "makespan": makespan_value,
        "energy": 0.0,  # Not applicable for classical solver
        "execution_time": execution_time
    }
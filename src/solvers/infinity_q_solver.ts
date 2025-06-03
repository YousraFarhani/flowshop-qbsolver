import { JobMatrix } from "@/components/job-matrix";

// Import the getApiUrl function at the top of the file
import { getApiUrl } from '@/config/api';

export interface InfinityQSolverParams {
  num_chains?: number;  // Default: 128
  num_engines?: number;  // Default: 4
  timeout?: number;      // Default: 120.0 (in seconds)
  T_min?: number;        // Default: 0.01
  T_max?: number;        // Default: 1e9
  coupling_multiplier?: number; // Default: 0.4
  solver_type?: 'infinityq' | 'infinityq_autoqubo';
  qubo_type?: 'auto' | 'position-based' | 'mocellin' | 'widmer-hertz' | 'gupta' | 'stinson-smith-1' | 'stinson-smith-2';
}

export interface InfinityQSolverResult {
  makespan: number;
  sequence: number[];
  energy: number;
  execution_time: number;
  num_occurrences?: number;
  solution_quality?: number;
}

export async function solveWithInfinityQ(
  jobMatrix: JobMatrix,
  params: InfinityQSolverParams = {}
): Promise<InfinityQSolverResult> {
  try {
    console.log('Sending to InfinityQ backend:', {
      job_matrix: {
        jobs: jobMatrix.jobs,
        machines: jobMatrix.machines,
        processing_times: jobMatrix.processingTimes
      },
      params: {
        num_chains: params.num_chains || 128,
        num_engines: params.num_engines || 4,
        timeout: params.timeout || 60.0,
        T_min: params.T_min || 0.01,
        T_max: params.T_max || 1e9,
        coupling_multiplier: params.coupling_multiplier || 0.4,
        solver_type: params.solver_type || 'infinityq'
      }
    });

    
    // Replace this line:
    // const response = await fetch('/.netlify/functions/solve_qubo', {
    // With this:
    const response = await fetch(getApiUrl('/solve_qubo'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_matrix: {
          jobs: jobMatrix.jobs,
          machines: jobMatrix.machines,
          processing_times: jobMatrix.processingTimes
        },
        params: {
          num_chains: params.num_chains || 128,
          num_engines: params.num_engines || 4,
          timeout: params.timeout || 60.0,
          T_min: params.T_min || 0.01,
          T_max: params.T_max || 1e9,
          coupling_multiplier: params.coupling_multiplier || 0.4,
          solver_type: params.solver_type || 'infinityq',
          qubo_type: params.qubo_type || 'auto'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      makespan: result.makespan,
      sequence: result.sequence,
      energy: result.energy,
      execution_time: result.execution_time,
      num_occurrences: result.num_occurrences,
      solution_quality: result.solution_quality
    };
  } catch (error) {
    console.error('Error in solveWithInfinityQ:', error);
    throw error;
  }
}
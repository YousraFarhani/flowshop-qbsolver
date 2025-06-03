// Import the getApiUrl function at the top of the file
import { getApiUrl } from '@/config/api';

import { JobMatrix } from "@/components/job-matrix";

export interface ClassicalSolverParams {
  timeout?: number;  // Default: 60.0 (in seconds)
  iteration_count?: number; // Default: 4
  k_remove?: number; // Default: 4
}

export interface ClassicalSolverResult {
  makespan: number;
  sequence: number[];
  energy: number;  // Will be 0 for classical solver
  execution_time: number;
}

export async function solveWithClassicalAlgorithm(
  jobMatrix: JobMatrix,
  params: ClassicalSolverParams = {}
): Promise<ClassicalSolverResult> {
  try {
    console.log('Sending to classical solver backend:', {
      job_matrix: {
        jobs: jobMatrix.jobs,
        machines: jobMatrix.machines,
        processing_times: jobMatrix.processingTimes
      },
      params: {
        timeout: params.timeout || 60.0,
        iteration_count: params.iteration_count || 4,
        k_remove: params.k_remove || 4,
        solver_type: 'classical'
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
          timeout: params.timeout || 60.0,
          iteration_count: params.iteration_count || 4,
          k_remove: params.k_remove || 4,
          solver_type: 'classical'
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
      execution_time: result.execution_time
    };
  } catch (error) {
    console.error('Error in solveWithClassicalAlgorithm:', error);
    throw error;
  }
}
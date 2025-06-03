// Import the getApiUrl function at the top of the file
import { getApiUrl } from '@/config/api';

import { JobMatrix } from "@/components/job-matrix";

export interface QUBOSolverParams {
  repeat?: number;
  timeout?: number;
}

export interface QUBOSolverResult {
  makespan: number;
  sequence: number[];
  energy: number;
  execution_time: number;
}

export async function solveWithAutoQubo(
  jobMatrix: JobMatrix,
  params: QUBOSolverParams = {}
): Promise<QUBOSolverResult> {
  try {
    console.log('Sending to backend:', {
      job_matrix: {
        jobs: jobMatrix.jobs,
        machines: jobMatrix.machines,
        processing_times: jobMatrix.processingTimes
      },
      params: {
        repeat: params.repeat,
        timeout: params.timeout
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
          num_repeats: params.repeat,  // Changed from repeat to num_repeats
          timeout: params.timeout
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
    console.error('Error in solveWithAutoQubo:', error);
    throw error;
  }
}
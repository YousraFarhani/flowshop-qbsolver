import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Import QUBO implementations
from .qubo_implementations.position_based import solve_with_position_based_qubo
from .qubo_implementations.moccelin import solve_with_mocellin_qubo
from .qubo_implementations.widmer_hertz import solve_with_widmer_hertz_qubo
from .qubo_implementations.gupta import solve_with_gupta_qubo
from .qubo_implementations.stinson_smith_1 import solve_with_stinson_smith_1_qubo
from .qubo_implementations.stinson_smith_2 import solve_with_stinson_smith_2_qubo
from .qubo_implementations.auto_qbsolv import solve_with_auto_qbsolv
from .qubo_implementations.auto_infinityq import solve_with_auto_infinityq
# Import classical solver
from .qubo_implementations.classical_solver import solve_with_classical_algorithm

class JobMatrixModel(BaseModel):
    jobs: int
    machines: int
    processing_times: List[List[float]]

class SolverParams(BaseModel):
    # Common parameters
    timeout: Optional[float] = 60.0
    solver_type: Optional[str] = "qbsolv"  # qbsolv, infinityq, leaphybrid
    qubo_type: Optional[str] = "auto"  # auto, position-based, mocellin
    
    # InfinityQ specific parameters
    
    num_chains: Optional[int] = 128
    num_engines: Optional[int] = 4
    T_min: Optional[float] = 0.01
    T_max: Optional[float] = 1e9
    coupling_multiplier: Optional[float] = 0.4
    
    # Classical solver parameters
    iteration_count: Optional[int] = 10000
    k_remove: Optional[int] = 100
    
    # Remove the repeat parameter
    # repeat: Optional[int] = 1

class SolverRequest(BaseModel):
    job_matrix: JobMatrixModel
    params: Optional[SolverParams] = None

# Add this near the top of your FastAPI app
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/solve_qubo")
async def solve_qubo_endpoint(request: SolverRequest = None, job_matrix: JobMatrixModel = None, params: SolverParams = None):
    """Unified endpoint for solving QUBO problems"""
    try:
        # Handle both request formats
        if request is not None:
            job_matrix = request.job_matrix
            params = request.params or SolverParams()
        else:
            # Make sure params is initialized
            params = params or SolverParams()
            # Make sure job_matrix is provided when request is None
            if job_matrix is None:
                raise ValueError("Either 'request' or 'job_matrix' must be provided")
        
        # Add this logging
        print("Received request with params:", params.dict())
        print("Job matrix:", job_matrix.dict())
        
        # Add a new condition for the classical solver
        if params.solver_type == "classical":
            return solve_with_classical_algorithm(job_matrix, params.dict())
        elif params.solver_type == "infinityq":
            if params.qubo_type == "position-based":
                # Position-based QUBO implementation with InfinityQ solver
                return solve_with_position_based_qubo(job_matrix, params)
            elif params.qubo_type == "mocellin":
                # Mocellin QUBO implementation with InfinityQ solver
                return solve_with_mocellin_qubo(job_matrix, params)
            elif params.qubo_type == "widmer-hertz":
                return solve_with_widmer_hertz_qubo(job_matrix, params)
            elif params.qubo_type == "gupta":
                return solve_with_gupta_qubo(job_matrix, params)
            elif params.qubo_type == "stinson-smith-1":
                return solve_with_stinson_smith_1_qubo(job_matrix, params)
            elif params.qubo_type == "stinson-smith-2":
                return solve_with_stinson_smith_2_qubo(job_matrix, params)
            else:  # auto
                # Auto-generated QUBO with InfinityQ solver
                return solve_with_auto_infinityq(job_matrix, params)
        else:
            # Other solvers (QBSOLV, LeapHybrid) always use auto-generated QUBO
            return solve_with_auto_qbsolv(job_matrix, params)
    except Exception as e:
        print(f"Error in solve_qubo: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Update the command-line handling section at the end of the file
if __name__ == "__main__":
    import sys
    import json
    
    # Check if we're being called from the command line with JSON input
    if len(sys.argv) > 1:
        try:
            # Parse the JSON input from command line argument
            input_data = json.loads(sys.argv[1])
            print(f"Received input: {input_data}")  # Debug print
            
            # Extract job_matrix and params
            job_matrix_data = input_data.get('job_matrix')
            params_data = input_data.get('params')
            
            if not job_matrix_data:
                print(json.dumps({"error": "Missing job_matrix in input"}))  
                sys.exit(1)
                
            # Convert to Pydantic models
            job_matrix = JobMatrixModel(**job_matrix_data)
            params = SolverParams(**params_data) if params_data else SolverParams()
            
            # Call the solve function
            result = solve_qubo_endpoint(job_matrix=job_matrix, params=params)
            
            # Print the result as JSON
            print(json.dumps(result))
        except Exception as e:
            import traceback
            print(json.dumps({
                "error": str(e),
                "traceback": traceback.format_exc()
            }))
            sys.exit(1)
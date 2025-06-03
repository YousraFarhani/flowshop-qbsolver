
import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { JobMatrix } from "@/components/job-matrix";
import { ResultPanel, SolutionResult } from "@/components/result-panel";
import { generateJobMatrix, generateSolutionResult, taillardDatasets } from "@/utils/generate-data";
import { ProblemInputModal, ProblemInputData } from "@/components/problem-input-modal";
import { QUBOComparisonChart } from "@/components/qubo-comparison-chart";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { Operation, OperationType } from "@/components/gantt-chart";
import { solveWithAutoQubo } from "@/solvers/dwave_auto_qubo_solver";
import { solveWithInfinityQ } from "@/solvers/infinity_q_solver";
import { solveWithClassicalAlgorithm } from "@/solvers/classical_solver";

// Sample QUBO comparison data
const sampleQUBOData = [
  { qubo: "Automated", solver: "D-Wave QBSolv", makespan: 1458, lbGap: 13.29, runtime: 3.2, feasible: true },
 

  
  { qubo: "Position-based", solver: "D-Wave LeapHybrid", makespan: 1300, lbGap: 0.10, runtime: 8.2, feasible: true },
  { qubo: "Gupta", solver: "D-Wave LeapHybrid", makespan: 1458, lbGap: 0.06, runtime: 9.1, feasible: true },
  { qubo: "Moccellin", solver: "D-Wave LeapHybrid", makespan: 1286, lbGap: 0.13, runtime: 7.8, feasible: true },
  { qubo: "Widmer & Hertz", solver: "D-Wave LeapHybrid", makespan: 1435, lbGap: 0.09, runtime: 8.5, feasible: true },
  { qubo: "Stinson & Smith-1", solver: "D-Wave LeapHybrid", makespan: 1501, lbGap: 0.07, runtime: 8.7, feasible: true },
  { qubo: "Stinson & Smith-2", solver: "D-Wave LeapHybrid", makespan: 1333, lbGap: 0.04, runtime: 9.3, feasible: true },
  
  { qubo: "Position-based", solver: "InfinityQ TitanQ", makespan: 1509, lbGap: 17.25, runtime: 3.2, feasible: true },
  { qubo: "Position-based", solver: "InfinityQ TitanQ", makespan: 1454, lbGap: 0.11, runtime: 2.2, feasible: true },
  { qubo: "Gupta", solver: "InfinityQ TitanQ", makespan: 1484, lbGap: 0.07, runtime: 3.1, feasible: true },
  { qubo: "Moccellin", solver: "InfinityQ TitanQ", makespan: 1492, lbGap: 0.14, runtime: 1.8, feasible: true },
  { qubo: "Widmer & Hertz", solver: "InfinityQ TitanQ", makespan: 1536, lbGap: 0.10, runtime: 2.5, feasible: true },
  { qubo: "Stinson & Smith-1", solver: "InfinityQ TitanQ", makespan: 1494, lbGap: 0.08, runtime: 2.7, feasible: true },
  { qubo: "Stinson & Smith-2", solver: "InfinityQ TitanQ", makespan: 1407, lbGap: 0.05, runtime: 3.3, feasible: false },
  
  { qubo: "Position-based", solver: "Classical Solver", makespan: 1287, lbGap: 0.15, runtime: 1.2, feasible: true },

  // Add this entry to sampleQUBOData
  { qubo: "Auto-generated", solver: "D-Wave QBSolv", makespan: 1458, lbGap: 0.095, runtime: 2.4, feasible: true },

  
];


// Main application
const Dashboard = () => {
  // Change this line
  const [activeTab, setActiveTab] = useState("input");
  const [jobMatrix, setJobMatrix] = useState(generateJobMatrix("tai20x5"));
  const [customJobMatrix, setCustomJobMatrix] = useState<JobMatrix | null>(null);
  const [results, setResults] = useState<{
    quantum: SolutionResult | null;
    classical: SolutionResult | null;
    infinityq: SolutionResult | null;
  }>({
    quantum: null,
    classical: null,
    infinityq: null
  });
  const [showConflicts, setShowConflicts] = useState(false);
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  
  // Handle run configuration
  // First, add the calculateSchedule helper function at the top level of the component
  const calculateSchedule = (jobMatrix: JobMatrix, sequence: number[]): Operation[] => {
    const schedule: Operation[] = [];
    const machineEndTimes = new Array(jobMatrix.machines).fill(0);
    const jobEndTimes = new Array(jobMatrix.jobs).fill(0);
    
    // Check if sequence is already 0-indexed (contains a 0)
    const isZeroIndexed = sequence.includes(0);
    
    // Convert to 0-indexed only if it's not already 0-indexed
    const zeroBasedSequence = isZeroIndexed 
      ? sequence 
      : sequence.map(jobIndex => jobIndex - 1);
    
    for (let machine = 0; machine < jobMatrix.machines; machine++) {
      zeroBasedSequence.forEach((job) => {
        const processingTime = jobMatrix.processingTimes[job][machine];
        const startTime = Math.max(
          machine > 0 ? jobEndTimes[job] : 0,
          machineEndTimes[machine]
        );
        
        schedule.push({
          id: `job${job + 1}-machine${machine + 1}`,
          jobId: job,
          type: "process" as OperationType,
          startTime: startTime,
          endTime: startTime + processingTime,
          machineId: machine
        });
        
        machineEndTimes[machine] = startTime + processingTime;
        jobEndTimes[job] = startTime + processingTime;
      });
    }
    
    return schedule;
  };
  
  // Update the handleRunOptimization function
  // Add this import at the top of the file
 
  
  const handleRunOptimization = async (config: any) => {
    const { instance, solvers, timeLimit, quboMode } = config;
    
    // Generate new job matrix based on selected instance
    let newJobMatrix;
    if (instance === "custom" && customJobMatrix) {
      // Use the existing custom job matrix instead of generating a new one
      newJobMatrix = customJobMatrix;
    } else {
      // For non-custom instances, generate a new matrix
      newJobMatrix = generateJobMatrix(instance);
    }
    setJobMatrix(newJobMatrix);
    
    // Reset results
    const newResults = { 
      quantum: null,
      classical: null,
      infinityq: null
    };
    
    try {
      // Handle quantum solvers
      const quantumSolver = solvers.find((s: any) => s.id === "qbsolv" || s.id === "leaphybrid");
      if (quantumSolver) {
        const solverName = quantumSolver.id === "qbsolv" ? "D-Wave QBSolv" : "D-Wave LeapHybrid";
        const quboResult = await solveWithAutoQubo(newJobMatrix, {
          timeout: quantumSolver.timeLimit,  // Use the solver's time limit
          // Removed the repeat parameter
        });
        
        newResults.quantum = {
          solver: solverName,
          makespan: quboResult.makespan,
          schedule: calculateSchedule(newJobMatrix, quboResult.sequence),
          logs: [
            `[INFO] Starting ${solverName} for instance ${instance}`,
            `[INFO] QUBO Type: Automated`,
           
            `[INFO] Execution time: ${quboResult.execution_time.toFixed(2)}s`,
            `[INFO] Solution energy: ${quboResult.energy.toFixed(2)}`,
            `[INFO] Makespan: ${quboResult.makespan}`
          ],
          numJobs: newJobMatrix.jobs,
          executionTime: quboResult.execution_time,
          jobSequence: quboResult.sequence,
          quboType: "Automated"
        };
      }
  
      // Handle InfinityQ solver
      const infinityqSolver = solvers.find((s: any) => s.id === "titanq");
      if (infinityqSolver) {
        const result = await solveWithInfinityQ(newJobMatrix, {
          timeout: infinityqSolver.timeLimit,
          solver_type: "infinityq",  // Always use infinityq for manual QUBO types
          qubo_type: quboMode === "auto" ? "auto" : config.quboType,  // Pass the selected QUBO type
          num_chains: config.titanqParams?.numChains || 128,
          num_engines: config.titanqParams?.numEngines || 4,
          T_min: config.titanqParams?.minTemp || 0.01,
          T_max: config.titanqParams?.maxTemp || 1e9,
          coupling_multiplier: config.titanqParams?.couplingMultiplier || 0.4  // Add this line
        });

        // Get QUBO type based on the mode and params
        let quboType = "Automated";
        if (quboMode !== "auto") {
          // Use the exact QUBO type that was passed to the backend
          quboType = config.quboType;
        }

        newResults.infinityq = {
          solver: "InfinityQ TitanQ",
          makespan: result.makespan,
          schedule: calculateSchedule(newJobMatrix, result.sequence),
          logs: [
            `[INFO] Starting InfinityQ solver for instance ${instance}`,
            `[INFO] QUBO Type: ${quboType}`,
          
            `[INFO] Execution time: ${result.execution_time.toFixed(2)}s`,
            `[INFO] Solution energy: ${result.energy.toFixed(2)}`,
            `[INFO] Makespan: ${result.makespan}`
          ],
          numJobs: newJobMatrix.jobs,
          executionTime: result.execution_time,
          jobSequence: result.sequence,
          quboType: quboType
        };
  
        setActiveTab("infinityq");
      }
  
      // Handle Classical solver
      // Find the classical solver section in handleRunOptimization and update it
      const classicalSolver = solvers.find((s: any) => s.id === "classical");
      if (classicalSolver) {
      const result = await solveWithClassicalAlgorithm(newJobMatrix, {
      timeout: classicalSolver.timeLimit,
      iteration_count: config.classicalParams?.iterationCount || 4,
      k_remove: config.classicalParams?.kRemove || 4
      });
      
      // Rest of the code remains the same
      newResults.classical = {
      solver: "Classical NEH Heuristic",
      makespan: result.makespan,
      schedule: calculateSchedule(newJobMatrix, result.sequence),
      logs: [
      `[INFO] Starting Classical NEH Heuristic for instance ${instance}`,
      `[INFO] Using NEH algorithm with local search`,
      `[INFO] Execution time: ${result.execution_time.toFixed(2)}s`,
      `[INFO] Makespan: ${result.makespan}`
      ],
      numJobs: newJobMatrix.jobs,
      executionTime: result.execution_time,
      jobSequence: result.sequence,
      quboType: "N/A"  // Not applicable for classical solver
      };
      
      setActiveTab("classical");
      }
  
      // Update results
      setResults(newResults);
    } catch (error) {
      console.error('Error during optimization:', error);
      alert('Error during optimization: ' + (error as Error).message);
    }
  };
  const handleProblemSubmit = (data: ProblemInputData) => {
    // Create a new job matrix from the problem data
    const lines = data.processingTimes.trim().split("\n");
    const processingTimes = lines.map(line => 
      line.trim().split(/\s+/).map(val => parseInt(val))
    );
    
    const newMatrix = {
      jobs: data.jobs,
      machines: data.machines,
      processingTimes
    };
    
    // Store the custom job matrix
    setCustomJobMatrix(newMatrix);
    setJobMatrix(newMatrix);
    
    // Remove the automatic classical result generation
    // and tab switching to keep the user on the input tab
    
    // Set active tab to input instead of classical
    setActiveTab("input");
  };
  
  // Check if we have any results
  const hasAnyResults = results.quantum || results.classical || results.infinityq;
  
  return (
    <div className="h-screen flex flex-col">
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar 
              onRun={handleRunOptimization} 
              onInstanceChange={(instance) => {
                // Generate new job matrix based on selected instance
                if (instance === "custom" && customJobMatrix) {
                  setJobMatrix(customJobMatrix);
                } else if (instance !== "custom") {
                  const newJobMatrix = generateJobMatrix(instance);
                  setJobMatrix(newJobMatrix);
                }
              }}
              onCustomSelected={() => setProblemModalOpen(true)}  // Add this line
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AppHeader 
              activeTab={activeTab} 
              results={results} 
              showConflicts={showConflicts}
              setShowConflicts={setShowConflicts}
            />
            <main className="flex-1 overflow-y-auto p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger
                      value="input"
                      className="text-base py-2 px-4 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                    >
                      Input Data
                    </TabsTrigger>
                    <TabsTrigger
                      value="quantum"
                      disabled={!results.quantum}
                      className="text-base py-2 px-4 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                    >
                      D-Wave Results
                    </TabsTrigger>
                    <TabsTrigger
                      value="infinityq"
                      disabled={!results.infinityq}
                      className="text-base py-2 px-4 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                    >
                      InfinityQ Results
                    </TabsTrigger>
                    <TabsTrigger
                      value="classical"
                      disabled={!results.classical}
                      className="text-base py-2 px-4 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                    >
                      Classical Results
                    </TabsTrigger>
                    <TabsTrigger
                      value="comparison"
                      className="text-base py-2 px-4 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                    >
                      QUBO Comparison
                    </TabsTrigger>
                  </TabsList>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setProblemModalOpen(true)}
                    className="gap-2"
                  >
                    <CirclePlus className="h-4 w-4" />
                    Custom Problem
                  </Button>
                </div>
                
                <TabsContent value="input" className="space-y-4">
                  <JobMatrix data={jobMatrix} />
                </TabsContent>
                
                <TabsContent value="quantum" className="space-y-4">
                  {results.quantum && (
                    <ResultPanel 
                      result={results.quantum}
                      showConflicts={showConflicts}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="infinityq" className="space-y-4">
                  {results.infinityq && (
                    <ResultPanel 
                      result={results.infinityq}
                      showConflicts={showConflicts}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="classical" className="space-y-4">
                  {results.classical && (
                    <ResultPanel 
                      result={results.classical}
                      showConflicts={showConflicts}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="comparison" className="space-y-4">
                  <QUBOComparisonChart data={sampleQUBOData} />
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </SidebarProvider>
      
      <ProblemInputModal
        open={problemModalOpen}
        onOpenChange={setProblemModalOpen}
        onSubmit={handleProblemSubmit}
      />
    </div>
  );
};

export default Dashboard;

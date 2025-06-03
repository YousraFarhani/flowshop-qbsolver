
import { useState, forwardRef, useImperativeHandle } from "react";
import { ChevronDown, Info } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { SolverParameters } from "./solver-parameters";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

// Define types for our solvers and instances
type SolverType = "qbsolv" | "leaphybrid" | "titanq" | "classical";

interface SolverConfig {
  id: SolverType;
  name: string;
  enabled: boolean;
  description: string;
  companyLogo?: string;
  timeLimit: number;
}

// Instance benchmarks
const instances = [
  { id: "tai20x5", label: "Taillard 20×5" },
  { id: "tai20x10", label: "Taillard 20×10" },
  { id: "tai20x20", label: "Taillard 20×20" },
  { id: "tai50x5", label: "Taillard 50×5" },
  { id: "tai50x10", label: "Taillard 50×10" },
  { id: "custom", label: "Custom Instance" },  // Add this line
];

// Add this interface to define the ref type
export interface AppSidebarRef {
  setSelectedInstance: (instance: string) => void;
}

export const AppSidebar = forwardRef<AppSidebarRef, {
  onRun: (config: any) => void;
  onInstanceChange?: (instance: string) => void;
  onCustomSelected?: () => void;
}>(({
  onRun, 
  onInstanceChange,
  onCustomSelected
}, ref) => {
  // Component implementation
  const { toast } = useToast();
  const [selectedInstance, setSelectedInstance] = useState("tai20x5");
  const [globalTimeLimit, setGlobalTimeLimit] = useState("60");
  const [syncTimeLimits, setSyncTimeLimits] = useState(false);
  const [solvers, setSolvers] = useState<SolverConfig[]>([
    { 
      id: "titanq", 
      name: "InfinityQ TitanQ", 
      enabled: false,
      description: "InfinityQ's TitanQ is a quantum-inspired analog computing solver.",
      companyLogo: "https://infinityq.com/wp-content/uploads/2023/07/InfinityQ-Logo.png",
      timeLimit: 60
    },
    { 
      id: "qbsolv", 
      name: "D-Wave QBSolv", 
      enabled: false,
      description: "D-Wave's QBSolv is a classical and hybrid solver that tackles large QUBO problems by decomposing them into smaller subproblems. It uses tabu search to solve each subQUBO and can optionally leverage quantum annealers for hybrid execution. This makes it ideal for scaling optimization tasks beyond current quantum hardware limits.",
      companyLogo: "https://upload.wikimedia.org/wikipedia/en/9/9c/D-Wave_Systems_logo.png",
      timeLimit: 60
    },
    { 
      id: "leaphybrid", 
      name: "D-Wave LeapHybridSolver", 
      enabled: false,
      description: "D-Wave's Leap Hybrid Solver combines quantum and classical resources to solve large-scale QUBO problems.",
      companyLogo: "https://upload.wikimedia.org/wikipedia/en/9/9c/D-Wave_Systems_logo.png",
      timeLimit: 60
    },
    { 
      id: "classical", 
      name: "Classical Solver-NEH Heuristic", 
      enabled: false,  // Changed to false
      description: "The Nawaz–Enscore–Ham heuristic is a widely used, fast insertion‐based method for permutation flowshop scheduling. It builds an initial job sequence by sorting jobs in descending total‐processing‐time order, then inserts them one by one in the position that yields the lowest makespan. Optionally, you can apply Iterated Greedy (IG) or a simple local‐search swap to refine the NEH solution.",
      timeLimit: 60
    }
  ]);
  
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [currentSolver, setCurrentSolver] = useState<SolverConfig | null>(null);
  const [quboMode, setQuboMode] = useState<"auto" | "manual">("auto");
  const [quboType, setQuboType] = useState<"position-based" | "mocellin" | "widmer-hertz" | "gupta" | "stinson-smith-1" | "stinson-smith-2">("position-based");
  
  // Add TitanQ parameters state at the component level
  const [titanqParams, setTitanqParams] = useState({
    minTemp: 0.1,
    maxTemp: 100000000.0,
    numEngines: 4,
    numChains: 4,
    couplingMultiplier: 0.4  // Add this new parameter
  });
  const [classicalParams, setClassicalParams] = useState({
    iterationCount: 10000,
    kRemove: 100
  });

  const toggleSolver = (id: SolverType) => {
    setSolvers(solvers.map(solver => 
      solver.id === id ? { ...solver, enabled: !solver.enabled } : solver
    ));
  };
  
  const handleSolverInfo = (solver: SolverConfig) => {
    setCurrentSolver(solver);
    setInfoDialogOpen(true);
  };

  const updateSolverTimeLimit = (id: SolverType, value: string) => {
    const numValue = parseInt(value) || 0;
    setSolvers(solvers.map(solver => 
      solver.id === id ? { ...solver, timeLimit: numValue } : solver
    ));
  };

  const handleGlobalTimeLimitChange = (value: string) => {
    setGlobalTimeLimit(value);
    if (syncTimeLimits) {
      const numValue = parseInt(value) || 0;
      setSolvers(solvers.map(solver => ({ ...solver, timeLimit: numValue })));
    }
  };

  const handleSyncTimeLimit = (checked: boolean) => {
    setSyncTimeLimits(checked);
    if (checked) {
      const numValue = parseInt(globalTimeLimit) || 0;
      setSolvers(solvers.map(solver => ({ ...solver, timeLimit: numValue })));
    }
  };

  // Update the handleRunOptimization function to include quboType
  const handleRunOptimization = () => {
    // Validate at least one solver is enabled
    if (!solvers.some(solver => solver.enabled)) {
      toast({
        title: "Solver Required",
        description: "Please select at least one solver to continue.",
        variant: "destructive"
      });
      return;
    }

    // Remove the incorrect state declaration here
    // const [titanqParams, setTitanqParams] = useState({ ... }); - DELETE THIS LINE
    
    // Pass configuration to parent component with TitanQ parameters
    // In the handleRunOptimization function, update the onRun call
    onRun({
      instance: selectedInstance,
      solvers: solvers.filter(s => s.enabled).map(s => ({
        id: s.id,
        timeLimit: s.timeLimit
      })),
      quboMode,
      quboType,
      titanqParams,
      classicalParams // Add this line to pass the classical parameters
    });

    // Create a persistent toast with spinner and progress
    const initialToast = toast({
      title: "Optimization Started",
      description: (
        <div className="flex flex-col gap-2">
          <span>Running with {solvers.filter(s => s.enabled).length} solver(s).</span>
          <div className="flex items-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-t-2 border-gray-300 border-t-blue-500 rounded-full"></span>
            <span>Initializing...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `0%` }}></div>
          </div>
        </div>
      ),
      duration: Infinity
    });

    // Example: update progress and status dynamically
    let progress = 0;
    const updateProgress = (status: string, percent: number) => {
      initialToast.update({
        id: initialToast.id, // <-- Add this line
        title: "Optimization In Progress",
        description: (
          <div className="flex flex-col gap-2">
            <span>Running with {solvers.filter(s => s.enabled).length} solver(s).</span>
            <div className="flex items-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-3 border-t-3 border-gray-300 border-t-blue-500 rounded-full"></span>
              <span>{status}</span>
            </div>
            <div className="w-64 bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
            </div>
          </div>
        ),
        duration: Infinity
      });
    };

    // Simulate progress updates (replace with real callbacks)
    const interval = setInterval(() => {
      progress += 3;
      updateProgress(`Processing... (${progress}%)`, progress);
      if (progress >= 100) {
        clearInterval(interval);
        initialToast.update({
          id: initialToast.id, // This is required
          title: "Optimization Complete!",
          description: (
            <div className="flex flex-col gap-2">
              <span>All solvers finished.</span>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 text-green-500">✔️</span>
                <span>Results ready, Just a moment as we prepare them for display!</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `100%` }}></div>
              </div>
            </div>
          ),
          duration: 400000 // Show for 2 seconds after completion
        });
      }
    }, 600);
  };

  return (
    <>
      <Sidebar className="border-r bg-slate-50 dark:bg-gray-900">
        <SidebarHeader className="border-b py-4 px-6 bg-slate-100 dark:bg-gray-800">
            <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-quantum-purple text-white flex items-center justify-center font-mono text-base">
              Q
            </div>
            <div>
              <h2 className="font-bold tracking-tight text-base">FlowShop QBSolver</h2>
              <p className="text-xs text-muted-foreground">Quantum-Classical Hybrid Optimization</p>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="py-6 px-6">
          <div className="space-y-6">
            {/* Problem Instance */}
            <div className="space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Label htmlFor="instance" className="text-sm font-medium">Scheduling Instance</Label>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">Select a benchmark instance for the flow shop scheduling problem</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              
              <Select onValueChange={(value) => {
                  setSelectedInstance(value);
                  // Call the onInstanceChange callback when an instance is selected
                  if (onInstanceChange) {
                      onInstanceChange(value);
                  }
                  // If custom is selected, trigger the onCustomSelected callback
                  if (value === "custom" && onCustomSelected) {
                      onCustomSelected();
                  }
              }} value={selectedInstance}>
                  <SelectTrigger id="instance" className="w-full text-sm">
                      <SelectValue placeholder="Select instance" />
                  </SelectTrigger>
                  <SelectContent>
                      {instances.map((instance) => (
                          <SelectItem key={instance.id} value={instance.id} className="text-sm">
                              {instance.label}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>

            {/* Time Limit Sync Option */}
            <div className="space-y-3 border-t border-border pt-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sync-time-limits" 
                  checked={syncTimeLimits}
                  onCheckedChange={handleSyncTimeLimit}
                />
                <Label 
                  htmlFor="sync-time-limits" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Apply same timeouts to all solvers
                </Label>
              </div>
              
              {syncTimeLimits && (
                <div className="space-y-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <Label htmlFor="global-time-limit" className="text-sm font-medium">Global Timeout (seconds)</Label>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Maximum time allowed for all solvers</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Input
                    id="global-time-limit"
                    type="number"
                    value={globalTimeLimit}
                    onChange={(e) => handleGlobalTimeLimitChange(e.target.value)}
                    min={1}
                    className="text-sm"
                  />
                </div>
              )}
            </div>

            {/* QUBO Formulation Selector */}
            <div className="border-t border-border pt-3 space-y-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Label className="text-sm font-medium">QUBO Formulation</Label>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Choose between automatic or manual QUBO formulation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Tabs value={quboMode} onValueChange={(v) => setQuboMode(v as "auto" | "manual")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="auto" className="text-sm py-2">AutoQUBO</TabsTrigger>
                  <TabsTrigger value="manual" className="text-sm py-2">Manual</TabsTrigger>
                </TabsList>
                <TabsContent value="auto" className="pt-1">
                  <Card className="border-slate-200 dark:border-slate-700 w-50 m-0">
                    <CardContent className="pt-2">
                      <p className="text-xs text-muted-foreground text-center ">
                      By selecting AutoQUBO, you opt for an automated QUBO formulation tailored by the framework. It translates your high-level Flow Shop description into a QUBO model, automatically choosing suitable encodings and penalty parameters for execution on the solver.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="manual" className="pt-3">
                  <div className="space-y-3">
                    <Label htmlFor="qubo-type" className="text-sm font-medium">QUBO Implementation</Label>
                    <Select 
                      value={quboType}
                      onValueChange={(value) => setQuboType(value as "position-based" | "mocellin" | "widmer-hertz" | "gupta" | "stinson-smith-1" | "stinson-smith-2")}
                    >
                      <SelectTrigger id="qubo-type" className="text-sm">
                        <SelectValue placeholder="Select QUBO type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="position-based" className="text-sm">Position-based</SelectItem>
                        <SelectItem value="mocellin" className="text-sm">Moccellin</SelectItem>
                        <SelectItem value="widmer-hertz" className="text-sm">Widmer & Hertz</SelectItem>
                        <SelectItem value="gupta" className="text-sm">Gupta</SelectItem>
                        <SelectItem value="stinson-smith-1" className="text-sm">Stinson & Smith-1</SelectItem>
                        <SelectItem value="stinson-smith-2" className="text-sm">Stinson & Smith-2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Solvers */}
            <div className="space-y-3 border-t border-border pt-3">
              <Label className="text-sm font-medium">Solver Selection</Label>
              <div className="space-y-4">
                {solvers.map((solver) => (
                  <Card key={solver.id} className={`overflow-hidden transition-all duration-200 ${solver.enabled ? 'border-primary/20' : 'border-muted opacity-70'} bg-white dark:bg-slate-800`}>
                    <div className="p-3 flex items-center space-x-2">
                      <Checkbox 
                        id={solver.id} 
                        checked={solver.enabled}
                        onCheckedChange={() => toggleSolver(solver.id)}
                      />
                      <label
                        htmlFor={solver.id}
                        className="flex flex-1 items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {solver.name}
                      </label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleSolverInfo(solver)}
                            >
                              <Info className="h-4 w-4" />
                              <span className="sr-only">Solver info</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>View solver information and documentation</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {solver.enabled && (
                      <CardContent className="pb-3 pt-0">
                        {!syncTimeLimits && (
                          <div className="space-y-2 mb-3">
                            <Label htmlFor={`${solver.id}-time-limit`} className="text-sm font-medium">Timeout (seconds)</Label>
                            <Input
                              id={`${solver.id}-time-limit`}
                              type="number"
                              value={solver.timeLimit}
                              onChange={(e) => updateSolverTimeLimit(solver.id, e.target.value)}
                              min={1}
                              className="text-sm"
                            />
                          </div>
                        )}
                        
                        {solver.id === "qbsolv" && (
                          <div className="space-y-3">
                            <h4 className="text-xs text-muted-foreground uppercase tracking-wide">Parameters</h4>
                            {/* Removed the Repeats input */}
                            {/* No additional parameters needed */}
                          </div>
                        )}
                        
                        {solver.id === "leaphybrid" && (
                          <div className="space-y-3">
                            <h4 className="text-xs text-muted-foreground uppercase tracking-wide">Parameters</h4>
                            
                            <div className="flex justify-between items-center gap-4">
                              <Label className="text-sm">QPU Time (μs)</Label>
                              <Input type="number" defaultValue={20} min={1} className="w-16 h-8 text-sm" />
                            </div>
                            <div className="flex justify-between items-center gap-4">
                              <Label className="text-sm">Penalty Value</Label>
                              <Input type="number" defaultValue={1.0} step={0.1} min={0} className="w-16 h-8 text-sm" />
                            </div>
                          </div>
                        )}
                        
                        {solver.id === "titanq" && (
                          <div className="space-y-3">
                            <h4 className="text-xs text-muted-foreground uppercase tracking-wide">Parameters</h4>
                            <div className="flex justify-between items-center gap-4">
                              <Label className="text-sm">Coupling Multiplier</Label>
                              <Input 
                                type="number" 
                                value={titanqParams.couplingMultiplier}
                                onChange={(e) => setTitanqParams({...titanqParams, couplingMultiplier: parseFloat(e.target.value)})}  
                                step={0.1}
                                min={0} 
                                className="w-16 h-8 text-sm" 
                              />
                            </div>
                            <div className="flex justify-between items-center gap-4">
                              <Label className="text-sm">Min Temperature</Label>
                              <Input 
                                type="number" 
                                value={titanqParams.minTemp}
                                onChange={(e) => setTitanqParams({...titanqParams, minTemp: parseFloat(e.target.value)})}
                                step={0.1} 
                                min={0} 
                                className="w-16 h-8 text-sm" 
                              />
                            </div>
                            <div className="flex justify-between items-center gap-4">
                              <Label className="text-sm">Max Temperature</Label>
                              <Input 
                                type="number" 
                                value={titanqParams.maxTemp}
                                onChange={(e) => setTitanqParams({...titanqParams, maxTemp: parseFloat(e.target.value)})}
                                step={0.1} 
                                min={0} 
                                className="w-16 h-8 text-sm" 
                              />
                            </div>
                            <div className="flex justify-between items-center gap-4">
                              <Label className="text-sm">Number of Engines</Label>
                              <Input 
                                type="number" 
                                value={titanqParams.numEngines}
                                onChange={(e) => setTitanqParams({...titanqParams, numEngines: parseInt(e.target.value)})}
                                min={1} 
                                className="w-16 h-8 text-sm" 
                              />
                            </div>
                            <div className="flex justify-between items-center gap-4">
                              <Label className="text-sm">Number of Chains</Label>
                              <Input 
                                type="number" 
                                value={titanqParams.numChains}
                                onChange={(e) => setTitanqParams({...titanqParams, numChains: parseInt(e.target.value)})}  
                                min={1} 
                                className="w-16 h-8 text-sm" 
                              />
                            </div>
                          
                          </div>
                        )}
                        
                        {solver.id === "classical" && (
                          <div className="space-y-3">
                            <h4 className="text-xs text-muted-foreground uppercase tracking-wide">Parameters</h4>
                            <div className="flex justify-between items-center gap-4">
                              <Label className="text-sm">Iteration Count</Label>
                              <Input 
                                type="number" 
                                value={classicalParams.iterationCount}
                                onChange={(e) => setClassicalParams({...classicalParams, iterationCount: parseInt(e.target.value)})}
                                min={1} 
                                className="w-16 h-8 text-sm" 
                              />
                            </div>
                            <div className="flex justify-between items-center gap-4">
                              <Label className="text-sm">Removal Size</Label>
                              <Input 
                                type="number" 
                                value={classicalParams.kRemove}
                                onChange={(e) => setClassicalParams({...classicalParams, kRemove: parseInt(e.target.value)})}
                                min={1} 
                                className="w-16 h-8 text-sm" 
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </SidebarContent>

        <SidebarFooter className="p-6 border-t">
          <Button 
            className="w-full font-mono bg-blue-500 hover:bg-blue-600 text-white text-base py-5"
            onClick={handleRunOptimization}
          >
            Run Optimization
          </Button>
        </SidebarFooter>
      </Sidebar>
      
      {/* Solver Information Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentSolver?.name} Info
            </DialogTitle>
            <DialogDescription>
              {currentSolver?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm">
              <h4 className="font-medium mb-2">Key parameters:</h4>
              {currentSolver?.id === "qbsolv" && (
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li><span className="font-medium text-foreground">Timeout:</span> Maximum CPU time in seconds (default: 2592000.0s). Execution stops when CPU time equals or exceeds this value</li>
                 
              
                </ul>
              )}
              {currentSolver?.id === "leaphybrid" && (
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li><span className="font-medium text-foreground">Timeout:</span> Maximum wall clock time in seconds</li>
                  <li><span className="font-medium text-foreground">QPU Time:</span> Time per subproblem on quantum processor</li>
                  <li><span className="font-medium text-foreground">Penalty Value:</span> Strength of constraint violations in the QUBO formulation</li>
                </ul>
              )}
              {currentSolver?.id === "titanq" && (
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              
                  <li><span className="font-medium text-foreground">Timeout:</span> Maximum time per optimization run</li>
                  <li><span className="font-medium text-foreground">Coupling Multiplier:</span> it scales the strength of the interaction terms between variables in a QUBO, influencing the solver's sensitivity to constraint enforcement versus objective optimization.</li>
                  <li><span className="font-medium text-foreground">Minimum Temperature (Tmin):</span>sets the lower bound of the annealing temperature, influencing exploration and exploitation of the solution space.</li>
                  <li><span className="font-medium text-foreground">Maximum Temperature (Tmax):</span>determines the upper limit of the annealing temperature, significantly impacting the solver’s initial exploration phase.</li>
                  <li><span className="font-medium text-foreground">Number of Engines:</span>the number of parallel computational processes employed. Utilizing multiple engines can accelerate computations, especially for large-scale problems, but it requires balancing against available hardware capabilities.</li>
                  <li><span className="font-medium text-foreground">Number of Chains:</span>determines the number of solution chains executed simultaneously. Increasing the number of chains can enhance solution diversity and convergence.</li>
                </ul>
              )}
              {currentSolver?.id === "classical" && (
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                   <li><span className="font-medium text-foreground">Timeout:</span> Maximum wall‐clock time (in seconds) before the solver aborts and returns the best solution found so far.</li>
                  <li><span className="font-medium text-foreground">Iteration Count (iters):</span> The number of destroy–rebuild-local‐search cycles the Iterated Greedy algorithm will performl cycles to perform.</li>
                  <li><span className="font-medium text-foreground">Removal Size (k_remove):</span> The number of jobs randomly removed in each “destroy” step before rebuilding the sequence.</li>
                  </ul>
              )}
            </div>
            
            <div className="text-sm">
              <h4 className="font-medium mb-2">Best used for:</h4>
              <p className="text-muted-foreground">
                {currentSolver?.id === "qbsolv" && "Small to medium-sized problems that can benefit from quantum speedup."}
                {currentSolver?.id === "leaphybrid" && "Large-scale problems that require both classical and quantum approaches."}
                {currentSolver?.id === "titanq" && "Problems requiring quantum-inspired acceleration without actual quantum hardware."}
                {currentSolver?.id === "classical" && "Large flowshop benchmarks (Taillard n ≥ 50–100) where pure NEH is a good start but might get stuck in a local minimum. The NEH + IG blend often yields solutions within 1–2% of best‐known for n up to 200–500 in seconds to minutes.."}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setSelectedInstance: (instance: string) => {
      setSelectedInstance(instance);
    }
  }));
});







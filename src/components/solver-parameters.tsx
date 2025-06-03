import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SolverParametersProps {
  solverType: "qbsolv" | "leaphybrid" | "infinityq" | "infinityq_autoqubo" | "classical";
  onInfoClick?: () => void;
}

export function SolverParameters({ solverType, onInfoClick }: SolverParametersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Different parameters per solver type
  const renderParameters = () => {
    switch (solverType) {
      case "qbsolv":
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium mb-3">Parameters</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Label htmlFor="num_reads" className="text-sm font-medium">Num Reads</Label>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Number of reads/samples to take from the QUBO solver</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input id="num_reads" type="number" defaultValue={50} className="text-sm" />
              </div>
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Label htmlFor="chain_strength" className="text-sm font-medium">Chain Strength</Label>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Strength of the chain coupling between physical qubits</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input id="chain_strength" type="number" defaultValue={1.5} step={0.1} className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Label htmlFor="annealing_time" className="text-sm font-medium">Annealing Time (μs)</Label>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Time for quantum annealing process in microseconds</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input id="annealing_time" type="number" defaultValue={20} className="text-sm" />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch id="auto_scale" defaultChecked />
                <Label htmlFor="auto_scale" className="text-sm">Auto Scale</Label>
              </div>
            </div>
          </div>
        );
      
      case "leaphybrid":
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium mb-3">Parameters</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Label htmlFor="time_limit" className="text-sm font-medium">Timeout (s)</Label>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Maximum time allowed for the hybrid solver</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input id="time_limit" type="number" defaultValue={5} className="text-sm" />
              </div>
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Label htmlFor="max_iter" className="text-sm font-medium">Maximum Iterations</Label>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Maximum number of iterations for the hybrid solver</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input id="max_iter" type="number" defaultValue={100} className="text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Label htmlFor="hybrid_sampler" className="text-sm font-medium">Hybrid Sampler</Label>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Type of hybrid quantum sampler to use</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Select defaultValue="leap">
                <SelectTrigger id="hybrid_sampler" className="text-sm">
                  <SelectValue placeholder="Select sampler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leap" className="text-sm">Leap Hybrid v2</SelectItem>
                  <SelectItem value="advantage" className="text-sm">Advantage System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      
      case "infinityq":
      case "infinityq_autoqubo":
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium mb-3">Parameters</h4>
            <div className="space-y-2">  {/* Changed from grid to single column */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Label htmlFor="timeout" className="text-sm font-medium">Timeout (s)</Label>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Maximum time in seconds for the solver to run</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Input id="timeout" type="number" defaultValue={60} className="text-sm" />
            </div>
            {/* Removed the repeat input */}
          </div>
        );
      
      case "classical":
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium mb-3">Parameters</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Label htmlFor="algorithm" className="text-sm font-medium">Algorithm</Label>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Classical optimization algorithm to use</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select defaultValue="brute_force">
                  <SelectTrigger id="algorithm" className="text-sm">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brute_force" className="text-sm">Brute Force</SelectItem>
                    <SelectItem value="palmer" className="text-sm">Palmer's Heuristic</SelectItem>
                    <SelectItem value="neh" className="text-sm">NEH Heuristic</SelectItem>
                    <SelectItem value="johnson" className="text-sm">Johnson's (2 machines)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Label htmlFor="n_threads" className="text-sm font-medium">Number of Threads</Label>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Number of CPU threads to use for parallel processing</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input id="n_threads" type="number" defaultValue={4} className="text-sm" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="use_parallel" defaultChecked />
              <Label htmlFor="use_parallel" className="text-sm">Use Parallel Processing</Label>
            </div>
          </div>
        );
      
      default:
        return <div className="text-sm text-muted-foreground">No parameters for this solver.</div>;
    }
  };

  return (
    <Card className="mt-2 border-dashed border-muted">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <div className="flex justify-between items-center px-4 py-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex justify-between text-sm w-full" size="sm">
              <span>Solver Parameters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          {onInfoClick && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onInfoClick();
                    }}
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
          )}
        </div>
        <CollapsibleContent>
          <CardContent className="pt-2">
            {renderParameters()}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

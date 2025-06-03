
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface ProblemInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProblemInputData) => void;
}

export interface ProblemInputData {
  machines: number;
  jobs: number;
  processingTimes: string;
}

export function ProblemInputModal({ 
  open, 
  onOpenChange,
  onSubmit
}: ProblemInputModalProps) {
  const { toast } = useToast();
  const [machines, setMachines] = useState(5);
  const [jobs, setJobs] = useState(20);
  const [processingTimes, setProcessingTimes] = useState("");

  const handleGenerateRandom = () => {
    let randomData = "";
    for (let j = 0; j < jobs; j++) {
      let row = [];
      for (let m = 0; m < machines; m++) {
        row.push(Math.floor(Math.random() * 50) + 1); // Random processing time between 1 and 50
      }
      randomData += row.join(" ") + "\n";
    }
    setProcessingTimes(randomData.trim());
  };

  const handleSubmit = () => {
    // Validate input
    if (machines < 2) {
      toast({
        title: "Invalid Input",
        description: "Number of machines must be at least 2",
        variant: "destructive"
      });
      return;
    }

    if (jobs < 2) {
      toast({
        title: "Invalid Input",
        description: "Number of jobs must be at least 2",
        variant: "destructive"
      });
      return;
    }

    if (!processingTimes.trim()) {
      toast({
        title: "Invalid Input",
        description: "Processing times cannot be empty",
        variant: "destructive"
      });
      return;
    }

    // Parse processing times
    try {
      // Just do basic validation, not actually parsing the full matrix
      const lines = processingTimes.trim().split("\n");
      if (lines.length !== jobs) {
        throw new Error(`Expected ${jobs} rows of data`);
      }

      onSubmit({
        machines,
        jobs,
        processingTimes
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Invalid Input",
        description: error instanceof Error ? error.message : "Invalid processing times format",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Submit Problem Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="machines">Number of machines</Label>
              <Input 
                id="machines" 
                type="number" 
                value={machines} 
                onChange={(e) => setMachines(parseInt(e.target.value) || 0)}
                min={2}
                max={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobs">Number of jobs</Label>
              <Input 
                id="jobs" 
                type="number" 
                value={jobs} 
                onChange={(e) => setJobs(parseInt(e.target.value) || 0)}
                min={2}
                max={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="processingTimes">Problem Data</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateRandom}
              >
                Generate Random Data
              </Button>
            </div>
            <Textarea 
              id="processingTimes"
              value={processingTimes}
              onChange={(e) => setProcessingTimes(e.target.value)}
              placeholder="Enter processing times (space-separated values, one job per line)"
              className="font-mono h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Enter processing times as space-separated integers, with each line representing a job
              and each value representing the processing time on a machine.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="default"
            onClick={handleSubmit}
            className="w-full sm:w-auto"
          >
            Add Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { GanttChart, Operation } from "./gantt-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { JobSequence } from "./job-sequence";

// Interface for the solution data
export interface SolutionResult {
  solver: string;
  makespan: number;
  schedule: Operation[];
  logs: string[];
  numJobs: number;
  executionTime: number;
  jobSequence: number[];
  quboType?: string;  // Add this field
}

interface ResultPanelProps {
  result: SolutionResult;
  showConflicts?: boolean;
}

export function ResultPanel({ result, showConflicts = false }: ResultPanelProps) {
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  
  const { solver, makespan, schedule, logs, numJobs, executionTime, jobSequence, quboType } = result;
  
  return (
    <div className="space-y-4">
      <JobSequence 
        sequence={jobSequence || Array.from({ length: numJobs }, (_, i) => i + 1)} 
        makespan={makespan} 
        executionTime={executionTime}
      />
      
      <div className="flex items-center gap-2 ml-[0.5cm]">
        {solver.includes("Classical") ? (
          <Badge
            variant="secondary"
            className="text-[1rem] bg-blue-100 text-blue-800"
          >
            NEH-based Heuristic
          </Badge>
        ) : (
          <>
            <div className="text-lg font-semibold">QUBO Type:</div>
            {quboType && (
              <Badge
                variant="secondary"
                className="text-[1rem] bg-blue-100 text-blue-800 "
              >
                {quboType}
              </Badge>
            )}
          </>
        )}
      </div>

      
      <GanttChart
        title={`${solver} Schedule`}
        operations={schedule}
        jobs={numJobs}
        totalMakespan={makespan}
        showConflicts={showConflicts}
      />
      
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Solution Details</CardTitle>
          <CardDescription>
            Execution Time: {executionTime.toFixed(2)}s
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Collapsible
            open={isLogsOpen}
            onOpenChange={setIsLogsOpen}
            className="space-y-2"
          >
            <div className="flex items-center justify-between space-x-4">
              <h4 className="text-sm font-semibold">
                Solution Logs
              </h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isLogsOpen ? "rotate-180" : ""
                    }`}
                  />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2">
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <div className="font-mono text-xs whitespace-pre-wrap">
                  {logs.map((log, index) => (
                    <div key={index} className="py-1">
                      {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}

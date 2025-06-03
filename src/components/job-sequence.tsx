
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JobSequenceProps {
  sequence: number[];
  makespan: number;
  executionTime: number;
}

export function JobSequence({ sequence, makespan, executionTime }: JobSequenceProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Optimal Solution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Optimal Makespan</div>
            <div className="text-xl font-mono font-semibold">{makespan}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Running Time</div>
            <div className="text-xl font-mono font-semibold">{executionTime.toFixed(2)}s</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Jobs Processed</div>
            <div className="text-xl font-mono font-semibold">{sequence.length}</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-muted-foreground">Optimal Job Sequence</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {sequence.map((jobId, index) => (
              <div
                key={index}
                className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 text-primary font-mono text-sm rounded"
              >
                {jobId}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Interface for job data
export interface JobMatrix {
  jobs: number;
  machines: number;
  processingTimes: number[][];
}

interface JobMatrixProps {
  data: JobMatrix;
}

export function JobMatrix({ data }: JobMatrixProps) {
  const { jobs, machines, processingTimes } = data;
  
  // Calculate total processing time per job
  const totalProcessingTimes = processingTimes.map(jobTimes => 
    jobTimes.reduce((sum, time) => sum + time, 0)
  );
  
  // Calculate average processing time per job
  const avgProcessingTime = totalProcessingTimes.reduce((sum, time) => sum + time, 0) / jobs;
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Job-Operation Processing Times</CardTitle>
        <CardDescription>
          {jobs} Jobs × {machines} Machines | Average processing time: {avgProcessingTime.toFixed(1)} units
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Job</TableHead>
                {Array.from({ length: machines }).map((_, i) => (
                  <TableHead key={i} className="text-center">M{i+1}</TableHead>
                ))}
                <TableHead className="text-center">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: jobs }).map((_, jobIndex) => (
                <TableRow key={jobIndex}>
                  <TableCell className="font-medium">Job {jobIndex+1}</TableCell>
                  {Array.from({ length: machines }).map((_, machineIndex) => (
                    <TableCell key={machineIndex} className="text-center font-mono">
                      {processingTimes[jobIndex][machineIndex]}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-medium">
                    {totalProcessingTimes[jobIndex]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

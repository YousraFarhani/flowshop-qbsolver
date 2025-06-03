
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";

interface QUBOComparisonProps {
  data: {
    qubo: string;
    solver: string;
    makespan: number;
    lbGap: number;
    runtime: number;
    feasible: boolean;
    type?: string; // Added type field to distinguish manual vs automated
  }[];
  instanceName?: string; // Add this prop
}

export function QUBOComparisonChart({ data, instanceName }: QUBOComparisonProps) {
  const [chartType, setChartType] = useState<"formulation" | "approach">("formulation");
  const [animate, setAnimate] = useState(false);
  const { theme } = useTheme();
  
  // Process data for charts
  const processedData = data.map(item => ({
    ...item,
    // Normalize values for better visualization
    normalizedMakespan: 100 - ((item.makespan - Math.min(...data.map(d => d.makespan))) / 
      (Math.max(...data.map(d => d.makespan)) - Math.min(...data.map(d => d.makespan)) || 1)) * 100,
    normalizedRuntime: 100 - ((item.runtime - Math.min(...data.map(d => d.runtime))) / 
      (Math.max(...data.map(d => d.runtime)) - Math.min(...data.map(d => d.runtime)) || 1)) * 100,
    name: item.qubo,
    formulation: item.qubo
  }));
  
  // Get best-performing QUBO for each solver
  const solvers = Array.from(new Set(data.map(item => item.solver)));
  const bestQUBOs = solvers.map(solver => {
    const solverData = data.filter(item => item.solver === solver);
    const bestQUBO = solverData.reduce((best, current) => 
      (current.makespan < best.makespan) ? current : best, solverData[0]);
    return {
      solver,
      bestQubo: bestQUBO.qubo,
      makespan: bestQUBO.makespan
    };
  });
  
  // Trigger animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  
  // Generate bar data grouped by QUBO formulation
  // Filter out D-Wave QBSolv data
  const filteredData = data.filter(item => item.solver !== "D-Wave QBSolv");
  const uniqueQUBOs = Array.from(new Set(filteredData.map(item => item.qubo)));
  
  const barData = [];
  
  // First add other QUBOs with D-Wave LeapHybrid and InfinityQ TitanQ bars only
  // Exclude any QUBO that only has Classical Solver data
  const otherQUBOs = uniqueQUBOs.filter(qubo => {
    const quboItems = filteredData.filter(item => item.qubo === qubo);
    // Only include QUBOs that have quantum solver data AND exclude classical-only QUBOs
    const hasQuantumData = quboItems.some(item => item.solver === "D-Wave LeapHybrid" || item.solver === "InfinityQ TitanQ");
    const hasOnlyClassical = quboItems.every(item => item.solver === "Classical Solver");
    return hasQuantumData && !hasOnlyClassical;
  });
  
  otherQUBOs.forEach(qubo => {
    const quboItems = filteredData.filter(item => item.qubo === qubo && item.solver !== "Classical Solver");
    const result = { name: qubo };
    
    // Add only quantum solvers for other QUBOs
    const leapHybridItem = quboItems.find(item => item.solver === "D-Wave LeapHybrid");
    const titanQItem = quboItems.find(item => item.solver === "InfinityQ TitanQ");
    
    if (leapHybridItem) {
      // @ts-ignore
      result["D-Wave LeapHybrid"] = leapHybridItem.makespan;
    }
    if (titanQItem) {
      // @ts-ignore
      result["InfinityQ TitanQ"] = titanQItem.makespan;
    }
    barData.push(result);
  });
  
  // Then add NEH-enhanced at the end as a standalone QUBO with only Classical Solver
  const nehData = filteredData.filter(item => item.solver === "Classical Solver");
  if (nehData.length > 0) {
    barData.push({
      name: "NEH-enhanced",
      "Classical Solver": nehData[0].makespan
    });
  }
  
  // Generate data for manual vs automated comparison
  const approachData = [
    {
      name: "Manual QUBO",
      "D-Wave LeapHybrid": data.find(item => 
        item.solver === "D-Wave LeapHybrid" && item.qubo === "Stinson & Smith-2")?.makespan || 0,
      "InfinityQ TitanQ": data.find(item => 
        item.solver === "InfinityQ TitanQ" && item.qubo === "Stinson & Smith-2")?.makespan || 0,
    },
    {
      name: "Automated QUBO",
      "D-Wave QBSolv": data.find(item => 
        item.solver === "D-Wave QBSolv" && item.qubo === "Automated")?.makespan || 0,
      "InfinityQ TitanQ": data.find(item => 
        item.solver === "InfinityQ TitanQ" && item.qubo === "Position-based")?.makespan || 0,
    }
  ];
  
  // Colors for solvers
  const solverColors = {
    "D-Wave QBSolv": "#DA6935", // quantum-indigo
    "D-Wave LeapHybrid": "#8B5CF6", // quantum-purple
    "InfinityQ TitanQ": "#14B8A6", // quantum-teal
    "Classical Solver": "#1F79C8" // gray-500
  };

  // Define text color based on theme
  const textColor = theme === "dark" ? "#FFFFFF" : "#000000";

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>QUBO Formulation Comparison</CardTitle>
            <CardDescription className="mt-2">
              Performance metrics across different QUBO formulations
              {instanceName && (
                <span className="block mt-1 font-medium text-primary">
                  Instance: {instanceName.toUpperCase()}
                </span>
              )}
            </CardDescription>
          </div>
          <Tabs value={chartType} onValueChange={v => setChartType(v as "formulation" | "approach")}>
            <TabsList>
              <TabsTrigger value="formulation">By Formulation</TabsTrigger>
              <TabsTrigger value="approach">Manual vs Automated</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div 
            className="h-[400px] transition-opacity duration-500"
            style={{ opacity: animate ? 1 : 0 }}
          >
            {chartType === "formulation" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 30, left: 50, bottom: 70 }}
                  barGap={10}
                  barCategoryGap={30}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={0} 
                    textAnchor="end" 
                    height={70}
                    interval={0}
                    tickMargin={15}
                    tick={{ dx: 50, fill: textColor }}
                    stroke={textColor}
                  />
                  <YAxis 
                    label={{ value: 'Makespan', angle: -90, position: 'insideLeft', offset: -20, fill: textColor }} 
                    tickMargin={15}
                    tick={{ fill: textColor }}
                    stroke={textColor}
                  />
                  <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff", color: textColor, borderColor: theme === "dark" ? "#334155" : "#e2e8f0" }} />
                  <Legend wrapperStyle={{ color: textColor }} />
                  {/* Only render the specific bars we need without duplication */}
                  <Bar 
                    dataKey="D-Wave LeapHybrid" 
                    name="D-Wave LeapHybrid" 
                    fill={solverColors["D-Wave LeapHybrid"]} 
                    isAnimationActive={animate}
                    animationDuration={1000}
                    animationBegin={300}
                    animationEasing="ease-out"
                  />
                  <Bar 
                    dataKey="InfinityQ TitanQ" 
                    name="InfinityQ TitanQ" 
                    fill={solverColors["InfinityQ TitanQ"]} 
                    isAnimationActive={animate}
                    animationDuration={1000}
                    animationBegin={400}
                    animationEasing="ease-out"
                  />
                  <Bar 
                    dataKey="Classical Solver" 
                    name="Classical Solver (NEH-enhanced)" 
                    fill={solverColors["Classical Solver"]} 
                    isAnimationActive={animate}
                    animationDuration={1000}
                    animationBegin={500}
                    animationEasing="ease-out"
                  />
                
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={approachData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    interval={0}
                    tick={{ fill: textColor }}
                    stroke={textColor}
                  />
                  <YAxis 
                    label={{ value: 'Makespan', angle: -90, position: 'insideLeft', offset: -10, fill: textColor }} 
                    tick={{ fill: textColor }}
                    stroke={textColor}
                  />
                  <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff", color: textColor, borderColor: theme === "dark" ? "#334155" : "#e2e8f0" }} />
                  <Legend wrapperStyle={{ color: textColor }} />
                  <Bar 
                    dataKey="D-Wave LeapHybrid" 
                    name="D-Wave LeapHybrid (Manual)" 
                    fill={solverColors["D-Wave LeapHybrid"]} 
                    isAnimationActive={animate}
                    animationDuration={1000}
                    animationBegin={300}
                    animationEasing="ease-out"
                  />
                  <Bar 
                    dataKey="D-Wave QBSolv" 
                    name="D-Wave QBSolv (Automated)" 
                    fill={solverColors["D-Wave QBSolv"]} 
                    isAnimationActive={animate}
                    animationDuration={1000}
                    animationBegin={400}
                    animationEasing="ease-out"
                  />
                  <Bar 
                    dataKey="InfinityQ TitanQ" 
                    name="InfinityQ TitanQ" 
                    fill={solverColors["InfinityQ TitanQ"]} 
                    isAnimationActive={animate}
                    animationDuration={1000}
                    animationBegin={500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Best Performance per Solver (Makespan)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {bestQUBOs.map((item) => (
                <Card key={item.solver} className="border-dashed">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">{item.solver}</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="space-y-1">
                      {(item.solver === "D-Wave LeapHybrid" || item.solver === "InfinityQ TitanQ") && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Best QUBO:</span>
                          <span className="font-medium">{item.bestQubo}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Makespan:</span>
                        <span className="font-medium">{item.makespan}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

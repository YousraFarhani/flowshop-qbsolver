import React, { useState, useRef, useEffect } from "react";
import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Customized,
  Rectangle,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";

// -- TYPES --
export type OperationType = "lift" | "load" | "unload" | "process";
export interface Operation {
  id: string;
  jobId: number;
  type: OperationType;
  startTime: number;
  endTime: number;
  machineId: number;
}

interface GanttChartProps {
  title: string;
  operations: Operation[];
  jobs: number;
  totalMakespan: number;
  showConflicts?: boolean;  // Add this optional prop
}

export function GanttChart({ title, operations, jobs, totalMakespan, showConflicts = false }: GanttChartProps) {
  const { theme } = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  const [zoomDomain, setZoomDomain] = useState<[number, number]>([0, totalMakespan]);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [hoveredOp, setHoveredOp] = useState<Operation | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setZoomDomain([0, totalMakespan]);
    setZoomLevel(100);
  }, [totalMakespan]);

  const numMachines = Math.max(...operations.map((o) => o.machineId)) + 1;
  const machines = Array.from({ length: numMachines }, (_, i) => i);

  const barHeight = 60;
  const machineSpacing = 15;  // vertical spacing
  const containerHeight = numMachines * (barHeight + machineSpacing) + 120;

  // Matte color palette
  // Enhanced color palette for better dark mode visibility
  const jobColors = Array.from({ length: jobs }, (_, i) =>
    `hsl(${(i * 360) / jobs}, 70%, ${theme === 'dark' ? '60%' : '70%'})`
  );

  const exportPNG = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current);
      const png = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = png;
      link.download = `${title.replace(/\s+/g, "_")}.png`;
      link.click();
      toast({ title: "Exported PNG", description: "Gantt chart downloaded." });
    } catch {
      toast({ title: "Failed", description: "Could not export.", variant: "destructive" });
    }
  };

  // Zoom only to the right (keep left at 0)
  const applyZoom = (newLevel: number) => {
    const maxVisible = totalMakespan * (newLevel / 100);
    setZoomDomain([0, maxVisible]);
  };
  const handleZoomIn = () => {
    const nl = Math.max(20, zoomLevel - 10);
    setZoomLevel(nl);
    applyZoom(nl);
  };
  const handleZoomOut = () => {
    const nl = Math.min(100, zoomLevel + 10);
    setZoomLevel(nl);
    applyZoom(nl);
  };
  const handleSlider = (vals: number[]) => {
    const nl = vals[0];
    setZoomLevel(nl);
    applyZoom(nl);
  };

  // horizontal gap between jobs (px)
  const jobGap = 0;

  return (
    <Card className="w-full max-w-full">
  
  <CardHeader className="flex flex-col space-y-2">
    {/* Row 1: the title */}
    <CardTitle className="text-lg font-semibold">
      {title}
    </CardTitle>

    {/* Row 2: controls, spaced left/right */}
    <div className="flex justify-between items-center w-full">
      {/* left side: makespan + export */}
      <div className="flex items-center space-x-4">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-4 py-1 text-sm dark:text-white">
          Makespan: {totalMakespan}
        </div>
        <Button
          variant="outline"
          onClick={exportPNG}
          className="whitespace-nowrap"
        >
          Export PNG
          <Download className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* right side: zoom controls */}
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          –
        </Button>
        <Slider
          value={[zoomLevel]}
          min={20}
          max={100}
          step={1}
          onValueChange={handleSlider}
          className="w-24"
        />
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          +
        </Button>
        <span className="text-sm font-medium">
          {zoomLevel}%
        </span>
      </div>
    </div>
  </CardHeader>


      <CardContent>
        <div ref={chartRef} className="w-full relative" style={{ height: containerHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={machines.map((m) => ({ machineId: m }))}
              layout="vertical"
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid 
                vertical 
                horizontal={false} 
                strokeDasharray="3 3" 
                className="dark:opacity-30"
              />
              <XAxis
                type="number"
                domain={zoomDomain}
                label={{ value: "Time", position: "bottom", style: { fill: theme === 'dark' ? '#fff' : '#000' } }}
                tick={{ fill: theme === 'dark' ? '#fff' : '#000' }}
                stroke={theme === 'dark' ? '#fff' : '#000'}
              />
              <YAxis
                dataKey="machineId"
                type="category"
                allowDuplicatedCategory={false}
                tickFormatter={(v) => `Machine ${v}`}
                width={90}
                style={{ marginBottom: machineSpacing }}
                label={{ 
                  value: "Machines", 
                  angle: -90, 
                  position: "left", 
                  offset: 15,
                  style: { fill: theme === 'dark' ? '#fff' : '#000' } 
                }}
                tick={{ fill: theme === 'dark' ? '#fff' : '#000' }}
                stroke={theme === 'dark' ? '#fff' : '#000'}
              />
              <Customized
                component={({ xAxisMap, yAxisMap }) => {
                  const xScale = xAxisMap[0].scale;
                  const yScale = yAxisMap[0].scale;
                  return operations.map((op) => {
                    const x = xScale(op.startTime) + jobGap / 2;
                    const w = xScale(op.endTime) - xScale(op.startTime) - jobGap;
                    const cy = yScale(op.machineId);
                    return (
                      <Rectangle
                        key={op.id}
                        x={x}
                        y={cy - barHeight / 2}
                        width={Math.max(0, w)}
                        height={barHeight}
                        fill={jobColors[op.jobId]}
                        stroke={theme === 'dark' ? '#555' : '#333'}
                        strokeWidth={1.5}
                        rx={4}
                        ry={4}
                        className="dark:shadow-lg"
                        onMouseEnter={() => {
                          setHoveredOp(op);
                          setTooltipPos({ x: x + w / 2, y: cy - barHeight / 2 });
                        }}
                        onMouseLeave={() => setHoveredOp(null)}
                      />
                    );
                  });
                }}
              />
            </BarChart>
          </ResponsiveContainer>

          {hoveredOp && tooltipPos && (
            <div
              className="absolute p-2 rounded shadow border text-xs pointer-events-none z-10 bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y - 10,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div><strong>Job {hoveredOp.jobId + 1}</strong></div>
              <div>Start: {hoveredOp.startTime}</div>
              <div>End: {hoveredOp.endTime}</div>
            </div>
          )}
        </div>

      
      </CardContent>
    </Card>
  );
}

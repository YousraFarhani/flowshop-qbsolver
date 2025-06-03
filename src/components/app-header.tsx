
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChartGantt, Home, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AppHeaderProps {
  activeTab: string;
  results: {
    quantum: any | null;
    classical: any | null;
    infinityq: any | null;
  };
  showConflicts?: boolean;
  setShowConflicts?: (show: boolean) => void;
}

export function AppHeader({ 
  activeTab, 
  results,
  showConflicts = false,
  setShowConflicts = () => {}
}: AppHeaderProps) {
  const [isConflictToggleVisible, setIsConflictToggleVisible] = useState(false);
  
  // Update conflict toggle visibility when tab or results change
  useEffect(() => {
    setIsConflictToggleVisible(
      activeTab !== "input" && 
      activeTab !== "comparison" && 
      (results.quantum !== null || results.classical !== null || results.infinityq !== null)
    );
  }, [activeTab, results]);

  return (
    <div className="h-16 border-b px-4 flex items-center justify-between bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <ChartGantt size={24} className="text-quantum-indigo" />
          <span className="font-semibold text-lg whitespace-nowrap">
            FlowShop Qbsolver
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {isConflictToggleVisible && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                  <Switch 
                    id="conflict-toggle" 
                    checked={showConflicts} 
                    onCheckedChange={setShowConflicts}
                  />
                  <Label htmlFor="conflict-toggle" className="cursor-pointer text-sm">
                    Show Conflicts
                  </Label>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Highlight operations that have scheduling conflicts</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <Home className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Home</span>
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

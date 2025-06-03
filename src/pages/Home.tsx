
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChartGantt, LayoutDashboard, Info, CircleCheck, Atom, BrainCircuit, CircuitBoard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { FlowShopSimulation } from "@/components/flow-shop-simulation";

export default function Home() {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const quantumGridRef = useRef<HTMLDivElement>(null);
  
  const handleNavigate = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
    
    // Mouse movement effect for quantum grid
    const handleMouseMove = (e: MouseEvent) => {
      if (quantumGridRef.current) {
        const rect = quantumGridRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col">
      {/* Quantum Circuit Background Overlay */}
      <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-full quantum-circuit">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background"></div>
        </div>
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="qubit absolute rounded-full"
            style={{
              width: `${Math.random() * 60 + 20}px`,
              height: `${Math.random() * 60 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 15}s infinite ease-in-out, pulse-glow ${Math.random() * 3 + 2}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.6,
              background: `radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, rgba(51, 195, 240, 0) 70%)`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="container mx-auto py-8 px-4 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 relative group">
            <ChartGantt size={32} className="text-quantum-indigo group-hover:text-quantum-cyan transition-colors duration-300" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-quantum-indigo to-quantum-cyan bg-clip-text text-transparent relative">
              FlowShop Qbsolver
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-quantum-indigo to-quantum-cyan transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </h1>
            <div className="absolute -inset-2 bg-gradient-to-r from-quantum-indigo/20 to-quantum-cyan/20 rounded-lg blur opacity-0 group-hover:opacity-70 transition-opacity"></div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" onClick={handleNavigate} className="group relative overflow-hidden border border-quantum-indigo/30">
              <div className="absolute inset-0 bg-gradient-to-r from-quantum-indigo/10 to-quantum-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">Go to Dashboard</span>
              <ArrowRight className="ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute -inset-1 bg-gradient-to-r from-quantum-indigo/20 to-quantum-cyan/20 rounded-full blur opacity-0 group-hover:opacity-70 transition-opacity"></div>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Hero Section with Interactive Quantum Circuit Background */}
          <section className={`relative text-center space-y-6 py-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Quantum Circuit Background */}
            <div className="absolute inset-0 overflow-hidden -z-10" ref={quantumGridRef}>
              <div className="absolute w-full h-full opacity-20">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="circuit" width="100" height="100" patternUnits="userSpaceOnUse">
                      <path d="M0 50 H100 M50 0 V100" stroke="url(#grad)" strokeWidth="1" fill="none" />
                      <circle cx="50" cy="50" r="5" fill="url(#grad)" opacity="0.8" />
                      <circle cx="0" cy="50" r="5" fill="url(#grad)" opacity="0.8" />
                      <circle cx="100" cy="50" r="5" fill="url(#grad)" opacity="0.8" />
                      <circle cx="50" cy="0" r="5" fill="url(#grad)" opacity="0.8" />
                      <circle cx="50" cy="100" r="5" fill="url(#grad)" opacity="0.8" />
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--quantum-indigo)" />
                        <stop offset="100%" stopColor="var(--quantum-cyan)" />
                      </linearGradient>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#circuit)" />
                </svg>
              </div>
              {/* Interactive glowing point that follows mouse */}
              <div 
                className="absolute w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(51, 195, 240, 0) 70%)',
                  left: `${mousePosition.x}%`,
                  top: `${mousePosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  filter: 'blur(10px)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
            </div>

            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight relative">
              Quantum-Powered <br />
              <span className="bg-gradient-to-r from-quantum-indigo to-quantum-cyan bg-clip-text text-transparent">
                Flow Shop Scheduling
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Optimize manufacturing processes with advanced quantum and classical algorithms.
              Minimize makespan and maximize production efficiency.
            </p>
            <div className="pt-4">
              <Button size="lg" onClick={handleNavigate} className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-quantum-indigo to-quantum-cyan"></div>
                <span className="relative z-10 text-white font-medium">Launch Optimizer</span>
                <ArrowRight className="ml-2 relative z-10 text-white group-hover:translate-x-1 transition-transform" />
                <div className="absolute -inset-1 bg-gradient-to-r from-quantum-indigo/50 to-quantum-cyan/50 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            </div>
            
            {/* Animated Qubits */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
              {Array.from({ length: 15 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full bg-quantum-indigo/30 backdrop-blur-sm"
                  style={{
                    width: `${Math.random() * 60 + 20}px`,
                    height: `${Math.random() * 60 + 20}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${Math.random() * 10 + 15}s infinite ease-in-out`,
                    animationDelay: `${Math.random() * 5}s`
                  }}
                />
              ))}
            </div>
          </section>
          
          {/* What is Flow Shop Scheduling */}
          <section className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="lg:w-1/2 space-y-4">
                <Badge variant="outline" className="bg-quantum-indigo/10 text-quantum-indigo border-quantum-indigo/20">
                  Flow Shop Scheduling
                </Badge>
                <h3 className="text-3xl font-bold">Optimizing Production Processes</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Flow Shop Scheduling is a classic manufacturing optimization problem where n jobs must be processed 
                  on m machines in the same order. The goal is to find the sequence of jobs that minimizes the total 
                  completion time (makespan).
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 group">
                    <CircleCheck className="h-5 w-5 text-quantum-teal shrink-0 mt-0.5 group-hover:text-quantum-cyan transition-colors" />
                    <p className="text-sm group-hover:text-quantum-cyan/90 transition-colors">Traditional methods struggle with large-scale scheduling problems</p>
                  </div>
                  <div className="flex items-start gap-2 group">
                    <CircleCheck className="h-5 w-5 text-quantum-teal shrink-0 mt-0.5 group-hover:text-quantum-cyan transition-colors" />
                    <p className="text-sm group-hover:text-quantum-cyan/90 transition-colors">Quantum computing offers exponential speed improvements</p>
                  </div>
                  <div className="flex items-start gap-2 group">
                    <CircleCheck className="h-5 w-5 text-quantum-teal shrink-0 mt-0.5 group-hover:text-quantum-cyan transition-colors" />
                    <p className="text-sm group-hover:text-quantum-cyan/90 transition-colors">QUBO formulation makes it perfect for quantum annealing</p>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <Card className="overflow-hidden border-quantum-indigo/20 shadow-lg backdrop-blur-sm bg-background/80 relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-quantum-indigo/5 to-quantum-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader className="pb-0 relative z-10">
                    <CardTitle className="text-lg">Flow Shop Simulation</CardTitle>
                    <CardDescription>3 jobs × 3 machines</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 relative z-10">
                    <FlowShopSimulation jobs={3} machines={3} />
                  </CardContent>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-quantum-indigo/20 to-quantum-cyan/20 rounded-lg blur opacity-0 group-hover:opacity-70 transition-opacity"></div>
                </Card>
              </div>
            </div>
          </section>
          
          {/* Quantum Computing Section */}
          <section className={`transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="lg:w-1/2">
                <div className="relative rounded-xl overflow-hidden border border-quantum-indigo/20 shadow-lg group">
                  <div className="absolute inset-0 bg-gradient-to-br from-quantum-indigo/20 to-quantum-cyan/20 mix-blend-overlay group-hover:opacity-70 transition-opacity"></div>
                  <img 
                    src="/QC.png" 
                    alt="Quantum Computer" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-4">
                    <p className="text-xs text-muted-foreground">Quantum Computer</p>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2 space-y-4">
                <Badge variant="outline" className="bg-quantum-purple/10 text-quantum-purple border-quantum-purple/20">
                  Quantum Advantage
                </Badge>
                <h3 className="text-3xl font-bold">Why Quantum Computing?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Quantum computing leverages quantum mechanical phenomena to process information in ways 
                  classical computers cannot. For complex optimization problems like flow shop scheduling, 
                  quantum computing offers a significant advantage.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our platform integrates D-Wave's quantum annealers and InfinityQ's quantum-inspired 
                  technology to solve these NP-hard problems more efficiently than classical methods alone.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="relative rounded-lg overflow-hidden border border-quantum-indigo/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-quantum-indigo/20 to-quantum-cyan/20 mix-blend-overlay"></div>
                    <a href="https://www.dwavesys.com/" target="_blank" rel="noopener noreferrer" className="relative p-4 block">
                      <img 
                        src="/DWave.png" 
                        alt="D-Wave Systems" 
                        className="h-8 object-contain relative z-10" 
                      />
                    </a>
                  </div>
                  <div className="relative rounded-lg overflow-hidden border border-quantum-indigo/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-quantum-indigo/20 to-quantum-cyan/20 mix-blend-overlay"></div>
                    <a href="https://infinityq.com/" target="_blank" rel="noopener noreferrer" className="relative p-4 block">
                      <img 
                        src="/infinityq.png" 
                        alt="InfinityQ" 
                        className="h-8 w-auto object-contain relative z-10" 
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className={`space-y-8 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-2xl font-semibold text-center">Supported Solvers & Technologies</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-primary/10 group"
                onMouseEnter={() => setIsHovering('quantum')}
                onMouseLeave={() => setIsHovering(null)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-quantum-indigo/10 to-quantum-cyan/10 transition-opacity duration-300 ${isHovering === 'quantum' ? 'opacity-100' : 'opacity-0'}`}></div>
                <CardHeader className="pb-2 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="h-5 w-5 text-quantum-indigo" />
                      <div>
                        <CardTitle>Quantum Hybrid Solvers</CardTitle>
                        <CardDescription>Leverage quantum computing power</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 hover:bg-quantum-indigo/5 p-1 rounded-md transition-colors">
                      <div className="w-2 h-2 rounded-full bg-quantum-indigo"></div>
                      <span>D-Wave QBSolv</span>
                      <Badge variant="outline" className="ml-2 text-xs border-quantum-indigo/30 text-quantum-indigo">QUBO</Badge>
                    </li>
                    <li className="flex items-center gap-2 hover:bg-quantum-purple/5 p-1 rounded-md transition-colors">
                      <div className="w-2 h-2 rounded-full bg-quantum-purple"></div>
                      <span>D-Wave LeapHybrid</span>
                      <Badge variant="outline" className="ml-2 text-xs border-quantum-purple/30 text-quantum-purple">Hybrid</Badge>
                    </li>
                    <li className="flex items-center gap-2 hover:bg-quantum-teal/5 p-1 rounded-md transition-colors">
                      <div className="w-2 h-2 rounded-full bg-quantum-teal"></div>
                      <span>InfinityQ TitanQ</span>
                      <Badge variant="outline" className="ml-2 text-xs border-quantum-teal/30 text-quantum-teal">Quantum Inspired</Badge>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="relative z-10">
                  <div className="text-sm text-muted-foreground">
                    Advanced optimization for complex schedules
                  </div>
                </CardFooter>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-quantum-indigo/20 to-quantum-cyan/20 rounded-lg blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
              </Card>
              
              <Card 
                className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-primary/10 group"
                onMouseEnter={() => setIsHovering('classical')}
                onMouseLeave={() => setIsHovering(null)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 transition-opacity duration-300 ${isHovering === 'classical' ? 'opacity-100' : 'opacity-0'}`}></div>
                <CardHeader className="pb-2 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CircuitBoard className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle>Classical Solver</CardTitle>
                        <CardDescription>NEH-Based Heuristic</CardDescription>
                      </div>
                    </div>
                    <div>
                      <Badge variant="secondary">CPU-Based</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 hover:bg-primary/5 p-1 rounded-md transition-colors">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>NEH Insertion</span>
                      <Badge variant="outline" className="ml-2 text-xs">Heuristic</Badge>
                    </li>
                    <li className="flex items-center gap-2 hover:bg-accent/5 p-1 rounded-md transition-colors">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <span>Pairwise-Swap Local Search</span>
                      <Badge variant="outline" className="ml-2 text-xs">Local Search</Badge>
                    </li>
                    <li className="flex items-center gap-2 hover:bg-secondary-foreground/5 p-1 rounded-md transition-colors">
                      <div className="w-2 h-2 rounded-full bg-secondary-foreground"></div>
                      <span>Iterated Greedy (IG)</span>
                      <Badge variant="outline" className="ml-2 text-xs">Metaheuristic</Badge>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="relative z-10">
                  <div className="text-sm text-muted-foreground">
                    Reliable performance for standard problems
                  </div>
                </CardFooter>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
              </Card>
            </div>
          </section>
          
          {/* Call to Action */}
          <section className={`text-center space-y-6 py-8 transition-all duration-700 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl font-bold">
              Ready to optimize your scheduling?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Compare quantum and classical approaches side by side with our interactive Gantt visualization.
            </p>
            <div className="pt-4">
              <Button onClick={handleNavigate} className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-quantum-indigo to-quantum-cyan"></div>
                <LayoutDashboard className="mr-2 relative z-10 text-white" />
                <span className="relative z-10 text-white font-medium">Open Dashboard</span>
                <ArrowRight className="ml-2 relative z-10 text-white group-hover:translate-x-1 transition-transform" />
                <div className="absolute -inset-1 bg-gradient-to-r from-quantum-indigo/50 to-quantum-cyan/50 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            </div>
          </section>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="container mx-auto py-8 px-4 border-t border-quantum-indigo/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ChartGantt size={20} className="text-quantum-indigo" />
            <span className="text-muted-foreground">
              FlowShop Qbsolver © {new Date().getFullYear()}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            A quantum-powered flow shop scheduling optimizer
          </div>
          <div className="text-sm text-muted-foreground">
            Realised by: Yousra Farhani
          </div>
        </div>
      </footer>

      {/* Add CSS keyframes for animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.6;
            filter: blur(5px);
          }
          50% {
            opacity: 1;
            filter: blur(10px);
          }
        }
        
        .shadow-glow {
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
}

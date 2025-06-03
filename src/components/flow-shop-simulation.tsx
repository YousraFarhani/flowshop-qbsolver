
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface FlowShopSimulationProps {
  jobs: number;
  machines: number;
}

type JobState = {
  jobId: number;
  machineId: number;
  progress: number;
  duration: number;
  completed: boolean;
}

export function FlowShopSimulation({ jobs = 3, machines = 3 }: FlowShopSimulationProps) {
  const [jobStates, setJobStates] = useState<JobState[]>([]);
  const [running, setRunning] = useState(true);
  const [time, setTime] = useState(0);
  
  // Generate random processing times between 10 and 30
  const randomDuration = () => Math.floor(Math.random() * 20) + 10;
  
  // Initialize job states
  useEffect(() => {
    const initialStates: JobState[] = [];
    for (let j = 0; j < jobs; j++) {
      initialStates.push({
        jobId: j,
        machineId: 0, // All jobs start at machine 0
        progress: 0,
        duration: randomDuration(),
        completed: false
      });
    }
    setJobStates(initialStates);
  }, [jobs, machines]);
  
  // Animation loop
  useEffect(() => {
    if (!running) return;
    
    const interval = setInterval(() => {
      setTime(prevTime => prevTime + 1);
      
      setJobStates(prevStates => {
        const newStates = [...prevStates];
        
        // Update each job
        for (let i = 0; i < newStates.length; i++) {
          const job = newStates[i];
          
          // Skip completed jobs
          if (job.completed) continue;
          
          // Update progress for current machine
          job.progress += 1;
          
          // Check if job completed current machine
          if (job.progress >= job.duration) {
            // Move to next machine or mark as complete
            if (job.machineId < machines - 1) {
              job.machineId += 1;
              job.progress = 0;
              job.duration = randomDuration();
            } else {
              job.completed = true;
            }
          }
        }
        
        // Check if all jobs completed
        if (newStates.every(job => job.completed)) {
          setRunning(false);
          
          // Reset after a delay
          setTimeout(() => {
            const resetStates: JobState[] = [];
            for (let j = 0; j < jobs; j++) {
              resetStates.push({
                jobId: j,
                machineId: 0,
                progress: 0,
                duration: randomDuration(),
                completed: false
              });
            }
            setJobStates(resetStates);
            setRunning(true);
            setTime(0);
          }, 2000);
        }
        
        return newStates;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [running, jobs, machines]);
  
  // Colors for jobs with quantum theme
  const jobColors = [
    "bg-quantum-indigo",
    "bg-quantum-purple",
    "bg-quantum-teal"
  ];
  
  // Particle effects for quantum visualization
  const [particles, setParticles] = useState<{ x: number, y: number, size: number, opacity: number, direction: number }[]>([]);
  
  useEffect(() => {
    // Create initial particles
    const initialParticles = Array.from({ length: 15 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.2,
      direction: Math.random() > 0.5 ? 1 : -1
    }));
    setParticles(initialParticles);
    
    // Animate particles
    const particleInterval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: (particle.x + particle.direction * 0.2) % 100,
          y: (particle.y + Math.sin(particle.x / 10) * 0.1) % 100,
          opacity: 0.2 + Math.sin(particle.x / 20) * 0.3
        }))
      );
    }, 50);
    
    return () => clearInterval(particleInterval);
  }, []);
  
  return (
    <div className="p-4 bg-card relative overflow-hidden">
      {/* Quantum particle effects */}
      {particles.map((particle, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-quantum-indigo/30"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            top: `${particle.y}%`,
            left: `${particle.x}%`,
            opacity: particle.opacity,
            filter: "blur(1px)"
          }}
        />
      ))}
      
      <div className="mb-4 flex justify-between items-center relative z-10">
        <div className="text-sm font-medium">Simulation Time: {time}</div>
        <div className="flex gap-4">
          {Array.from({ length: jobs }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${jobColors[i % jobColors.length]}`}></div>
              <span className="text-xs">Job {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4 relative z-10">
        {Array.from({ length: machines }).map((_, machineId) => (
          <div key={machineId} className="relative h-8">
            <div className="absolute left-0 top-0 h-full w-full bg-muted rounded-md"></div>
            <div className="absolute left-0 top-0 h-full flex items-center ps-2 text-xs font-medium">
              Machine {machineId + 1}
            </div>
            
            {/* Job blocks */}
            {jobStates.filter(job => job.machineId === machineId).map(job => {
              // Calculate width based on progress and duration
              const progressPercent = (job.progress / job.duration) * 100;
              
              return (
                <div 
                  key={job.jobId}
                  className={`absolute top-0 h-full rounded-md transition-all ease-linear flex items-center justify-center text-xs font-medium text-white
                             ${jobColors[job.jobId % jobColors.length]} shadow-glow-sm`}
                  style={{
                    width: `${progressPercent}%`,
                    left: `${job.jobId * 5}%`, // Staggered starting position
                    transition: 'width 50ms linear'
                  }}
                >
                  J{job.jobId + 1}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Add quantum circuit pattern to background */}
      <div className="absolute bottom-0 right-0 w-full h-full opacity-5 z-0 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="quantum-circuit" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 H40 M20 0 V40" stroke="currentColor" strokeWidth="1" fill="none" />
              <circle cx="20" cy="20" r="3" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#quantum-circuit)" />
        </svg>
      </div>
      
      <style>{`
        .shadow-glow-sm {
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.3);
        }
      `}</style>
    </div>
  );
}

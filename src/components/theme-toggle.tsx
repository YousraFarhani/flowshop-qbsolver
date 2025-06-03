
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Toggle } from "@/components/ui/toggle"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Toggle 
      pressed={theme === "dark"} 
      onPressedChange={toggleTheme}
      variant="outline" 
      size="sm" 
      aria-label="Toggle theme"
      className="h-9 w-9 relative overflow-hidden group border border-quantum-indigo/30"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-quantum-indigo/10 to-quantum-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 flex items-center justify-center">
        {theme === "dark" ? (
          <Moon className="h-[1.2rem] w-[1.2rem] text-quantum-indigo" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem] text-quantum-cyan" />
        )}
      </div>
      <div className="absolute -inset-1 bg-gradient-to-r from-quantum-indigo/20 to-quantum-cyan/20 rounded-full blur opacity-0 group-hover:opacity-70 transition-opacity animate-pulse-glow" />
    </Toggle>
  )
}

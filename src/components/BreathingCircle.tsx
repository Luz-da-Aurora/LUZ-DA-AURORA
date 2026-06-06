import React, { useState, useEffect, useRef } from "react";
import { Wind, Play, Pause, Sparkles, RefreshCw } from "lucide-react";
import { BreathPhase, BreathPhaseConfig } from "../types";

export function BreathingCircle() {
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(4); // seconds in current phase
  const [totalBreaths, setTotalBreaths] = useState(0);

  const phaseConfigs: BreathPhaseConfig[] = [
    {
      phase: "inhale",
      label: "Inspire",
      instruction: "Inspire a luz da vida, sentindo o peito se expandir de bondade.",
      durationMs: 4000,
      scale: 1.4,
      colorClass: "bg-white/50 text-stone-850 border-white/70 shadow-inner font-medium",
    },
    {
      phase: "holdFull",
      label: "Sustenha",
      instruction: "Deixe essa luz nutrir cada cantinho da sua alma cansada.",
      durationMs: 4000,
      scale: 1.4,
      colorClass: "bg-white/65 text-stone-900 border-white/80 font-bold shadow-md",
    },
    {
      phase: "exhale",
      label: "Expire",
      instruction: "Deixe ir a culpa, a cansaço e a cobrança de dar conta do mundo.",
      durationMs: 4000,
      scale: 1.0,
      colorClass: "bg-white/30 text-stone-700 border-white/50 shadow-sm",
    },
    {
      phase: "holdEmpty",
      label: "Pausa Vazia",
      instruction: "Apenas descanse no silêncio dourado do seu próprio coração.",
      durationMs: 4000,
      scale: 1.0,
      colorClass: "bg-white/15 text-stone-500 border-white/30 italic",
    },
  ];

  const currentConfig = phaseConfigs[currentPhaseIdx];
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      setTimeLeft(4);
      const runCycleInMs = () => {
        timerRef.current = window.setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              // Switch to next phase
              setCurrentPhaseIdx((currentIdx) => {
                const nextIdx = (currentIdx + 1) % phaseConfigs.length;
                if (nextIdx === 0) {
                  setTotalBreaths((b) => b + 1);
                }
                return nextIdx;
              });
              return 4; // Reset timer to 4 seconds
            }
            return prev - 1;
          });
        }, 1000);
      };

      runCycleInMs();
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCurrentPhaseIdx(0);
      setTimeLeft(4);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const toggleBreathing = () => {
    setIsActive(!isActive);
  };

  const resetCounter = () => {
    setTotalBreaths(0);
  };

  return (
    <div id="breathing-guide-card" className="glass-panel p-6 rounded-3xl max-w-xl mx-auto flex flex-col items-center space-y-6 text-center">
      <div className="flex flex-col items-center space-y-1">
        <span className="flex items-center space-x-1.5 text-stone-600 font-sans text-xs font-semibold uppercase tracking-wider">
          <Wind className="w-4 h-4 animate-pulse text-stone-500" />
          <span>Ritual de Respiração Quadrada (Pranayama)</span>
        </span>
        <h3 className="font-serif italic text-stone-850 text-xl font-semibold">
          "Respira, Mulher" • Retorno para Si
        </h3>
        <p className="text-stone-500 font-sans text-xs max-w-md">
          Sincronize sua respiração para acalmar o sistema nervoso. A aurora nasce devagar, no seu próprio ritmo natural.
        </p>
      </div>

      {/* Breathing graphic representation */}
      <div className="relative w-64 h-64 flex items-center justify-center select-none">
        
        {/* Glow rings surrounding */}
        <div 
          className="absolute inset-0 rounded-full bg-white/20 blur-3xl transition-transform duration-1000"
          style={{
            transform: `scale(${isActive ? currentConfig.scale * 1.2 : 1})`,
          }}
        />

        {/* Breathing Circle Core */}
        <div
          id="breathing-circle-ball"
          className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border transition-all duration-[4000ms] cubic-bezier(0.4, 0, 0.2, 1) shadow-lg ${
            isActive ? currentConfig.colorClass : "bg-white/30 backdrop-blur-md text-stone-500 border-white/50"
          }`}
          style={{
            transform: `scale(${isActive ? currentConfig.scale : 1.0})`,
          }}
        >
          {isActive ? (
            <div className="flex flex-col items-center justify-center space-y-1 animate-fade-in">
              <span className="text-sm font-sans tracking-widest uppercase font-semibold">
                {currentConfig.label}
              </span>
              <span className="text-3xl font-mono font-bold leading-none">
                {timeLeft}s
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-1">
              <Wind className="w-10 h-10 text-stone-400 stroke-[1.5]" />
              <span className="text-xs font-sans text-stone-500 font-medium tracking-wider uppercase">Pronta?</span>
            </div>
          )}
        </div>

        {/* Small floating particles */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none animate-spin" style={{ animationDuration: "20s" }}>
            <Sparkles className="absolute top-4 left-1/2 w-4 h-4 text-stone-400 -translate-x-1/2 animate-pulse" />
          </div>
        )}
      </div>

      {/* Description overlay */}
      <div className="h-16 flex items-center justify-center max-w-sm">
        <p className="text-stone-700 font-serif text-sm italic leading-relaxed">
          {isActive ? currentConfig.instruction : '"Nem toda força precisa calar, nem toda dor precisa esperar..."'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleBreathing}
          id="breathing-toggle-btn"
          className={`flex items-center space-x-2 px-6 py-3 rounded-full font-sans text-sm font-medium shadow-md transition-all duration-300 ${
            isActive
              ? "bg-stone-800 hover:bg-stone-900 text-white hover:scale-105"
              : "bg-white/70 hover:bg-white/95 text-stone-800 border border-white/85 hover:scale-105"
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 text-white" />
              <span>Pausar Respiração</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-stone-800 animate-pulse" />
              <span>Começar Ciclo (16s)</span>
            </>
          )}
        </button>

        {totalBreaths > 0 && (
          <div className="flex items-center space-x-2 bg-white/40 border border-white/50 px-4 py-2.5 rounded-full text-xs font-mono text-stone-600">
            <span>Ciclos: {totalBreaths}</span>
            <button
              onClick={resetCounter}
              id="breathing-reset-btn"
              className="hover:text-stone-900 transition-colors"
              title="Zerar ciclos"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

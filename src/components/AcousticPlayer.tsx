import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, Sparkles, Wind, Music, ShieldAlert, Mic } from "lucide-react";

export function AcousticPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volumePad, setVolumePad] = useState(60);     // 0-100
  const [volumeSea, setVolumeSea] = useState(40);     // 0-100
  const [volumePiano, setVolumePiano] = useState(50); // 0-100
  const [currentChordName, setCurrentChordName] = useState("Silêncio");
  const [bpm] = useState(76); // 72 to 82 BPM range
  const [audioError, setAudioError] = useState<string | null>(null);

  // Audio nodes refs to persist across renders and clean up
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const padGainRef = useRef<GainNode | null>(null);
  const seaGainRef = useRef<GainNode | null>(null);
  const pianoGainRef = useRef<GainNode | null>(null);
  
  // Interval & timers
  const chordSchedulerRef = useRef<number | null>(null);
  const pianoSchedulerRef = useRef<number | null>(null);
  const oceanOscillatorRef = useRef<OscillatorNode | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const [vocalGuideEnabled, setVocalGuideEnabled] = useState(false);

  // Speech helper to narrate corresponding lyrics calmly
  const speakVocalGuide = (chordIndex: number) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop current speech to keep rhythm synchronized

      const lyricsByChord = [
        "Você acorda antes do dia clarear, segura o mundo e esquece de si... Mas há uma voz suave te dizendo: é hora de voltar.",
        "Respira, mulher... Não precisa esconder. Deus também vê o que ninguém consegue ver no silêncio.",
        "Você também merece cuidado, também merece ser acolhida. Não nasceu para viver se apagando enquanto ilumina outras vidas.",
        "A aurora nasce devagar... sem pressa, sem cobrança... sinta aí dentro nascer um recomeço de doce esperança."
      ];

      const text = lyricsByChord[chordIndex] || "";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";

      // Select a warm, gentle female Portuguese voice
      const voices = window.speechSynthesis.getVoices();
      
      // Filter for Portuguese language voices
      const ptVoices = voices.filter(v => v.lang.toLowerCase().startsWith("pt"));
      
      // Filter out explicitly male voices to avoid any deep tones
      const femalePtVoices = ptVoices.filter(v => {
        const nameLower = v.name.toLowerCase();
        return !nameLower.includes("daniel") && 
               !nameLower.includes("felipe") && 
               !nameLower.includes("duarte") && 
               !nameLower.includes("male") && 
               !nameLower.includes("masculin") &&
               !nameLower.includes("filipe");
      });

      // Prioritize known female voices or names that sound soft
      const bestFemaleVoice = femalePtVoices.find(v => {
        const nameLower = v.name.toLowerCase();
        return nameLower.includes("maria") || 
               nameLower.includes("luciana") || 
               nameLower.includes("heloisa") || 
               nameLower.includes("victoria") || 
               nameLower.includes("francisca") || 
               nameLower.includes("joana") || 
               nameLower.includes("female") || 
               nameLower.includes("feminina") ||
               nameLower.includes("sussurro") || 
               nameLower.includes("zira") || 
               nameLower.includes("helena");
      }) || femalePtVoices[0] || ptVoices[0];
      
      if (bestFemaleVoice) {
        utterance.voice = bestFemaleVoice;
      }
      
      // Increase pitch slightly (1.18) to guarantee a sweet, high, delicate feminine tone
      // and keep the pacing (0.70) very relaxed, warm, and therapeutic.
      utterance.pitch = 1.18; 
      utterance.rate = 0.70;  
      utterance.volume = 0.55; // Blend smoothly next to synthesis sound

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis failed or was blocked by browser permissions:", e);
    }
  };

  // Chord progression definitions (C Major Healing Progression)
  // Roots & notes tuned to warm, relaxing, heart-centered pitches (A4 = 432Hz inspired for healing, but standard A440 is fine too)
  const chorals = [
    { name: "Dó Maior (Corações Abertos)", notes: [130.81, 164.81, 196.00, 261.63, 329.63] }, // C3, E3, G3, C4, E4
    { name: "Sol Maior (Transição e Fluxo)", notes: [146.83, 196.00, 246.94, 293.66, 392.00] }, // D3, G3, B3, D4, G4
    { name: "Lá Menor (Entrega e Verdade)", notes: [110.00, 164.81, 220.00, 261.63, 329.63] }, // A2, E3, A3, C4, E4
    { name: "Fá Maior (Esperança e Aurora)", notes: [130.81, 174.61, 220.00, 261.63, 349.23] }, // C3, F3, A3, C4, F4
  ];

  const currentChordIdxRef = useRef(0);

  // Initialize Speech voices collection
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize Audio Context on demand (autoplay friendly)
  const initAudio = () => {
    try {
      if (audioCtxRef.current) return;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Master gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.8, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Sub mixers
      const padGain = ctx.createGain();
      padGain.gain.setValueAtTime(volumePad / 100, ctx.currentTime);
      padGain.connect(masterGain);
      padGainRef.current = padGain;

      const seaGain = ctx.createGain();
      seaGain.gain.setValueAtTime(volumeSea / 100, ctx.currentTime);
      seaGain.connect(masterGain);
      seaGainRef.current = seaGain;

      const pianoGain = ctx.createGain();
      pianoGain.gain.setValueAtTime(volumePiano / 100, ctx.currentTime);
      pianoGain.connect(masterGain);
      pianoGainRef.current = pianoGain;

      // Build Sea Noise Generator (Organic white noise + LFO filter sweep)
      buildSeaSynthesizer(ctx, seaGain);

      setAudioError(null);
    } catch (err: any) {
      console.error("Erro ao inicializar som com Web Audio API:", err);
      setAudioError("Seu navegador restringiu o áudio. Toque em 'Iniciar Instrumental' para permitir.");
    }
  };

  // Sea waves synthesizer
  const buildSeaSynthesizer = (ctx: AudioContext, destination: AudioNode) => {
    try {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      // Generate standard white noise
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoiseNode = ctx.createBufferSource();
      whiteNoiseNode.buffer = noiseBuffer;
      whiteNoiseNode.loop = true;

      // Create filter to make noise sound like waves
      const lowpassFilter = ctx.createBiquadFilter();
      lowpassFilter.type = "lowpass";
      lowpassFilter.frequency.setValueAtTime(350, ctx.currentTime);
      lowpassFilter.Q.setValueAtTime(1.5, ctx.currentTime);

      // Create LFO to simulate surf rising and falling (period of roughly 7 seconds)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.14, ctx.currentTime); // 1 / 7s ~ 0.14Hz

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(250, ctx.currentTime);  // modulate filter by 250Hz up and down

      lfo.connect(lfoGain);
      lfoGain.connect(lowpassFilter.frequency);

      // Connect noise source
      whiteNoiseNode.connect(lowpassFilter);

      // Create gain nodes for LFO surf volume swells
      const volumeSwell = ctx.createGain();
      volumeSwell.gain.setValueAtTime(0.4, ctx.currentTime);

      // Connect LFO directly to surf volume too for ultimate realism
      const lfoVolumeGain = ctx.createGain();
      lfoVolumeGain.gain.setValueAtTime(0.2, ctx.currentTime);
      lfo.connect(lfoVolumeGain);
      lfoVolumeGain.connect(volumeSwell.gain);

      lowpassFilter.connect(volumeSwell);
      volumeSwell.connect(destination);

      // Start sea
      lfo.start();
      whiteNoiseNode.start();

      oceanOscillatorRef.current = lfo; // Keep track for cleanup
    } catch (e) {
      console.error("Sea Sweep Synth failed to construct:", e);
    }
  };

  // Play a beautiful, gentle ambient synthesizer chord
  const playAmbientChordNotes = (ctx: AudioContext, notes: number[], durationSec: number) => {
    if (!padGainRef.current) return;

    const startTime = ctx.currentTime;
    const fadeTime = 1.8; // Gentle crossfade attack and decay
    const notesOscillators: OscillatorNode[] = [];

    notes.forEach((freq, idx) => {
      // Warm sound: use low triangle wave or lowpass-filtered sawtooth
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      // Soft filter to remove harshness
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, startTime);

      // Gentle individual envelope for each oscillators
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0, startTime);
      // Soft glide attack
      oscGain.gain.linearRampToValueAtTime(0.08 / notes.length, startTime + fadeTime);
      // Sustain
      oscGain.gain.setValueAtTime(0.08 / notes.length, startTime + durationSec - fadeTime);
      // Release
      oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(padGainRef.current!);

      osc.start(startTime);
      osc.stop(startTime + durationSec);

      notesOscillators.push(osc);
      activeOscillatorsRef.current.push(osc);
    });

    // Remove finished oscillators from active array later
    setTimeout(() => {
      activeOscillatorsRef.current = activeOscillatorsRef.current.filter(
        (o) => !notesOscillators.includes(o)
      );
    }, durationSec * 1000);
  };

  // Delicate random piano notes from the C Major Pentatonic scale (C4 to C6)
  const triggerHealingPianoNote = () => {
    const ctx = audioCtxRef.current;
    if (!ctx || !pianoGainRef.current) return;

    const pentatonicNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00]; // C4 to A5
    const randomFreq = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];

    const startTime = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(randomFreq, startTime);

    // Warmth filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, startTime);

    // Echo/Delay Simulator (simple feedback delay node)
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.4, startTime); // 400ms echo
    
    const delayGain = ctx.createGain();
    delayGain.gain.setValueAtTime(0.35, startTime); // feedback level

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.12, startTime + 0.03); // rapid click
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.5); // long decay

    osc.connect(filter);
    filter.connect(noteGain);
    
    // Connect to echo delay feedback network
    noteGain.connect(pianoGainRef.current);
    noteGain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(delay); // feedback loop
    delayGain.connect(pianoGainRef.current);

    osc.start(startTime);
    osc.stop(startTime + 3.0);

    activeOscillatorsRef.current.push(osc);
  };

  const vocalGuideEnabledRef = useRef(vocalGuideEnabled);
  useEffect(() => {
    vocalGuideEnabledRef.current = vocalGuideEnabled;
    if (!vocalGuideEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [vocalGuideEnabled]);

  // Main loop control
  useEffect(() => {
    if (isPlaying) {
      initAudio();

      // Ensure context is running (can be suspended if user hasn't clicked something, but this is triggered by button click)
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const scheduleCycle = () => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        const chordDuration = 8.0; // Seconds per chord sequence
        const currentIdx = currentChordIdxRef.current;
        const currentChord = chorals[currentIdx];
        setCurrentChordName(currentChord.name);

        playAmbientChordNotes(ctx, currentChord.notes, chordDuration);

        if (vocalGuideEnabledRef.current) {
          speakVocalGuide(currentIdx);
        }

        currentChordIdxRef.current = (currentIdx + 1) % chorals.length;
      };

      // Play immediately on launch
      scheduleCycle();

      // Schedule subsequent chords (every 8 seconds)
      chordSchedulerRef.current = window.setInterval(scheduleCycle, 8000);

      // Schedule random healing piano triggers (every 1.5 to 3.5 seconds)
      const pianoLoop = () => {
        triggerHealingPianoNote();
        const nextTimeMs = 1500 + Math.random() * 2000;
        pianoSchedulerRef.current = window.setTimeout(pianoLoop, nextTimeMs);
      };
      
      // Delay initial piano drops by 2 seconds
      pianoSchedulerRef.current = window.setTimeout(pianoLoop, 2000);

    } else {
      // Stop and clean up and reset
      if (chordSchedulerRef.current) {
        clearInterval(chordSchedulerRef.current);
        chordSchedulerRef.current = null;
      }
      if (pianoSchedulerRef.current) {
        clearTimeout(pianoSchedulerRef.current);
        pianoSchedulerRef.current = null;
      }

      // Stop ocean oscillators if any
      if (oceanOscillatorRef.current) {
        try {
          oceanOscillatorRef.current.stop();
        } catch (e) {}
        oceanOscillatorRef.current = null;
      }

      // Force-kill active oscillators
      activeOscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
        } catch (e) {}
      });
      activeOscillatorsRef.current = [];

      // Suspend audio context
      if (audioCtxRef.current && audioCtxRef.current.state === "running") {
        audioCtxRef.current.suspend();
      }

      setCurrentChordName("Silêncio");
    }

    return () => {
      // Cleanup on unmount
      if (chordSchedulerRef.current) clearInterval(chordSchedulerRef.current);
      if (pianoSchedulerRef.current) clearTimeout(pianoSchedulerRef.current);
    };
  }, [isPlaying]);

  // Handle mixing gains
  useEffect(() => {
    if (padGainRef.current && audioCtxRef.current) {
      padGainRef.current.gain.linearRampToValueAtTime(volumePad / 100, audioCtxRef.current.currentTime + 0.2);
    }
  }, [volumePad]);

  useEffect(() => {
    if (seaGainRef.current && audioCtxRef.current) {
      seaGainRef.current.gain.linearRampToValueAtTime(volumeSea / 100, audioCtxRef.current.currentTime + 0.2);
    }
  }, [volumeSea]);

  useEffect(() => {
    if (pianoGainRef.current && audioCtxRef.current) {
      pianoGainRef.current.gain.linearRampToValueAtTime(volumePiano / 100, audioCtxRef.current.currentTime + 0.2);
    }
  }, [volumePiano]);

  const toggleSoundscape = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div id="acoustic-sound-portal" className="glass-panel p-6 rounded-3xl max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/60 border border-white/80 p-2.5 rounded-2xl text-stone-850 shadow-sm">
            <Music className="w-5 h-5" id="soundscape-icon-header" />
          </div>
          <div>
            <h3 className="font-serif italic text-stone-850 text-base font-semibold" id="soundscape-title">
              Santuário de Som Aurora
            </h3>
            <p className="font-mono text-[10px] uppercase text-stone-500 tracking-wider" id="soundscape-bpm-meta">
              Pop Acústico • {bpm} BPM • 432Hz Healing
            </p>
          </div>
        </div>
        <button
          onClick={toggleSoundscape}
          id="soundscape-toggle-btn"
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-sans text-sm font-medium transition-all duration-300 shadow-md ${
            isPlaying
              ? "bg-stone-800 hover:bg-stone-900 text-white hover:scale-105"
              : "bg-white/70 hover:bg-white/90 text-stone-800 border border-white/85 hover:scale-[1.02]"
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 text-white" />
              <span>Sussurrar Pausa</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-stone-800" />
              <span>Ouvir Som da Cura</span>
            </>
          )}
        </button>
      </div>

      {audioError && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl flex items-center col-span-2 space-x-2 border border-red-100" id="audio-alert">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{audioError}</span>
        </div>
      )}

      {/* Visualizer showing the active chord playing */}
      <div className={`p-4 rounded-2xl transition-all duration-500 border ${
        isPlaying ? "bg-white/50 border-white/60 backdrop-blur-sm shadow-inner" : "bg-white/20 border-white/30"
      }`}>
        <div className="flex items-center justify-between text-xs font-mono text-stone-500 mb-2">
          <span>Acorde Harmônico Corrente:</span>
          <span className="flex items-center space-x-1">
            <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${isPlaying ? "animate-pulse" : ""}`} />
            <span className={isPlaying ? "text-stone-700 font-bold" : ""}>
              {isPlaying ? "Ativo" : "Em Silêncio"}
            </span>
          </span>
        </div>
        <div className="text-stone-800 font-sans font-medium text-lg flex items-center justify-center py-2 relative overflow-hidden h-10 select-none">
          {isPlaying ? (
            <div className="flex flex-col items-center justify-center text-center animate-fade-in">
              <span className="text-stone-850 font-serif italic font-semibold tracking-wide transition-all">
                {currentChordName}
              </span>
              <div className="flex justify-center space-x-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-stone-600 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          ) : (
            <span className="text-stone-400 italic font-normal text-sm">
              Inicie o som para harmonizar o ambiente
            </span>
          )}
        </div>
      </div>

      {/* Guia de Voz Poética (Sincronizado com a música) */}
      <div className="bg-white/45 border border-white/55 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
        <div className="space-y-0.5">
          <span className="flex items-center space-x-1.5 text-stone-700 font-mono text-[9px] uppercase tracking-wider font-semibold">
            <Mic className="w-3.5 h-3.5 text-stone-500 animate-pulse" />
            <span>Sussurro Terapêutico Integrado</span>
          </span>
          <p className="font-serif italic text-xs text-stone-850 font-semibold">
            Ativar Guia de Voz (Sintonizar com a Letra)
          </p>
          <p className="text-[10.5px] text-stone-500 leading-snug">
            A cada transição de acorde, a voz recita calmamente os versos correspondentes da sua canção.
          </p>
        </div>
        <button
          onClick={() => setVocalGuideEnabled(!vocalGuideEnabled)}
          id="toggle-vocal-guide-btn"
          className={`flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 self-start sm:self-center shadow-sm ${
            vocalGuideEnabled
              ? "bg-stone-800 hover:bg-stone-900 text-white hover:scale-105"
              : "bg-white/70 hover:bg-white text-stone-800 border border-white/90 hover:scale-[1.02]"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${vocalGuideEnabled ? "bg-emerald-400 animate-pulse" : "bg-stone-300"}`} />
          <span>{vocalGuideEnabled ? "Voz Sintonizada" : "Sintonizar Voz"}</span>
        </button>
      </div>

      {/* Mixer controls */}
      <div className="space-y-4 pt-2">
        <h4 className="font-sans text-[10px] font-semibold text-stone-500 tracking-wider uppercase mb-1">
          Mesa de Sintonia do Autocuidado
        </h4>

        {/* Ambient pad volume */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-stone-650">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stone-500" />
              <span>Pads Atmosféricos da Alma</span>
            </span>
            <span className="font-mono text-stone-500">{volumePad}%</span>
          </div>
          <div className="flex items-center space-x-3">
            <Volume2 className="w-3.5 h-3.5 text-stone-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volumePad}
              onChange={(e) => setVolumePad(Number(e.target.value))}
              disabled={!isPlaying}
              id="mixer-pad-volume"
              className="w-full accent-stone-800 h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
            />
          </div>
        </div>

        {/* Ocean Waves Volume */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-stone-650">
            <span className="flex items-center space-x-1.5">
              <Wind className="w-3.5 h-3.5 text-stone-550" />
              <span>Ondas da Manhã (Filtro Surf)</span>
            </span>
            <span className="font-mono text-stone-500">{volumeSea}%</span>
          </div>
          <div className="flex items-center space-x-3">
            <Volume2 className="w-3.5 h-3.5 text-stone-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volumeSea}
              onChange={(e) => setVolumeSea(Number(e.target.value))}
              disabled={!isPlaying}
              id="mixer-sea-volume"
              className="w-full accent-stone-800 h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
            />
          </div>
        </div>

        {/* Healing Piano volume */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-stone-650">
            <span className="flex items-center space-x-1.5">
              <Music className="w-3.5 h-3.5 text-stone-500" />
              <span>Piano Delicado (Cristal de Cura)</span>
            </span>
            <span className="font-mono text-stone-500">{volumePiano}%</span>
          </div>
          <div className="flex items-center space-x-3">
            <Volume2 className="w-3.5 h-3.5 text-stone-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volumePiano}
              onChange={(e) => setVolumePiano(Number(e.target.value))}
              disabled={!isPlaying}
              id="mixer-piano-volume"
              className="w-full accent-stone-800 h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
            />
          </div>
        </div>
      </div>

      <div className="text-[10px] uppercase tracking-wider font-mono text-stone-400 text-center select-none pt-2 border-t border-white/40">
        Dispositivo de Cura Sintética Luz da Aurora • 100% Livre de Interferências
      </div>
    </div>
  );
}

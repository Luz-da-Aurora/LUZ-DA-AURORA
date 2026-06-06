import React, { useState, useEffect } from "react";
import { Sparkles, Heart, ChevronRight, MessageSquareCode, Volume2, VolumeX, Mic } from "lucide-react";
import { ReflectionPrompt } from "../types";

interface LyricsViewerProps {
  onSelectPrompt: (prompt: ReflectionPrompt) => void;
  activePromptId?: string;
}

export function LyricsViewer({ onSelectPrompt, activePromptId }: LyricsViewerProps) {
  const [activeDeclaimerSec, setActiveDeclaimerSec] = useState<string | null>(null);

  // Initialize Speech synthesis voice bindings
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

  const playCozyChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 chime note
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.1); // G5 glide
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.warn("Chime sound effect blocked or unsupported:", e);
    }
  };

  const declaimVerse = (sectionId: string, textToRead: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      if (activeDeclaimerSec === sectionId) {
        window.speechSynthesis.cancel();
        setActiveDeclaimerSec(null);
        return;
      }

      window.speechSynthesis.cancel();
      playCozyChime();
      setActiveDeclaimerSec(sectionId);

      // Brief delay to let the chime sound finish loading before speech starts
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = "pt-BR";
        
        const voices = window.speechSynthesis.getVoices();
        
        // Filter for Portuguese language voices
        const ptVoices = voices.filter(v => v.lang.toLowerCase().startsWith("pt"));
        
        // Filter out explicitly male voices
        const femalePtVoices = ptVoices.filter(v => {
          const nameLower = v.name.toLowerCase();
          return !nameLower.includes("daniel") && 
                 !nameLower.includes("felipe") && 
                 !nameLower.includes("duarte") && 
                 !nameLower.includes("male") && 
                 !nameLower.includes("masculin") &&
                 !nameLower.includes("filipe");
        });

        // Prioritize known sweet female Portuguese voices
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
        
        // Align pitch and speed to a delicate, soothing feminine voice profile
        utterance.pitch = 1.18; // Sweet, soft feminine frequency
        utterance.rate = 0.70;  // Beautiful meditative speed
        utterance.volume = 1.0;
        
        utterance.onend = () => {
          setActiveDeclaimerSec(null);
        };
        utterance.onerror = () => {
          setActiveDeclaimerSec(null);
        };

        window.speechSynthesis.speak(utterance);
      }, 350);

    } catch (err) {
      console.error(err);
      setActiveDeclaimerSec(null);
    }
  };

  const prompts: ReflectionPrompt[] = [
    {
      id: "v1-care",
      section: "Verso 1 • A Carga Invisível",
      title: "Segurando o Mundo",
      lyricsSnippet: "Cuida de todos, segura o mundo / E esquece de si por mais um segundo...",
      promptText: "Escreva com franqueza: qual foi a maior carga invisível que você carregou esta semana sem pedir ajuda?",
    },
    {
      id: "ref-deserve",
      section: "Refrão • A Verdade Fundamental",
      title: "Você Também Merece Cuidado",
      lyricsSnippet: "Não nasceu para viver se apagando / Enquanto ilumina outras vidas...",
      promptText: "Como é para seu coração ouvir a frase 'Você também merece cuidado'? Onde dói aceitar esse direito?",
    },
    {
      id: "v2-vulnerability",
      section: "Verso 2 • Força de Si",
      title: "O Peso da Força Permanente",
      lyricsSnippet: "Nem toda força precisa calar / Nem toda dor precisa esperar...",
      promptText: "Você sente culpa por se mostrar frágil? O que acontece se você simplesmente respirar e se perceber vulnerável por um momento?",
    },
    {
      id: "bridge-hope",
      section: "Ponte • A Aurora Lenta",
      title: "Nascer Devagar, Sem Pressa",
      lyricsSnippet: "A aurora nasce devagar / Sem pressa, sem cobrança...",
      promptText: "A natureza não se apressa, e mesmo assim tudo desabrocha. Qual pequena esperança está nascendo no silêncio do seu peito hoje?",
    }
  ];

  return (
    <div id="lyrics-viewer-container" className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-6xl mx-auto items-stretch">
      
      {/* Complete Song Lyrics Panel */}
      <div id="lyrics-content-panel" className="md:col-span-7 glass-panel p-6 md:p-8 rounded-3xl flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 text-stone-800 mb-6">
            <Heart className="w-4 h-4 fill-stone-800 text-stone-800 animate-pulse" />
            <span className="font-sans text-xs font-semibold uppercase tracking-wider">
              Canção Oficial • Luz da Aurora
            </span>
          </div>

          <h2 className="font-serif italic font-bold text-stone-850 text-2.5xl mb-1" id="lyrics-title">
            Você Também Merece Cuidado
          </h2>
          <p className="font-mono text-[10px] uppercase text-stone-500 tracking-wider mb-6" id="lyrics-author">
            Letra Terapêutica de Reconexão • Pop Acústico Espiritual
          </p>

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar text-sm leading-relaxed text-stone-600 font-serif">
            
            {/* Verso 1 */}
            <div className={`space-y-2 py-2.5 border-l-2 pl-4 transition-all duration-300 ${
              activeDeclaimerSec === "verso1" ? "border-stone-850 bg-white/45 rounded-r-2xl shadow-sm" : "border-transparent hover:border-white/60"
            }`}>
              <div className="flex items-center justify-between">
                <span className="block font-mono text-[10px] text-stone-400 uppercase tracking-widest font-bold">Verso 1</span>
                <button
                  onClick={() => declaimVerse("verso1", "Você acorda antes do dia clarear, com tanta coisa para lembrar. Cuida de todos, segura o mundo, e esquece de si por mais um segundo. Sorri por fora, cansa por dentro. Guarda no peito tanto sentimento. Mas há uma voz querendo falar, dizendo baixinho: é hora de voltar.")}
                  className={`p-1 px-2.5 rounded-xl text-[9px] font-mono tracking-wider uppercase font-semibold flex items-center space-x-1.5 transition-all outline-none border ${
                    activeDeclaimerSec === "verso1"
                      ? "bg-stone-800 border-stone-800 text-white animate-pulse"
                      : "bg-white/40 border-white/50 text-stone-600 hover:bg-white/60 hover:text-stone-850"
                  }`}
                  aria-label="Declamar Verso 1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{activeDeclaimerSec === "verso1" ? "Sussurrando..." : "Declama Voz"}</span>
                </button>
              </div>
              <p>Você acorda antes do dia clarear</p>
              <p>Com tanta coisa para lembrar</p>
              <p className="text-stone-800">Cuida de todos, segura o mundo</p>
              <p className="text-stone-800">E esquece de si por mais um segundo</p>
              <p>Sorri por fora, cansa por dentro</p>
              <p>Guarda no peito tanto sentimento</p>
              <p>Mas há uma voz querendo falar</p>
              <p>Dizendo baixinho: é hora de voltar</p>
            </div>

            {/* Pré-refrão */}
            <div className={`space-y-2 py-2.5 border-l-2 pl-4 transition-all duration-300 ${
              activeDeclaimerSec === "prerefrao" ? "border-stone-800 bg-white/45 rounded-r-2xl shadow-sm" : "border-transparent hover:border-white/60"
            }`}>
              <div className="flex items-center justify-between">
                <span className="block font-mono text-[10px] text-stone-550 uppercase tracking-widest font-bold">Pré-refrão</span>
                <button
                  onClick={() => declaimVerse("prerefrao", "Respira, mulher... não precisa esconder. Deus também vê o que ninguém consegue ver.")}
                  className={`p-1 px-2.5 rounded-xl text-[9px] font-mono tracking-wider uppercase font-semibold flex items-center space-x-1.5 transition-all outline-none border ${
                    activeDeclaimerSec === "prerefrao"
                      ? "bg-stone-800 border-stone-800 text-white animate-pulse"
                      : "bg-white/40 border-white/50 text-stone-600 hover:bg-white/60 hover:text-stone-850"
                  }`}
                  aria-label="Declamar Pré-refrão"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{activeDeclaimerSec === "prerefrao" ? "Sussurrando..." : "Declama Voz"}</span>
                </button>
              </div>
              <p className="italic text-stone-800 font-medium font-serif">Respira, mulher</p>
              <p className="italic text-stone-800 font-medium font-serif">Não precisa esconder</p>
              <p className="italic text-stone-800 font-medium font-serif">Deus também vê</p>
              <p className="italic text-stone-800 font-medium font-serif">O que ninguém consegue ver</p>
            </div>

            {/* Refrão */}
            <div className={`space-y-2 py-3.5 bg-white/50 backdrop-blur-sm rounded-xl px-4 border-l-2 transition-all duration-300 shadow-sm ${
              activeDeclaimerSec === "refrao" ? "border-stone-900 bg-white/70" : "border-stone-850"
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="block font-mono text-[10px] text-stone-500 uppercase tracking-widest font-bold">Refrão • Clímax da Alma</span>
                <button
                  onClick={() => declaimVerse("refrao", "Você também merece cuidado... também merece ser acolhida. Não nasceu para viver se apagando enquanto ilumina outras vidas. Você também merece descanso. Um colo, uma pausa, uma oração. Há luz esperando por você no silêncio do seu coração.")}
                  className={`p-1 px-2.5 rounded-xl text-[9px] font-mono tracking-wider uppercase font-semibold flex items-center space-x-1.5 transition-all outline-none border ${
                    activeDeclaimerSec === "refrao"
                      ? "bg-stone-800 border-stone-800 text-white animate-pulse"
                      : "bg-white/40 border-white/50 text-stone-650 hover:bg-white/60 hover:text-stone-850"
                  }`}
                  aria-label="Declamar Refrão"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{activeDeclaimerSec === "refrao" ? "Sussurrando..." : "Declama Voz"}</span>
                </button>
              </div>
              <p className="font-semibold text-stone-900 text-base leading-snug">Você também merece cuidado</p>
              <p className="font-semibold text-stone-900">Também merece ser acolhida</p>
              <p className="text-stone-700">Não nasceu para viver se apagando</p>
              <p className="text-stone-700">Enquanto ilumina outras vidas</p>
              <p className="mt-2 font-semibold text-stone-900">Você também merece descanso</p>
              <p className="text-stone-700">Um colo, uma pausa, uma oração</p>
              <p className="text-stone-750 font-serif italic text-sm">Há luz esperando por você</p>
              <p className="text-stone-850 font-serif italic font-semibold text-sm">No silêncio do seu coração</p>
            </div>

            {/* Verso 2 */}
            <div className={`space-y-2 py-2.5 border-l-2 pl-4 transition-all duration-300 ${
              activeDeclaimerSec === "verso2" ? "border-stone-850 bg-white/45 rounded-r-2xl shadow-sm" : "border-transparent hover:border-white/60"
            }`}>
              <div className="flex items-center justify-between">
                <span className="block font-mono text-[10px] text-stone-400 uppercase tracking-widest font-bold">Verso 2</span>
                <button
                  onClick={() => declaimVerse("verso2", "Nem toda força precisa calar, nem toda dor precisa esperar. Se a alma cansou de tanto conter, talvez seja tempo de se perceber. Voltar para si não é abandonar quem você ama e quer cuidar. É lembrar com amor e delicadeza que você também é parte da beleza.")}
                  className={`p-1 px-2.5 rounded-xl text-[9px] font-mono tracking-wider uppercase font-semibold flex items-center space-x-1.5 transition-all outline-none border ${
                    activeDeclaimerSec === "verso2"
                      ? "bg-stone-800 border-stone-800 text-white animate-pulse"
                      : "bg-white/40 border-white/50 text-stone-600 hover:bg-white/60 hover:text-stone-850"
                  }`}
                  aria-label="Declamar Verso 2"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{activeDeclaimerSec === "verso2" ? "Sussurrando..." : "Declama Voz"}</span>
                </button>
              </div>
              <p>Nem toda força precisa calar</p>
              <p>Nem toda dor precisa esperar</p>
              <p className="text-stone-800">Se a alma cansou de tanto conter</p>
              <p className="text-stone-800">Talvez seja tempo de se perceber</p>
              <p>Voltar para si não é abandonar</p>
              <p>Quem você ama e quer cuidar</p>
              <p>É lembrar com amor e delicadeza</p>
              <p>Que você também é parte da beleza</p>
            </div>

            {/* Ponte */}
            <div className={`space-y-2 py-2.5 border-l-2 pl-4 transition-all duration-300 ${
              activeDeclaimerSec === "ponte" ? "border-stone-850 bg-white/45 rounded-r-2xl shadow-sm" : "border-transparent hover:border-white/60"
            }`}>
              <div className="flex items-center justify-between">
                <span className="block font-mono text-[10px] text-stone-550 uppercase tracking-widest font-bold">Ponte</span>
                <button
                  onClick={() => declaimVerse("ponte", "Quando a alma pede cuidado, Deus sussurra: vem descansar. Você não precisa dar conta de tudo para ser digna de amar. A aurora nasce devagar, sem pressa, sem cobrança... e dentro de você também existe um começo de doce esperança.")}
                  className={`p-1 px-2.5 rounded-xl text-[9px] font-mono tracking-wider uppercase font-semibold flex items-center space-x-1.5 transition-all outline-none border ${
                    activeDeclaimerSec === "ponte"
                      ? "bg-stone-800 border-stone-800 text-white animate-pulse"
                      : "bg-white/40 border-white/50 text-stone-600 hover:bg-white/60 hover:text-stone-850"
                  }`}
                  aria-label="Declamar Ponte"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{activeDeclaimerSec === "ponte" ? "Sussurrando..." : "Declama Voz"}</span>
                </button>
              </div>
              <p>Quando a alma pede cuidado</p>
              <p>Deus sussurra: vem descansar</p>
              <p className="text-stone-800 font-sans tracking-wide">Você não precisa dar conta de tudo</p>
              <p className="text-stone-850 font-sans tracking-wide">Para ser digna de amar</p>
              <p className="mt-2 italic">A aurora nasce devagar</p>
              <p className="italic">Sem pressa, sem cobrança</p>
              <p className="italic text-stone-850 font-sans tracking-wide">E dentro de você também existe</p>
              <p className="italic text-stone-900 font-semibold font-serif text-sm">Um começo de esperança</p>
            </div>

            {/* Final */}
            <div className={`space-y-1.5 py-3 border-l-2 pl-4 transition-all duration-300 ${
              activeDeclaimerSec === "final" ? "border-stone-900 bg-white/45 rounded-r-2xl" : "border-stone-800"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="block font-mono text-[10px] text-stone-400 uppercase tracking-widest font-bold font-sans">Instante Final</span>
                <button
                  onClick={() => declaimVerse("final", "Luz da aurora... volte para si... com calma, com fé... com amor por você.")}
                  className={`p-1 px-2.5 rounded-xl text-[9px] font-mono tracking-wider uppercase font-semibold flex items-center space-x-1.5 transition-all outline-none border ${
                    activeDeclaimerSec === "final"
                      ? "bg-stone-800 border-stone-800 text-white animate-pulse"
                      : "bg-white/40 border-white/50 text-stone-600 hover:bg-white/60 hover:text-stone-850"
                  }`}
                  aria-label="Declamar Instante Final"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{activeDeclaimerSec === "final" ? "Sussurrando..." : "Declama Voz"}</span>
                </button>
              </div>
              <p className="font-serif text-stone-850 italic font-medium">Luz da Aurora</p>
              <p className="font-serif text-stone-850 italic font-medium">Volte para si</p>
              <p className="font-serif text-stone-850 italic font-medium">Com calma, com fé</p>
              <p className="font-serif text-stone-850 italic font-medium">Com amor por você</p>
            </div>

          </div>
        </div>

        <div className="mt-6 text-xs text-stone-500 italic bg-white/20 p-3 rounded-xl border border-white/30">
          * Dica: Cada estrofe esconde um sussurro terapêutico. Clique nos cartões ao lado para refletir nas entrelinhas e preparar a sua Carta da Aurora personalizada.
        </div>
      </div>

      {/* Prompts reflection cards Panel */}
      <div id="prompts-reflection-panel" className="md:col-span-5 flex flex-col space-y-4 justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif italic font-semibold text-stone-800 text-base" id="prompts-header-title">
              Estações de Auto-percepção
            </h3>
            <span className="bg-white/50 border border-white/60 text-stone-700 font-mono text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
              Portais de Cura
            </span>
          </div>

          <div className="space-y-3">
            {prompts.map((prompt) => {
              const isActive = activePromptId === prompt.id;
              return (
                <button
                  key={prompt.id}
                  onClick={() => onSelectPrompt(prompt)}
                  id={`prompt-btn-${prompt.id}`}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative group flex flex-col ${
                    isActive
                      ? "bg-white/85 border-white/95 shadow-md translate-x-1"
                      : "bg-white/35 backdrop-blur-sm hover:bg-white/50 border-white/40 hover:border-white/60"
                  }`}
                >
                  <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest font-bold mb-1">
                    {prompt.section}
                  </span>
                  
                  <h4 className="font-sans font-semibold text-stone-800 text-sm mb-1 group-hover:text-stone-900 transition-colors">
                    {prompt.title}
                  </h4>
                  
                  <p className="font-serif text-xs text-stone-500 italic mb-2 line-clamp-1">
                    "{prompt.lyricsSnippet}"
                  </p>

                  <div className="flex items-center justify-between w-full pt-1.5 border-t border-white/40 mt-1">
                    <span className="font-sans text-[11px] text-stone-600 line-clamp-1 pr-4">
                      {prompt.promptText}
                    </span>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                      isActive ? "text-stone-800 translate-x-0.5" : "text-stone-400 group-hover:text-stone-700"
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white/35 backdrop-blur-sm p-4 rounded-2xl border border-white/40 text-center">
          <Sparkles className="w-5 h-5 text-stone-400 mx-auto mb-2" />
          <p className="font-serif italic text-xs text-stone-700 leading-snug">
            "Voltar para si não é abandonar quem você ama... É lembrar com amor que você também é parte da beleza."
          </p>
        </div>

      </div>

    </div>
  );
}

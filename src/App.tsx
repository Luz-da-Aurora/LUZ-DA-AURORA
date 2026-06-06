import React, { useState, useEffect } from "react";
import { Music, Heart, Sparkles, BookOpen, Wind, Compass, Sun, Eye, Info } from "lucide-react";
import { AcousticPlayer } from "./components/AcousticPlayer";
import { BreathingCircle } from "./components/BreathingCircle";
import { LyricsViewer } from "./components/LyricsViewer";
import { JournalingReflections } from "./components/JournalingReflections";
import { LuzDaAuroraOracle } from "./components/LuzDaAuroraOracle";
import { ReflectionPrompt } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"peace" | "lyrics" | "oracle">("peace");
  
  // High-level common state to sync across tabs
  const [selectedPrompt, setSelectedPrompt] = useState<ReflectionPrompt>({
    id: "v1-care",
    section: "Verso 1 • A Carga Invisível",
    title: "Segurando o Mundo",
    lyricsSnippet: "Cuida de todos, segura o mundo / E esquece de si por mais um segundo...",
    promptText: "Escreva com franqueza: qual foi a maior carga invisível que você carregou esta semana sem pedir ajuda?",
  });

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("aurora_user_name") || "";
  });

  const [currentFeeling, setCurrentFeeling] = useState(() => {
    return localStorage.getItem("aurora_current_feeling") || "Buscando paz e reconexão";
  });

  // Keep a map of prompt responses in state & localStorage
  const [journalResponses, setJournalResponses] = useState<Record<string, string>>(() => {
    const raw = localStorage.getItem("aurora_journal_responses");
    if (raw) return JSON.parse(raw);
    return {};
  });

  // Sync to localstorage
  useEffect(() => {
    localStorage.setItem("aurora_user_name", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("aurora_current_feeling", currentFeeling);
  }, [currentFeeling]);

  useEffect(() => {
    localStorage.setItem("aurora_journal_responses", JSON.stringify(journalResponses));
  }, [journalResponses]);

  const handleSavePromptResponse = (promptId: string, text: string) => {
    setJournalResponses((prev) => ({
      ...prev,
      [promptId]: text,
    }));
  };

  // Compile all diary inputs to a single string for Gemini
  const getAccumulatedDrafts = () => {
    return Object.entries(journalResponses)
      .map(([id, text]) => {
        const findPrompt = [
          { id: "v1-care", title: "Carga invisível" },
          { id: "ref-deserve", title: "Sentir que merece cuidado" },
          { id: "v2-vulnerability", title: "Vulnerabilidade e Força" },
          { id: "bridge-hope", title: "Esperança e Desaceleração" },
        ].find((p) => p.id === id);
        return `[Tema ${findPrompt?.title || id}]: ${text}`;
      })
      .join("\n\n");
  };

  const selectPromptFromLyrics = (prompt: ReflectionPrompt) => {
    setSelectedPrompt(prompt);
    setActiveTab("lyrics"); // Shift perspective to let them answer the questionnaire
  };

  return (
    <div id="app-root-viewport" className="min-h-screen bg-frosted-gradient text-stone-800 flex flex-col font-sans select-none antialiased relative overflow-hidden">
      
      {/* Decorative Aura Background Layers */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-35" style={{ background: "radial-gradient(circle, #ffecd2 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-[10%] right-[-5%] w-[60%] h-[60%] rounded-full opacity-25" style={{ background: "radial-gradient(circle, #fcb69f 0%, transparent 70%)", filter: "blur(100px)" }} />
        <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #ff9a9e 0%, transparent 70%)", filter: "blur(90px)" }} />
      </div>

      {/* Healing Soft Aurora Top Header Banner - Frosted Glass Inspired */}
      <header id="main-header" className="relative z-10 bg-white/20 backdrop-blur-md border-b border-white/40 overflow-hidden shadow-sm">
        
        {/* Soft morning pastel background glow strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-200 via-amber-400 to-pink-300" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center space-x-2.5">
              <span className="flex items-center space-x-1.5 bg-white/60 text-stone-800 border border-white/80 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest shadow-sm">
                <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: "14s" }} />
                <span>Marca Terapêutica Luz da Aurora</span>
              </span>
            </div>

            <h1 className="font-serif italic text-stone-850 text-4xl md:text-5xl tracking-tight leading-tight">
              Uma pausa sincera para quem cuida do mundo.
            </h1>
            
            <p className="font-serif text-sm md:text-base text-stone-600 leading-relaxed max-w-xl">
              Inspirado na melodia autoral <strong className="text-stone-800 font-sans">“Você Também Merece Cuidado”</strong>, criamos um espaço sagrado para você desmecanizar a rotina, respirar fundo e lembrar: voltar para si é um ato de amor e delicadeza.
            </p>

            <div className="flex flex-wrap gap-4 items-center pt-1 font-mono text-[10px] text-stone-500 tracking-wider">
              <span className="flex items-center space-x-1 text-stone-800 font-sans font-bold">
                <Music className="w-3.5 h-3.5" />
                <span>RITMO: 72-82 BPM</span>
              </span>
              <span>•</span>
              <span className="uppercase">Voz Feminina Suave & Terapêutica</span>
              <span>•</span>
              <span className="uppercase">Instrumental Acústico de Cura</span>
            </div>
          </div>

          {/* Generated watercolor Header Illustration */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="relative group w-full max-w-sm rounded-[32px] overflow-hidden shadow-xl border-[8px] border-white/45">
              <img
                src="/src/assets/images/luz_da_aurora_dawn_1780761282431.png"
                alt="Amanhecer no Lago Celeste - Luz da Aurora"
                referrerPolicy="no-referrer"
                className="w-full h-44 object-cover transform scale-102 group-hover:scale-105 transition-transform duration-[6000ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent flex items-end p-4">
                <span className="font-serif text-white text-xs italic">
                  "A aurora nasce devagar, sem pressa, sem cobrança."
                </span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Tabs navigation list - Translucent Glass styling */}
      <nav id="tabs-navigation-rail" className="sticky top-0 z-40 bg-white/20 backdrop-blur-md border-b border-white/30 flex justify-center py-4">
        <div className="flex bg-white/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/50 space-x-2 shadow-sm">
          
          <button
            onClick={() => setActiveTab("peace")}
            id="tab-btn-peace"
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-sans text-xs font-semibold tracking-wide transition-all ${
              activeTab === "peace"
                ? "bg-stone-800 text-white shadow-md scale-[1.02]"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/30"
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>Sopro de Paz (Ritual & Som)</span>
          </button>

          <button
            onClick={() => setActiveTab("lyrics")}
            id="tab-btn-lyrics"
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-sans text-xs font-semibold tracking-wide transition-all ${
              activeTab === "lyrics"
                ? "bg-stone-800 text-white shadow-md scale-[1.02]"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/30"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Letra & Diário de Acorde</span>
          </button>

          <button
            onClick={() => setActiveTab("oracle")}
            id="tab-btn-oracle"
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-sans text-xs font-semibold tracking-wide transition-all ${
              activeTab === "oracle"
                ? "bg-stone-800 text-white shadow-md scale-[1.02]"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/30"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Oráculo Luz da Aurora</span>
          </button>

        </div>
      </nav>

      {/* Primary Layout Switcher */}
      <main id="primary-content-viewport" className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 py-10 relative z-10">
        
        {/* TAB 1: Breath & Sounds of Dawn */}
        {activeTab === "peace" && (
          <div id="tab-peace-view" className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl">
                <h2 className="font-serif italic text-stone-800 text-xl mb-2 flex items-center space-x-2">
                  <Compass className="w-5 h-5 text-stone-700" />
                  <span>Sintonize seu Ritmo</span>
                </h2>
                <p className="text-stone-600 font-serif text-sm leading-relaxed mb-4">
                  Antes de começar a escrever ou ler, clame por um instante de silêncio interno. Desative as notificações externas. Coloque seus fones de ouvido e ligue nosso sussurrador de som.
                </p>
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white/60 flex items-start space-x-3 text-xs leading-relaxed text-stone-600">
                  <Info className="w-4.5 h-4.5 text-stone-700 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Explicação de Tom:</strong> O som gerado pelo santuário baseia-se nos pilares da música de cura: tons puros com afinação harmônica a 432Hz, piano pentatônico cristalino gerado proceduralmente e som do mar para harmonizar os sentidos.
                  </span>
                </div>
              </div>
              
              <AcousticPlayer />
            </div>

            <div className="space-y-6">
              <BreathingCircle />
            </div>
          </div>
        )}

        {/* TAB 2: Songs full text & Reflective writing journal */}
        {activeTab === "lyrics" && (
          <div id="tab-lyrics-view" className="space-y-12">
            
            {/* Guide strip */}
            <div className="glass-panel p-5 rounded-2xl text-stone-700 text-xs flex items-center space-x-3">
              <div className="bg-white/60 p-2 rounded-xl text-stone-700">
                <Eye className="w-4 h-4" />
              </div>
              <p className="font-sans">
                <strong>Ritual de Escuta Atenta:</strong> Leia a melodia oficial do Luz da Aurora na coluna esquerda. Quando sentir que uma estrofe reflete sua alma, toque no cartão correspondente na coluna direita para preencher sua resposta privada no diário.
              </p>
            </div>

            {/* Subcomponents for lyrics & journaling interaction */}
            <LyricsViewer
              onSelectPrompt={selectPromptFromLyrics}
              activePromptId={selectedPrompt.id}
            />

            <div className="border-t border-white/30 pt-10">
              <JournalingReflections
                currentPrompt={selectedPrompt}
                onSavePromptResponse={handleSavePromptResponse}
                savedResponse={journalResponses[selectedPrompt.id] || ""}
                onFeelingChange={setCurrentFeeling}
                currentFeeling={currentFeeling}
              />
            </div>

          </div>
        )}

        {/* TAB 3: Personalized response card letter (Therapeutic oracle) */}
        {activeTab === "oracle" && (
          <div id="tab-oracle-view">
            <LuzDaAuroraOracle
              currentFeeling={currentFeeling}
              accumulatedDiaryDrafts={getAccumulatedDrafts()}
              userName={userName}
              onUserNameChange={setUserName}
            />
          </div>
        )}

      </main>

      {/* Human, elegant Footer adhering to scope boundaries */}
      <footer id="primary-footer" className="relative z-10 bg-white/10 backdrop-blur-md border-t border-white/30 py-8 text-center text-stone-500 text-xs font-mono tracking-wide mt-auto select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div>
            © 2026 Luz da Aurora • "Você também merece cuidado"
          </div>
          <div className="flex items-center space-x-1.5 text-stone-500">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-300" />
            <span>Feito com delicadeza e fé para mulheres cuidadoras</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

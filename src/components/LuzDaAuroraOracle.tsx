import React, { useState, useEffect } from "react";
import { Sparkles, Calendar, BookOpen, Send, Loader2, ArrowRight, HeartPulse, ClipboardCheck, Trash2 } from "lucide-react";
import { JournalEntry } from "../types";

interface LuzDaAuroraOracleProps {
  currentFeeling: string;
  accumulatedDiaryDrafts: string;
  userName: string;
  onUserNameChange: (name: string) => void;
}

export function LuzDaAuroraOracle({
  currentFeeling,
  accumulatedDiaryDrafts,
  userName,
  onUserNameChange
}: LuzDaAuroraOracleProps) {
  const [loading, setLoading] = useState(false);
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // History system
  const [history, setHistory] = useState<JournalEntry[]>(() => {
    const raw = localStorage.getItem("aurora_letters_history");
    if (raw) return JSON.parse(raw);
    return [];
  });

  const loadingPhrases = [
    "Sua aurora está surgindo devagar...",
    "Preparando um abraço em forma de palavras...",
    "Conectando ao silêncio sagrado do seu coração...",
    "Infundindo carinho nas entrelinhas da sua história...",
    "Lembrando que você merece todo o colo do mundo...",
  ];

  // Rotate loading phrases beautifully
  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const requestLetterFromOracle = async () => {
    if (!currentFeeling) return;
    setLoading(true);
    setCurrentLetter(null);
    setLoadingPhraseIndex(0);

    try {
      const response = await fetch("/api/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeling: currentFeeling,
          journalText: accumulatedDiaryDrafts,
          name: userName,
        }),
      });
      const data = await response.json();

      if (data.letter) {
        setCurrentLetter(data.letter);

        // Save to localized history
        const newEntry: JournalEntry = {
          id: `entry-${Date.now()}`,
          name: userName || "Querida Alma",
          feeling: currentFeeling,
          journalText: accumulatedDiaryDrafts || "Procurando silêncio e acolhida nas estrelas",
          letter: data.letter,
          timestamp: new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        const updatedHistory = [newEntry, ...history];
        setHistory(updatedHistory);
        localStorage.setItem("aurora_letters_history", JSON.stringify(updatedHistory));
      }
    } catch (err) {
      console.error("Erro ao invocar o oráculo Luz da Aurora:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!currentLetter) return;
    navigator.clipboard.writeText(currentLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter((x) => x.id !== id);
    setHistory(updated);
    localStorage.setItem("aurora_letters_history", JSON.stringify(updated));
  };

  return (
    <div id="oracle-portal-wrapper" className="space-y-10 max-w-5xl mx-auto">
      
      {/* Name Input & Feeling Recap Card */}
      <div id="oracle-setup-card" className="glass-panel p-6 md:p-8 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-sm">
        
        <div className="md:col-span-8 space-y-4">
          <div className="space-y-2">
            <span className="bg-white/50 text-stone-850 border border-white/60 font-mono text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider block w-fit shadow-sm font-bold">
              Santuário da Aurora
            </span>
            <h3 className="font-serif italic font-semibold text-stone-850 text-xl">
              Receba Sua Carta Terapêutica Personalizada
            </h3>
            <p className="font-sans text-stone-600 text-xs leading-relaxed max-w-xl">
              Nossa inteligência se une às frequências acolhedoras do Luz da Aurora para elaborar uma reflexão inspirada na nossa música. Registre seu nome e acione o oráculo para acolher sua alma.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-sans text-stone-600 font-semibold">Como gostaria de ser chamada na carta?</label>
              <input
                type="text"
                placeholder="Ex: Aurora, Ana, Cláudia..."
                value={userName}
                onChange={(e) => onUserNameChange(e.target.value)}
                id="user-name-input"
                className="w-full bg-white/45 focus:bg-white/65 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/60 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-sans text-stone-600 font-semibold">Sentimento Ativo no Diário</label>
              <div id="feeling-display-recap" className="w-full bg-white/45 border border-white/60 px-4 py-2.5 rounded-xl text-xs text-stone-800 font-bold flex items-center space-x-1.5 shadow-inner">
                <HeartPulse className="w-4 h-4 text-stone-700 animate-pulse" />
                <span>{currentFeeling || "Selecione na aba anterior"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex justify-center">
          <button
            onClick={requestLetterFromOracle}
            disabled={loading || !currentFeeling}
            id="invoke-oracle-btn"
            className="w-full sm:w-auto md:w-full bg-stone-850 hover:bg-stone-900 duration-300 hover:scale-105 active:scale-[0.98] text-white p-6 rounded-2xl font-sans text-sm font-semibold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center justify-center space-y-2 group border border-white/10"
          >
            <Sparkles className="w-6 h-6 animate-pulse text-stone-200 group-hover:scale-110 transition-transform" />
            <span>Despertar Carta da Aurora</span>
            <span className="text-[10px] font-light text-stone-300 font-sans tracking-wide">Emanar consolo sincero</span>
          </button>
        </div>

      </div>

      {/* Loading Animation Area */}
      {loading && (
        <div id="oracle-loading-space" className="glass-panel-heavy p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto py-16 animate-fade-in">
          <Loader2 className="w-10 h-10 text-stone-700 animate-spin" />
          <h4 className="font-serif italic font-semibold text-stone-850 text-lg">
            Deixe o mar acalmar...
          </h4>
          <p className="font-serif text-sm text-stone-600 italic max-w-sm transition-all duration-500 animate-pulse">
            {loadingPhrases[loadingPhraseIndex]}
          </p>
        </div>
      )}

      {/* Dynamic letter card scroll displaying details */}
      {currentLetter && !loading && (
        <div id="aurora-letter-card" className="glass-panel-heavy p-6 md:p-10 rounded-3xl border border-white/80 shadow-2xl relative max-w-2xl mx-auto animate-fade-in mb-8">
          
          {/* Subtle watermarks or corner designs resembling rich stationery */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/60 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/60 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/60 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/60 rounded-br-xl" />

          <div className="flex items-center justify-between border-b border-white/40 pb-4 mb-6">
            <span className="font-mono text-[10px] text-stone-550">
              {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
            <button
              onClick={copyToClipboard}
              id="copy-letter-btn"
              className="text-stone-600 hover:text-stone-900 transition-colors flex items-center space-x-1 text-xs font-semibold"
            >
              <ClipboardCheck className={`w-4 h-4 ${copied ? "text-emerald-700" : ""}`} />
              <span>{copied ? "Copiada!" : "Copiar Carta"}</span>
            </button>
          </div>

          <div className="prose prose-stone max-w-none text-stone-850 font-serif text-sm leading-relaxed space-y-4 whitespace-pre-line" id="letter-body-rendered">
            {currentLetter}
          </div>

          <div className="border-t border-white/40 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 font-sans">
            <span className="italic font-serif">Inspirado na melodia "Você Também Merece Cuidado" • 76 BPM</span>
            <div className="flex items-center space-x-1.5 text-stone-700 font-semibold mt-2 sm:mt-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Luz da Aurora © 2026</span>
            </div>
          </div>

        </div>
      )}

      {/* History Archive space looking like cards */}
      {history.length > 0 && (
        <div id="oracle-history-section" className="space-y-4 pt-4 border-t border-white/30">
          <h4 className="font-serif italic text-stone-850 text-base font-semibold flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-stone-705" />
            <span>Seu Baú das Auroras Passadas ({history.length})</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => (
              <div
                key={item.id}
                id={`history-card-${item.id}`}
                className="glass-panel p-5 rounded-2xl flex flex-col justify-between hover:bg-white/45 transition-colors duration-300"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 mb-2">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                    </span>
                    <span className="bg-white/50 border border-white/60 uppercase px-2 py-0.5 rounded-full font-bold text-stone-700 text-[9px] tracking-wider">
                      {item.feeling}
                    </span>
                  </div>

                  <h5 className="font-sans font-semibold text-stone-800 text-sm mb-2">
                    Para: {item.name}
                  </h5>

                  <p className="font-serif text-xs text-stone-600 line-clamp-3 mb-4 leading-relaxed italic">
                    {item.letter}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/30 pt-3">
                  <button
                    onClick={() => setCurrentLetter(item.letter)}
                    id={`preview-history-btn-${item.id}`}
                    className="text-stone-850 hover:text-stone-950 hover:underline text-xs font-semibold flex items-center space-x-1"
                  >
                    <span>Reler Carta</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    id={`delete-history-btn-${item.id}`}
                    className="text-stone-400 hover:text-red-700 transition-colors"
                    title="Excluir do baú"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

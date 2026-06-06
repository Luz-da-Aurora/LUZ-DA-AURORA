import React, { useState, useEffect } from "react";
import { Edit3, CheckCircle, Save, Sparkles, Smile, Trash2 } from "lucide-react";
import { ReflectionPrompt, SelfCareTask } from "../types";

interface JournalingReflectionsProps {
  currentPrompt: ReflectionPrompt;
  onSavePromptResponse: (promptId: string, response: string) => void;
  savedResponse?: string;
  onFeelingChange: (feeling: string) => void;
  currentFeeling: string;
}

export function JournalingReflections({
  currentPrompt,
  onSavePromptResponse,
  savedResponse = "",
  onFeelingChange,
  currentFeeling
}: JournalingReflectionsProps) {
  const [typedValue, setTypedValue] = useState(savedResponse);
  const [isSavedFlag, setIsSavedFlag] = useState(false);

  // Synchronize when the active prompt shifts
  useEffect(() => {
    setTypedValue(savedResponse);
    setIsSavedFlag(false);
  }, [currentPrompt.id, savedResponse]);

  const handleSave = () => {
    onSavePromptResponse(currentPrompt.id, typedValue);
    setIsSavedFlag(true);
    setTimeout(() => setIsSavedFlag(false), 2500);
  };

  const feelings = [
    { label: "Cansada de carregar o mundo", color: "bg-white/70 border-white/80 text-orange-950 font-medium" },
    { label: "Sentindo-se culpada por parar", color: "bg-white/70 border-white/80 text-red-950 font-medium" },
    { label: "Buscando paz e reconexão", color: "bg-white/70 border-white/80 text-stone-900 font-medium" },
    { label: "Ansiosa pelo amanhã", color: "bg-white/70 border-white/80 text-emerald-950 font-medium" },
    { label: "Pronta para receber carinho", color: "bg-white/70 border-white/80 text-pink-950 font-medium" }
  ];

  // Micro client-side tasks list
  const [tasks, setTasks] = useState<SelfCareTask[]>(() => {
    const raw = localStorage.getItem("aurora_selfcare_tasks");
    if (raw) return JSON.parse(raw);
    return [
      { id: "task-1", text: "Silenciar o celular por 10 minutos agora", category: "mind", completed: false },
      { id: "task-2", text: "Fazer 1 ciclo completo de respiração guiada", category: "soul", completed: false },
      { id: "task-3", text: "Dizer um 'não' gentil para uma sobrecarga hoje", category: "boundary", completed: false },
      { id: "task-4", text: "Beber um chá sem pressa, sentindo o calor das mãos", category: "body", completed: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem("aurora_selfcare_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div id="journal-reflects-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
      
      {/* Visual Diário Column (Stationery style) */}
      <div id="journaling-stationery-card" className="lg:col-span-7 glass-panel p-6 md:p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden">
        
        {/* Shadow backgrounds */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-2 text-stone-750 text-xs font-semibold bg-white/40 border border-white/50 px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              <Edit3 className="w-3.5 h-3.5 text-stone-600" />
              <span>Meu Diário de Aurora</span>
            </span>
            <span className="text-[11px] font-mono text-stone-500 font-medium">
              Salva-se automaticamente
            </span>
          </div>

          {/* Active prompt focus */}
          <div className="space-y-3 bg-white/55 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-sm transition-all duration-300">
            <span className="text-[9.5px] font-mono text-stone-500 uppercase tracking-widest font-extrabold block">
              {currentPrompt.section}
            </span>
            <h4 className="font-serif italic text-stone-850 text-base leading-tight font-semibold">
              {currentPrompt.title}
            </h4>
            <p className="font-serif text-sm text-stone-600 border-l border-white/60 pl-3 italic">
              "{currentPrompt.lyricsSnippet}"
            </p>
            <p className="font-sans text-xs text-stone-700 pt-1 font-semibold">
              🔔 {currentPrompt.promptText}
            </p>
          </div>

          {/* Notebook Paper simulation textarea container */}
          <div className="relative group">
            <textarea
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              id="reflection-textarea"
              placeholder="Escreva seus sentimentos com liberdade e sutileza... Este espaço é sagrado e totalmente seu."
              rows={7}
              className="w-full bg-white/55 backdrop-blur-sm rounded-2xl p-5 border border-white/45 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 font-serif text-sm leading-relaxed shadow-inner placeholder-stone-400"
            />
            
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <button
                onClick={handleSave}
                id="save-journal-btn"
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-medium shadow-sm transition-all duration-300 hover:scale-105 ${
                  isSavedFlag 
                    ? "bg-emerald-700 text-white" 
                    : "bg-stone-800 hover:bg-stone-900 text-white"
                }`}
              >
                {isSavedFlag ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                    <span>Guardado com Amor</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-white" />
                    <span>Gravar Sentimento</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Emotion tracker selection inside the journal */}
        <div className="mt-8 pt-6 border-t border-white/40">
          <div className="flex items-center space-x-1.5 text-stone-700 text-xs font-semibold mb-3">
            <Smile className="w-4 h-4 text-stone-600" />
            <span>Como sua alma se sente neste exato segundo?</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {feelings.map((f) => {
              const isSelected = currentFeeling === f.label;
              return (
                <button
                  key={f.label}
                  onClick={() => onFeelingChange(f.label)}
                  id={`feeling-chip-${f.label.replace(/\s+/g, "-")}`}
                  className={`px-3.5 py-2 rounded-2xl text-xs border transition-all duration-300 ${
                    isSelected
                      ? `bg-white/85 text-stone-900 border-stone-850 scale-102 ring-1 ring-stone-700 shadow-md font-semibold`
                      : "bg-white/30 hover:bg-white/55 text-stone-600 border-white/45"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Gentle Checklist Task Column */}
      <div id="self-care-checklist-panel" className="lg:col-span-5 glass-panel p-6 md:p-8 rounded-3xl flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-serif italic font-semibold text-stone-800 text-base" id="checklist-title">
                Sussurros de Gentileza
              </h3>
              <p className="text-[11px] font-sans text-stone-500">
                Pequenas permissões diárias de autocuidado.
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-stone-400" />
          </div>

          <div className="space-y-3 pb-1">
            {tasks.map((task) => (
              <label
                key={task.id}
                id={`task-label-${task.id}`}
                className={`flex items-start space-x-3 p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  task.completed
                    ? "bg-white/10 border-white/20 opacity-60"
                    : "bg-white/35 backdrop-blur-sm border-white/50 hover:bg-white/50 hover:border-white/70"
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  id={`task-input-${task.id}`}
                  className="mt-0.5 w-4.5 h-4.5 text-stone-700 cursor-pointer accent-stone-800 border-white/60 rounded"
                />
                <span className={`font-sans text-xs ${
                  task.completed ? "line-through text-stone-400 italic" : "text-stone-700"
                }`}>
                  {task.text}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-white/30 backdrop-blur-sm p-4 rounded-2xl border border-white/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span>Seu Despertar de Hoje</span>
            <span className="font-mono text-[10.5px] font-bold text-stone-800">
              {Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-stone-800 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${(tasks.filter((t) => t.completed).length / tasks.length) * 100}%`,
              }}
            />
          </div>
          <p className="text-[10.5px] text-stone-500 italic text-center pt-1 leading-snug font-serif">
            "A aurora nasce devagar, sem cobrança."
          </p>
        </div>

      </div>

    </div>
  );
}

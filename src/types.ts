/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface JournalEntry {
  id: string;
  name: string;
  feeling: string;
  journalText: string;
  letter: string;
  timestamp: string;
}

export interface ReflectionPrompt {
  id: string;
  section: string;
  title: string;
  lyricsSnippet: string;
  promptText: string;
  userAnswer?: string;
}

export interface SelfCareTask {
  id: string;
  text: string;
  category: "mind" | "body" | "soul" | "boundary";
  completed: boolean;
}

export type BreathPhase = "idle" | "inhale" | "holdFull" | "exhale" | "holdEmpty";

export interface BreathPhaseConfig {
  phase: BreathPhase;
  label: string;
  instruction: string;
  durationMs: number;
  scale: number;
  colorClass: string;
}

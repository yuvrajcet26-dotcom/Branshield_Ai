"use client";

import React from 'react';
import { SceneInfo } from './types';
import {
  Sparkles,
  Layers,
  Database,
  Search,
  Cpu,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  Bot,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface SceneOverlayProps {
  scene: SceneInfo;
  time: number;
  showTelemetry: boolean;
  onCloseTelemetry: () => void;
}

export const SceneOverlay: React.FC<SceneOverlayProps> = ({
  scene,
  time,
  showTelemetry,
  onCloseTelemetry
}) => {
  return (
    <>
      {/* 1. Cinematic Scene Narrative HUD (Top-Left Floating Glass Card) */}
      <div
        style={{ zIndex: 30 }}
        className="absolute top-4 left-6 max-w-lg bg-slate-950/85 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shadow-2xl transition-all duration-300 pointer-events-auto"
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>
              Scene {scene.number}: {scene.name}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-semibold">
            {scene.badgeText}
          </span>
        </div>

        <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
          {scene.title}
        </h3>
        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
          {scene.narrativeText}
        </p>

        {/* Bullet Points */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
          {scene.bulletPoints.map((pt, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1 shrink-0" />
              <span>{pt}</span>
            </div>
          ))}
        </div>

        {/* Technical Metric */}
        {scene.technicalMetric && (
          <div className="mt-3 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px]">
            <span className="text-slate-400 font-medium">{scene.technicalMetric.label}:</span>
            <span className="font-mono font-bold text-sky-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {scene.technicalMetric.value}
            </span>
          </div>
        )}
      </div>

      {/* 2. Dynamic Scene Insets (Contextual Floating Panels) */}

      {/* Scene 5 Inset: User Query Bubble */}
      {scene.id === 5 && (
        <div
          style={{ zIndex: 35, left: '100px', top: '515px' }}
          className="absolute max-w-sm bg-gradient-to-br from-blue-900/95 to-slate-900/95 backdrop-blur-md rounded-2xl p-3.5 border-2 border-blue-400 shadow-2xl animate-fade-in"
        >
          <div className="flex items-center gap-2 mb-1.5 text-blue-300 text-xs font-bold">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Sample User Prompt Input</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-blue-800/60 font-mono text-xs text-blue-100 italic">
            &ldquo;What information is contained in this document? Specifically summarize the architecture diagrams and key technical specifications.&rdquo;
          </div>
          <div className="mt-1.5 text-[9.5px] text-blue-300 font-medium text-right">
            Dispatched to Multimodal Retriever →
          </div>
        </div>
      )}

      {/* Scene 6 Inset: Retrieval Candidate Inspector & Disclaimer */}
      {scene.id === 6 && (
        <div
          style={{ zIndex: 35, right: '80px', top: '520px' }}
          className="absolute max-w-md bg-slate-950/90 backdrop-blur-md rounded-2xl p-3.5 border border-purple-500/80 shadow-2xl"
        >
          <div className="flex items-center justify-between text-xs font-bold text-purple-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Search className="w-4 h-4 text-purple-400" />
              Retrieved Multimodal Candidates
            </span>
            <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full border border-purple-800">
              Top-K Filtered
            </span>
          </div>

          <div className="space-y-2 text-[10.5px]">
            {/* Text Candidates */}
            <div className="p-2 rounded-lg bg-slate-900/90 border border-sky-800/60 text-slate-300">
              <div className="font-bold text-sky-400 mb-0.5 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Text Chunks (Top-3):
              </div>
              <p className="line-clamp-2 italic text-slate-400 text-[10px]">
                &ldquo;[Chunk #42]: IM-RAG architecture couples dual-pipeline ingestion with dense vector similarity indices...&rdquo;
              </p>
            </div>

            {/* Image Candidates */}
            <div className="p-2 rounded-lg bg-slate-900/90 border border-purple-800/60 text-slate-300">
              <div className="font-bold text-purple-400 mb-0.5 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                Page Image Diagrams (Top-2):
              </div>
              <p className="line-clamp-2 italic text-slate-400 text-[10px]">
                &ldquo;[Page 17 Schematic]: Visual features encoded. Agent generated summary: System Architecture block diagram.&rdquo;
              </p>
            </div>
          </div>

          {/* Prompt requirement: Represent this as an illustrative retrieval process, not a claim of measured model performance */}
          <div className="mt-2 pt-2 border-t border-slate-800 text-[9px] text-amber-300/90 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Illustrative retrieval process, not a claim of measured model performance.</span>
          </div>
        </div>
      )}

      {/* Scene 7 Inset: Combined Context Inspector */}
      {scene.id === 7 && (
        <div
          style={{ zIndex: 35, left: '980px', top: '500px' }}
          className="absolute max-w-sm bg-slate-950/90 backdrop-blur-md rounded-2xl p-3 border-2 border-sky-400 shadow-2xl animate-fade-in"
        >
          <div className="flex items-center gap-1.5 text-sky-300 text-xs font-bold mb-1">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Fused Context Payload Preview</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-sky-900/60 font-mono text-[9.5px] text-slate-300 space-y-1">
            <div className="text-sky-400 font-bold">{'<context_block>'}</div>
            <div className="text-blue-300 pl-2">{'• Text: Chunks [42, 43, 44]'}</div>
            <div className="text-purple-300 pl-2">{'• Visual: Page 17 (Architecture)'}</div>
            <div className="text-amber-300 pl-2">{'• Summary: LLM diagram caption'}</div>
            <div className="text-emerald-300 pl-2">{'• Query: "What information..."'}</div>
            <div className="text-sky-400 font-bold">{'</context_block>'}</div>
          </div>
        </div>
      )}

      {/* Scene 8 Inset: Mu-LLM Neural Pulse */}
      {scene.id === 8 && (
        <div
          style={{ zIndex: 35, left: '1280px', top: '500px' }}
          className="absolute max-w-sm bg-slate-950/90 backdrop-blur-md rounded-2xl p-3 border-2 border-emerald-400 shadow-2xl animate-fade-in"
        >
          <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold mb-1">
            <Cpu className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Mu-LLM Reasoning Engine</span>
          </div>
          <p className="text-[10px] text-slate-300 leading-tight">
            Cross-attention mechanism computing multi-modal relevance matrices between text tokens and visual patches.
          </p>
          <div className="mt-2 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-emerald-900">
            <div
              className="bg-emerald-400 h-full rounded-full animate-pulse"
              style={{ width: `${Math.min(100, Math.max(0, ((time - scene.startTime) / (scene.endTime - scene.startTime)) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Scene 9 Inset: Final Response Card */}
      {scene.id === 9 && (
        <div
          style={{ zIndex: 35, right: '40px', top: '500px' }}
          className="absolute max-w-md bg-gradient-to-br from-purple-950/95 to-slate-950/95 backdrop-blur-md rounded-2xl p-4 border-2 border-purple-400 shadow-2xl animate-fade-in"
        >
          <div className="flex items-center justify-between text-xs font-bold text-purple-200 mb-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Synthesized Multimodal Answer
            </span>
            <span className="text-[9px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 font-semibold">
              Grounded
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-800/80 text-[11px] text-slate-200 leading-relaxed font-sans">
            <p className="font-semibold text-white mb-1">
              &ldquo;The analyzed document specifies the IM-RAG (Image-Based Multimodal RAG) framework:&rdquo;
            </p>
            <p className="text-slate-300 text-[10.5px]">
              The system bifurcates ingestion into text chunking and page-to-image encoding with LLM summaries. During retrieval, both modalities are fused into Combined Context for Mu-LLM, enabling grounded answers across both prose and complex system diagrams.
            </p>
          </div>

          {/* Prompt requirement: Display a sample answer that clearly indicates it is illustrative rather than an actual result from a running IM-RAG backend */}
          <div className="mt-2 pt-2 border-t border-slate-800 text-[9px] text-amber-300/90 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Illustrative demonstration response, not an execution of a live backend.</span>
          </div>
        </div>
      )}

      {/* Scene 10 Inset: Grand Finale Hero Banner */}
      {scene.id === 10 && (
        <div
          style={{ zIndex: 35, left: '50%', top: '48%', transform: 'translate(-50%, -50%)' }}
          className="absolute text-center max-w-2xl bg-slate-950/95 backdrop-blur-xl rounded-3xl p-8 border-2 border-sky-400 shadow-[0_0_80px_rgba(56,189,248,0.25)] animate-fade-in"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950 text-sky-400 border border-sky-700 text-xs font-bold mb-3">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>TECHNICAL ARCHITECTURE COMPLETED</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
            IM-RAG
          </h1>
          <h2 className="text-base font-bold text-sky-300 mt-1">
            Image-Based Multimodal Retrieval-Augmented Generation
          </h2>
          <p className="text-sm font-semibold text-slate-300 italic mt-3 bg-slate-900/90 py-2 px-4 rounded-xl border border-slate-800">
            &ldquo;From Documents and Images to Context-Aware Answers.&rdquo;
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-blue-900/60">
              <span className="text-[10px] text-blue-400 font-bold block">Phase 1</span>
              <span className="text-xs font-bold text-white">Knowledge Ingestion</span>
              <p className="text-[9px] text-slate-400 mt-0.5">Dual text & image pipeline</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-purple-900/60">
              <span className="text-[10px] text-purple-400 font-bold block">Phase 2</span>
              <span className="text-xs font-bold text-white">Multimodal Retrieval</span>
              <p className="text-[9px] text-slate-400 mt-0.5">Top-K text & image filter</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-900/60">
              <span className="text-[10px] text-emerald-400 font-bold block">Inference</span>
              <span className="text-xs font-bold text-white">Mu-LLM Generation</span>
              <p className="text-[9px] text-slate-400 mt-0.5">Context-aware answers</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Live Telemetry Drawer (Right Side) */}
      {showTelemetry && (
        <div
          style={{ zIndex: 40 }}
          className="absolute top-4 right-4 w-80 bg-slate-950/95 backdrop-blur-xl rounded-2xl p-4 border border-slate-700 shadow-2xl text-white text-xs space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-extrabold text-sky-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Live Pipeline Telemetry
            </span>
            <button
              onClick={onCloseTelemetry}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-[10px] font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Current Phase:</span>
              <span className="font-mono font-bold text-sky-300">
                {scene.phase.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Active Nodes:</span>
              <span className="font-mono font-bold text-emerald-400">
                {scene.activeNodeIds.length} Nodes
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Active Connectors:</span>
              <span className="font-mono font-bold text-indigo-400">
                {scene.activeConnectorIds.length} Paths
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Text Store Size:</span>
              <span className="font-mono font-bold text-sky-400">184 Chunks</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Image Store Size:</span>
              <span className="font-mono font-bold text-purple-400">24 Pages</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Mu-LLM Attention:</span>
              <span className="font-mono font-bold text-emerald-400">
                {scene.id >= 8 ? 'CROSS-MODAL ACTIVE' : 'STANDBY'}
              </span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[9.5px] text-slate-400 leading-tight">
            Telemetry tracks real-time data flow across the 18 architecture components.
          </div>
        </div>
      )}
    </>
  );
};

"use client";

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Download,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Activity,
  Sliders,
  CheckCircle2,
  Film
} from 'lucide-react';
import { SCENES, TOTAL_DURATION } from './architecture-data';
import { SceneInfo } from './types';

interface PlaybackControlsProps {
  currentTime: number;
  isPlaying: boolean;
  speed: number;
  currentScene: SceneInfo;
  viewMode: 'vector' | 'sprites' | 'hybrid';
  showTelemetry: boolean;
  isExporting: boolean;
  exportProgress: number;
  onPlayPause: () => void;
  onReplay: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  onJumpToPhase: (phase: 1 | 2) => void;
  onJumpToScene: (sceneId: number) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onViewModeChange: (mode: 'vector' | 'sprites' | 'hybrid') => void;
  onToggleTelemetry: () => void;
  onExportVideo: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentTime,
  isPlaying,
  speed,
  currentScene,
  viewMode,
  showTelemetry,
  isExporting,
  exportProgress,
  onPlayPause,
  onReplay,
  onSeek,
  onSpeedChange,
  onJumpToPhase,
  onJumpToScene,
  onToggleFullscreen,
  isFullscreen,
  onViewModeChange,
  onToggleTelemetry,
  onExportVideo
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTime / TOTAL_DURATION) * 100));

  return (
    <div className="w-full bg-slate-950/95 backdrop-blur-md border-t border-slate-800 text-white px-4 py-3 select-none flex flex-col gap-2.5 shadow-2xl z-40">
      {/* 1. Main Interactive Timeline Scrubber with Scene Markers */}
      <div className="relative w-full flex items-center group">
        <div
          className="relative w-full h-3 bg-slate-800/90 rounded-full cursor-pointer overflow-hidden border border-slate-700/60 shadow-inner"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            onSeek(clickPos * TOTAL_DURATION);
          }}
        >
          {/* Progress fill */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Scene boundaries ticks */}
          {SCENES.map(scene => {
            const leftPct = (scene.startTime / TOTAL_DURATION) * 100;
            return (
              <div
                key={scene.id}
                title={`Scene ${scene.id}: ${scene.name}`}
                className="absolute top-0 bottom-0 w-0.5 bg-slate-900/80 hover:bg-white z-10 cursor-pointer"
                style={{ left: `${leftPct}%` }}
              />
            );
          })}
        </div>

        {/* Scrubber thumb handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] border-2 border-sky-500 pointer-events-none transition-all duration-75"
          style={{ left: `calc(${progressPercent}% - 8px)` }}
        />
      </div>

      {/* 2. Primary Transport & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Playback controls & Time */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={onPlayPause}
            className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-md hover:shadow-sky-500/30 transition-all flex items-center gap-1.5 active:scale-95"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Replay Button */}
          <button
            onClick={onReplay}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow transition-all flex items-center gap-1 active:scale-95"
            title="Replay from Beginning"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Replay</span>
          </button>

          {/* Timestamp readout */}
          <div className="font-mono text-[13px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5">
            <span className="text-sky-400 font-bold">{formatTime(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{formatTime(TOTAL_DURATION)}</span>
          </div>

          {/* Speed selector */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            {[0.5, 1, 1.5, 2].map(s => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  speed === s ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Center: Phase Replay Shortcuts */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[11px] font-semibold hidden md:inline">Jump to Phase:</span>
          <button
            onClick={() => onJumpToPhase(1)}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
              currentScene.phase === 'phase1' || (currentScene.id >= 2 && currentScene.id <= 4)
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                : 'bg-slate-800/90 hover:bg-blue-900/60 text-blue-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            Phase 1: Knowledge Base
          </button>
          <button
            onClick={() => onJumpToPhase(2)}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
              currentScene.phase === 'phase2' || (currentScene.id >= 5 && currentScene.id <= 9)
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'bg-slate-800/90 hover:bg-emerald-900/60 text-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Phase 2: Retrieval & Response
          </button>
        </div>

        {/* Right: View Mode, Telemetry & 1080p MP4 Export */}
        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800" title="Switch Component Style">
            <button
              onClick={() => onViewModeChange('vector')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                viewMode === 'vector' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              1080p Vector
            </button>
            <button
              onClick={() => onViewModeChange('sprites')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                viewMode === 'sprites' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Diagram Crops
            </button>
            <button
              onClick={() => onViewModeChange('hybrid')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                viewMode === 'hybrid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hybrid
            </button>
          </div>

          {/* Telemetry Inspector Button */}
          <button
            onClick={onToggleTelemetry}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1 ${
              showTelemetry
                ? 'bg-purple-900/80 border-purple-500 text-purple-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Live Telemetry Inspector"
          >
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="hidden xl:inline">Telemetry</span>
          </button>

          {/* MP4 Export Button */}
          <button
            onClick={onExportVideo}
            disabled={isExporting}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-lg transition-all active:scale-95 ${
              isExporting
                ? 'bg-amber-600/80 text-white cursor-wait'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
            }`}
            title="Export 1920x1080 Video (.mp4 / .webm)"
          >
            {isExporting ? (
              <>
                <Film className="w-4 h-4 animate-spin text-white" />
                <span>Exporting ({exportProgress}%)</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export MP4 Video</span>
              </>
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter 16:9 Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. Scene Navigator Bar (Scene 1 to Scene 10) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar border-t border-slate-800/60 pt-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap mr-1">
          Scenes:
        </span>
        {SCENES.map(scene => {
          const isCurrent = currentScene.id === scene.id;
          return (
            <button
              key={scene.id}
              onClick={() => onJumpToScene(scene.id)}
              className={`px-2 py-1 rounded-lg text-[10.5px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm shadow-sky-500/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCurrent ? 'bg-slate-950' : 'bg-slate-500'
                }`}
              />
              <span className="font-mono text-[9px] opacity-75">{scene.id}.</span>
              <span>{scene.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

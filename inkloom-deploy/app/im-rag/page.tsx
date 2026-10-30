"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  NODES,
  CONNECTORS,
  SCENES,
  TOTAL_DURATION,
  getSceneAtTime,
  isNodeActiveAtTime,
  isConnectorActiveAtTime
} from '@/components/im-rag/architecture-data';
import { ArchitectureNodeComponent } from '@/components/im-rag/vector-nodes';
import { ConnectorLayer } from '@/components/im-rag/connector-layer';
import { PlaybackControls } from '@/components/im-rag/playback-controls';
import { SceneOverlay } from '@/components/im-rag/scene-overlay';
import { recordAnimationToVideo, drawFrameToCanvas, preloadComponentImages } from '@/components/im-rag/video-exporter';
import {
  Sparkles,
  ArrowLeft,
  Camera,
  Info,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Film
} from 'lucide-react';

export default function ImRagDemonstrationPage() {
  // Playback state
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'vector' | 'sprites' | 'hybrid'>('vector');
  const [showTelemetry, setShowTelemetry] = useState<boolean>(false);
  const [showRefModal, setShowRefModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Video Export state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Refs for animation loop
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  const currentScene = getSceneAtTime(currentTime);

  // Animation Frame Loop
  const animate = useCallback(
    (now: number) => {
      if (lastTimeRef.current !== null && isPlaying && !isExporting) {
        const delta = (now - lastTimeRef.current) / 1000;
        setCurrentTime(prevTime => {
          const nextTime = prevTime + delta * speed;
          if (nextTime >= TOTAL_DURATION) {
            setIsPlaying(false);
            return TOTAL_DURATION;
          }
          return nextTime;
        });
      }
      lastTimeRef.current = now;
      requestRef.current = requestAnimationFrame(animate);
    },
    [isPlaying, speed, isExporting]
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // Keyboard Shortcuts (Space for Play/Pause, Left/Right for Seek)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime(t => Math.min(TOTAL_DURATION, t + 2));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime(t => Math.max(0, t - 2));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handlePlayPause = () => setIsPlaying(prev => !prev);

  const handleReplay = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(TOTAL_DURATION, time)));
  };

  const handleSpeedChange = (newSpeed: number) => setSpeed(newSpeed);

  const handleJumpToPhase = (phase: 1 | 2) => {
    if (phase === 1) {
      setCurrentTime(5.0); // Scene 2 start
    } else {
      setCurrentTime(22.0); // Scene 5 start
    }
    setIsPlaying(true);
  };

  const handleJumpToScene = (sceneId: number) => {
    const targetScene = SCENES.find(s => s.id === sceneId);
    if (targetScene) {
      setCurrentTime(targetScene.startTime);
      setIsPlaying(true);
    }
  };

  const handleToggleFullscreen = () => {
    if (!stageContainerRef.current) return;
    if (!document.fullscreenElement) {
      stageContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Snapshot Current 1080p Frame as PNG
  const handleCaptureSnapshot = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const componentImages = await preloadComponentImages();
    drawFrameToCanvas(ctx, currentTime, componentImages, viewMode);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `IM-RAG-Frame-${currentTime.toFixed(1)}s-Scene${currentScene.id}.png`;
    link.click();
  };

  // Export 1080p Video (.mp4 / .webm)
  const handleExportVideo = async () => {
    if (isExporting) return;
    setIsPlaying(false);
    setIsExporting(true);
    setExportProgress(0);

    try {
      const videoBlob = await recordAnimationToVideo(progress => {
        setExportProgress(progress);
      });

      const url = URL.createObjectURL(videoBlob);
      setDownloadUrl(url);

      const extension = videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
      const link = document.createElement('a');
      link.href = url;
      link.download = `IM-RAG-System-Architecture-Demonstration.${extension}`;
      link.click();
    } catch (err) {
      console.error('Video export error:', err);
      alert('Video export could not be completed in this browser: ' + err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Header Navigation Bar */}
      <header className="h-14 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Platform Overview</span>
          </Link>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              IM-RAG
            </span>
            <span className="hidden md:inline text-xs text-slate-400">
              Image-Based Multimodal Retrieval-Augmented Generation
            </span>
            <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full font-bold">
              Technical Motion Demo
            </span>
          </div>
        </div>

        {/* Top Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* Reference Diagram Comparison Modal Button */}
          <button
            onClick={() => setShowRefModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
            title="Inspect Original Reference Diagram (Slide 16 & 17)"
          >
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Reference Diagrams</span>
          </button>

          {/* Quick Snapshot 1080p PNG */}
          <button
            onClick={handleCaptureSnapshot}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
            title="Download Current 1080p Frame Snapshot"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Capture PNG</span>
          </button>

          {/* Institutional Credit Badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span>SVKM Technical Architecture Slide 17</span>
          </div>
        </div>
      </header>

      {/* Main 16:9 Cinema Viewport Container */}
      <main
        ref={stageContainerRef}
        className="flex-1 relative flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
      >
        {/* 16:9 Aspect Ratio Box Scaled to Screen */}
        <div
          className="relative w-full max-w-[1920px] aspect-[16/9] shadow-2xl overflow-hidden bg-[#090D16]"
          style={{
            maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 128px)'
          }}
        >
          {/* Base Coordinates Stage (1920 x 1080 native coordinate space scaled with CSS) */}
          <div
            className="absolute inset-0 origin-top-left"
            style={{
              width: '1920px',
              height: '1080px',
              transform: `scale(calc(min(100vw / 1920, ${
                isFullscreen
                  ? '100vh / 1080'
                  : '(100vh - 130px) / 1080'
              })))`,
              transformOrigin: 'top left'
            }}
          >
            {/* Ambient Background Grid & Studio Lights */}
            <div className="absolute inset-0 pointer-events-none">
              <svg width="1920" height="1080" className="opacity-15">
                <defs>
                  <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748B" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="1920" height="1080" fill="url(#gridPattern)" />
              </svg>

              {/* Phase 1 Soft Blue Glow */}
              <div
                className="absolute top-[80px] left-[100px] w-[1720px] h-[400px] rounded-3xl pointer-events-none opacity-20 filter blur-3xl"
                style={{
                  background: 'radial-gradient(circle, #2563EB 0%, transparent 75%)'
                }}
              />
              {/* Phase 2 Soft Green Glow */}
              <div
                className="absolute top-[500px] left-[100px] w-[1720px] h-[420px] rounded-3xl pointer-events-none opacity-15 filter blur-3xl"
                style={{
                  background: 'radial-gradient(circle, #10B981 0%, transparent 75%)'
                }}
              />
            </div>

            {/* Architecture Section 1: Phase 1 Container (Knowledge Base Generation) */}
            <div
              style={{
                left: '60px',
                top: '100px',
                width: '1800px',
                height: '385px',
                zIndex: 5
              }}
              className="absolute rounded-3xl bg-slate-900/40 border-2 border-blue-500/30 backdrop-blur-sm p-6 shadow-[inset_0_0_30px_rgba(37,99,235,0.05)]"
            >
              {/* Phase 1 Banner Pill (Slide 17 Faithful) */}
              <div className="absolute -top-4 left-10 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-700 to-blue-600 text-white font-black text-sm tracking-wide shadow-lg border border-blue-400">
                <span className="w-5 h-5 rounded-full bg-white text-blue-700 font-extrabold text-xs flex items-center justify-center">
                  1
                </span>
                <span>Phase 1: Knowledge Base Generation</span>
              </div>
            </div>

            {/* Architecture Section 2: Phase 2 Container (Retrieval and Response Generation) */}
            <div
              style={{
                left: '60px',
                top: '505px',
                width: '1800px',
                height: '420px',
                zIndex: 5
              }}
              className="absolute rounded-3xl bg-slate-900/40 border-2 border-emerald-500/30 backdrop-blur-sm p-6 shadow-[inset_0_0_30px_rgba(16,185,129,0.05)]"
            >
              {/* Phase 2 Banner Pill (Slide 17 Faithful) */}
              <div className="absolute -top-4 left-10 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-black text-sm tracking-wide shadow-lg border border-emerald-400">
                <span className="w-5 h-5 rounded-full bg-white text-emerald-700 font-extrabold text-xs flex items-center justify-center">
                  2
                </span>
                <span>Phase 2: Retrieval and Response Generation</span>
              </div>
            </div>

            {/* SVG Connector Paths Layer with Animated Traveling Particles */}
            <ConnectorLayer
              connectors={CONNECTORS}
              activeConnectorIds={currentScene.activeConnectorIds}
              time={currentTime}
            />

            {/* 18 Architecture Component Nodes */}
            {NODES.map(node => (
              <ArchitectureNodeComponent
                key={node.id}
                node={node}
                isActive={currentScene.activeNodeIds.includes(node.id)}
                viewMode={viewMode}
                time={currentTime}
              />
            ))}

            {/* Cinematic Narrative Overlay, Step Cards, Query Dialogue & Telemetry */}
            <SceneOverlay
              scene={currentScene}
              time={currentTime}
              showTelemetry={showTelemetry}
              onCloseTelemetry={() => setShowTelemetry(false)}
            />
          </div>
        </div>
      </main>

      {/* Bottom Transport HUD & Timeline Scrubber Bar */}
      <PlaybackControls
        currentTime={currentTime}
        isPlaying={isPlaying}
        speed={speed}
        currentScene={currentScene}
        viewMode={viewMode}
        showTelemetry={showTelemetry}
        isExporting={isExporting}
        exportProgress={exportProgress}
        onPlayPause={handlePlayPause}
        onReplay={handleReplay}
        onSeek={handleSeek}
        onSpeedChange={handleSpeedChange}
        onJumpToPhase={handleJumpToPhase}
        onJumpToScene={handleJumpToScene}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        onViewModeChange={setViewMode}
        onToggleTelemetry={() => setShowTelemetry(prev => !prev)}
        onExportVideo={handleExportVideo}
      />

      {/* Export Progress Modal */}
      {isExporting && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <Film className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-xl font-black text-white">Rendering 1080p Video</h3>
            <p className="text-xs text-slate-300">
              Exporting 55 seconds of IM-RAG architecture animation frame-by-frame at 1920 × 1080 resolution.
            </p>

            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-150"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <div className="font-mono text-sm font-bold text-emerald-400">
              {exportProgress}% Complete
            </div>
            <p className="text-[10px] text-slate-400">
              Your browser will automatically download the video file when the render completes.
            </p>
          </div>
        </div>
      )}

      {/* Reference Diagram Comparison Modal */}
      {showRefModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-black text-white">
                  Original Reference Architecture (Slide 16 & 17)
                </h3>
              </div>
              <button
                onClick={() => setShowRefModal(false)}
                className="text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-800 text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This animation faithfully recreates the authentic 18-component IM-RAG architecture from your uploaded slides. Each component, connector, and dataflow corresponds directly to the original specification.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Slide 17: Colored 3D Architecture */}
              <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold text-sky-400 flex items-center justify-between">
                  <span>Slide 17: Colored 3D Architecture</span>
                  <span className="text-[10px] bg-blue-950 px-2 py-0.5 rounded text-blue-300">Visual Blueprint</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/reference/media_1793109237641_23eee29b.png"
                  alt="Slide 17"
                  className="w-full rounded-xl border border-slate-800 shadow"
                />
                <p className="text-[10px] text-slate-400">
                  Defines Phase 1 (Knowledge Base Generation) & Phase 2 (Retrieval & Response Generation).
                </p>
              </div>

              {/* Slide 16: Conceptual Flowchart */}
              <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold text-purple-400 flex items-center justify-between">
                  <span>Slide 16: Dataflow Schema</span>
                  <span className="text-[10px] bg-purple-950 px-2 py-0.5 rounded text-purple-300">Flowchart Reference</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/reference/media_1793109228064_fc00e5d2.png"
                  alt="Slide 16"
                  className="w-full rounded-xl border border-slate-800 shadow"
                />
                <p className="text-[10px] text-slate-400">
                  Specifies data transformations: document → text/image → vector stores → multimodal retriever → Mu-LLM.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowRefModal(false)}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
              >
                Return to Live Demonstration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

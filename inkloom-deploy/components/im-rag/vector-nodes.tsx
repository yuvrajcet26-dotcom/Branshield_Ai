"use client";

import React from 'react';
import { ArchitectureNode } from './types';

interface VectorNodeProps {
  node: ArchitectureNode;
  isActive: boolean;
  viewMode: 'vector' | 'sprites' | 'hybrid';
  time: number;
}

export const ArchitectureNodeComponent: React.FC<VectorNodeProps> = ({
  node,
  isActive,
  viewMode,
  time
}) => {
  const isSpriteOnly = viewMode === 'sprites';
  const showHybridCrop = viewMode === 'hybrid';

  return (
    <div
      id={`node-${node.id}`}
      style={{
        position: 'absolute',
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${node.width}px`,
        height: `${node.height}px`,
        transform: isActive ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, filter 0.35s ease',
        zIndex: isActive ? 20 : 10
      }}
      className={`group select-none cursor-pointer flex flex-col items-center justify-center rounded-2xl p-2.5 transition-all duration-300 ${
        isActive
          ? 'bg-slate-900/90 shadow-[0_0_25px_rgba(56,189,248,0.35)] ring-2 ring-sky-400 border border-sky-300/40'
          : 'bg-slate-900/60 shadow-lg ring-1 ring-slate-800/80 border border-slate-700/50 hover:bg-slate-850 hover:ring-slate-700'
      }`}
    >
      {/* Active Pulse Aura */}
      {isActive && (
        <span
          className="absolute -inset-1 rounded-2xl opacity-40 animate-pulse pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${node.accentColor} 0%, transparent 70%)`
          }}
        />
      )}

      {/* Main Visual Representation */}
      <div className="relative w-full flex-1 flex items-center justify-center">
        {isSpriteOnly ? (
          /* Mode 1: Exact Cropped PNG from reference diagram */
          <div className="relative flex items-center justify-center w-full h-full p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={node.cropImage}
              alt={node.label}
              className="max-h-full max-w-full object-contain filter drop-shadow-md rounded"
            />
          </div>
        ) : (
          /* Mode 2: Ultra-Crisp High-Resolution Vector Representation matching reference style */
          <div className="relative flex items-center justify-center w-full h-full">
            <NodeVectorGraphics iconType={node.iconType} isActive={isActive} accentColor={node.accentColor} />
            {showHybridCrop && (
              <div
                title="Extracted from reference slide"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded bg-slate-950/90 p-0.5 border border-slate-700 shadow flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={node.cropImage} alt="ref crop" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Node Text Label & Sublabel */}
      <div className="w-full text-center mt-1 z-10 flex flex-col items-center">
        <span
          className={`text-[12px] font-bold tracking-tight leading-tight transition-colors ${
            isActive ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]' : 'text-slate-200'
          }`}
        >
          {node.label}
        </span>
        {node.sublabel && (
          <span
            className={`text-[9.5px] font-medium leading-tight truncate max-w-full px-1 mt-0.5 rounded ${
              isActive ? 'text-sky-300 font-semibold' : 'text-slate-400'
            }`}
          >
            {node.sublabel}
          </span>
        )}
      </div>

      {/* Stage Activity Dot */}
      {isActive && (
        <div className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: node.accentColor }}
          />
          <span
            className="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-slate-900"
            style={{ backgroundColor: node.accentColor }}
          />
        </div>
      )}
    </div>
  );
};

// Vector graphics accurately recreating each component from Slide 17
const NodeVectorGraphics: React.FC<{
  iconType: ArchitectureNode['iconType'];
  isActive: boolean;
  accentColor: string;
}> = ({ iconType, isActive, accentColor }) => {
  switch (iconType) {
    case 'document-stack':
      return (
        <svg viewBox="0 0 80 80" className="w-16 h-16 filter drop-shadow">
          <defs>
            <linearGradient id="docGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="photoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          {/* Back sheet */}
          <rect x="18" y="8" width="44" height="54" rx="4" fill="#94A3B8" opacity="0.6" />
          {/* Middle sheet */}
          <rect x="22" y="12" width="44" height="54" rx="4" fill="#CBD5E1" opacity="0.8" />
          {/* Front sheet */}
          <rect x="26" y="16" width="44" height="54" rx="4" fill="url(#docGrad)" stroke="#94A3B8" strokeWidth="1" />
          {/* Folded corner */}
          <path d="M 60 16 L 70 26 L 60 26 Z" fill="#94A3B8" opacity="0.5" />
          {/* Document text lines */}
          <line x1="32" y1="26" x2="54" y2="26" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="32" x2="48" y2="32" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
          {/* Image thumbnail on front page */}
          <rect x="32" y="38" width="32" height="24" rx="3" fill="url(#photoGrad)" />
          {/* Sun & mountain on image */}
          <circle cx="40" cy="45" r="3" fill="#FDE047" />
          <polygon points="34,60 44,48 52,58 60,52 64,60" fill="#0369A1" />
        </svg>
      );

    case 'text-extraction':
      return (
        <svg viewBox="0 0 70 60" className="w-14 h-12 filter drop-shadow">
          <rect x="15" y="6" width="40" height="48" rx="4" fill="#F8FAFC" stroke="#60A5FA" strokeWidth="1.5" />
          <line x1="22" y1="16" x2="48" y2="16" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="22" y1="24" x2="44" y2="24" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
          <line x1="22" y1="31" x2="48" y2="31" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
          <line x1="22" y1="38" x2="40" y2="38" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
          <line x1="22" y1="44" x2="46" y2="44" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
          {/* Sparkle extraction indicator */}
          <circle cx="50" cy="12" r="3" fill="#38BDF8" className={isActive ? 'animate-ping' : ''} />
        </svg>
      );

    case 'text-chunks':
      return (
        <svg viewBox="0 0 70 60" className="w-14 h-12 filter drop-shadow">
          <defs>
            <linearGradient id="purpleCard" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7E22CE" />
            </linearGradient>
          </defs>
          {/* Stack of purple chunk cards */}
          <rect x="12" y="8" width="42" height="34" rx="4" fill="#9333EA" opacity="0.4" />
          <rect x="16" y="13" width="42" height="34" rx="4" fill="#A855F7" opacity="0.7" />
          <rect x="20" y="18" width="42" height="34" rx="4" fill="url(#purpleCard)" stroke="#E9D5FF" strokeWidth="1" />
          <line x1="26" y1="26" x2="52" y2="26" stroke="#F3E8FF" strokeWidth="2" strokeLinecap="round" />
          <line x1="26" y1="33" x2="48" y2="33" stroke="#F3E8FF" strokeWidth="2" strokeLinecap="round" />
          <line x1="26" y1="40" x2="44" y2="40" stroke="#F3E8FF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'text-store':
    case 'image-store': {
      const isBlue = iconType === 'text-store';
      const c1 = isBlue ? '#38BDF8' : '#C084FC';
      const c2 = isBlue ? '#0284C7' : '#7E22CE';
      return (
        <svg viewBox="0 0 70 65" className="w-14 h-13 filter drop-shadow">
          <defs>
            <linearGradient id={isBlue ? 'cylBlue' : 'cylPurp'} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={c1} />
              <stop offset="100%" stopColor={c2} />
            </linearGradient>
          </defs>
          {/* 3D Database Cylinder */}
          {/* Bottom curve */}
          <path d="M 15 36 C 15 48, 55 48, 55 36 L 55 44 C 55 54, 15 54, 15 44 Z" fill={`url(#${isBlue ? 'cylBlue' : 'cylPurp'})`} opacity="0.85" />
          {/* Middle tier */}
          <path d="M 15 24 C 15 36, 55 36, 55 24 L 55 34 C 55 44, 15 44, 15 34 Z" fill={`url(#${isBlue ? 'cylBlue' : 'cylPurp'})`} opacity="0.95" />
          {/* Top cylinder body */}
          <path d="M 15 14 L 15 24 C 15 34, 55 34, 55 24 L 55 14 Z" fill={`url(#${isBlue ? 'cylBlue' : 'cylPurp'})`} />
          {/* Top cap ellipse */}
          <ellipse cx="35" cy="14" rx="20" ry="7" fill={c1} stroke="#FFFFFF" strokeWidth="1" />
          {/* Front badge icon: Document or Image */}
          {isBlue ? (
            <g transform="translate(38, 28) scale(0.7)">
              <rect x="0" y="0" width="16" height="20" rx="2" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
              <line x1="4" y1="5" x2="12" y2="5" stroke="#0284C7" strokeWidth="1.5" />
              <line x1="4" y1="10" x2="12" y2="10" stroke="#0284C7" strokeWidth="1.5" />
            </g>
          ) : (
            <g transform="translate(38, 28) scale(0.7)">
              <rect x="0" y="0" width="18" height="18" rx="2" fill="#FFFFFF" stroke="#7E22CE" strokeWidth="1.5" />
              <circle cx="5" cy="6" r="2" fill="#A855F7" />
              <polygon points="3,15 8,9 12,13 16,7 16,15" fill="#7E22CE" />
            </g>
          )}
        </svg>
      );
    }

    case 'pages-to-images':
      return (
        <svg viewBox="0 0 70 60" className="w-14 h-12 filter drop-shadow">
          <defs>
            <linearGradient id="pageImgGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
          </defs>
          {/* Back photo frame */}
          <rect x="12" y="10" width="34" height="26" rx="3" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
          <rect x="15" y="13" width="28" height="20" rx="2" fill="#0284C7" />
          {/* Front photo frame */}
          <rect x="24" y="18" width="34" height="28" rx="3" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1.5" />
          <rect x="27" y="21" width="28" height="22" rx="2" fill="url(#pageImgGrad)" />
          {/* Sun & mountain on front photo */}
          <circle cx="33" cy="27" r="2.5" fill="#FEF08A" />
          <polygon points="29,40 37,30 43,36 51,28 53,40" fill="#0C4A6E" />
        </svg>
      );

    case 'image-encoding':
      return (
        <svg viewBox="0 0 70 60" className="w-14 h-12 filter drop-shadow">
          <defs>
            <linearGradient id="cubeGreen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          {/* 3D Neural Cube */}
          <polygon points="35,10 56,22 35,34 14,22" fill="#6EE7B7" stroke="#A7F3D0" strokeWidth="1" />
          <polygon points="14,22 35,34 35,52 14,40" fill="url(#cubeGreen)" />
          <polygon points="35,34 56,22 56,40 35,52" fill="#047857" />
          {/* Neural graph overlay on front face */}
          <circle cx="28" cy="40" r="2" fill="#FFFFFF" />
          <circle cx="42" cy="40" r="2" fill="#FFFFFF" />
          <circle cx="35" cy="46" r="2" fill="#FFFFFF" />
          <line x1="28" y1="40" x2="42" y2="40" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
          <line x1="28" y1="40" x2="35" y2="46" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
          <line x1="42" y1="40" x2="35" y2="46" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
        </svg>
      );

    case 'image-summary':
      return (
        <svg viewBox="0 0 80 60" className="w-16 h-12 filter drop-shadow">
          {/* Outer container */}
          <rect x="8" y="10" width="64" height="40" rx="4" fill="#F0F9FF" stroke="#38BDF8" strokeWidth="1.5" />
          {/* Left: Image thumbnail */}
          <rect x="13" y="16" width="22" height="26" rx="2" fill="#0284C7" />
          <polygon points="15,38 21,28 26,34 31,26 33,38" fill="#075985" />
          {/* Center: Plus sign */}
          <circle cx="41" cy="29" r="6" fill="#0284C7" />
          <line x1="38" y1="29" x2="44" y2="29" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="41" y1="26" x2="41" y2="32" stroke="#FFFFFF" strokeWidth="1.5" />
          {/* Right: Summary text lines */}
          <line x1="51" y1="20" x2="66" y2="20" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
          <line x1="51" y1="26" x2="64" y2="26" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="51" y1="32" x2="67" y2="32" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="51" y1="38" x2="61" y2="38" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'retriever-p1':
    case 'retriever-p2': {
      const isPhase1 = iconType === 'retriever-p1';
      const cFill = isPhase1 ? '#1D4ED8' : '#6B21A8';
      const cTop = isPhase1 ? '#3B82F6' : '#9333EA';
      return (
        <svg viewBox="0 0 80 75" className="w-16 h-15 filter drop-shadow">
          <defs>
            <linearGradient id={isPhase1 ? 'retBlue' : 'retPurp'} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={cTop} />
              <stop offset="100%" stopColor={cFill} />
            </linearGradient>
          </defs>
          {/* 3D Database body */}
          <path d="M 18 20 L 18 52 C 18 64, 62 64, 62 52 L 62 20 Z" fill={`url(#${isPhase1 ? 'retBlue' : 'retPurp'})`} />
          <ellipse cx="40" cy="20" rx="22" ry="8" fill={cTop} stroke="#FFFFFF" strokeWidth="1.5" />
          {/* Prominent White Magnifying Glass */}
          <circle cx="37" cy="38" r="11" fill="none" stroke="#FFFFFF" strokeWidth="3" />
          <line x1="45" y1="46" x2="55" y2="56" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          {/* Sparkle reflection inside glass */}
          <path d="M 33 33 Q 37 31, 41 33" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    }

    case 'user-query':
      return (
        <svg viewBox="0 0 70 70" className="w-14 h-14 filter drop-shadow">
          <defs>
            <linearGradient id="userGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
          </defs>
          {/* User Avatar Head & Shoulders */}
          <circle cx="32" cy="24" r="12" fill="url(#userGrad)" stroke="#DBEAFE" strokeWidth="1.5" />
          <path d="M 16 54 C 16 42, 48 42, 48 54 Z" fill="url(#userGrad)" stroke="#DBEAFE" strokeWidth="1.5" />
          {/* Question speech bubble */}
          <g transform="translate(36, 6)">
            <rect x="0" y="0" width="22" height="18" rx="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1.5" />
            <polygon points="3,18 8,18 3,23" fill="#FFFFFF" />
            <polygon points="2,18 8,18 2,24" stroke="#2563EB" strokeWidth="1" fill="#FFFFFF" />
            <text x="11" y="13" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2563EB">
              ?
            </text>
          </g>
        </svg>
      );

    case 'topk-text-chunks':
      return (
        <svg viewBox="0 0 110 50" className="w-24 h-11 filter drop-shadow">
          {/* 3 side-by-side text chunk cards */}
          {[10, 42, 74].map((offset, i) => (
            <g key={i} transform={`translate(${offset}, 6)`}>
              <rect x="0" y="0" width="26" height="34" rx="3" fill="#F0F9FF" stroke="#38BDF8" strokeWidth="1.5" />
              <line x1="5" y1="8" x2="21" y2="8" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
              <line x1="5" y1="14" x2="18" y2="14" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="5" y1="20" x2="20" y2="20" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="5" y1="26" x2="15" y2="26" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ))}
        </svg>
      );

    case 'topk-image-chunks':
      return (
        <svg viewBox="0 0 110 50" className="w-24 h-11 filter drop-shadow">
          {/* 3 side-by-side purple image cards with landscape and ellipsis */}
          {[8, 40, 72].map((offset, i) => (
            <g key={i} transform={`translate(${offset}, 6)`}>
              <rect x="0" y="0" width="28" height="32" rx="3" fill="#FAF5FF" stroke="#A855F7" strokeWidth="1.5" />
              <rect x="3" y="3" width="22" height="18" rx="2" fill="#7E22CE" />
              <polygon points="5,19 11,10 16,16 20,9 23,19" fill="#581C87" />
              {/* Ellipsis below */}
              <circle cx="10" cy="26" r="1.5" fill="#A855F7" />
              <circle cx="14" cy="26" r="1.5" fill="#A855F7" />
              <circle cx="18" cy="26" r="1.5" fill="#A855F7" />
            </g>
          ))}
        </svg>
      );

    case 'agent-summary':
      return (
        <svg viewBox="0 0 75 50" className="w-16 h-11 filter drop-shadow">
          <defs>
            <linearGradient id="robotGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          {/* Yellow/Gold 3D Robot Face */}
          <rect x="18" y="10" width="38" height="30" rx="6" fill="url(#robotGold)" stroke="#D97706" strokeWidth="1.5" />
          {/* Antenna */}
          <line x1="37" y1="4" x2="37" y2="10" stroke="#D97706" strokeWidth="2" />
          <circle cx="37" cy="3" r="2.5" fill="#EF4444" />
          {/* Robot Eyes */}
          <circle cx="28" cy="22" r="4" fill="#1E293B" />
          <circle cx="29" cy="21" r="1.5" fill="#38BDF8" />
          <circle cx="46" cy="22" r="4" fill="#1E293B" />
          <circle cx="47" cy="21" r="1.5" fill="#38BDF8" />
          {/* Robot Smile / grid */}
          <line x1="28" y1="32" x2="46" y2="32" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'image-summaries':
      return (
        <svg viewBox="0 0 90 50" className="w-20 h-11 filter drop-shadow">
          {/* 2 purple summary cards + ellipsis */}
          {[12, 44].map((offset, i) => (
            <g key={i} transform={`translate(${offset}, 6)`}>
              <rect x="0" y="0" width="28" height="34" rx="3" fill="#FAF5FF" stroke="#A855F7" strokeWidth="1.5" />
              <line x1="5" y1="8" x2="23" y2="8" stroke="#7E22CE" strokeWidth="2" strokeLinecap="round" />
              <line x1="5" y1="14" x2="20" y2="14" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="5" y1="20" x2="22" y2="20" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="5" y1="26" x2="16" y2="26" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ))}
          <circle cx="78" cy="24" r="2" fill="#A855F7" />
          <circle cx="83" cy="24" r="2" fill="#A855F7" />
          <circle cx="88" cy="24" r="2" fill="#A855F7" />
        </svg>
      );

    case 'combined-context':
      return (
        <svg viewBox="0 0 110 65" className="w-24 h-14 filter drop-shadow">
          <defs>
            <linearGradient id="combGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#BAE6FD" />
            </linearGradient>
          </defs>
          {/* Cyan/Blue container card */}
          <rect x="8" y="8" width="94" height="48" rx="6" fill="url(#combGrad)" stroke="#38BDF8" strokeWidth="2" />
          {/* Text doc badge */}
          <g transform="translate(16, 16)">
            <rect x="0" y="0" width="20" height="26" rx="2" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
            <line x1="4" y1="6" x2="16" y2="6" stroke="#0284C7" strokeWidth="1.5" />
            <line x1="4" y1="11" x2="14" y2="11" stroke="#94A3B8" strokeWidth="1.2" />
            <line x1="4" y1="16" x2="15" y2="16" stroke="#94A3B8" strokeWidth="1.2" />
          </g>
          {/* Photo badge */}
          <g transform="translate(42, 16)">
            <rect x="0" y="0" width="24" height="26" rx="2" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
            <rect x="2" y="2" width="20" height="16" rx="1" fill="#0284C7" />
            <polygon points="4,16 9,8 14,13 18,7 20,16" fill="#0369A1" />
          </g>
          {/* Summary lines on right */}
          <g transform="translate(72, 18)">
            <line x1="0" y1="4" x2="22" y2="4" stroke="#0369A1" strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="10" x2="18" y2="10" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="16" x2="20" y2="16" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="22" x2="14" y2="22" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'mu-llm':
      return (
        <svg viewBox="0 0 75 65" className="w-16 h-14 filter drop-shadow">
          <defs>
            <linearGradient id="mullmGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          {/* Emerald green 3D glossy cube */}
          <polygon points="37,8 60,20 37,32 14,20" fill="#6EE7B7" stroke="#A7F3D0" strokeWidth="1" />
          <polygon points="14,20 37,32 37,54 14,42" fill="url(#mullmGrad)" />
          <polygon points="37,32 60,20 60,42 37,54" fill="#047857" />
          {/* Swirl / Neural Spiral logo in white */}
          <g transform="translate(37, 34) scale(0.65)" stroke="#FFFFFF" strokeWidth="2.5" fill="none">
            <circle cx="0" cy="0" r="10" strokeDasharray="5,3" className={isActive ? 'animate-spin origin-center' : ''} />
            <path d="M -5 -3 Q 0 -8, 5 -3 T -5 3" />
          </g>
        </svg>
      );

    case 'final-response':
      return (
        <svg viewBox="0 0 90 65" className="w-20 h-14 filter drop-shadow">
          <defs>
            <linearGradient id="respGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5F3FF" />
              <stop offset="100%" stopColor="#EDE9FE" />
            </linearGradient>
          </defs>
          {/* Lavender response card */}
          <rect x="10" y="8" width="70" height="48" rx="6" fill="url(#respGrad)" stroke="#A78BFA" strokeWidth="2" />
          {/* Green checkmark badge */}
          <circle cx="26" cy="24" r="8" fill="#10B981" />
          <polyline points="22,24 25,27 30,21" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Formatted response lines */}
          <line x1="40" y1="18" x2="72" y2="18" stroke="#4C1D95" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="40" y1="26" x2="68" y2="26" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="36" x2="72" y2="36" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="18" y1="44" x2="60" y2="44" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
};

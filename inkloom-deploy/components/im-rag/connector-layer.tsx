"use client";

import React, { useMemo } from 'react';
import { ConnectorPath } from './types';

interface ConnectorLayerProps {
  connectors: ConnectorPath[];
  activeConnectorIds: string[];
  time: number;
}

export const ConnectorLayer: React.FC<ConnectorLayerProps> = ({
  connectors,
  activeConnectorIds,
  time
}) => {
  // Speed parameter for particle movement
  const particlePhase = (time * 1.5) % 1;

  return (
    <svg
      viewBox="0 0 1920 1080"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 15 }}
    >
      <defs>
        {/* Glow Filters */}
        <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="greenGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Arrow Marker Definitions */}
        <marker
          id="arrow-cyan"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#38BDF8" />
        </marker>
        <marker
          id="arrow-purple"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#C084FC" />
        </marker>
        <marker
          id="arrow-green"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#34D399" />
        </marker>
        <marker
          id="arrow-amber"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#FBBF24" />
        </marker>
        <marker
          id="arrow-dim"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
        </marker>
      </defs>

      {/* 1. Base Connector Track Paths */}
      {connectors.map(c => {
        const isActive = activeConnectorIds.includes(c.id);
        const markerId = isActive
          ? c.branch === 'image'
            ? 'url(#arrow-purple)'
            : c.branch === 'query' || c.branch === 'final'
            ? 'url(#arrow-green)'
            : c.branch === 'bridge'
            ? 'url(#arrow-cyan)'
            : 'url(#arrow-cyan)'
          : 'url(#arrow-dim)';

        return (
          <g key={c.id}>
            {/* Background casing line */}
            <path
              d={c.pathD}
              fill="none"
              stroke="#0F172A"
              strokeWidth={isActive ? 6 : 4}
              strokeLinecap="round"
              opacity={0.8}
            />

            {/* Inactive line */}
            {!isActive && (
              <path
                d={c.pathD}
                fill="none"
                stroke="#334155"
                strokeWidth={2}
                strokeDasharray="4 4"
                strokeLinecap="round"
                markerEnd={markerId}
                opacity={0.4}
              />
            )}

            {/* Active Base Glowing Path */}
            {isActive && (
              <>
                <path
                  d={c.pathD}
                  fill="none"
                  stroke={c.strokeColor}
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  filter={
                    c.branch === 'image'
                      ? 'url(#purpleGlow)'
                      : c.branch === 'query' || c.branch === 'final'
                      ? 'url(#greenGlow)'
                      : 'url(#cyanGlow)'
                  }
                  opacity={0.4}
                />
                <path
                  d={c.pathD}
                  fill="none"
                  stroke={c.strokeColor}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  markerEnd={markerId}
                  opacity={0.9}
                />
                {/* Animated traveling dashed pulse along active path */}
                <path
                  d={c.pathD}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                  strokeDasharray="8 20"
                  strokeDashoffset={-((time * 60) % 28)}
                  strokeLinecap="round"
                  opacity={0.85}
                />
              </>
            )}
          </g>
        );
      })}

      {/* 2. Traveling High-Energy Data Particles */}
      {connectors.map(c => {
        const isActive = activeConnectorIds.includes(c.id);
        if (!isActive) return null;

        // Render 2 staggered particles per active line
        return (
          <g key={`particles-${c.id}`}>
            <ParticleDot pathD={c.pathD} offset={(particlePhase + 0.0) % 1} color={c.strokeColor} />
            <ParticleDot pathD={c.pathD} offset={(particlePhase + 0.5) % 1} color="#FFFFFF" size={3} />
          </g>
        );
      })}
    </svg>
  );
};

// SVG component that places an animated circle along any SVG path definition
const ParticleDot: React.FC<{
  pathD: string;
  offset: number;
  color: string;
  size?: number;
}> = ({ pathD, offset, color, size = 4.5 }) => {
  // We attach a hidden path to query pointAtLength
  const pathRef = React.useRef<SVGPathElement | null>(null);
  const [point, setPoint] = React.useState<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    if (pathRef.current) {
      try {
        const total = pathRef.current.getTotalLength();
        if (total > 0) {
          const pt = pathRef.current.getPointAtLength(total * offset);
          setPoint({ x: pt.x, y: pt.y });
        }
      } catch (e) {
        // Fallback if not mounted
      }
    }
  }, [offset, pathD]);

  return (
    <>
      <path ref={pathRef} d={pathD} fill="none" stroke="none" className="hidden" />
      {point && (
        <g transform={`translate(${point.x}, ${point.y})`}>
          <circle r={size * 2} fill={color} opacity={0.3} className="animate-ping origin-center" />
          <circle r={size} fill={color} stroke="#FFFFFF" strokeWidth={1} />
        </g>
      )}
    </>
  );
};

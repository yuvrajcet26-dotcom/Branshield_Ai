export type SceneId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface SceneInfo {
  id: SceneId;
  number: number;
  name: string;
  title: string;
  subtitle: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  phase: 'intro' | 'phase1' | 'phase2' | 'fusion' | 'generation' | 'overview';
  activeNodeIds: string[];
  activeConnectorIds: string[];
  badgeText: string;
  narrativeText: string;
  bulletPoints: string[];
  technicalMetric?: {
    label: string;
    value: string;
    status: 'idle' | 'active' | 'success' | 'indexing';
  };
}

export interface ArchitectureNode {
  id: string;
  label: string;
  sublabel?: string;
  phase: 1 | 2;
  x: number; // base 1920 coordinate
  y: number; // base 1080 coordinate
  width: number;
  height: number;
  cropImage: string;
  accentColor: string;
  themeColor: 'blue' | 'purple' | 'green' | 'amber' | 'cyan';
  iconType: 
    | 'document-stack'
    | 'text-extraction'
    | 'text-chunks'
    | 'text-store'
    | 'pages-to-images'
    | 'image-encoding'
    | 'image-summary'
    | 'image-store'
    | 'retriever-p1'
    | 'user-query'
    | 'retriever-p2'
    | 'topk-text-chunks'
    | 'topk-image-chunks'
    | 'agent-summary'
    | 'image-summaries'
    | 'combined-context'
    | 'mu-llm'
    | 'final-response';
}

export interface ConnectorPath {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  pathD: string;
  branch: 'text' | 'image' | 'query' | 'fusion' | 'final' | 'bridge';
  strokeColor: string;
  arrowPos: { x: number; y: number; angle: number };
}

export interface ParticlePacket {
  id: string;
  connectorId: string;
  progress: number; // 0..1
  label?: string;
  color: string;
  type: 'text-token' | 'image-feature' | 'summary-token' | 'query-vector' | 'context-tensor';
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  currentScene: SceneInfo;
  viewMode: 'vector' | 'sprites' | 'hybrid';
  showTelemetry: boolean;
  isExporting: boolean;
  exportProgress: number;
}

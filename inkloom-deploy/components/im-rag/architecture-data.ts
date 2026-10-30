import { SceneInfo, ArchitectureNode, ConnectorPath } from './types';

export const TOTAL_DURATION = 55; // 55 seconds total duration

export const SCENES: SceneInfo[] = [
  {
    id: 1,
    number: 1,
    name: 'Introduction',
    title: 'System Architecture Assembly',
    subtitle: 'From Documents and Images to Context-Aware Answers',
    startTime: 0,
    endTime: 5.0,
    phase: 'intro',
    activeNodeIds: [],
    activeConnectorIds: [],
    badgeText: 'SYSTEM INITIALIZATION',
    narrativeText:
      'IM-RAG introduces a dual-path multimodal ingestion and retrieval architecture. The system progressively initializes Phase 1 (Knowledge Base Generation) and Phase 2 (Retrieval and Response Generation).',
    bulletPoints: [
      'Two-tier architecture: Ingestion & Storage vs. Online Retrieval & Generation',
      'Dual knowledge representations: Raw Text Chunks + Page-Image Visual Features',
      'Context-aware grounding for multimodal Large Language Models (Mu-LLM)'
    ],
    technicalMetric: {
      label: 'Pipeline State',
      value: 'Ready for Ingestion',
      status: 'idle'
    }
  },
  {
    id: 2,
    number: 2,
    name: 'Document Processing',
    title: 'Document Ingestion & Parallel Stream Fork',
    subtitle: 'Simultaneous Dispatch to Text & Visual Extraction Pipelines',
    startTime: 5.0,
    endTime: 9.0,
    phase: 'phase1',
    activeNodeIds: ['document'],
    activeConnectorIds: ['c-doc-text', 'c-doc-pages'],
    badgeText: 'MULTIMODAL DISPATCH',
    narrativeText:
      'A multi-page document containing text, tables, and architectural diagrams enters the pipeline. IM-RAG immediately splits processing into two concurrent pipelines to preserve both semantic prose and visual layout.',
    bulletPoints: [
      'Accepts heterogeneous formats: PDF, technical whitepapers, scanned sheets',
      'Upper branch forks into text tokenization and semantic chunking',
      'Lower branch renders full page images for visual encoding & summarization'
    ],
    technicalMetric: {
      label: 'Document Input',
      value: '24 Pages / Multimodal PDF',
      status: 'active'
    }
  },
  {
    id: 3,
    number: 3,
    name: 'Text Knowledge Pipeline',
    title: 'Text Extraction, Chunking & Storage',
    subtitle: 'Document → Text Extraction → Text Chunks → Text Store',
    startTime: 9.0,
    endTime: 15.0,
    phase: 'phase1',
    activeNodeIds: ['document', 'text-extraction', 'text-chunks', 'text-store'],
    activeConnectorIds: ['c-doc-text', 'c-text-chunks', 'c-chunks-store'],
    badgeText: 'TEXT INGESTION PIPELINE',
    narrativeText:
      'Document prose is extracted, cleaned of layout artifacts, divided into semantic overlapping text chunks, and vectorized into the high-dimensional Text Store vector index.',
    bulletPoints: [
      'Text Extraction: Extracts raw text bodies, headings, bullet lists, and tables',
      'Text Chunking: 512-token windows with 64-token semantic overlap',
      'Text Store: Dense vector embeddings stored for cosine similarity lookup'
    ],
    technicalMetric: {
      label: 'Text Chunks Indexed',
      value: '184 Vectors in Store',
      status: 'indexing'
    }
  },
  {
    id: 4,
    number: 4,
    name: 'Image Knowledge Pipeline',
    title: 'Page-to-Image, Vision Encoding & LLM Summaries',
    subtitle: 'Document Pages → Image Encoding → LLM Summary → Image Store',
    startTime: 15.0,
    endTime: 22.0,
    phase: 'phase1',
    activeNodeIds: [
      'pages-to-images',
      'image-encoding',
      'image-summary',
      'image-store',
      'retriever-p1'
    ],
    activeConnectorIds: [
      'c-doc-pages',
      'c-pages-encoding',
      'c-encoding-summary',
      'c-summary-store',
      'c-textstore-retriever',
      'c-imagestore-retriever',
      'c-bridge-p1-p2'
    ],
    badgeText: 'IMAGE INGESTION PIPELINE',
    narrativeText:
      'Concurrently, each page is rasterized into high-resolution images. Visual features are extracted via Vision Encoders, while an LLM generates dense descriptive summaries of diagrams, charts, and spatial relationships before indexing into Image Store.',
    bulletPoints: [
      'Pages to Images: High-DPI rasterization captures visual layout & typography',
      'Image Encoding: Dense visual representations via deep multimodal encoder',
      'Image Summarization (LLM): Synthesizes semantic captions for figures & diagrams',
      'Image Store: Indexes image embeddings paired with their generated summaries'
    ],
    technicalMetric: {
      label: 'Multimodal Store',
      value: '24 Page Embeddings + Summaries',
      status: 'indexing'
    }
  },
  {
    id: 5,
    number: 5,
    name: 'User Query',
    title: 'Query Ingestion & Vector Transformation',
    subtitle: 'User Query → Retriever Connection',
    startTime: 22.0,
    endTime: 27.0,
    phase: 'phase2',
    activeNodeIds: ['user-query', 'retriever-p2'],
    activeConnectorIds: ['c-query-retriever'],
    badgeText: 'USER INTENT CAPTURE',
    narrativeText:
      'A user poses a query: "What information is contained in this document? Analyze both the text sections and system diagrams." The query is converted into a dual text-visual search probe.',
    bulletPoints: [
      'User Prompt: "What information is contained in this document?"',
      'Captures query intent requiring both descriptive text and visual diagrams',
      'Dispatches query vector directly to the multimodal Retriever'
    ],
    technicalMetric: {
      label: 'Query Latency',
      value: '42ms (Embedding Dispatch)',
      status: 'active'
    }
  },
  {
    id: 6,
    number: 6,
    name: 'Multimodal Retrieval',
    title: 'Dual-Store Retrieval & Agent Summary Generation',
    subtitle: 'Candidate Filtering: Top-K Text Chunks & Top-K Image Chunks',
    startTime: 27.0,
    endTime: 33.0,
    phase: 'phase2',
    activeNodeIds: [
      'retriever-p2',
      'topk-text-chunks',
      'topk-image-chunks',
      'agent-summary',
      'image-summaries'
    ],
    activeConnectorIds: [
      'c-retriever-textchunks',
      'c-retriever-imagechunks',
      'c-imagechunks-agent',
      'c-agent-summaries'
    ],
    badgeText: 'DUAL-STREAM RETRIEVAL',
    narrativeText:
      'The Retriever queries both the Text Store and Image Store. It isolates the most relevant Top-K Text Chunks alongside Top-K Image Chunks, while an Agent synthesizes tailored image summaries for the retrieved visual pages.',
    bulletPoints: [
      'Top-K Text Chunks: Isolates high-scoring text passages matching user query',
      'Top-K Image Chunks: Pinpoints the most relevant page diagrams and schematics',
      'Agent (Generate Summary): Extracts focused visual insights tailored to query',
      'Illustrative retrieval process demonstrating architectural flow'
    ],
    technicalMetric: {
      label: 'Retrieved Items',
      value: 'Top-3 Text Chunks | Top-2 Diagram Pages',
      status: 'success'
    }
  },
  {
    id: 7,
    number: 7,
    name: 'Context Fusion',
    title: 'Multimodal Context Synthesis',
    subtitle: 'Text Chunks + Image Chunks + Summaries + Query → Combined Context',
    startTime: 33.0,
    endTime: 38.0,
    phase: 'fusion',
    activeNodeIds: [
      'topk-text-chunks',
      'topk-image-chunks',
      'image-summaries',
      'combined-context'
    ],
    activeConnectorIds: [
      'c-textchunks-fusion',
      'c-imagechunks-fusion',
      'c-summaries-fusion',
      'c-query-fusion'
    ],
    badgeText: 'CONTEXT FUSION ENGINE',
    narrativeText:
      'All retrieved components converge into the Combined Context container. Raw text passages, high-resolution diagram images, generated visual summaries, and original user query tokens are fused into a unified multimodal prompt context.',
    bulletPoints: [
      'Unifies disparate modalities: Tokenized prose + image embeddings + structured summaries',
      'Eliminates hallucination by cross-referencing text claims against visual schematics',
      'Constructs the enriched prompt payload for the multimodal foundation model'
    ],
    technicalMetric: {
      label: 'Fused Context Size',
      value: '3,840 Multimodal Tokens',
      status: 'active'
    }
  },
  {
    id: 8,
    number: 8,
    name: 'Multimodal Generation',
    title: 'Mu-LLM Reasoning & Cross-Attention',
    subtitle: 'Combined Context → Mu-LLM Neural Model',
    startTime: 38.0,
    endTime: 43.0,
    phase: 'generation',
    activeNodeIds: ['combined-context', 'mu-llm'],
    activeConnectorIds: ['c-fusion-llm'],
    badgeText: 'FOUNDATION MODEL INFERENCE',
    narrativeText:
      'The Combined Context enters Mu-LLM (Multimodal Large Language Model). The model performs cross-attention across text tokens and image features, synthesizing an answer grounded in both prose and visual diagrams.',
    bulletPoints: [
      'Mu-LLM: Vision-Language foundation model with cross-attention heads',
      'Performs joint semantic reasoning across diagram geometry and textual data',
      'Grounds factual claims directly to referenced document pages'
    ],
    technicalMetric: {
      label: 'Inference Status',
      value: 'Cross-Attention Active',
      status: 'active'
    }
  },
  {
    id: 9,
    number: 9,
    name: 'Final Response',
    title: 'Context-Aware Response Delivery',
    subtitle: 'Mu-LLM → Final Response → User Delivery',
    startTime: 43.0,
    endTime: 48.0,
    phase: 'generation',
    activeNodeIds: ['mu-llm', 'final-response', 'user-query'],
    activeConnectorIds: ['c-llm-response', 'c-response-user'],
    badgeText: 'SYNTHESIS COMPLETE',
    narrativeText:
      'The Final Response is generated and delivered back to the user. The answer provides a verified, comprehensive explanation citing both the extracted text findings and the architecture diagrams.',
    bulletPoints: [
      'Structured response answering user query with diagram-grounded citations',
      'Illustrative demonstration response showcasing complete pipeline flow',
      'Seamless round-trip from raw document ingestion to context-aware answer'
    ],
    technicalMetric: {
      label: 'Response Verification',
      value: '100% Grounded (Illustrative)',
      status: 'success'
    }
  },
  {
    id: 10,
    number: 10,
    name: 'Complete System Overview',
    title: 'End-to-End Architecture Showcase',
    subtitle: 'IM-RAG: Image-Based Multimodal Retrieval-Augmented Generation',
    startTime: 48.0,
    endTime: 55.0,
    phase: 'overview',
    activeNodeIds: [
      'document',
      'text-extraction',
      'text-chunks',
      'text-store',
      'pages-to-images',
      'image-encoding',
      'image-summary',
      'image-store',
      'retriever-p1',
      'user-query',
      'retriever-p2',
      'topk-text-chunks',
      'topk-image-chunks',
      'agent-summary',
      'image-summaries',
      'combined-context',
      'mu-llm',
      'final-response'
    ],
    activeConnectorIds: [
      'c-doc-text',
      'c-text-chunks',
      'c-chunks-store',
      'c-doc-pages',
      'c-pages-encoding',
      'c-encoding-summary',
      'c-summary-store',
      'c-textstore-retriever',
      'c-imagestore-retriever',
      'c-bridge-p1-p2',
      'c-query-retriever',
      'c-retriever-textchunks',
      'c-retriever-imagechunks',
      'c-imagechunks-agent',
      'c-agent-summaries',
      'c-textchunks-fusion',
      'c-imagechunks-fusion',
      'c-summaries-fusion',
      'c-query-fusion',
      'c-fusion-llm',
      'c-llm-response'
    ],
    badgeText: 'END-TO-END PIPELINE',
    narrativeText:
      'The complete IM-RAG architecture links Document Ingestion, Parallel Knowledge Pipelines, Dual Vector Stores, Targeted Multimodal Retrieval, Context Fusion, and Mu-LLM Generation into a unified system.',
    bulletPoints: [
      'IM-RAG: Image-Based Multimodal Retrieval-Augmented Generation',
      '"From Documents and Images to Context-Aware Answers."',
      'Complete end-to-end continuous technical dataflow'
    ],
    technicalMetric: {
      label: 'System Status',
      value: 'End-to-End Operational',
      status: 'success'
    }
  }
];

// Architecture Nodes (coordinates based on 1920x1080 canvas)
export const NODES: ArchitectureNode[] = [
  // --- PHASE 1: Knowledge Base Generation ---
  {
    id: 'document',
    label: 'Document',
    sublabel: 'Multimodal Source PDF',
    phase: 1,
    x: 90,
    y: 230,
    width: 140,
    height: 170,
    cropImage: '/assets/components/document.png',
    accentColor: '#2563EB',
    themeColor: 'blue',
    iconType: 'document-stack'
  },
  {
    id: 'text-extraction',
    label: 'Text Extraction',
    sublabel: 'Parser & Cleaner',
    phase: 1,
    x: 340,
    y: 175,
    width: 155,
    height: 105,
    cropImage: '/assets/components/text-extraction.png',
    accentColor: '#3B82F6',
    themeColor: 'blue',
    iconType: 'text-extraction'
  },
  {
    id: 'text-chunks',
    label: 'Text Chunks',
    sublabel: '512-Token Windows',
    phase: 1,
    x: 580,
    y: 175,
    width: 155,
    height: 105,
    cropImage: '/assets/components/text-chunks.png',
    accentColor: '#8B5CF6',
    themeColor: 'purple',
    iconType: 'text-chunks'
  },
  {
    id: 'text-store',
    label: 'Text Store',
    sublabel: 'Vector Database',
    phase: 1,
    x: 820,
    y: 170,
    width: 155,
    height: 115,
    cropImage: '/assets/components/text-store.png',
    accentColor: '#0284C7',
    themeColor: 'blue',
    iconType: 'text-store'
  },
  {
    id: 'pages-to-images',
    label: 'Pages to Images',
    sublabel: 'Rasterizer Engine',
    phase: 1,
    x: 340,
    y: 325,
    width: 155,
    height: 105,
    cropImage: '/assets/components/pages-to-images.png',
    accentColor: '#0EA5E9',
    themeColor: 'cyan',
    iconType: 'pages-to-images'
  },
  {
    id: 'image-encoding',
    label: 'Image Encoding',
    sublabel: 'Vision Model (ViT/CNN)',
    phase: 1,
    x: 560,
    y: 325,
    width: 155,
    height: 105,
    cropImage: '/assets/components/image-encoding.png',
    accentColor: '#10B981',
    themeColor: 'green',
    iconType: 'image-encoding'
  },
  {
    id: 'image-summary',
    label: 'Image + Summary',
    sublabel: 'Using LLM Agent',
    phase: 1,
    x: 775,
    y: 325,
    width: 180,
    height: 105,
    cropImage: '/assets/components/image-summary.png',
    accentColor: '#38BDF8',
    themeColor: 'cyan',
    iconType: 'image-summary'
  },
  {
    id: 'image-store',
    label: 'Image Store',
    sublabel: 'Visual Vector DB',
    phase: 1,
    x: 1015,
    y: 320,
    width: 155,
    height: 115,
    cropImage: '/assets/components/image-store.png',
    accentColor: '#9333EA',
    themeColor: 'purple',
    iconType: 'image-store'
  },
  {
    id: 'retriever-p1',
    label: 'Retriever',
    sublabel: 'Knowledge Index Link',
    phase: 1,
    x: 1330,
    y: 235,
    width: 175,
    height: 150,
    cropImage: '/assets/components/retriever-p1.png',
    accentColor: '#2563EB',
    themeColor: 'blue',
    iconType: 'retriever-p1'
  },

  // --- PHASE 2: Retrieval and Response Generation ---
  {
    id: 'user-query',
    label: 'User Query',
    sublabel: 'Multimodal Question',
    phase: 2,
    x: 90,
    y: 620,
    width: 140,
    height: 140,
    cropImage: '/assets/components/user-query.png',
    accentColor: '#2563EB',
    themeColor: 'blue',
    iconType: 'user-query'
  },
  {
    id: 'retriever-p2',
    label: 'Retriever',
    sublabel: 'Dual Store Dispatcher',
    phase: 2,
    x: 290,
    y: 620,
    width: 155,
    height: 140,
    cropImage: '/assets/components/retriever-p2.png',
    accentColor: '#8B5CF6',
    themeColor: 'purple',
    iconType: 'retriever-p2'
  },
  {
    id: 'topk-text-chunks',
    label: 'Top-K Text Chunks',
    sublabel: 'Semantic Text Matches',
    phase: 2,
    x: 520,
    y: 565,
    width: 220,
    height: 100,
    cropImage: '/assets/components/topk-text-chunks.png',
    accentColor: '#38BDF8',
    themeColor: 'cyan',
    iconType: 'topk-text-chunks'
  },
  {
    id: 'topk-image-chunks',
    label: 'Top-K Image Chunks',
    sublabel: 'Matching Visual Pages',
    phase: 2,
    x: 520,
    y: 685,
    width: 220,
    height: 95,
    cropImage: '/assets/components/topk-image-chunks.png',
    accentColor: '#A855F7',
    themeColor: 'purple',
    iconType: 'topk-image-chunks'
  },
  {
    id: 'agent-summary',
    label: 'Agent (Gen Summary)',
    sublabel: 'Focused Vision Summarizer',
    phase: 2,
    x: 430,
    y: 810,
    width: 180,
    height: 90,
    cropImage: '/assets/components/agent-summary.png',
    accentColor: '#F59E0B',
    themeColor: 'amber',
    iconType: 'agent-summary'
  },
  {
    id: 'image-summaries',
    label: 'Image Summaries',
    sublabel: 'Synthesized Diagram Notes',
    phase: 2,
    x: 690,
    y: 810,
    width: 200,
    height: 90,
    cropImage: '/assets/components/image-summaries.png',
    accentColor: '#8B5CF6',
    themeColor: 'purple',
    iconType: 'image-summaries'
  },
  {
    id: 'combined-context',
    label: 'Combined Context',
    sublabel: 'Text + Image + Summary',
    phase: 2,
    x: 990,
    y: 625,
    width: 240,
    height: 135,
    cropImage: '/assets/components/combined-context.png',
    accentColor: '#0EA5E9',
    themeColor: 'cyan',
    iconType: 'combined-context'
  },
  {
    id: 'mu-llm',
    label: 'Mu-LLM',
    sublabel: 'Multimodal Foundation Model',
    phase: 2,
    x: 1320,
    y: 625,
    width: 165,
    height: 135,
    cropImage: '/assets/components/mu-llm.png',
    accentColor: '#10B981',
    themeColor: 'green',
    iconType: 'mu-llm'
  },
  {
    id: 'final-response',
    label: 'Final Response',
    sublabel: 'Context-Aware Answer',
    phase: 2,
    x: 1570,
    y: 625,
    width: 205,
    height: 135,
    cropImage: '/assets/components/final-response.png',
    accentColor: '#8B5CF6',
    themeColor: 'purple',
    iconType: 'final-response'
  }
];

// SVG Connectors with precise paths and directional flow
export const CONNECTORS: ConnectorPath[] = [
  // Document -> Text Extraction (curved upper branch)
  {
    id: 'c-doc-text',
    fromNodeId: 'document',
    toNodeId: 'text-extraction',
    pathD: 'M 230 280 C 275 280, 290 227, 340 227',
    branch: 'text',
    strokeColor: '#38BDF8',
    arrowPos: { x: 340, y: 227, angle: 0 }
  },
  // Text Extraction -> Text Chunks
  {
    id: 'c-text-chunks',
    fromNodeId: 'text-extraction',
    toNodeId: 'text-chunks',
    pathD: 'M 495 227 L 580 227',
    branch: 'text',
    strokeColor: '#38BDF8',
    arrowPos: { x: 580, y: 227, angle: 0 }
  },
  // Text Chunks -> Text Store
  {
    id: 'c-chunks-store',
    fromNodeId: 'text-chunks',
    toNodeId: 'text-store',
    pathD: 'M 735 227 L 820 227',
    branch: 'text',
    strokeColor: '#38BDF8',
    arrowPos: { x: 820, y: 227, angle: 0 }
  },
  // Document -> Pages to Images (curved lower branch)
  {
    id: 'c-doc-pages',
    fromNodeId: 'document',
    toNodeId: 'pages-to-images',
    pathD: 'M 230 350 C 275 350, 290 377, 340 377',
    branch: 'image',
    strokeColor: '#A855F7',
    arrowPos: { x: 340, y: 377, angle: 0 }
  },
  // Pages to Images -> Image Encoding
  {
    id: 'c-pages-encoding',
    fromNodeId: 'pages-to-images',
    toNodeId: 'image-encoding',
    pathD: 'M 495 377 L 560 377',
    branch: 'image',
    strokeColor: '#10B981',
    arrowPos: { x: 560, y: 377, angle: 0 }
  },
  // Image Encoding -> Image + Summary
  {
    id: 'c-encoding-summary',
    fromNodeId: 'image-encoding',
    toNodeId: 'image-summary',
    pathD: 'M 715 377 L 775 377',
    branch: 'image',
    strokeColor: '#38BDF8',
    arrowPos: { x: 775, y: 377, angle: 0 }
  },
  // Image + Summary -> Image Store
  {
    id: 'c-summary-store',
    fromNodeId: 'image-summary',
    toNodeId: 'image-store',
    pathD: 'M 955 377 L 1015 377',
    branch: 'image',
    strokeColor: '#A855F7',
    arrowPos: { x: 1015, y: 377, angle: 0 }
  },
  // Text Store -> Phase 1 Retriever
  {
    id: 'c-textstore-retriever',
    fromNodeId: 'text-store',
    toNodeId: 'retriever-p1',
    pathD: 'M 975 227 C 1120 227, 1200 280, 1330 280',
    branch: 'text',
    strokeColor: '#38BDF8',
    arrowPos: { x: 1330, y: 280, angle: 0 }
  },
  // Image Store -> Phase 1 Retriever
  {
    id: 'c-imagestore-retriever',
    fromNodeId: 'image-store',
    toNodeId: 'retriever-p1',
    pathD: 'M 1170 377 C 1230 377, 1260 330, 1330 330',
    branch: 'image',
    strokeColor: '#A855F7',
    arrowPos: { x: 1330, y: 330, angle: 0 }
  },
  // Vertical Bridge from Phase 1 Retriever down into Phase 2 Retriever
  {
    id: 'c-bridge-p1-p2',
    fromNodeId: 'retriever-p1',
    toNodeId: 'retriever-p2',
    pathD: 'M 1417 385 C 1417 480, 420 480, 370 620',
    branch: 'bridge',
    strokeColor: '#60A5FA',
    arrowPos: { x: 370, y: 620, angle: 90 }
  },

  // User Query -> Phase 2 Retriever
  {
    id: 'c-query-retriever',
    fromNodeId: 'user-query',
    toNodeId: 'retriever-p2',
    pathD: 'M 230 690 L 290 690',
    branch: 'query',
    strokeColor: '#38BDF8',
    arrowPos: { x: 290, y: 690, angle: 0 }
  },
  // Phase 2 Retriever -> Top-K Text Chunks
  {
    id: 'c-retriever-textchunks',
    fromNodeId: 'retriever-p2',
    toNodeId: 'topk-text-chunks',
    pathD: 'M 445 660 C 475 660, 485 615, 520 615',
    branch: 'text',
    strokeColor: '#38BDF8',
    arrowPos: { x: 520, y: 615, angle: 0 }
  },
  // Phase 2 Retriever -> Top-K Image Chunks
  {
    id: 'c-retriever-imagechunks',
    fromNodeId: 'retriever-p2',
    toNodeId: 'topk-image-chunks',
    pathD: 'M 445 715 C 475 715, 485 732, 520 732',
    branch: 'image',
    strokeColor: '#A855F7',
    arrowPos: { x: 520, y: 732, angle: 0 }
  },
  // Top-K Image Chunks -> Agent (Generate Summary)
  {
    id: 'c-imagechunks-agent',
    fromNodeId: 'topk-image-chunks',
    toNodeId: 'agent-summary',
    pathD: 'M 560 780 C 560 795, 520 795, 520 810',
    branch: 'image',
    strokeColor: '#F59E0B',
    arrowPos: { x: 520, y: 810, angle: 90 }
  },
  // Agent (Generate Summary) -> Image Summaries
  {
    id: 'c-agent-summaries',
    fromNodeId: 'agent-summary',
    toNodeId: 'image-summaries',
    pathD: 'M 610 855 L 690 855',
    branch: 'image',
    strokeColor: '#8B5CF6',
    arrowPos: { x: 690, y: 855, angle: 0 }
  },
  // Top-K Text Chunks -> Combined Context
  {
    id: 'c-textchunks-fusion',
    fromNodeId: 'topk-text-chunks',
    toNodeId: 'combined-context',
    pathD: 'M 740 615 C 840 615, 890 665, 990 665',
    branch: 'fusion',
    strokeColor: '#38BDF8',
    arrowPos: { x: 990, y: 665, angle: 0 }
  },
  // Top-K Image Chunks -> Combined Context
  {
    id: 'c-imagechunks-fusion',
    fromNodeId: 'topk-image-chunks',
    toNodeId: 'combined-context',
    pathD: 'M 740 732 C 840 732, 890 692, 990 692',
    branch: 'fusion',
    strokeColor: '#A855F7',
    arrowPos: { x: 990, y: 692, angle: 0 }
  },
  // Image Summaries -> Combined Context
  {
    id: 'c-summaries-fusion',
    fromNodeId: 'image-summaries',
    toNodeId: 'combined-context',
    pathD: 'M 890 855 C 950 855, 970 720, 990 720',
    branch: 'fusion',
    strokeColor: '#8B5CF6',
    arrowPos: { x: 990, y: 720, angle: -45 }
  },
  // User Query Context Badge -> Combined Context
  {
    id: 'c-query-fusion',
    fromNodeId: 'user-query',
    toNodeId: 'combined-context',
    pathD: 'M 160 760 C 160 880, 1050 880, 1110 760',
    branch: 'query',
    strokeColor: '#10B981',
    arrowPos: { x: 1110, y: 760, angle: -90 }
  },
  // Combined Context -> Mu-LLM
  {
    id: 'c-fusion-llm',
    fromNodeId: 'combined-context',
    toNodeId: 'mu-llm',
    pathD: 'M 1230 692 L 1320 692',
    branch: 'final',
    strokeColor: '#10B981',
    arrowPos: { x: 1320, y: 692, angle: 0 }
  },
  // Mu-LLM -> Final Response
  {
    id: 'c-llm-response',
    fromNodeId: 'mu-llm',
    toNodeId: 'final-response',
    pathD: 'M 1485 692 L 1570 692',
    branch: 'final',
    strokeColor: '#8B5CF6',
    arrowPos: { x: 1570, y: 692, angle: 0 }
  },
  // Final Response -> User (Return Loop)
  {
    id: 'c-response-user',
    fromNodeId: 'final-response',
    toNodeId: 'user-query',
    pathD: 'M 1672 760 C 1672 900, 160 900, 160 760',
    branch: 'final',
    strokeColor: '#10B981',
    arrowPos: { x: 160, y: 760, angle: -90 }
  }
];

export function getSceneAtTime(time: number): SceneInfo {
  const clamped = Math.max(0, Math.min(time, TOTAL_DURATION));
  for (const scene of SCENES) {
    if (clamped >= scene.startTime && clamped <= scene.endTime) {
      return scene;
    }
  }
  return SCENES[SCENES.length - 1];
}

export function isNodeActiveAtTime(nodeId: string, time: number): boolean {
  const scene = getSceneAtTime(time);
  return scene.activeNodeIds.includes(nodeId);
}

export function isConnectorActiveAtTime(connectorId: string, time: number): boolean {
  const scene = getSceneAtTime(time);
  return scene.activeConnectorIds.includes(connectorId);
}

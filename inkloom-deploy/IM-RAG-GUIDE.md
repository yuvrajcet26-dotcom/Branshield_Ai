# IM-RAG: Image-Based Multimodal Retrieval-Augmented Generation
## Animated Technical Demonstration & Video Export System

> **"From Documents and Images to Context-Aware Answers."**
> Visual Reference: SVKM Technical Architecture (Slides 16 & 17)

---

### 1. Executive Summary & Overview
**IM-RAG** is an advanced multimodal retrieval-augmented generation framework designed to ingest, index, and retrieve heterogeneous documents comprising dense prose, complex typography, architectural schematics, figures, and charts.

Unlike conventional text-only RAG pipelines that discard visual layout and spatial figures, IM-RAG bifurcates ingestion into:
1. **Text Knowledge Pipeline**: Text extraction → semantic chunking (512 tokens with overlap) → dense vector embeddings in `Text Store`.
2. **Image Knowledge Pipeline**: High-DPI rasterization into page images → deep visual encoding (ViT/CNN) → LLM-generated structural summaries of figures and charts → multimodal indexing in `Image Store`.

During online inference, a dual-store `Retriever` gathers high-scoring text chunks and relevant diagram pages. An auxiliary Agent synthesizes query-focused image summaries. All elements merge into `Combined Context` and feed into **Mu-LLM** for grounded, hallucination-resistant answer generation.

---

### 2. The 10-Scene Cinematic Animation Sequence

The technical demonstration runs as a continuous 55-second 16:9 widescreen animation structured into 10 distinct scenes:

| Scene | Timestamp | Title | Pipeline Stage & Narrative Focus |
|---|---|---|---|
| **Scene 1** | 0.0s – 5.0s | **Introduction & Architecture Assembly** | Cinematic studio backdrop materializes; Phase 1 (Knowledge Base Generation) and Phase 2 (Retrieval & Response) containers assemble progressively. |
| **Scene 2** | 5.0s – 9.0s | **Document Ingestion & Stream Fork** | Multimodal PDF document enters; flow splits into upper (Text) and lower (Visual) parallel pathways. |
| **Scene 3** | 9.0s – 15.0s | **Text Knowledge Pipeline** | Document → Text Extraction → Text Chunks → Text Store. Animated traveling cyan particles show vector indexing. |
| **Scene 4** | 15.0s – 22.0s | **Image Knowledge Pipeline** | Document Pages → Pages to Images → Image Encoding → Image + Summary (LLM) → Image Store. Visual embeddings and diagram notes stored. |
| **Scene 5** | 22.0s – 27.0s | **User Query Ingestion** | User avatar poses sample query: *"What information is contained in this document? Analyze text and architecture diagrams."* Dispatches to Retriever. |
| **Scene 6** | 27.0s – 33.0s | **Dual-Store Multimodal Retrieval** | Retriever scans both knowledge stores. Isolates Top-K Text Chunks and Top-K Image Chunks. Agent generates focused diagram summaries. *(Illustrative retrieval process disclosure)* |
| **Scene 7** | 33.0s – 38.0s | **Context Fusion Engine** | Text chunks, image pages, summaries, and query context converge into `Combined Context (Text + Image + Summary)`. |
| **Scene 8** | 38.0s – 43.0s | **Multimodal Generation (Mu-LLM)** | Combined Context enters Mu-LLM neural cube. Multi-head cross-attention active across visual tokens and prose text. |
| **Scene 9** | 43.0s – 48.0s | **Final Response Synthesis** | Lavender response card appears with green checkmark. Formatted context-aware answer returned to user. *(Illustrative demonstration response disclosure)* |
| **Scene 10** | 48.0s – 55.0s | **Complete System Showcase** | Camera pulls back to full 16:9 widescreen view. Entire end-to-end dataflow pulses with synchronized energy. Hero banner displayed. |

---

### 3. Architecture Components & Visual Mapping

All 18 components directly correspond to the uploaded system architecture diagrams (Slide 16 & Slide 17):

#### **Phase 1: Knowledge Base Generation**
- `Document`: Multimodal source PDF with text, tables, and architecture diagrams.
- `Text Extraction`: High-fidelity parser extracting raw text bodies and table hierarchies.
- `Text Chunks`: Overlapping 512-token semantic chunk cards.
- `Text Store`: 3D blue cylinder database with document badge.
- `Pages to Images`: High-resolution page rasterizer creating visual page representations.
- `Image Encoding`: Green 3D neural cube (Vision Transformer / CNN feature extractor).
- `Image + Summary (Using LLM)`: Paired photo thumbnail + LLM-generated diagram caption.
- `Image Store`: 3D purple cylinder database storing visual vector embeddings.
- `Retriever (Phase 1)`: Blue 3D cylinder database with magnifying glass linking indexed stores.

#### **Phase 2: Retrieval and Response Generation**
- `User Query`: Blue 3D avatar with question bubble (`?`).
- `Retriever (Phase 2)`: Purple 3D cylinder database querying both vector indices.
- `Top-K Text Chunks`: High-relevance text snippets matching the query.
- `Top-K Image Chunks`: Relevant page-image figures and diagrams.
- `Agent (Generate Summary)`: Yellow/gold 3D robot face synthesizing query-specific figure insights.
- `Image Summaries`: Structured diagram notes and spatial figure summaries.
- `Combined Context (Text + Image + Summary)`: Fused multimodal prompt container.
- `Mu-LLM`: Emerald green 3D cube with neural swirl foundation model.
- `Final Response`: Lavender card with green checkmark delivering grounded answer.

---

### 4. Interactive Controls & Video Export

1. **Scrubbable Timeline**: Real-time progress bar with scene boundary ticks for seamless jumping.
2. **Transport Controls**: Play, Pause, Spacebar shortcut, and Replay from beginning.
3. **Speed Selector**: 0.5x, 1x, 1.5x, 2x playback rates.
4. **Phase Jump**: One-click jump to Phase 1 (Knowledge Ingestion) or Phase 2 (Retrieval & Response).
5. **Scene Selector**: 10 direct scene chips with active status indicators.
6. **Component View Modes**:
   - `1080p Vector`: Razor-sharp custom SVG vectors with glowing 3D gradients and drop shadows.
   - `Diagram Crops`: Exact cropped PNG components extracted from reference slide 17.
   - `Hybrid`: Vector rendering with reference slide crop badge.
7. **Live Telemetry Drawer**: Real-time pipeline state, active nodes/connectors, token sizes, and attention status.
8. **1080p MP4 / WebM Video Export**:
   - Client-side deterministic 30fps canvas rendering pipeline.
   - Outputs full 1920 × 1080 high-bitrate video file.
   - Live progress indicator with automatic download.
9. **Capture PNG Snapshot**: 1-click 1920 × 1080 high-res still image download.
10. **16:9 Fullscreen**: Full immersion mode for presentations and screen capture.

---

### 5. How to Run

1. **Start the application**:
   ```bash
   npm run dev
   ```
2. **Access the IM-RAG Demonstration**:
   Navigate to `http://localhost:3000/im-rag` in any modern web browser (Chrome, Edge, Firefox, Safari).
3. **Export Video**:
   Click the **"Export MP4 Video"** button on the bottom control bar to generate and download the complete 1080p video demonstration.

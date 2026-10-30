import { NODES, CONNECTORS, SCENES, TOTAL_DURATION, getSceneAtTime } from './architecture-data';

/**
 * 1920x1080 Canvas Drawing Function
 * Renders any given timestamp `time` to a 1920x1080 canvas context.
 */
export function drawFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  time: number,
  componentImages: Record<string, HTMLImageElement>,
  viewMode: 'vector' | 'sprites' | 'hybrid'
) {
  const width = 1920;
  const height = 1080;
  const scene = getSceneAtTime(time);

  // 1. Dark Technical Studio Background
  ctx.fillStyle = '#090D16';
  ctx.fillRect(0, 0, width, height);

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Radial Ambient Glows
  const p1Glow = ctx.createRadialGradient(960, 300, 50, 960, 300, 600);
  p1Glow.addColorStop(0, 'rgba(37, 99, 235, 0.08)');
  p1Glow.addColorStop(1, 'rgba(9, 13, 22, 0)');
  ctx.fillStyle = p1Glow;
  ctx.fillRect(0, 0, width, 500);

  const p2Glow = ctx.createRadialGradient(960, 720, 50, 960, 720, 600);
  p2Glow.addColorStop(0, 'rgba(16, 185, 129, 0.06)');
  p2Glow.addColorStop(1, 'rgba(9, 13, 22, 0)');
  ctx.fillStyle = p2Glow;
  ctx.fillRect(0, 500, width, 580);

  // 2. Phase 1 Container (Top Box: Blue Border)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
  ctx.lineWidth = 2;
  roundRect(ctx, 60, 110, 1800, 370, 24);
  ctx.fill();
  ctx.stroke();

  // Phase 1 Banner Pill
  ctx.fillStyle = '#1E3A8A';
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 90, 125, 340, 32, 16);
  ctx.fill();
  ctx.stroke();
  // '1' circle
  ctx.fillStyle = '#3B82F6';
  ctx.beginPath();
  ctx.arc(108, 141, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('1', 108, 145);
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('Phase 1: Knowledge Base Generation', 126, 146);

  // 3. Phase 2 Container (Bottom Box: Green Border)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
  ctx.lineWidth = 2;
  roundRect(ctx, 60, 510, 1800, 410, 24);
  ctx.fill();
  ctx.stroke();

  // Phase 2 Banner Pill
  ctx.fillStyle = '#064E3B';
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 90, 525, 360, 32, 16);
  ctx.fill();
  ctx.stroke();
  // '2' circle
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(108, 541, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('2', 108, 545);
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('Phase 2: Retrieval and Response Generation', 126, 546);

  // 4. Draw SVG Connectors onto Canvas
  CONNECTORS.forEach(c => {
    const isActive = scene.activeConnectorIds.includes(c.id);
    const p = new Path2D(c.pathD);

    // Background track
    ctx.strokeStyle = isActive ? c.strokeColor : 'rgba(71, 85, 105, 0.3)';
    ctx.lineWidth = isActive ? 4 : 2;
    if (!isActive) {
      ctx.setLineDash([6, 6]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke(p);
    ctx.setLineDash([]);

    // Active particle highlights
    if (isActive) {
      const particleProgress = (time * 1.5) % 1;
      // Draw traveling circles
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      // Arrow pos estimation
      ctx.arc(c.arrowPos.x, c.arrowPos.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 5. Draw Architecture Nodes
  NODES.forEach(node => {
    const isActive = scene.activeNodeIds.includes(node.id);

    // Node Box
    ctx.save();
    ctx.translate(node.x, node.y);

    // Box background
    ctx.fillStyle = isActive ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.65)';
    ctx.strokeStyle = isActive ? node.accentColor : 'rgba(51, 65, 85, 0.6)';
    ctx.lineWidth = isActive ? 2.5 : 1;
    roundRect(ctx, 0, 0, node.width, node.height, 16);
    ctx.fill();
    ctx.stroke();

    // Active glow aura
    if (isActive) {
      ctx.shadowColor = node.accentColor;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = node.accentColor;
      roundRect(ctx, 0, 0, node.width, node.height, 16);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Component Image or Icon
    const img = componentImages[node.id];
    if (img && img.complete) {
      // Draw centered image
      const pad = 12;
      const availW = node.width - pad * 2;
      const availH = node.height - 40;
      const scale = Math.min(availW / img.width, availH / img.height, 1.8);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = (node.width - drawW) / 2;
      const drawY = 8 + (availH - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    // Node Label
    ctx.fillStyle = isActive ? '#FFFFFF' : '#E2E8F0';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(node.label, node.width / 2, node.height - 18);

    // Node Sublabel
    if (node.sublabel) {
      ctx.fillStyle = isActive ? node.accentColor : '#94A3B8';
      ctx.font = '9.5px sans-serif';
      ctx.fillText(node.sublabel, node.width / 2, node.height - 6);
    }

    ctx.restore();
  });

  // 6. Header Title Banner
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('IM-RAG', 60, 48);

  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Image-Based Multimodal Retrieval-Augmented Generation', 170, 46);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '12px sans-serif';
  ctx.fillText('Dual-Path Knowledge Ingestion & Context-Aware Multimodal Inference', 170, 68);

  // Timer readout on canvas top-right
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  roundRect(ctx, width - 260, 24, 200, 42, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  const ms = Math.floor((time % 1) * 10);
  ctx.fillText(
    `TIME: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms} / 00:55`,
    width - 160,
    50
  );

  // 7. Active Scene Narrative Card on Canvas
  ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 480, 24, 960, 60, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCENE ${scene.number}: ${scene.name.toUpperCase()} — ${scene.title}`, 496, 45);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '11px sans-serif';
  ctx.fillText(scene.narrativeText, 496, 68);

  // 8. Footer Watermark / Disclaimer
  ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'IM-RAG Architecture Demonstration • Illustrative Technical Dataflow Visualization',
    width / 2,
    1060
  );
}

// Helper to draw rounded rectangle in Canvas 2D
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Preload component images for Canvas 2D rendering
 */
export async function preloadComponentImages(): Promise<Record<string, HTMLImageElement>> {
  const images: Record<string, HTMLImageElement> = {};
  const promises = NODES.map(node => {
    return new Promise<void>(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        images[node.id] = img;
        resolve();
      };
      img.onerror = () => {
        // Fallback gracefully
        resolve();
      };
      img.src = node.cropImage;
    });
  });

  await Promise.all(promises);
  return images;
}

/**
 * Record the entire 55-second animation to a downloadable video (MP4 or WebM)
 */
export async function recordAnimationToVideo(
  onProgress: (percent: number) => void
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const componentImages = await preloadComponentImages();

  // Pick best supported MIME type
  let mimeType = 'video/webm;codecs=vp9';
  if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
    mimeType = 'video/mp4;codecs=avc1';
  } else if (MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
    mimeType = 'video/webm;codecs=vp8';
  }

  const stream = canvas.captureStream(30); // 30 fps
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8000000 // 8 Mbps high-quality 1080p
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = e => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  // Render frames deterministically at 30 fps for 55 seconds (1650 frames)
  const fps = 30;
  const totalFrames = Math.floor(TOTAL_DURATION * fps);
  const frameDuration = 1 / fps;

  return new Promise<Blob>((resolve, reject) => {
    let frame = 0;

    function renderNext() {
      if (frame >= totalFrames) {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          resolve(blob);
        };
        recorder.stop();
        return;
      }

      const t = frame * frameDuration;
      drawFrameToCanvas(ctx!, t, componentImages, 'vector');

      frame++;
      if (frame % 15 === 0) {
        onProgress(Math.floor((frame / totalFrames) * 100));
      }

      // Small delay to allow browser thread to process MediaRecorder stream
      setTimeout(renderNext, 8);
    }

    renderNext();
  });
}

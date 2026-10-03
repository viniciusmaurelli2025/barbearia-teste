import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookmarkCheck,
  Calendar,
  Camera,
  CheckCircle2,
  Columns,
  Download,
  MessageCircle,
  MoveVertical,
  Palette,
  RefreshCw,
  Share2,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Upload,
  UserCheck,
  X,
  ZoomIn,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Haircut, VisagismAnalysis } from '../types';
import { ResilientImage } from './ResilientImage';

const LOADING_MESSAGES = [
  'Analisando formato do seu rosto...',
  'Extraindo geometria e textura do corte...',
  'Aplicando acabamento e degradê nas têmporas...',
  'Finalizando simulação visagista...',
];

const CAMERA_INSTRUCTIONS = [
  'Olhe diretamente para a câmera',
  'Mantenha o rosto bem iluminado',
  'Retire bonés ou objetos que cubram o cabelo',
  'Mantenha a cabeça centralizada',
];

export type HairColorPreset =
  | 'natural'
  | 'jet_black'
  | 'espresso_brown'
  | 'platinum'
  | 'silver_fox';

const HAIR_COLOR_PRESETS: {
  id: HairColorPreset;
  label: string;
  swatch: string;
  tintRgba: string | null;
  strandColor: string;
  highlightColor: string;
}[] = [
  {
    id: 'natural',
    label: 'Natural',
    swatch: '#231C18',
    tintRgba: null,
    strandColor: 'rgba(20, 16, 14, 0.78)',
    highlightColor: 'rgba(90, 70, 56, 0.35)',
  },
  {
    id: 'jet_black',
    label: 'Preto Intenso',
    swatch: '#0D0C0C',
    tintRgba: 'rgba(10, 10, 12, 0.62)',
    strandColor: 'rgba(8, 8, 10, 0.88)',
    highlightColor: 'rgba(60, 65, 75, 0.35)',
  },
  {
    id: 'espresso_brown',
    label: 'Castanho',
    swatch: '#4A2C18',
    tintRgba: 'rgba(88, 46, 20, 0.50)',
    strandColor: 'rgba(58, 32, 16, 0.82)',
    highlightColor: 'rgba(168, 95, 45, 0.42)',
  },
  {
    id: 'platinum',
    label: 'Platinado / Nevou',
    swatch: '#E8E4DC',
    tintRgba: 'rgba(238, 234, 224, 0.78)',
    strandColor: 'rgba(235, 230, 218, 0.85)',
    highlightColor: 'rgba(255, 255, 255, 0.65)',
  },
  {
    id: 'silver_fox',
    label: 'Grisalho',
    swatch: '#8E9299',
    tintRgba: 'rgba(155, 160, 170, 0.58)',
    strandColor: 'rgba(135, 140, 150, 0.82)',
    highlightColor: 'rgba(215, 220, 228, 0.50)',
  },
];

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

async function compressImageToDataUrl(
  sourceUrl: string,
  maxWidth = 720
): Promise<string> {
  const img = await loadImageElement(sourceUrl);
  const ratio = img.height / img.width;
  const width = Math.min(img.width, maxWidth);
  const height = Math.round(width * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return sourceUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.88);
}

/**
 * Generates a realistic "ANTES DO CORTE (Cabelo Crescido / Sem Degradê)" version
 * for Demo Mode so the interactive Before/After slider shows a clear, authentic barbershop transformation.
 */
async function createBeforeGrownOutPortrait(sourceUrl: string): Promise<string> {
  const img = await loadImageElement(sourceUrl);
  const w = 720;
  const h = Math.round((img.height / img.width) * w) || 960;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return sourceUrl;

  // Draw un-styled, softer contrast portrait representing 45 days without a haircut
  ctx.filter = 'contrast(0.88) saturate(0.78) brightness(0.93)';
  ctx.drawImage(img, 0, 0, w, h);
  ctx.filter = 'none';

  const cx = w * 0.5;
  const cy = h * 0.35;
  const headW = w * 0.54;

  ctx.save();
  // Darken and fill in the faded temples to simulate grown-out side hair before a fade
  const leftSideGrad = ctx.createRadialGradient(
    cx - headW * 0.42,
    cy,
    8,
    cx - headW * 0.42,
    cy,
    headW * 0.26
  );
  leftSideGrad.addColorStop(0, 'rgba(20, 16, 13, 0.88)');
  leftSideGrad.addColorStop(0.65, 'rgba(25, 20, 16, 0.65)');
  leftSideGrad.addColorStop(1, 'rgba(25, 20, 16, 0)');
  ctx.fillStyle = leftSideGrad;
  ctx.fillRect(cx - headW * 0.72, cy - headW * 0.35, headW * 0.55, headW * 0.7);

  const rightSideGrad = ctx.createRadialGradient(
    cx + headW * 0.42,
    cy,
    8,
    cx + headW * 0.42,
    cy,
    headW * 0.26
  );
  rightSideGrad.addColorStop(0, 'rgba(20, 16, 13, 0.88)');
  rightSideGrad.addColorStop(0.65, 'rgba(25, 20, 16, 0.65)');
  rightSideGrad.addColorStop(1, 'rgba(25, 20, 16, 0)');
  ctx.fillStyle = rightSideGrad;
  ctx.fillRect(cx + headW * 0.17, cy - headW * 0.35, headW * 0.55, headW * 0.7);

  // Add un-trimmed stray hair strands along temples and forehead line
  ctx.strokeStyle = 'rgba(22, 18, 15, 0.78)';
  ctx.lineWidth = 2.4;
  for (let i = 0; i < 48; i++) {
    const t = i / 48;
    const sx = cx - headW * 0.46 + t * headW * 0.92;
    const sy = h * 0.22 + Math.sin(i * 2.1) * 12;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 16);
    ctx.quadraticCurveTo(
      sx + (i % 2 === 0 ? 14 : -14),
      sy + 8,
      sx + ((i % 3) - 1) * 16,
      sy + 26
    );
    ctx.stroke();
  }

  // Subtle top banner indicating ANTES state
  const bottomScrim = ctx.createLinearGradient(0, h - 105, 0, h);
  bottomScrim.addColorStop(0, 'rgba(7, 6, 5, 0)');
  bottomScrim.addColorStop(1, 'rgba(7, 6, 5, 0.88)');
  ctx.fillStyle = bottomScrim;
  ctx.fillRect(0, h - 105, w, 105);

  ctx.fillStyle = '#A9A29B';
  ctx.font = '700 11px "Montserrat", sans-serif';
  ctx.fillText('ANTES DO CORTE · SEM ACABAMENTO', 24, h - 52);

  ctx.fillStyle = '#F5F2ED';
  ctx.font = '700 18px "Montserrat", sans-serif';
  ctx.fillText('Laterais crescidas & sem degradê', 24, h - 24);

  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.88);
}

/**
 * Multi-layered Haircut & Visagism Transformation Engine:
 * Renders a realistic haircut simulation onto either the user's selfie/uploaded photo
 * or the interactive studio model.
 */
async function renderRealisticHaircutSimulation(params: {
  userPhotoUrl: string;
  cut: Haircut;
  analysis: VisagismAnalysis;
  verticalOffsetPct: number;
  scaleOffsetPct: number;
  fadeIntensityPct: number;
  colorPreset: HairColorPreset;
  isDemoMode: boolean;
}): Promise<string> {
  const {
    userPhotoUrl,
    cut,
    analysis,
    verticalOffsetPct,
    scaleOffsetPct,
    fadeIntensityPct,
    colorPreset,
    isDemoMode,
  } = params;

  const [userImg, cutImg] = await Promise.all([
    loadImageElement(userPhotoUrl),
    loadImageElement(cut.imageUrl).catch(() => null),
  ]);

  const w = 720;
  const h = Math.round((userImg.height / userImg.width) * w) || 960;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return userPhotoUrl;

  if (isDemoMode && cutImg) {
    ctx.drawImage(cutImg, 0, 0, w, h);
  } else {
    ctx.drawImage(userImg, 0, 0, w, h);
  }

  const centerX = w * 0.5;
  const baseCrownY = Math.max(
    0.14,
    Math.min(0.34, analysis.crownCenterY || 0.21)
  );
  const crownY = h * (baseCrownY + verticalOffsetPct * 0.0025);
  const baseHeadW = Math.max(
    0.44,
    Math.min(0.66, analysis.headWidthRatio || 0.54)
  );
  const headW = w * baseHeadW * (1 + scaleOffsetPct * 0.004);
  const fadeAlphaMultiplier = Math.max(0.4, Math.min(1.4, fadeIntensityPct / 100));

  const selectedColorObj =
    HAIR_COLOR_PRESETS.find((p) => p.id === colorPreset) ||
    HAIR_COLOR_PRESETS[0];

  // Sample approximate skin tone from forehead center of user photo for natural skin-fade blending
  let sampledSkinRgb = { r: 215, g: 175, b: 145 };
  if (!isDemoMode) {
    try {
      const sampleX = Math.round(centerX);
      const sampleY = Math.max(10, Math.min(h - 10, Math.round(crownY + headW * 0.16)));
      const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
      if (pixel[0] > 45 && pixel[1] > 35) {
        sampledSkinRgb = { r: pixel[0], g: pixel[1], b: pixel[2] };
      }
    } catch {
      // keep default warm skin tone
    }
  }

  // If User Selfie / Uploaded Photo: Blend real hair crown texture + procedural barbershop architecture
  if (!isDemoMode && cutImg) {
    const offscreen = document.createElement('canvas');
    const cropW = Math.round(headW * 1.26);
    const cropH = Math.round(headW * 0.88);
    offscreen.width = cropW;
    offscreen.height = cropH;
    const oCtx = offscreen.getContext('2d');

    if (oCtx) {
      const srcX = cutImg.width * 0.15;
      const srcY = cutImg.height * 0.02;
      const srcW = cutImg.width * 0.70;
      const srcH = cutImg.height * 0.40;
      oCtx.drawImage(cutImg, srcX, srcY, srcW, srcH, 0, 0, cropW, cropH);

      if (selectedColorObj.tintRgba) {
        oCtx.globalCompositeOperation =
          colorPreset === 'platinum' || colorPreset === 'silver_fox'
            ? 'screen'
            : 'source-atop';
        oCtx.fillStyle = selectedColorObj.tintRgba;
        oCtx.fillRect(0, 0, cropW, cropH);
      }

      // Elliptical crown mask
      oCtx.globalCompositeOperation = 'destination-in';
      const radialMask = oCtx.createRadialGradient(
        cropW * 0.5,
        cropH * 0.44,
        cropW * 0.10,
        cropW * 0.5,
        cropH * 0.44,
        cropW * 0.48
      );
      radialMask.addColorStop(0, 'rgba(0,0,0,0.96)');
      radialMask.addColorStop(0.65, 'rgba(0,0,0,0.88)');
      radialMask.addColorStop(0.88, 'rgba(0,0,0,0.28)');
      radialMask.addColorStop(1, 'rgba(0,0,0,0)');
      oCtx.fillStyle = radialMask;
      oCtx.fillRect(0, 0, cropW, cropH);

      // Protect user's forehead and eyebrows
      oCtx.globalCompositeOperation = 'destination-out';
      const faceCutout = oCtx.createRadialGradient(
        cropW * 0.5,
        cropH * 0.96,
        cropW * 0.10,
        cropW * 0.5,
        cropH * 0.96,
        cropW * 0.40
      );
      faceCutout.addColorStop(0, 'rgba(0,0,0,1)');
      faceCutout.addColorStop(0.68, 'rgba(0,0,0,0.88)');
      faceCutout.addColorStop(1, 'rgba(0,0,0,0)');
      oCtx.fillStyle = faceCutout;
      oCtx.fillRect(0, 0, cropW, cropH);

      ctx.save();
      const destX = centerX - cropW * 0.5;
      const destY = crownY - cropH * 0.58;
      ctx.drawImage(offscreen, destX, destY, cropW, cropH);
      ctx.restore();
    }
  }

  ctx.save();
  const isBuzz = cut.id.includes('buzz') || cut.id.includes('crew') || cut.id.includes('high_fade');
  const isHighVolume =
    cut.id.includes('pompadour') ||
    cut.id.includes('quiff') ||
    cut.id.includes('wolf') ||
    cut.length === 'Longo';
  const isCurly =
    cut.category === 'Cacheados' ||
    cut.category === 'Crespos' ||
    cut.id.includes('taper') ||
    cut.id.includes('neymar') ||
    cut.id.includes('americano') ||
    cut.id.includes('burst');
  const isBeardFocus = cut.category === 'Barba' || cut.id.includes('barba');

  const topArchHeight = isBuzz
    ? headW * 0.16
    : isHighVolume
    ? headW * 0.36
    : headW * 0.25;

  // Apply custom hair color preset in Demo Mode
  if (isDemoMode && selectedColorObj.tintRgba) {
    ctx.save();
    ctx.globalCompositeOperation =
      colorPreset === 'platinum' || colorPreset === 'silver_fox'
        ? 'overlay'
        : 'multiply';
    const tintGrad = ctx.createRadialGradient(
      centerX,
      crownY - topArchHeight * 0.15,
      headW * 0.05,
      centerX,
      crownY + headW * 0.05,
      headW * 0.56
    );
    tintGrad.addColorStop(0, selectedColorObj.tintRgba);
    tintGrad.addColorStop(0.72, selectedColorObj.tintRgba);
    tintGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = tintGrad;
    ctx.fillRect(0, 0, w, h * 0.6);
    ctx.restore();
  }

  // Sculpt Skin-Fade, Razor Line-Up & 3D Texture on User Photos
  if (!isDemoMode) {
    const templeY = crownY + headW * 0.12;
    const fadeW = headW * 0.15;
    const fadeH = headW * 0.42;
    const { r, g, b } = sampledSkinRgb;

    // 1. Left & Right Temple Skin-Fade (Degradê Navalhado)
    const createTempleFade = (xCenter: number) => {
      const grad = ctx.createLinearGradient(
        xCenter,
        templeY - fadeH * 0.35,
        xCenter,
        templeY + fadeH * 0.65
      );
      grad.addColorStop(0, selectedColorObj.strandColor);
      grad.addColorStop(
        0.48,
        `rgba(${Math.round(r * 0.55)}, ${Math.round(g * 0.52)}, ${Math.round(b * 0.5)}, ${
          0.62 * fadeAlphaMultiplier
        })`
      );
      grad.addColorStop(
        0.85,
        `rgba(${r}, ${g}, ${b}, ${0.78 * fadeAlphaMultiplier})`
      );
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      return grad;
    };

    ctx.fillStyle = createTempleFade(centerX - headW * 0.47);
    ctx.beginPath();
    ctx.roundRect(
      centerX - headW * 0.54,
      templeY - fadeH * 0.25,
      fadeW,
      fadeH,
      18
    );
    ctx.fill();

    ctx.fillStyle = createTempleFade(centerX + headW * 0.47);
    ctx.beginPath();
    ctx.roundRect(
      centerX + headW * 0.54 - fadeW,
      templeY - fadeH * 0.25,
      fadeW,
      fadeH,
      18
    );
    ctx.fill();

    // 2. Micro-follicle clipper stippling on temples for realistic fade gradient
    ctx.fillStyle = selectedColorObj.strandColor;
    for (let d = 0; d < 180; d++) {
      const side = d % 2 === 0 ? -1 : 1;
      const rx =
        centerX +
        side * (headW * 0.39 + ((d * 17) % 100) * 0.0012 * headW);
      const ry =
        templeY -
        fadeH * 0.2 +
        ((d * 29) % 100) * 0.007 * fadeH;
      const verticalProgress = (ry - (templeY - fadeH * 0.2)) / (fadeH * 0.7);
      if (Math.random() > verticalProgress * 0.85) {
        ctx.globalAlpha = Math.max(0.12, (1 - verticalProgress) * 0.55);
        ctx.fillRect(rx, ry, 1.5, 1.5);
      }
    }
    ctx.globalAlpha = 1;

    // 3. Crisp Razor Line-Up (Contorno Frontal / Pezinho)
    const lineUpY = crownY + headW * 0.02;
    ctx.strokeStyle = selectedColorObj.strandColor;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(centerX - headW * 0.36, lineUpY + 8);
    ctx.quadraticCurveTo(centerX, lineUpY - 6, centerX + headW * 0.36, lineUpY + 8);
    ctx.stroke();

    // Crisp skin highlight 2px below the razor line-up
    ctx.strokeStyle = `rgba(${Math.min(255, r + 22)}, ${Math.min(
      255,
      g + 18
    )}, ${Math.min(255, b + 15)}, 0.48)`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(centerX - headW * 0.35, lineUpY + 11);
    ctx.quadraticCurveTo(centerX, lineUpY - 3, centerX + headW * 0.35, lineUpY + 11);
    ctx.stroke();

    // 4. 3D Hair Strands / Curls / Volume Texture along Crown
    const count = isCurly ? 95 : 75;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const sx = centerX - headW * 0.41 + t * headW * 0.82;
      const archOffset = Math.sin(t * Math.PI) * topArchHeight * 0.58;
      const sy = crownY - topArchHeight * 0.05 - archOffset + (i % 5) * 3;

      ctx.strokeStyle =
        i % 4 === 0 ? selectedColorObj.highlightColor : selectedColorObj.strandColor;
      ctx.lineWidth = isCurly ? 2.4 : 2.1;
      ctx.beginPath();
      if (isCurly) {
        ctx.arc(sx, sy, 5 + (i % 6), 0, Math.PI * 1.65);
      } else if (isBuzz) {
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + (t - 0.5) * 4, sy - 7);
      } else {
        ctx.moveTo(sx, sy + 14);
        ctx.quadraticCurveTo(
          sx + (t - 0.5) * 20,
          sy - 12,
          sx + (t - 0.5) * 30,
          sy - (isHighVolume ? 34 : 18)
        );
      }
      ctx.stroke();
    }

    // Optional Beard Fade sculpting if "Barba" category is selected
    if (isBeardFocus) {
      const jawY = crownY + headW * 0.72;
      ctx.strokeStyle = selectedColorObj.strandColor;
      ctx.lineWidth = 2.2;
      for (let bIdx = 0; bIdx < 60; bIdx++) {
        const bt = bIdx / 60;
        const bx = centerX - headW * 0.38 + bt * headW * 0.76;
        const by = jawY + Math.sin(bt * Math.PI) * (headW * 0.26);
        ctx.beginPath();
        ctx.moveTo(bx, by - 10);
        ctx.lineTo(bx + (0.5 - bt) * 8, by + 12);
        ctx.stroke();
      }
    }
  }

  // Editorial Bottom Badge on Generated Image
  const bottomScrim = ctx.createLinearGradient(0, h - 105, 0, h);
  bottomScrim.addColorStop(0, 'rgba(7, 6, 5, 0)');
  bottomScrim.addColorStop(1, 'rgba(7, 6, 5, 0.92)');
  ctx.fillStyle = bottomScrim;
  ctx.fillRect(0, h - 105, w, 105);

  ctx.fillStyle = '#A84F1F';
  ctx.font = '700 11px "Montserrat", sans-serif';
  ctx.fillText('BARBER AI · CORTE SIMULADO NA RÉGUA', 24, h - 52);

  ctx.fillStyle = '#F5F2ED';
  ctx.font = '800 20px "Montserrat", sans-serif';
  ctx.fillText(
    `${cut.name} · Harmonia ${analysis.compatibilityScore}%`,
    24,
    h - 24
  );

  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.92);
}

export const BarberAiScreen: React.FC = () => {
  const {
    haircuts,
    businessSettings,
    selectedCutForAi,
    setSelectedCutForAi,
    openBookingWithCut,
    saveCutReference,
    saveAiGenerationRecord,
    showToast,
  } = useApp();

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [userPhotoDataUrl, setUserPhotoDataUrl] = useState<string | null>(null);
  const [rawCapturedPhotoUrl, setRawCapturedPhotoUrl] = useState<string | null>(
    null
  );
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [simulatedPhotoDataUrl, setSimulatedPhotoDataUrl] = useState<
    string | null
  >(null);
  const [analysisResult, setAnalysisResult] = useState<VisagismAnalysis | null>(
    null
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [viewMode, setViewMode] = useState<'slider' | 'side_by_side'>('slider');

  // Real-time Interactive Fit & Color Adjustments
  const [verticalOffsetPct, setVerticalOffsetPct] = useState<number>(0);
  const [scaleOffsetPct, setScaleOffsetPct] = useState<number>(0);
  const [fadeIntensityPct, setFadeIntensityPct] = useState<number>(100);
  const [colorPreset, setColorPreset] = useState<HairColorPreset>('natural');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const comparisonContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSliderRef = useRef<boolean>(false);
  const hasAutoStartedRef = useRef<boolean>(false);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Ensure video element receives the active MediaStream reliably once mounted
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

  // Rotate loading messages while simulating
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 800);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Re-render composite immediately whenever user adjusts vertical offset, scale, fade, or hair color
  const updateCompositePreview = useCallback(async () => {
    if (!rawCapturedPhotoUrl || !analysisResult) return;
    try {
      const rendered = await renderRealisticHaircutSimulation({
        userPhotoUrl: rawCapturedPhotoUrl,
        cut: selectedCutForAi,
        analysis: analysisResult,
        verticalOffsetPct,
        scaleOffsetPct,
        fadeIntensityPct,
        colorPreset,
        isDemoMode,
      });
      setSimulatedPhotoDataUrl(rendered);
    } catch (err) {
      console.error('Composite render error:', err);
    }
  }, [
    rawCapturedPhotoUrl,
    selectedCutForAi,
    analysisResult,
    verticalOffsetPct,
    scaleOffsetPct,
    fadeIntensityPct,
    colorPreset,
    isDemoMode,
  ]);

  useEffect(() => {
    if (rawCapturedPhotoUrl && analysisResult) {
      updateCompositePreview();
    }
  }, [
    verticalOffsetPct,
    scaleOffsetPct,
    fadeIntensityPct,
    colorPreset,
    updateCompositePreview,
    rawCapturedPhotoUrl,
    analysisResult,
  ]);

  const runAiSimulation = useCallback(
    async (photoDataUrl: string, cut: Haircut, demoFlag: boolean) => {
      setIsSimulating(true);
      setLoadingStepIdx(0);

      const defaultAnalysis: VisagismAnalysis = {
        faceShape: 'Oval Estruturado',
        compatibilityScore: 96,
        whyItWorks: `O corte ${cut.name} (${cut.category}) valoriza a linha do maxilar e cria proporção vertical equilibrada com acabamento limpo nas têmporas.`,
        barberInstructions: `Executar transição ${cut.category} gradual com máquina #0.5 na lateral, preservando textura no topo (${cut.length}) e contorno preciso na navalha.`,
        maintenanceAdvice: `Finalizar com pomada efeito matte de fixação média. Manutenção ${cut.maintenanceLevel.toLowerCase()} recomendada a cada 15 a 20 dias.`,
        hairToneHex: '#181412',
        crownCenterY: 0.21,
        headWidthRatio: 0.54,
      };

      try {
        let analysis = defaultAnalysis;

        if (!demoFlag) {
          // For user selfies/uploaded photos, query backend Gemini Visagism analysis
          const response = await fetch('/api/barber-ai/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: photoDataUrl,
              mimeType: 'image/jpeg',
              haircutName: cut.name,
              haircutCategory: cut.category,
              haircutDescription: cut.description,
              recommendedHairType: cut.recommendedHairType,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.analysis) {
              analysis = { ...defaultAnalysis, ...data.analysis };
            }
          }
        } else {
          // Fast instant feedback in Demo Mode
          await new Promise((r) => setTimeout(r, 320));
        }

        setAnalysisResult(analysis);

        const composite = await renderRealisticHaircutSimulation({
          userPhotoUrl: photoDataUrl,
          cut,
          analysis,
          verticalOffsetPct,
          scaleOffsetPct,
          fadeIntensityPct,
          colorPreset,
          isDemoMode: demoFlag,
        });
        setSimulatedPhotoDataUrl(composite);
      } catch (error) {
        console.error('AI simulation fallback:', error);
        setAnalysisResult(defaultAnalysis);
        const composite = await renderRealisticHaircutSimulation({
          userPhotoUrl: photoDataUrl,
          cut,
          analysis: defaultAnalysis,
          verticalOffsetPct,
          scaleOffsetPct,
          fadeIntensityPct,
          colorPreset,
          isDemoMode: demoFlag,
        });
        setSimulatedPhotoDataUrl(composite);
      } finally {
        setIsSimulating(false);
      }
    },
    [verticalOffsetPct, scaleOffsetPct, fadeIntensityPct, colorPreset]
  );

  const handleInstantDemoSimulation = useCallback(
    async (cutToUse = selectedCutForAi) => {
      setIsDemoMode(true);
      setCameraActive(false);
      try {
        const beforePortrait = await createBeforeGrownOutPortrait(
          cutToUse.imageUrl
        );
        const afterBase = await compressImageToDataUrl(cutToUse.imageUrl);
        setUserPhotoDataUrl(beforePortrait);
        setRawCapturedPhotoUrl(afterBase);
        await runAiSimulation(afterBase, cutToUse, true);
      } catch {
        setUserPhotoDataUrl(cutToUse.imageUrl);
        setRawCapturedPhotoUrl(cutToUse.imageUrl);
        await runAiSimulation(cutToUse.imageUrl, cutToUse, true);
      }
    },
    [selectedCutForAi, runAiSimulation]
  );

  // Automatically initialize simulation when opening the Visualize com IA screen
  useEffect(() => {
    if (!hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      handleInstantDemoSimulation(selectedCutForAi);
    }
  }, [handleInstantDemoSimulation, selectedCutForAi]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 720 },
          height: { ideal: 960 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch {
      setCameraError(
        'Acesso à câmera bloqueado pelo navegador. Use o botão "Enviar Sua Foto" ao lado para carregar uma foto da sua galeria.'
      );
      showToast('Use "Enviar Sua Foto" para carregar da galeria.', 'info');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureFromCamera = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    const compressed = await compressImageToDataUrl(rawDataUrl);
    setIsDemoMode(false);
    setUserPhotoDataUrl(compressed);
    setRawCapturedPhotoUrl(compressed);
    await runAiSimulation(compressed, selectedCutForAi, false);
    showToast(`Corte ${selectedCutForAi.name} simulado na sua selfie!`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        try {
          const compressed = await compressImageToDataUrl(reader.result);
          stopCamera();
          setIsDemoMode(false);
          setUserPhotoDataUrl(compressed);
          setRawCapturedPhotoUrl(compressed);
          await runAiSimulation(compressed, selectedCutForAi, false);
          showToast(`Simulação aplicada na sua foto!`);
        } catch {
          showToast('Não foi possível ler esta imagem. Tente outra foto.', 'error');
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectDifferentCut = async (cut: Haircut) => {
    setSelectedCutForAi(cut);
    if (isDemoMode || !rawCapturedPhotoUrl) {
      await handleInstantDemoSimulation(cut);
    } else {
      await runAiSimulation(rawCapturedPhotoUrl, cut, false);
    }
    showToast(`Simulando corte: ${cut.name}`);
  };

  const handlePointerMoveSlider = (clientX: number) => {
    if (!comparisonContainerRef.current) return;
    const rect = comparisonContainerRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = Math.round((relX / rect.width) * 100);
    setSliderPosition(Math.max(4, Math.min(96, pct)));
  };

  const handleSaveSimulation = async () => {
    if (!simulatedPhotoDataUrl || !analysisResult) return;

    const link = document.createElement('a');
    link.href = simulatedPhotoDataUrl;
    link.download = `barberia-ai-${selectedCutForAi.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await saveAiGenerationRecord({
      haircutId: selectedCutForAi.id,
      haircutName: selectedCutForAi.name,
      faceShape: analysisResult.faceShape,
      compatibilityScore: analysisResult.compatibilityScore,
      summary: analysisResult.whyItWorks,
      previewDataUrl: simulatedPhotoDataUrl,
    });
  };

  const handleShareSimulation = async () => {
    if (!analysisResult) return;
    const shareText = `Simulei o corte ${selectedCutForAi.name} no Barber AI (${analysisResult.compatibilityScore}% de harmonia com rosto ${analysisResult.faceShape}): ${analysisResult.whyItWorks}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Barber AI · ${selectedCutForAi.name}`,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // fallback
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      showToast('Resumo da simulação copiado para compartilhar!');
    } catch {
      showToast('Pronto para compartilhar.', 'info');
    }
  };

  const cleanWhatsapp = (businessSettings.whatsapp || '552197507533').replace(
    /\D/g,
    ''
  );
  const whatsappAiUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Olá! Testei o corte *${selectedCutForAi.name}* (${selectedCutForAi.category}) no simulador Barber AI e gostaria de agendar um horário!`
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8 pb-24"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#A84F1F] mb-1">
            BARBER AI · SIMULADOR VISUAL & VISAGISMO
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#F5F2ED]">
            Antes de cortar, veja como pode ficar.
          </h1>
          <p className="text-sm text-[#A9A29B] mt-1 max-w-2xl">
            Toque em qualquer corte abaixo para simular na hora, envie sua própria foto da galeria ou tire uma selfie frontal.
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="flex items-center gap-2 text-xs text-[#A9A29B] bg-[#14110F] border border-white/10 px-3.5 py-2.5 rounded-xl shrink-0">
          <Shield className="w-4 h-4 text-[#A84F1F] shrink-0" />
          <span>Foto privada · Processamento instantâneo</span>
        </div>
      </div>

      {/* Action Bar: Switch Between Selfie, Upload Photo, or Studio Demo Model */}
      <div className="p-4 rounded-2xl bg-[#14110F] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A84F1F]/20 border border-[#A84F1F] flex items-center justify-center text-[#A84F1F] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#F5F2ED]">
              {isDemoMode
                ? 'Modo Modelo de Estúdio Ativo (Demonstração Interativa)'
                : 'Sua Foto Pessoal Ativa no Simulador'}
            </p>
            <p className="text-xs text-[#A9A29B]">
              {isDemoMode
                ? 'Arraste o comparador Antes/Depois abaixo ou envie sua foto para testar no seu rosto.'
                : 'Use os controles abaixo da foto para ajustar altura, largura, degradê e cor dos fios.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] active:scale-95 text-[#F5F2ED] text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            <span>Enviar Sua Foto</span>
          </button>

          <button
            onClick={startCamera}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#582610] hover:bg-[#6B451F] active:scale-95 text-[#F5F2ED] text-xs font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap"
          >
            <Camera className="w-4 h-4" />
            <span>Tirar Selfie (Câmera)</span>
          </button>

          {!isDemoMode && (
            <button
              onClick={() => handleInstantDemoSimulation(selectedCutForAi)}
              className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#070605] hover:bg-white/5 border border-white/15 text-[#A9A29B] hover:text-[#F5F2ED] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4 text-[#A84F1F]" />
              <span>Ver em Modelo</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {cameraError && (
        <div className="p-3.5 rounded-xl bg-[#582610]/40 border border-[#A84F1F]/60 text-xs text-[#F5F2ED] flex items-center justify-between gap-3">
          <span>{cameraError}</span>
          <button
            onClick={() => setCameraError(null)}
            className="text-[#A9A29B] hover:text-[#F5F2ED]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 1: Reference Cut Horizontal Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base md:text-lg font-bold text-[#F5F2ED]">
            01. Escolha o Corte para Simular:{' '}
            <span className="text-[#A84F1F]">{selectedCutForAi.name}</span>
          </h2>
          <span className="text-xs text-[#A9A29B]">
            Toque em qualquer corte para trocar o estilo
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {haircuts.map((cut) => {
            const isSelected = cut.id === selectedCutForAi.id;
            return (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                key={cut.id}
                onClick={() => handleSelectDifferentCut(cut)}
                className={`group flex items-center gap-3 p-2 pr-4 rounded-xl border shrink-0 text-left transition-all ${
                  isSelected
                    ? 'bg-[#582610]/80 border-[#A84F1F] text-[#F5F2ED] shadow-md'
                    : 'bg-[#14110F] border-white/10 text-[#A9A29B] hover:border-white/25'
                }`}
              >
                <div className="w-11 h-12 rounded-lg overflow-hidden shrink-0">
                  <ResilientImage
                    src={cut.imageUrl}
                    alt={cut.name}
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#F5F2ED] whitespace-nowrap">
                    {cut.name}
                  </p>
                  <p className="text-[11px] text-[#A9A29B] whitespace-nowrap">
                    {cut.category} · {cut.length}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Try-On Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Center Column: Camera / Loading / Result Viewer */}
        <div className="lg:col-span-7 space-y-4">
          {/* View Mode Selector Tabs */}
          {!cameraActive && simulatedPhotoDataUrl && userPhotoDataUrl && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#14110F] border border-white/10">
                <button
                  onClick={() => setViewMode('slider')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    viewMode === 'slider'
                      ? 'bg-[#A84F1F] text-[#F5F2ED]'
                      : 'text-[#A9A29B] hover:text-[#F5F2ED]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Comparador Antes / Depois</span>
                </button>
                <button
                  onClick={() => setViewMode('side_by_side')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    viewMode === 'side_by_side'
                      ? 'bg-[#A84F1F] text-[#F5F2ED]'
                      : 'text-[#A9A29B] hover:text-[#F5F2ED]'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Lado a Lado + Referência</span>
                </button>
              </div>

              <span className="hidden sm:inline text-xs text-[#A9A29B]">
                {viewMode === 'slider'
                  ? 'Arraste a linha laranja para comparar'
                  : 'Comparação completa em 3 ângulos'}
              </span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {isSimulating ? (
              /* Loading State */
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="aspect-[3/4] max-h-[600px] w-full rounded-2xl bg-[#14110F] border border-[#A84F1F]/50 p-8 flex flex-col items-center justify-center text-center space-y-5"
              >
                <div className="relative w-20 h-20 rounded-full border-2 border-[#A84F1F]/30 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-t-2 border-[#A84F1F] animate-spin" />
                  <Sparkles className="w-8 h-8 text-[#A84F1F]" />
                </div>
                <div className="space-y-2">
                  <p className="font-display text-xl font-bold text-[#F5F2ED]">
                    {LOADING_MESSAGES[loadingStepIdx]}
                  </p>
                  <p className="text-xs text-[#A9A29B] max-w-sm">
                    Aplicando o estilo{' '}
                    <span className="text-[#F5F2ED] font-semibold">
                      {selectedCutForAi.name}
                    </span>{' '}
                    e calculando harmonia facial...
                  </p>
                </div>
              </motion.div>
            ) : cameraActive ? (
              /* Active Camera Viewfinder */
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative aspect-[3/4] max-h-[600px] w-full rounded-2xl bg-[#070605] border border-[#A84F1F] overflow-hidden flex flex-col justify-between"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                />
                <div className="relative z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                  <span className="text-xs font-medium text-[#F5F2ED]">
                    Centralize o rosto na guia oval
                  </span>
                  <button
                    onClick={stopCamera}
                    className="min-h-[40px] min-w-[40px] rounded-full bg-black/60 text-[#F5F2ED] flex items-center justify-center"
                    aria-label="Fechar câmera"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
                  <div className="w-52 h-68 md:w-60 md:h-76 rounded-full border-2 border-dashed border-[#A84F1F]/90 shadow-[0_0_0_9999px_rgba(7,6,5,0.45)]" />
                </div>

                <div className="relative z-10 p-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-center">
                  <button
                    onClick={captureFromCamera}
                    className="min-h-[52px] px-8 py-3 rounded-full bg-[#A84F1F] hover:bg-[#8E4118] active:scale-95 text-[#F5F2ED] text-sm font-bold flex items-center gap-2.5 shadow-xl transition-transform"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Capturar Foto Frontal</span>
                  </button>
                </div>
              </motion.div>
            ) : simulatedPhotoDataUrl && userPhotoDataUrl ? (
              /* Interactive Result View */
              <motion.div
                key={`result-${selectedCutForAi.id}-${viewMode}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {viewMode === 'slider' ? (
                  <div
                    ref={comparisonContainerRef}
                    onPointerDown={(e) => {
                      isDraggingSliderRef.current = true;
                      handlePointerMoveSlider(e.clientX);
                    }}
                    onPointerMove={(e) => {
                      if (isDraggingSliderRef.current) {
                        handlePointerMoveSlider(e.clientX);
                      }
                    }}
                    onPointerUp={() => {
                      isDraggingSliderRef.current = false;
                    }}
                    onPointerLeave={() => {
                      isDraggingSliderRef.current = false;
                    }}
                    className="relative aspect-[3/4] max-h-[600px] w-full rounded-2xl overflow-hidden border border-[#A84F1F]/60 bg-[#070605] select-none cursor-ew-resize touch-none shadow-2xl"
                  >
                    {/* Base Layer: DEPOIS (Simulated Haircut) */}
                    <img
                      src={simulatedPhotoDataUrl}
                      alt={`Simulação depois com ${selectedCutForAi.name}`}
                      referrerPolicy="no-referrer"
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />

                    {/* Top Layer: ANTES (Clipped with clip-path so it never distorts) */}
                    <img
                      src={userPhotoDataUrl}
                      alt="Foto antes do corte"
                      referrerPolicy="no-referrer"
                      draggable={false}
                      style={{
                        clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                      }}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />

                    {/* Vertical Divider Line & Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[#A84F1F] shadow-[0_0_15px_rgba(0,0,0,0.95)] pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-[#A84F1F] text-[#F5F2ED] flex items-center justify-center shadow-xl border-2 border-[#F5F2ED]">
                        <SlidersHorizontal className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm text-[11px] font-bold text-[#F5F2ED] tracking-wider border border-white/10 pointer-events-none">
                      ANTES
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-[#A84F1F] text-[11px] font-bold text-[#F5F2ED] tracking-wider shadow-lg pointer-events-none">
                      DEPOIS · {selectedCutForAi.name.toUpperCase()}
                    </div>
                  </div>
                ) : (
                  /* Side-by-Side 3-Panel Studio View */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#14110F]">
                      <div className="aspect-[3/4] relative">
                        <img
                          src={userPhotoDataUrl}
                          alt="Antes do corte"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 text-[10px] font-bold text-[#F5F2ED]">
                          1. ANTES
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden border-2 border-[#A84F1F] bg-[#14110F]">
                      <div className="aspect-[3/4] relative">
                        <img
                          src={simulatedPhotoDataUrl}
                          alt="Simulação Barber AI"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#A84F1F] text-[10px] font-bold text-[#F5F2ED]">
                          2. SIMULAÇÃO IA
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#14110F]">
                      <div className="aspect-[3/4] relative">
                        <ResilientImage
                          src={selectedCutForAi.imageUrl}
                          alt={`Referência ${selectedCutForAi.name}`}
                          className="w-full h-full"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 text-[10px] font-bold text-[#A84F1F]">
                          3. REFERÊNCIA REAL
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Studio Controls for Fine-Tuning */}
                <div className="p-4 md:p-5 rounded-2xl bg-[#14110F] border border-white/10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#F5F2ED] flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-[#A84F1F]" />
                      <span>Simular Tom / Cor do Cabelo:</span>
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {HAIR_COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => setColorPreset(preset.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 border transition-all ${
                            colorPreset === preset.id
                              ? 'bg-[#582610] border-[#A84F1F] text-[#F5F2ED]'
                              : 'bg-[#070605] border-white/10 text-[#A9A29B] hover:text-[#F5F2ED]'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-white/30"
                            style={{ backgroundColor: preset.swatch }}
                          />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {!isDemoMode && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
                      <div className="space-y-1">
                        <label className="flex items-center justify-between text-[#A9A29B]">
                          <span className="flex items-center gap-1">
                            <MoveVertical className="w-3.5 h-3.5 text-[#A84F1F]" />
                            Altura do Corte
                          </span>
                          <span className="font-mono-num text-[#F5F2ED]">
                            {verticalOffsetPct > 0
                              ? `+${verticalOffsetPct}`
                              : verticalOffsetPct}
                          </span>
                        </label>
                        <input
                          type="range"
                          min={-25}
                          max={25}
                          value={verticalOffsetPct}
                          onChange={(e) =>
                            setVerticalOffsetPct(Number(e.target.value))
                          }
                          className="w-full accent-[#A84F1F]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="flex items-center justify-between text-[#A9A29B]">
                          <span className="flex items-center gap-1">
                            <ZoomIn className="w-3.5 h-3.5 text-[#A84F1F]" />
                            Largura / Volume
                          </span>
                          <span className="font-mono-num text-[#F5F2ED]">
                            {scaleOffsetPct > 0
                              ? `+${scaleOffsetPct}%`
                              : `${scaleOffsetPct}%`}
                          </span>
                        </label>
                        <input
                          type="range"
                          min={-20}
                          max={25}
                          value={scaleOffsetPct}
                          onChange={(e) =>
                            setScaleOffsetPct(Number(e.target.value))
                          }
                          className="w-full accent-[#A84F1F]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="flex items-center justify-between text-[#A9A29B]">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#A84F1F]" />
                            Degradê Lateral
                          </span>
                          <span className="font-mono-num text-[#F5F2ED]">
                            {fadeIntensityPct}%
                          </span>
                        </label>
                        <input
                          type="range"
                          min={50}
                          max={140}
                          value={fadeIntensityPct}
                          onChange={(e) =>
                            setFadeIntensityPct(Number(e.target.value))
                          }
                          className="w-full accent-[#A84F1F]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Right Column: Visagism Report & Result Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-[#14110F] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs text-[#A84F1F] font-bold">
                  DIAGNÓSTICO VISAGISTA IA
                </p>
                <h3 className="font-display text-xl font-bold text-[#F5F2ED]">
                  {analysisResult
                    ? `Rosto ${analysisResult.faceShape}`
                    : 'Análise de Harmonia Facial'}
                </h3>
              </div>
              {analysisResult && (
                <div className="text-right">
                  <span className="block text-[11px] text-[#A9A29B]">
                    Compatibilidade
                  </span>
                  <span className="font-mono-num text-2xl font-extrabold text-[#A84F1F]">
                    {analysisResult.compatibilityScore}%
                  </span>
                </div>
              )}
            </div>

            {analysisResult && (
              <motion.div
                key={selectedCutForAi.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-sm"
              >
                {/* Reference Cut Summary Card */}
                <div className="p-3 rounded-xl bg-[#070605] border border-white/10 flex items-center gap-3.5">
                  <div className="w-14 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10">
                    <ResilientImage
                      src={selectedCutForAi.imageUrl}
                      alt={selectedCutForAi.name}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-[#A84F1F]">
                      CORTE EM SIMULAÇÃO
                    </span>
                    <h4 className="font-display text-base font-bold text-[#F5F2ED] truncate">
                      {selectedCutForAi.name}
                    </h4>
                    <p className="text-xs text-[#A9A29B]">
                      {selectedCutForAi.category} · {selectedCutForAi.length} ·{' '}
                      {selectedCutForAi.serviceDuration}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="block text-xs text-[#A9A29B] mb-1">
                    Por que combina com seu estilo
                  </span>
                  <p className="text-[#F5F2ED] leading-relaxed">
                    {analysisResult.whyItWorks}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#070605] border border-white/10">
                  <span className="block text-xs text-[#A84F1F] font-bold mb-1">
                    Instrução Técnica para o Barbeiro
                  </span>
                  <p className="text-xs text-[#A9A29B] leading-relaxed">
                    {analysisResult.barberInstructions}
                  </p>
                </div>

                <div>
                  <span className="block text-xs text-[#A9A29B] mb-1">
                    Manutenção & Finalização Diária
                  </span>
                  <p className="text-xs text-[#F5F2ED]/90 leading-relaxed">
                    {analysisResult.maintenanceAdvice}
                  </p>
                </div>

                {/* Result Actions */}
                <div className="pt-4 border-t border-white/10 space-y-2.5">
                  <button
                    onClick={() => openBookingWithCut(selectedCutForAi)}
                    className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] active:scale-[0.98] text-[#F5F2ED] text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Agendar este corte ({selectedCutForAi.name})</span>
                  </button>

                  <a
                    href={whatsappAiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#582610]/70 hover:bg-[#582610] border border-[#A84F1F]/50 text-[#F5F2ED] text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-[#A84F1F]" />
                    <span>Enviar corte para o WhatsApp (21 9750-7533)</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={handleSaveSimulation}
                      className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#070605] hover:bg-white/5 border border-white/15 text-[#F5F2ED] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <Download className="w-4 h-4 text-[#A84F1F]" />
                      <span>Salvar imagem</span>
                    </button>

                    <button
                      onClick={handleShareSimulation}
                      className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#070605] hover:bg-white/5 border border-white/15 text-[#F5F2ED] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <Share2 className="w-4 h-4 text-[#A84F1F]" />
                      <span>Compartilhar</span>
                    </button>

                    <button
                      onClick={() =>
                        saveCutReference(
                          selectedCutForAi,
                          `Simulado no Barber AI (${analysisResult.compatibilityScore}% harmonia)`
                        )
                      }
                      className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#070605] hover:bg-white/5 border border-white/15 text-[#F5F2ED] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <BookmarkCheck className="w-4 h-4 text-[#A84F1F]" />
                      <span>Salvar referência</span>
                    </button>

                    <button
                      onClick={() => {
                        const currentIndex = haircuts.findIndex(
                          (h) => h.id === selectedCutForAi.id
                        );
                        const nextCut =
                          haircuts[(currentIndex + 1) % haircuts.length];
                        handleSelectDifferentCut(nextCut);
                      }}
                      className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#070605] hover:bg-white/5 border border-white/15 text-[#F5F2ED] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <RefreshCw className="w-4 h-4 text-[#A84F1F]" />
                      <span>Próximo corte</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Camera Guidelines */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <p className="text-xs font-bold text-[#F5F2ED]">
                Dicas para simular na sua própria foto:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {CAMERA_INSTRUCTIONS.map((inst) => (
                  <li
                    key={inst}
                    className="flex items-center gap-1.5 text-[11px] text-[#A9A29B]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#A84F1F] shrink-0" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mandatory Disclaimer */}
            <p className="text-[11px] text-[#A9A29B]/80 pt-3 border-t border-white/10 leading-relaxed">
              A simulação é apenas uma visualização aproximada. O resultado real
              pode variar conforme tipo de cabelo, textura, comprimento e técnica
              do barbeiro.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

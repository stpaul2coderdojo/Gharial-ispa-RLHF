import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  Eye,
  Waves,
  Zap,
  Radio,
  Sliders,
  Sparkles,
  Download,
  Cpu,
  Video,
  CheckCircle2,
  Crosshair,
  Volume2,
} from 'lucide-react';
import { ISPATokenId, SparrowStreamChannel, VisionBoundingBox } from '../types';
import { ALL_ONNX_MODELS } from '../data/onnxModelsData';
import { bioacousticSynth } from '../utils/audioSynth';

interface SparrowVideoMonitorProps {
  channel: SparrowStreamChannel;
  activeToken: ISPATokenId | null;
  onSimulateDetection: (token: ISPATokenId) => void;
  onSaveFrameToDataset?: (frameData: {
    imageUrl: string;
    boundingBoxes: VisionBoundingBox[];
    token: ISPATokenId | null;
  }) => void;
  onOpenONNXStudio?: () => void;
  onOpenXiaoFirmware?: () => void;
}

export const SparrowVideoMonitor: React.FC<SparrowVideoMonitorProps> = ({
  channel,
  activeToken,
  onSimulateDetection,
  onSaveFrameToDataset,
  onOpenONNXStudio,
  onOpenXiaoFirmware,
}) => {
  // Video & Stream State
  const [videoMode, setVideoMode] = useState<'STANDARD' | 'INFRARED' | 'THERMAL'>('STANDARD');
  const [streamSource, setStreamSource] = useState<'ENCLOSURE_CAM' | 'XIAO_SENSE_MESH' | 'USER_WEBCAM'>('ENCLOSURE_CAM');
  const [streamTime, setStreamTime] = useState<string>('00:00:00');
  const [infrasoundEnergy, setInfrasoundEnergy] = useState<number>(12);

  // ONNX Model Inference State
  const [isOnnxActive, setIsOnnxActive] = useState<boolean>(true);
  const [selectedOnnxModelId, setSelectedOnnxModelId] = useState<string>('md-v6-yolov8x');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.65);
  const [inferenceLatency, setInferenceLatency] = useState<number>(24.2);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [snapshotSavedNotice, setSnapshotSavedNotice] = useState<string | null>(null);

  // Webcam stream ref
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);

  // Canvas Refs
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const activeTokenRef = useRef<ISPATokenId | null>(activeToken);

  // Get current active model definition
  const currentModel = ALL_ONNX_MODELS.find((m) => m.id === selectedOnnxModelId) || ALL_ONNX_MODELS[0];

  useEffect(() => {
    activeTokenRef.current = activeToken;
    if (activeToken === 'SAV') {
      setInfrasoundEnergy(94);
      const timer = setTimeout(() => setInfrasoundEnergy(18), 2400);
      return () => clearTimeout(timer);
    } else if (activeToken === 'POP' || activeToken === 'BR') {
      setInfrasoundEnergy(68);
      const timer = setTimeout(() => setInfrasoundEnergy(15), 1800);
      return () => clearTimeout(timer);
    }
  }, [activeToken]);

  // Handle stream clock
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      setStreamTime(`${h}:${m}:${s}`);

      // Slight natural variance in inference latency
      setInferenceLatency((prev) => {
        const delta = (Math.random() - 0.5) * 1.6;
        return Number((Math.max(12, prev + delta)).toFixed(1));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle webcam toggle
  useEffect(() => {
    if (streamSource === 'USER_WEBCAM') {
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
        .then((stream) => {
          if (webcamVideoRef.current) {
            webcamVideoRef.current.srcObject = stream;
            webcamVideoRef.current.play();
            setIsWebcamActive(true);
          }
        })
        .catch((err) => {
          console.warn('Webcam permission not granted or unavailable:', err);
          setStreamSource('ENCLOSURE_CAM');
          setIsWebcamActive(false);
        });
    } else {
      if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
        const stream = webcamVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
        webcamVideoRef.current.srcObject = null;
        setIsWebcamActive(false);
      }
    }

    return () => {
      if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
        const stream = webcamVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [streamSource]);

  // Compute active dynamic bounding boxes for the selected ONNX model
  const getDynamicBoundingBoxes = useCallback((): VisionBoundingBox[] => {
    const curTok = activeTokenRef.current;
    const isDisplay = curTok === 'POP' || curTok === 'SAV' || curTok === 'BR' || curTok === 'SN' || curTok === 'RR';

    if (selectedOnnxModelId.startsWith('md-')) {
      // MegaDetector family: Animal, Vehicle, Person
      return [
        {
          id: 'box-md-01',
          label: 'animal: adult male gharial (Gavialis gangeticus)',
          confidence: Number((0.95 + Math.sin(Date.now() * 0.001) * 0.02).toFixed(2)),
          x: 0.28,
          y: 0.44,
          width: 0.58,
          height: 0.38,
          color: '#10b981', // emerald
          category: 'animal',
        },
        ...(curTok === 'JC' || curTok === 'CC'
          ? [
              {
                id: 'box-md-02',
                label: 'animal: juvenile gharial (creche)',
                confidence: 0.88,
                x: 0.18,
                y: 0.72,
                width: 0.18,
                height: 0.14,
                color: '#06b6d4',
                category: 'animal' as const,
              },
            ]
          : []),
      ];
    } else if (selectedOnnxModelId === 'ptw-gharial-keypoints') {
      // PyTorch Wildlife Keypoints
      return [
        {
          id: 'box-ptw-ghara',
          label: 'anatomy: adult male ghara narial resonator',
          confidence: isDisplay ? 0.98 : 0.94,
          x: 0.72,
          y: isDisplay ? 0.44 : 0.47,
          width: 0.12,
          height: 0.14,
          color: '#f59e0b', // amber
          category: 'ghara',
          keypoints: [
            { name: 'Narial Aperture', x: 0.77, y: isDisplay ? 0.49 : 0.52, score: 0.96 },
            { name: 'Rostral Tip', x: 0.81, y: isDisplay ? 0.51 : 0.54, score: 0.98 },
            { name: 'Snout Dentition Tip', x: 0.73, y: isDisplay ? 0.53 : 0.56, score: 0.92 },
          ],
        },
        {
          id: 'box-ptw-head',
          label: 'head: elongated gavialid rostrum & cranial crest',
          confidence: 0.96,
          x: 0.54,
          y: 0.46,
          width: 0.3,
          height: 0.2,
          color: '#3b82f6', // blue
          category: 'snout',
          keypoints: [
            { name: 'Eye Orbit (Left)', x: 0.58, y: 0.51, score: 0.95 },
            { name: 'Cranial Crest', x: 0.55, y: 0.49, score: 0.91 },
          ],
        },
      ];
    } else if (selectedOnnxModelId === 'ptw-creche-juvenile-counter') {
      // PyTorch Wildlife Creche Counter
      return [
        {
          id: 'box-creche-cluster',
          label: 'creche_cluster: 4 basking hatchlings counted',
          confidence: 0.93,
          x: 0.16,
          y: 0.68,
          width: 0.24,
          height: 0.18,
          color: '#8b5cf6', // purple
          category: 'juvenile_creche',
        },
      ];
    } else {
      // Microsoft Sparrow Multimodal Fusion (OV2640 + PDM Hydrophone)
      return [
        {
          id: 'box-sparrow-fusion',
          label: `Sparrow Multimodal: ${isDisplay ? (curTok || 'POP') + ' Acoustic Display Synced' : 'Male Basking Passive'}`,
          confidence: isDisplay ? 0.97 : 0.91,
          x: 0.3,
          y: 0.42,
          width: 0.56,
          height: 0.42,
          color: isDisplay ? '#ec4899' : '#10b981',
          category: 'animal',
        },
        ...(isDisplay
          ? [
              {
                id: 'box-fusion-acoustic',
                label: `Hydrophone: ${curTok} Event (${infrasoundEnergy} dB infrasound)`,
                confidence: 0.94,
                x: 0.38,
                y: 0.58,
                width: 0.32,
                height: 0.22,
                color: '#6366f1',
                category: 'scutes' as const,
              },
            ]
          : []),
      ];
    }
  }, [selectedOnnxModelId, infrasoundEnergy]);

  // Wildlife Simulation & Spectrogram Canvas Renderer
  useEffect(() => {
    let tick = 0;
    const vCanvas = videoCanvasRef.current;
    const aCanvas = audioCanvasRef.current;
    const vCtx = vCanvas?.getContext('2d');
    const aCtx = aCanvas?.getContext('2d');

    const render = () => {
      tick++;

      // ─── 1. RENDER CAMERA FRAME ──────────────────────────────────────────
      if (vCanvas && vCtx) {
        const w = vCanvas.width;
        const h = vCanvas.height;

        if (streamSource === 'USER_WEBCAM' && isWebcamActive && webcamVideoRef.current) {
          // Render webcam video feed
          vCtx.drawImage(webcamVideoRef.current, 0, 0, w, h);
        } else {
          // Render simulated MCBT Gharial Lagoon / XIAO Sense Camera feed
          let skyGradient: CanvasGradient;
          let riverGradient: CanvasGradient;
          let sandColor = '#c2a679';
          let gharialSkin = '#334139';
          let gharaHighlight = '#47554d';

          if (videoMode === 'INFRARED') {
            skyGradient = vCtx.createLinearGradient(0, 0, 0, h * 0.45);
            skyGradient.addColorStop(0, '#0a100d');
            skyGradient.addColorStop(1, '#1b2a22');

            riverGradient = vCtx.createLinearGradient(0, h * 0.45, 0, h);
            riverGradient.addColorStop(0, '#101d16');
            riverGradient.addColorStop(1, '#182b20');
            sandColor = '#2b3e34';
            gharialSkin = '#88c999';
            gharaHighlight = '#c2ffd4';
          } else if (videoMode === 'THERMAL') {
            skyGradient = vCtx.createLinearGradient(0, 0, 0, h * 0.45);
            skyGradient.addColorStop(0, '#03001e');
            skyGradient.addColorStop(1, '#240046');

            riverGradient = vCtx.createLinearGradient(0, h * 0.45, 0, h);
            riverGradient.addColorStop(0, '#3c096c');
            riverGradient.addColorStop(1, '#10002b');
            sandColor = '#7b2cbf';
            gharialSkin = '#ff9e00';
            gharaHighlight = '#ffea00';
          } else {
            // Standard Daylight
            skyGradient = vCtx.createLinearGradient(0, 0, 0, h * 0.45);
            skyGradient.addColorStop(0, streamSource === 'XIAO_SENSE_MESH' ? '#7aa5b8' : '#8cb8c9');
            skyGradient.addColorStop(1, '#d8e7ed');

            riverGradient = vCtx.createLinearGradient(0, h * 0.45, 0, h);
            riverGradient.addColorStop(0, '#2b5f63');
            riverGradient.addColorStop(1, '#183a3d');
          }

          // Sky & River background
          vCtx.fillStyle = skyGradient;
          vCtx.fillRect(0, 0, w, h * 0.45);

          vCtx.fillStyle = riverGradient;
          vCtx.fillRect(0, h * 0.45, w, h * 0.55);

          // Water surface ripples
          vCtx.strokeStyle = videoMode === 'THERMAL' ? '#9d4edd' : 'rgba(255,255,255,0.18)';
          vCtx.lineWidth = 1.5;
          for (let r = 0; r < 7; r++) {
            const y = h * 0.52 + r * 22;
            const shift = Math.sin(tick * 0.04 + r) * 16;
            vCtx.beginPath();
            vCtx.moveTo(0, y);
            vCtx.bezierCurveTo(w * 0.3 + shift, y - 6, w * 0.7 - shift, y + 6, w, y);
            vCtx.stroke();
          }

          // Sandbank (island where gharials bask)
          vCtx.fillStyle = sandColor;
          vCtx.beginPath();
          vCtx.moveTo(w * 0.15, h * 0.85);
          vCtx.quadraticCurveTo(w * 0.5, h * 0.48, w * 0.95, h * 0.88);
          vCtx.lineTo(w * 0.95, h);
          vCtx.lineTo(w * 0.15, h);
          vCtx.closePath();
          vCtx.fill();

          // Male Gharial with Ghara Narial Bulb (Gavialis gangeticus)
          const curTok = activeTokenRef.current;
          const isDisplaying =
            curTok === 'POP' || curTok === 'SAV' || curTok === 'BR' || curTok === 'SN' || curTok === 'RR';
          const headLift = isDisplaying ? Math.sin(tick * 0.15) * 12 - 14 : 0;
          const vibrationOffset = curTok === 'SAV' ? (Math.random() - 0.5) * 6 : 0;

          vCtx.save();
          vCtx.translate(w * 0.46 + vibrationOffset, h * 0.62 + headLift);

          // Body
          vCtx.fillStyle = gharialSkin;
          vCtx.beginPath();
          vCtx.ellipse(0, 0, 110, 24, -0.08, 0, Math.PI * 2);
          vCtx.fill();

          // Tail scutes
          vCtx.beginPath();
          vCtx.moveTo(-100, -8);
          vCtx.quadraticCurveTo(-150, 10, -210, 26);
          vCtx.lineWidth = 14;
          vCtx.strokeStyle = gharialSkin;
          vCtx.stroke();

          // Elongated narrow snout
          vCtx.lineWidth = 8;
          vCtx.beginPath();
          vCtx.moveTo(85, -6);
          vCtx.lineTo(165, isDisplaying ? -18 : -10);
          vCtx.stroke();

          // The "Ghara" (bulbous cartilaginous narial appendage on snout tip)
          vCtx.fillStyle = gharaHighlight;
          vCtx.beginPath();
          vCtx.arc(166, isDisplaying ? -20 : -12, 11, 0, Math.PI * 2);
          vCtx.fill();

          // Eye
          vCtx.fillStyle = '#ffcf33';
          vCtx.beginPath();
          vCtx.arc(88, -12, 3.5, 0, Math.PI * 2);
          vCtx.fill();

          vCtx.restore();

          // Water droplets bouncing off male's back during SAV (Subaudible Vibration / Water Dance)
          if (curTok === 'SAV' || curTok === 'POP') {
            vCtx.fillStyle = '#67e8f9';
            for (let d = 0; d < 16; d++) {
              const dx = w * 0.44 + (Math.random() - 0.5) * 120;
              const dy = h * 0.58 - Math.random() * 30;
              const size = Math.random() * 3 + 1.5;
              vCtx.beginPath();
              vCtx.arc(dx, dy, size, 0, Math.PI * 2);
              vCtx.fill();
            }

            // Concentric seismic water ripples
            vCtx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
            vCtx.lineWidth = 2.5;
            const radius = (tick * 3) % 120;
            vCtx.beginPath();
            vCtx.ellipse(w * 0.46, h * 0.65, radius, radius * 0.4, 0, 0, Math.PI * 2);
            vCtx.stroke();
          }

          // Basking hatchlings / creche near water edge
          vCtx.fillStyle = videoMode === 'THERMAL' ? '#ffbe0b' : '#2d4a3e';
          for (let j = 0; j < 4; j++) {
            const jx = w * 0.22 + j * 24;
            const jy = h * 0.81 + (j % 2) * 8;
            vCtx.beginPath();
            vCtx.ellipse(jx, jy, 16, 4, 0.2, 0, Math.PI * 2);
            vCtx.fill();
          }

          // XIAO Meshmatics Sensor Dithering & Timestamp artifact (if XIAO stream active)
          if (streamSource === 'XIAO_SENSE_MESH') {
            vCtx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            for (let s = 0; s < 40; s++) {
              vCtx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
            }
          }
        }

        // ─── 2. RENDER MICROSOFT SPARROW ONNX MODEL OVERLAYS ────────────────
        if (isOnnxActive) {
          const boxes = getDynamicBoundingBoxes();

          boxes.forEach((box) => {
            if (box.confidence < confidenceThreshold) return;

            const bx = box.x * w;
            const by = box.y * h;
            const bw = box.width * w;
            const bh = box.height * h;

            // Bounding box fill & glowing border
            vCtx.save();
            vCtx.strokeStyle = box.color;
            vCtx.lineWidth = 2;
            vCtx.strokeRect(bx, by, bw, bh);

            // Semi-transparent background fill
            vCtx.fillStyle = `${box.color}22`;
            vCtx.fillRect(bx, by, bw, bh);

            // Professional Computer Vision Corner Reticles
            const cornerLen = Math.min(16, bw * 0.2, bh * 0.2);
            vCtx.lineWidth = 3.5;
            vCtx.strokeStyle = box.color;

            // Top-left corner
            vCtx.beginPath();
            vCtx.moveTo(bx, by + cornerLen);
            vCtx.lineTo(bx, by);
            vCtx.lineTo(bx + cornerLen, by);
            vCtx.stroke();

            // Top-right corner
            vCtx.beginPath();
            vCtx.moveTo(bx + bw - cornerLen, by);
            vCtx.lineTo(bx + bw, by);
            vCtx.lineTo(bx + bw, by + cornerLen);
            vCtx.stroke();

            // Bottom-left corner
            vCtx.beginPath();
            vCtx.moveTo(bx, by + bh - cornerLen);
            vCtx.lineTo(bx, by + bh);
            vCtx.lineTo(bx + cornerLen, by + bh);
            vCtx.stroke();

            // Bottom-right corner
            vCtx.beginPath();
            vCtx.moveTo(bx + bw - cornerLen, by + bh);
            vCtx.lineTo(bx + bw, by + bh);
            vCtx.lineTo(bx + bw, by + bh - cornerLen);
            vCtx.stroke();

            // Label pill above bounding box
            const labelText = `${box.label} (${Math.round(box.confidence * 100)}%)`;
            vCtx.font = 'bold 11px monospace';
            const textWidth = vCtx.measureText(labelText).width;
            const pillH = 18;
            const pillY = Math.max(0, by - pillH - 2);

            vCtx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            vCtx.fillRect(bx, pillY, textWidth + 14, pillH);

            vCtx.fillStyle = box.color;
            vCtx.fillRect(bx, pillY, 4, pillH); // accent tab

            vCtx.fillStyle = '#ffffff';
            vCtx.fillText(labelText, bx + 8, pillY + 13);

            // Render landmark keypoints if available (e.g. Ghara & Rostral Tip)
            if (box.keypoints) {
              box.keypoints.forEach((kp) => {
                const kx = kp.x * w;
                const ky = kp.y * h;

                // Glowing keypoint crosshair
                vCtx.strokeStyle = '#f59e0b';
                vCtx.lineWidth = 1.5;
                vCtx.beginPath();
                vCtx.arc(kx, ky, 5, 0, Math.PI * 2);
                vCtx.stroke();

                vCtx.fillStyle = '#ffedd5';
                vCtx.beginPath();
                vCtx.arc(kx, ky, 2.5, 0, Math.PI * 2);
                vCtx.fill();

                // Keypoint label
                vCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                vCtx.fillRect(kx + 7, ky - 7, vCtx.measureText(kp.name).width + 6, 14);
                vCtx.fillStyle = '#fbbf24';
                vCtx.font = '9px sans-serif';
                vCtx.fillText(kp.name, kx + 10, ky + 3);
              });
            }

            vCtx.restore();
          });
        }

        // Camera Scanline Grid Overlay
        vCtx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        vCtx.lineWidth = 1;
        for (let y = 0; y < h; y += 4) {
          vCtx.beginPath();
          vCtx.moveTo(0, y);
          vCtx.lineTo(w, y);
          vCtx.stroke();
        }
      }

      // ─── 3. RENDER FFT SPECTROGRAM ────────────────────────────────────────
      if (aCanvas && aCtx) {
        const aw = aCanvas.width;
        const ah = aCanvas.height;
        const analyser = bioacousticSynth.getAnalyser();

        aCtx.fillStyle = '#090d16';
        aCtx.fillRect(0, 0, aw, ah);

        // Frequency labels
        aCtx.strokeStyle = '#1e293b';
        aCtx.lineWidth = 1;
        const freqs = [
          { label: 'Infrasound (<20Hz)', y: ah * 0.9 },
          { label: '500 Hz', y: ah * 0.68 },
          { label: '2 kHz', y: ah * 0.42 },
          { label: '4 kHz', y: ah * 0.2 },
        ];
        freqs.forEach((f) => {
          aCtx.beginPath();
          aCtx.moveTo(0, f.y);
          aCtx.lineTo(aw, f.y);
          aCtx.stroke();
          aCtx.fillStyle = '#475569';
          aCtx.font = '9px monospace';
          aCtx.fillText(f.label, 8, f.y - 3);
        });

        if (analyser) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);

          const barWidth = aw / (bufferLength * 0.35);
          let x = 0;

          for (let i = 0; i < bufferLength * 0.35; i++) {
            const barHeight = (dataArray[i] / 255) * (ah * 0.85);

            let r = 16,
              g = 185,
              b = 129;
            if (i < 8) {
              r = 99;
              g = 102;
              b = 241;
            } else if (dataArray[i] > 180) {
              r = 239;
              g = 68;
              b = 68;
            } else if (dataArray[i] > 110) {
              r = 245;
              g = 158;
              b = 11;
            }

            aCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            aCtx.fillRect(x, ah - barHeight, Math.max(1, barWidth - 1), barHeight);
            x += barWidth;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    videoMode,
    streamSource,
    isWebcamActive,
    isOnnxActive,
    selectedOnnxModelId,
    confidenceThreshold,
    getDynamicBoundingBoxes,
  ]);

  // Snapshot active frame to Gharial Datasets library
  const handleSnapshotDataset = () => {
    const canvas = videoCanvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const boxes = getDynamicBoundingBoxes();

    if (onSaveFrameToDataset) {
      onSaveFrameToDataset({
        imageUrl: dataUrl,
        boundingBoxes: boxes,
        token: activeToken,
      });
    }

    setSnapshotSavedNotice('Captured & added to Gharial Dataset Corpus!');
    setTimeout(() => setSnapshotSavedNotice(null), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Hidden webcam video tag for browser camera capture */}
      <video ref={webcamVideoRef} className="hidden" playsInline muted autoPlay />

      {/* Stream Top Header Bar */}
      <div className="bg-slate-950 px-3 sm:px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold uppercase tracking-wider text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            SPARROW FEED
          </span>
          <span className="font-semibold text-slate-200 truncate max-w-[140px] sm:max-w-none">
            {streamSource === 'XIAO_SENSE_MESH'
              ? 'XIAO ESP32S3 Meshmatics Node #01'
              : streamSource === 'USER_WEBCAM'
              ? 'Local Camera Input'
              : channel.name}
          </span>
          <span className="text-slate-500 hidden md:inline">&bull; 4K OV2640 + PDM Hydrophone Array</span>
        </div>

        {/* Source and View Controls */}
        <div className="flex items-center gap-2">
          {/* Source Selector */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px]">
            <button
              onClick={() => setStreamSource('ENCLOSURE_CAM')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                streamSource === 'ENCLOSURE_CAM'
                  ? 'bg-emerald-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Live MCBT Lagoon Enclosure Camera"
            >
              Enclosure
            </button>
            <button
              onClick={() => setStreamSource('XIAO_SENSE_MESH')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                streamSource === 'XIAO_SENSE_MESH'
                  ? 'bg-indigo-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Seeed Studio XIAO ESP32S3 Sense Meshmatics Node"
            >
              XIAO Mesh
            </button>
            <button
              onClick={() => setStreamSource('USER_WEBCAM')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                streamSource === 'USER_WEBCAM'
                  ? 'bg-sky-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Test ONNX model against your browser webcam"
            >
              Webcam
            </button>
          </div>

          {/* Color filter mode toggle */}
          <div className="hidden sm:flex items-center bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px]">
            <button
              onClick={() => setVideoMode('STANDARD')}
              className={`px-1.5 py-0.5 rounded font-medium ${
                videoMode === 'STANDARD' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setVideoMode('INFRARED')}
              className={`px-1.5 py-0.5 rounded font-medium ${
                videoMode === 'INFRARED' ? 'bg-emerald-900 text-emerald-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              IR
            </button>
            <button
              onClick={() => setVideoMode('THERMAL')}
              className={`px-1.5 py-0.5 rounded font-medium ${
                videoMode === 'THERMAL' ? 'bg-purple-900 text-purple-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Thermal
            </button>
          </div>

          {/* ONNX Model Settings Toggle Button */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`p-1.5 rounded border transition-colors ${
              showSettingsDrawer
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Configure Microsoft Sparrow ONNX Models"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Secondary ONNX Control Bar */}
      <div className="bg-slate-950/90 px-3 sm:px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {/* Toggle ONNX Overlay */}
          <button
            onClick={() => setIsOnnxActive(!isOnnxActive)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors border ${
              isOnnxActive
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>ONNX Overlay: {isOnnxActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Model Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            <Cpu className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Model:</span>
            <select
              value={selectedOnnxModelId}
              onChange={(e) => setSelectedOnnxModelId(e.target.value)}
              className="bg-slate-950 text-slate-200 font-mono text-[11px] rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <optgroup label="MegaDetector Wildlife Vision">
                <option value="md-v6-yolov8x">MegaDetector v6 YOLOv8x (640x640)</option>
                <option value="md-v5a">MegaDetector v5a (YOLOv5x6 1280x1280)</option>
                <option value="md-v6-rtdetr">MegaDetector v6 RT-DETR Transformer</option>
              </optgroup>
              <optgroup label="PyTorch Wildlife Models">
                <option value="ptw-gharial-keypoints">PTW Gharial Ghara & Anatomical Keypoints</option>
                <option value="ptw-creche-juvenile-counter">PTW Creche Juvenile Cluster Counter</option>
                <option value="ptw-croc-classifier">PTW Crocodylia Taxa Classifier</option>
              </optgroup>
              <optgroup label="Microsoft Sparrow Multimodal">
                <option value="sparrow-multimodal-fusion">Sparrow Audio-Visual Fusion (Camera + PDM)</option>
                <option value="sparrow-ispa-13">Sparrow ISPA 13-Class Bioacoustic</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Live ONNX Telemetry & Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="hidden sm:inline">
              Latency: <strong className="text-emerald-400">{inferenceLatency}ms</strong>
            </span>
            <span className="hidden md:inline px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
              {currentModel.quantization}
            </span>
          </div>

          {/* Snapshot to Dataset Button */}
          <button
            onClick={handleSnapshotDataset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] transition-colors shadow-sm"
            title="Save current camera frame & hydrophone features as a new Gharial Dataset record"
          >
            <Camera className="w-3 h-3" />
            <span className="hidden sm:inline">Save Frame as Dataset</span>
            <span className="sm:hidden">Save</span>
          </button>
        </div>
      </div>

      {/* Settings Drawer (if toggled) */}
      {showSettingsDrawer && (
        <div className="bg-slate-950 p-3 border-b border-slate-800 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Confidence Threshold: <strong>{Math.round(confidenceThreshold * 100)}%</strong>
            </label>
            <input
              type="range"
              min="0.3"
              max="0.95"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Model Architecture:</span>
            <span className="font-mono text-emerald-300 text-[11px] block">{currentModel.architecture}</span>
            <span className="text-[10px] text-slate-500">Input: {currentModel.inputShape}</span>
          </div>
          <div className="flex items-center justify-end gap-2">
            {onOpenONNXStudio && (
              <button
                onClick={onOpenONNXStudio}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>ONNX Studio &bull; All Models</span>
              </button>
            )}
            {onOpenXiaoFirmware && (
              <button
                onClick={onOpenXiaoFirmware}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1"
              >
                <Cpu className="w-3 h-3 text-indigo-400" />
                <span>XIAO Firmware</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Video Canvas & Telemetry HUD */}
      <div className="relative aspect-video bg-black overflow-hidden select-none">
        <canvas
          ref={videoCanvasRef}
          width={640}
          height={360}
          className="w-full h-full object-cover"
        />

        {/* Saved Snapshot Toast Notification */}
        {snapshotSavedNotice && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-emerald-950/90 border border-emerald-500 text-emerald-200 px-3.5 py-1.5 rounded-full shadow-2xl text-xs font-semibold animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{snapshotSavedNotice}</span>
          </div>
        )}

        {/* Video OSD Overlays */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 text-[11px] font-mono text-emerald-400 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-emerald-500/30 max-w-[85%]">
          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 text-red-400 animate-pulse shrink-0" />
            <span className="uppercase font-semibold truncate">
              {streamSource === 'XIAO_SENSE_MESH'
                ? 'XIAO ESP32S3 MESHMATICS (NODE 01)'
                : streamSource === 'USER_WEBCAM'
                ? 'LIVE USER WEBCAM TEST'
                : channel.name}
            </span>
          </div>
          <div className="text-slate-400 text-[10px] flex items-center gap-3">
            <span>{channel.coordinates || '12.7563°N 80.2415°E'}</span>
            <span>DEPTH: 3.8m</span>
            <span>TEMP: {channel.waterTempC}&deg;C</span>
            <span>TIME: {streamTime}</span>
          </div>
        </div>

        {/* Active ISPA Token Visual Cue Badge */}
        {activeToken && (
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-950/90 border border-emerald-500 px-3 py-1.5 rounded-lg shadow-xl animate-bounce">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <div className="text-right">
              <div className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                <span>ACOUSTIC DETECTED:</span>
                <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded font-mono font-extrabold text-sm">
                  {activeToken}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Active Model Watermark Badge */}
        {isOnnxActive && (
          <div className="absolute bottom-11 right-3 px-2 py-0.5 rounded bg-black/75 border border-indigo-500/40 text-[10px] text-indigo-300 font-mono flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
            <span>{currentModel.filename}</span>
          </div>
        )}

        {/* Infrasound & Hydrophone Sensor Bar on Canvas Bottom */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-slate-800 text-[11px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400 font-medium">Infrasound (&lt;20Hz):</span>
              <span
                className={`font-mono font-bold ${
                  infrasoundEnergy > 50 ? 'text-indigo-400 animate-pulse' : 'text-slate-300'
                }`}
              >
                {infrasoundEnergy} dB
              </span>
            </div>
            {channel.maleGharaObserved && (
              <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 text-[10px] font-medium hidden sm:inline">
                Alpha Male Ghara Observed
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[10px]">
            <span>FLOW: {channel.flowVelocityMs} m/s</span>
            <span className="text-emerald-400 font-semibold">&bull; Sparrow Edge Synchronized</span>
          </div>
        </div>
      </div>

      {/* Bioacoustic Spectrogram & Quick Test Actions */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Spectrogram Canvas */}
        <div className="md:col-span-2 bg-slate-900 rounded-lg p-2 border border-slate-800">
          <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Zap className="w-3 h-3 text-amber-400" />
              Hydrophone Real-time Spectrogram (10 Hz &ndash; 8 kHz)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">FFT Size: 1024 &bull; 48 kHz</span>
          </div>
          <canvas
            ref={audioCanvasRef}
            width={480}
            height={90}
            className="w-full h-20 rounded bg-slate-950 border border-slate-800"
          />
        </div>

        {/* Quick Acoustic Trigger Simulation */}
        <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Trigger Enclosure Call</span>
              <span className="text-[10px] text-slate-500 font-normal">Sparrow Audio Inject</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
              Inject authentic bioacoustic events directly into hydrophone stream to test MegaDetector Acoustic.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onSimulateDetection('POP')}
              className="px-2 py-1.5 rounded bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-200 text-xs font-semibold transition-colors text-center"
              title="Underwater Impulsive Pop (POP)"
            >
              POP
            </button>
            <button
              onClick={() => onSimulateDetection('SAV')}
              className="px-2 py-1.5 rounded bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 text-xs font-semibold transition-colors text-center"
              title="Subaudible Vibration (SAV)"
            >
              SAV
            </button>
            <button
              onClick={() => onSimulateDetection('BR')}
              className="px-2 py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 text-xs font-semibold transition-colors text-center"
              title="Breathe-Roar (BR)"
            >
              BR
            </button>
            <button
              onClick={() => onSimulateDetection('HC')}
              className="px-2 py-1.5 rounded bg-teal-950 hover:bg-teal-900 border border-teal-800 text-teal-200 text-xs font-semibold transition-colors text-center"
              title="Hatchling Chirp (HC)"
            >
              HC
            </button>
            <button
              onClick={() => onSimulateDetection('SN')}
              className="px-2 py-1.5 rounded bg-pink-950 hover:bg-pink-900 border border-pink-800 text-pink-200 text-xs font-semibold transition-colors text-center"
              title="Snorting Hiss using the Ghara (SN)"
            >
              SN
            </button>
            <button
              onClick={() => onSimulateDetection('JC')}
              className="px-2 py-1.5 rounded bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-200 text-xs font-semibold transition-colors text-center"
              title="Jaw Clap (JC)"
            >
              JC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

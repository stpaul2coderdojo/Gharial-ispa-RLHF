import React, { useEffect, useRef, useState } from 'react';
import { Camera, Eye, Waves, Zap, RefreshCw, Radio, Maximize2 } from 'lucide-react';
import { ISPATokenId, SparrowStreamChannel } from '../types';
import { bioacousticSynth } from '../utils/audioSynth';

interface SparrowVideoMonitorProps {
  channel: SparrowStreamChannel;
  activeToken: ISPATokenId | null;
  onSimulateDetection: (token: ISPATokenId) => void;
}

export const SparrowVideoMonitor: React.FC<SparrowVideoMonitorProps> = ({
  channel,
  activeToken,
  onSimulateDetection,
}) => {
  const [videoMode, setVideoMode] = useState<'STANDARD' | 'INFRARED' | 'THERMAL'>('STANDARD');
  const [infrasoundEnergy, setInfrasoundEnergy] = useState<number>(12);
  const [isLiveStreaming] = useState<boolean>(true);
  const [streamTime, setStreamTime] = useState<string>('00:00:00');

  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const activeTokenRef = useRef<ISPATokenId | null>(activeToken);

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

  // Live stream clock
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      setStreamTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Wildlife simulation & Spectrogram canvas renderer
  useEffect(() => {
    let tick = 0;
    const vCanvas = videoCanvasRef.current;
    const aCanvas = audioCanvasRef.current;
    const vCtx = vCanvas?.getContext('2d');
    const aCtx = aCanvas?.getContext('2d');

    const render = () => {
      tick++;

      // 1. Render Video Stream Simulation
      if (vCanvas && vCtx) {
        const w = vCanvas.width;
        const h = vCanvas.height;

        // Color palettes based on mode
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
          skyGradient.addColorStop(0, '#8cb8c9');
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
        const isDisplaying = curTok === 'POP' || curTok === 'SAV' || curTok === 'BR' || curTok === 'SN' || curTok === 'RR';
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

        // Characteristic elongated narrow snout
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

        // Visual bubble burst effect for BB
        if (curTok === 'BB') {
          vCtx.fillStyle = 'rgba(165, 243, 252, 0.7)';
          for (let b = 0; b < 10; b++) {
            const bx = w * 0.55 + (Math.sin(tick * 0.1 + b) * 30);
            const by = h * 0.6 - (b * 6) - ((tick * 2) % 40);
            vCtx.beginPath();
            vCtx.arc(bx, by, 4 + (b % 3), 0, Math.PI * 2);
            vCtx.fill();
          }
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

        // Camera Scanline / Sensor Grid Overlay
        vCtx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
        vCtx.lineWidth = 1;
        for (let y = 0; y < h; y += 4) {
          vCtx.beginPath();
          vCtx.moveTo(0, y);
          vCtx.lineTo(w, y);
          vCtx.stroke();
        }
      }

      // 2. Render Audio FFT Spectrogram / Real-time Analyzer
      if (aCanvas && aCtx) {
        const aw = aCanvas.width;
        const ah = aCanvas.height;
        const analyser = bioacousticSynth.getAnalyser();

        aCtx.fillStyle = '#090d16';
        aCtx.fillRect(0, 0, aw, ah);

        // Draw frequency grid lines (0, 1k, 2k, 4k, 8k Hz)
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

          // Render FFT Frequency bars
          const barWidth = (aw / (bufferLength * 0.35));
          let x = 0;

          for (let i = 0; i < bufferLength * 0.35; i++) {
            const barHeight = (dataArray[i] / 255) * (ah * 0.85);

            // Spectral heat coloration
            let r = 16, g = 185, b = 129; // emerald
            if (i < 8) {
              // Infrasound band
              r = 99; g = 102; b = 241; // indigo
            } else if (dataArray[i] > 180) {
              r = 239; g = 68; b = 68; // intense red
            } else if (dataArray[i] > 110) {
              r = 245; g = 158; b = 11; // amber
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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoMode]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Stream Header Bar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold uppercase tracking-wider text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            SPARROW FEED
          </span>
          <span className="font-semibold text-slate-200">{channel.name}</span>
          <span className="text-slate-500 hidden sm:inline">&bull; Hydrophone Array #1 &amp; Cam 4K</span>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px]">
            <button
              onClick={() => setVideoMode('STANDARD')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                videoMode === 'STANDARD' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setVideoMode('INFRARED')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                videoMode === 'INFRARED' ? 'bg-emerald-800 text-emerald-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              IR Night
            </button>
            <button
              onClick={() => setVideoMode('THERMAL')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                videoMode === 'THERMAL' ? 'bg-purple-800 text-purple-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Thermal
            </button>
          </div>
        </div>
      </div>

      {/* Video Canvas & Telemetry HUD */}
      <div className="relative aspect-video bg-black overflow-hidden select-none">
        <canvas
          ref={videoCanvasRef}
          width={640}
          height={360}
          className="w-full h-full object-cover"
        />

        {/* Video OSD Overlays */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 text-[11px] font-mono text-emerald-400 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-emerald-500/30">
          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 text-red-400 animate-pulse" />
            <span>CHAMBAL SANCTUARY 26.6841&deg;N 78.7845&deg;E</span>
          </div>
          <div className="text-slate-400 text-[10px] flex items-center gap-3">
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

        {/* Infrasound & Hydrophone Sensor Bar on Canvas Bottom */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-slate-800 text-[11px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400 font-medium">Infrasound (&lt;20Hz):</span>
              <span className={`font-mono font-bold ${infrasoundEnergy > 50 ? 'text-indigo-400 animate-pulse' : 'text-slate-300'}`}>
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

        {/* Quick Sanctuary Trigger Simulation */}
        <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Trigger Sanctuary Call</span>
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

import React, { useState } from 'react';
import {
  Cpu,
  Download,
  Terminal,
  Radio,
  Sliders,
  CheckCircle,
  FileCode,
  Layers,
  Sparkles,
  Wifi,
  BatteryCharging,
  Mic,
  Camera,
  Play,
} from 'lucide-react';
import { XiaoSenseFirmwareConfig } from '../../types';
import {
  DEFAULT_XIAO_CONFIG,
  generateArduinoSketch,
  generateFlashScript,
  generatePlatformIOConfig,
  createFirmwareZipBundle,
} from '../../utils/firmwareGenerator';

export const XiaoMeshmaticsTab: React.FC = () => {
  const [config, setConfig] = useState<XiaoSenseFirmwareConfig>(DEFAULT_XIAO_CONFIG);
  const [activeSubView, setActiveSubView] = useState<'CONFIG' | 'SKETCH' | 'FLASH_SCRIPT' | 'SERIAL_MONITOR'>('CONFIG');
  const [isPackaging, setIsPackaging] = useState<boolean>(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Simulated serial output logs
  const [serialLogs, setSerialLogs] = useState<string[]>([
    '[BOOT] ESP-IDF v4.4.4 / Arduino Core v2.0.11',
    '[HW] Seeed Studio XIAO ESP32S3 Sense (Xtensa LX7 dual-core @ 240MHz, 8MB PSRAM)',
    '[CAM] OV2640 DVP Camera initialized. Resolution: VGA (640x480). Framebuffer: 2 in PSRAM',
    '[MIC] MSM261D3526H1CPM Digital PDM Microphone DMA configured (48,000 Hz, 16-bit, Gain: 18dB)',
    '[INFRASOUND] High-Pass filter BYPASS enabled. Listening for <20Hz SAV waves...',
    '[MESH] XIAO Meshmatics active on Channel 6. Group: "GHARIAL-ISPA-MCBT-2026"',
    '[SPARROW] Linked to Sparrow Base Station at 192.168.4.1:8883',
    '[TELEMETRY] Node mcbt-xiao-gharial-01 ready. Standing by for bioacoustic triggers...',
  ]);

  const handleDownloadZipBundle = async () => {
    setIsPackaging(true);
    try {
      const blob = await createFirmwareZipBundle(config);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xiao_sense_meshmatics_${config.nodeId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToastNotice(`Downloaded complete firmware ZIP bundle for ${config.nodeId}`);
    } catch (err) {
      console.error('Failed to generate zip:', err);
    } finally {
      setIsPackaging(false);
      setTimeout(() => setToastNotice(null), 4000);
    }
  };

  const handleDownloadSingleFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastNotice(`Downloaded ${filename}`);
    setTimeout(() => setToastNotice(null), 3500);
  };

  const handleSimulateSerialBeacon = () => {
    const timestamp = new Date().toLocaleTimeString();
    const rms = Math.floor(Math.random() * 400 + 450);
    const newLog = `[${timestamp}] [MESH TX] Packet #${serialLogs.length + 1} | Peak: 18.2Hz (SAV) | RMS: ${rms} | OV2640 JPEG: 8,420 bytes -> Gateway`;
    setSerialLogs((prev) => [...prev.slice(-14), newLog]);
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastNotice && (
        <div className="p-3 bg-indigo-950 border border-indigo-600 rounded-lg text-indigo-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-400" />
            <span>{toastNotice}</span>
          </div>
          <span className="text-[10px] text-indigo-400">Firmware Ready</span>
        </div>
      )}

      {/* Hero Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-bold text-[10px] uppercase tracking-wider">
              Seeed Studio XIAO ESP32S3 Sense
            </span>
            <span className="text-xs font-mono text-slate-400">&bull; Meshmatics Bioacoustics v2.4</span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            XIAO Sense Camera &amp; Digital PDM Microphone Firmware
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mt-0.5">
            Synchronizes the OV2640 camera with the onboard MSM261D PDM hydrophone microphone. Transmits live
            telemetry and compressed camera frames over low-power ESP-NOW mesh to Microsoft Sparrow base stations.
          </p>
        </div>

        <button
          onClick={handleDownloadZipBundle}
          disabled={isPackaging}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-950/50 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isPackaging ? 'Packaging Bundle...' : 'Download Firmware ZIP'}</span>
        </button>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubView('CONFIG')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubView === 'CONFIG'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Node Configuration</span>
        </button>
        <button
          onClick={() => setActiveSubView('SKETCH')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubView === 'SKETCH'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-emerald-400" />
          <span>Arduino Sketch (.ino)</span>
        </button>
        <button
          onClick={() => setActiveSubView('FLASH_SCRIPT')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubView === 'FLASH_SCRIPT'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span>Flashing Script (.sh)</span>
        </button>
        <button
          onClick={() => setActiveSubView('SERIAL_MONITOR')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubView === 'SERIAL_MONITOR'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-sky-400" />
          <span>Serial Monitor</span>
        </button>
      </div>

      {/* Tab Content: CONFIGURATION */}
      {activeSubView === 'CONFIG' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Camera & Microphone Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-400" />
              OV2640 Camera &amp; PDM Microphone
            </h4>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Camera Resolution</label>
              <select
                value={config.cameraResolution}
                onChange={(e) =>
                  setConfig({ ...config, cameraResolution: e.target.value as XiaoSenseFirmwareConfig['cameraResolution'] })
                }
                className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-700 font-mono"
              >
                <option value="QVGA">QVGA (320x240) - 25 FPS High Speed</option>
                <option value="VGA">VGA (640x480) - 15 FPS Balanced (Recommended)</option>
                <option value="SVGA">SVGA (800x600) - 8 FPS High Detail</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">PDM Microphone Sample Rate</label>
              <select
                value={config.pdmMicrophoneSampleRate}
                onChange={(e) =>
                  setConfig({ ...config, pdmMicrophoneSampleRate: parseInt(e.target.value) as 16000 | 44100 | 48000 })
                }
                className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-700 font-mono"
              >
                <option value={48000}>48,000 Hz (Full Spectrum &amp; Infrasound)</option>
                <option value={16000}>16,000 Hz (Speech / TinyML Low-Power)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Microphone PDM Digital Gain: <strong>+{config.pdmGainDb} dB</strong>
              </label>
              <input
                type="range"
                min="0"
                max="30"
                step="2"
                value={config.pdmGainDb}
                onChange={(e) => setConfig({ ...config, pdmGainDb: parseInt(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">Infrasound HPF Bypass</span>
                <span className="text-[10px] text-slate-400">
                  Preserves Subaudible Vibration (SAV) waves below 20Hz
                </span>
              </div>
              <input
                type="checkbox"
                checked={!config.infrasoundHighPassFilter}
                onChange={(e) => setConfig({ ...config, infrasoundHighPassFilter: !e.target.checked })}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Meshmatics & Radio Protocol Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-indigo-400" />
              Meshmatics &amp; Sparrow Protocol
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Node ID</label>
                <input
                  type="text"
                  value={config.nodeId}
                  onChange={(e) => setConfig({ ...config, nodeId: e.target.value })}
                  className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Mesh Channel (1-13)</label>
                <input
                  type="number"
                  min="1"
                  max="13"
                  value={config.meshChannel}
                  onChange={(e) => setConfig({ ...config, meshChannel: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-700 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Mesh Group Key</label>
              <input
                type="text"
                value={config.meshGroupKey}
                onChange={(e) => setConfig({ ...config, meshGroupKey: e.target.value })}
                className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Battery Power Strategy</label>
              <select
                value={config.batteryOptimizationMode}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    batteryOptimizationMode: e.target.value as XiaoSenseFirmwareConfig['batteryOptimizationMode'],
                  })
                }
                className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-700"
              >
                <option value="LOW_POWER_DUTY">Low Power Duty Cycle (Wake on Sound Trigger)</option>
                <option value="SOLAR_HARVEST">Solar Harvest (Adaptive framerate to battery voltage)</option>
                <option value="CONTINUOUS">Continuous 24/7 Monitoring</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() =>
                  handleDownloadSingleFile(
                    'meshmatics_config.json',
                    JSON.stringify(config, null, 2),
                    'application/json'
                  )
                }
                className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors text-center"
              >
                Save Config JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: ARDUINO SKETCH */}
      {activeSubView === 'SKETCH' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-xs">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="font-mono text-slate-300 font-semibold">xiao_sense_meshmatics.ino</span>
            <button
              onClick={() =>
                handleDownloadSingleFile('xiao_sense_meshmatics.ino', generateArduinoSketch(config), 'text/plain')
              }
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download .ino</span>
            </button>
          </div>
          <pre className="p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed">
            {generateArduinoSketch(config)}
          </pre>
        </div>
      )}

      {/* Tab Content: FLASH SCRIPT */}
      {activeSubView === 'FLASH_SCRIPT' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-xs">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="font-mono text-slate-300 font-semibold">flash_xiao_sense.sh (esptool.py)</span>
            <button
              onClick={() =>
                handleDownloadSingleFile('flash_xiao_sense.sh', generateFlashScript(config), 'text/x-sh')
              }
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download .sh</span>
            </button>
          </div>
          <pre className="p-4 font-mono text-[11px] text-amber-200 overflow-x-auto max-h-[450px] leading-relaxed">
            {generateFlashScript(config)}
          </pre>
        </div>
      )}

      {/* Tab Content: SERIAL MONITOR */}
      {activeSubView === 'SERIAL_MONITOR' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-xs">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-slate-300">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Serial Monitor: 115200 Baud /dev/ttyACM0 (XIAO ESP32S3)</span>
            </div>
            <button
              onClick={handleSimulateSerialBeacon}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              <Play className="w-3 h-3" />
              <span>Inject Sensor Beacon</span>
            </button>
          </div>
          <div className="p-4 font-mono text-[11px] text-emerald-400 bg-black min-h-[320px] max-h-[460px] overflow-y-auto space-y-1">
            {serialLogs.map((log, idx) => (
              <div key={idx} className="leading-tight">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

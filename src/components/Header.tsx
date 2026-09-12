import React from 'react';
import {
  Radio,
  Volume2,
  VolumeX,
  ShieldCheck,
  Activity,
  Info,
  Sparkles,
  Cpu,
  Database,
} from 'lucide-react';
import { SparrowStreamChannel } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { ONNXStudioTab } from './ONNXStudio/ONNXStudioModal';

interface HeaderProps {
  channels: SparrowStreamChannel[];
  selectedChannel: SparrowStreamChannel;
  onSelectChannel: (channel: SparrowStreamChannel) => void;
  isAudioMuted: boolean;
  onToggleMute: () => void;
  onOpenDictionary: () => void;
  onOpenONNXStudio: (tab?: ONNXStudioTab) => void;
  datasetCount: number;
  geminiActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  channels,
  selectedChannel,
  onSelectChannel,
  isAudioMuted,
  onToggleMute,
  onOpenDictionary,
  onOpenONNXStudio,
  datasetCount,
  geminiActive,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left Branding & Proposal Context */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold tracking-wider text-base shadow-inner">
            ISPA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Gharial ISPA &times; Microsoft Sparrow
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                RLHF &bull; ONNX
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              MCBT Bioacoustics &bull; MegaDetector Wildlife &bull; XIAO ESP32S3 Meshmatics
            </p>
          </div>
        </div>

        {/* Center Stream Channel Selector */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse ml-1" />
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider hidden lg:inline">
            Hydrophone:
          </span>
          <select
            id="channel-select-dropdown"
            value={selectedChannel.id}
            onChange={(e) => {
              const found = channels.find((c) => c.id === e.target.value);
              if (found) onSelectChannel(found);
            }}
            className="bg-slate-900 text-xs font-semibold text-emerald-300 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name} ({ch.activeGharialsCount} gharials)
              </option>
            ))}
          </select>

          <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400 pl-2 border-l border-slate-800">
            <span>Temp: <strong className="text-slate-200">{selectedChannel.waterTempC}&deg;C</strong></span>
            <span>Flow: <strong className="text-slate-200">{selectedChannel.flowVelocityMs}m/s</strong></span>
          </div>
        </div>

        {/* Right Actions: ONNX Studio, Datasets, XIAO Firmware, Dictionary */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Main ONNX Studio Button */}
          <button
            id="open-onnx-studio-btn"
            onClick={() => onOpenONNXStudio('MODELS')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
            title="Open Microsoft Sparrow & MegaDetector ONNX Studio"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ONNX Studio</span>
          </button>

          {/* Datasets Button */}
          <button
            id="open-datasets-btn"
            onClick={() => onOpenONNXStudio('DATASETS')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
            title="Browse & Export Gharial Datasets"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Datasets</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-700 text-[10px] font-mono text-slate-200">
              {datasetCount}
            </span>
          </button>

          {/* XIAO Sense Firmware Button */}
          <button
            id="open-xiao-firmware-btn"
            onClick={() => onOpenONNXStudio('XIAO_FIRMWARE')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
            title="Download XIAO ESP32S3 Sense Meshmatics Firmware"
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>XIAO Sense</span>
          </button>

          {/* ISPA Dictionary Modal */}
          <button
            id="open-dictionary-btn"
            onClick={onOpenDictionary}
            className="flex items-center gap-1 px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs transition-colors"
            title="View 13 ISPA Phonetic Tokens & Ethograms"
          >
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">13 Tokens</span>
          </button>

          <PWAInstallButton />

          <button
            id="toggle-audio-mute-btn"
            onClick={onToggleMute}
            className={`p-1.5 rounded border transition-colors ${
              isAudioMuted
                ? 'bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900/80'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-emerald-400'
            }`}
            title={isAudioMuted ? 'Unmute bioacoustic synth' : 'Mute bioacoustic synth'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Radio, Volume2, VolumeX, ShieldCheck, Activity, Info } from 'lucide-react';
import { SparrowStreamChannel } from '../types';

interface HeaderProps {
  channels: SparrowStreamChannel[];
  selectedChannel: SparrowStreamChannel;
  onSelectChannel: (channel: SparrowStreamChannel) => void;
  isAudioMuted: boolean;
  onToggleMute: () => void;
  onOpenDictionary: () => void;
  geminiActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  channels,
  selectedChannel,
  onSelectChannel,
  isAudioMuted,
  onToggleMute,
  onOpenDictionary,
  geminiActive,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left Branding & Proposal Context */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold tracking-wider text-lg shadow-inner">
            ISPA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Gharial ISPA &times; Microsoft Sparrow
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                RLHF v1.4
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interspecies Phonetic Alphabet Annotation &bull; Madras Crocodile Bank Trust (MCBT) &bull; Dr. Bheemaiah Anil Kumar Proposal
            </p>
          </div>
        </div>

        {/* Center Stream Channel Selector */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse ml-1" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:inline">
            Hydrophone Feed:
          </span>
          <select
            id="channel-select-dropdown"
            value={selectedChannel.id}
            onChange={(e) => {
              const found = channels.find((c) => c.id === e.target.value);
              if (found) onSelectChannel(found);
            }}
            className="bg-slate-900 text-xs font-semibold text-emerald-300 border border-slate-700 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name} ({ch.activeGharialsCount} gharials)
              </option>
            ))}
          </select>

          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 pl-2 border-l border-slate-800">
            <span>Temp: <strong className="text-slate-200">{selectedChannel.waterTempC}&deg;C</strong></span>
            <span>Flow: <strong className="text-slate-200">{selectedChannel.flowVelocityMs} m/s</strong></span>
          </div>
        </div>

        {/* Right Actions: Dictionary & Mute & Copilot Status */}
        <div className="flex items-center gap-2">
          {geminiActive ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-medium"
              title="Server-side Gemini 3.8 Flash bioacoustic reasoning active"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">MegaDetector Copilot</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-slate-400 text-xs"
              title="Bioacoustic heuristics active"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Heuristic Mode</span>
            </div>
          )}

          <button
            id="open-dictionary-btn"
            onClick={onOpenDictionary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>13 ISPA Tokens</span>
          </button>

          <button
            id="toggle-audio-mute-btn"
            onClick={onToggleMute}
            className={`p-2 rounded border transition-colors ${
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

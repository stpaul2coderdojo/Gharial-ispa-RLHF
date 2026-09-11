import React, { useState } from 'react';
import { Play, Square, Send, Plus, Trash2, RotateCcw, Volume2, Sparkles, ArrowRight } from 'lucide-react';
import { ISPATokenId } from '../types';
import { ISPA_VOCABULARY, PRESET_SEQUENCES } from '../data/ispaData';
import { bioacousticSynth } from '../utils/audioSynth';

interface ISPASentenceComposerProps {
  sentence: ISPATokenId[];
  onUpdateSentence: (tokens: ISPATokenId[]) => void;
  onTransmitToSparrow: (tokens: ISPATokenId[]) => void;
  isPlaying: boolean;
  playingTokenIndex: number | null;
  onPlaySentence: () => void;
  onStopSentence: () => void;
}

export const ISPASentenceComposer: React.FC<ISPASentenceComposerProps> = ({
  sentence,
  onUpdateSentence,
  onTransmitToSparrow,
  isPlaying,
  playingTokenIndex,
  onPlaySentence,
  onStopSentence,
}) => {
  const [tokenGapMs, setTokenGapMs] = useState<number>(300);

  const addToken = (token: ISPATokenId) => {
    onUpdateSentence([...sentence, token]);
  };

  const removeToken = (index: number) => {
    const next = [...sentence];
    next.splice(index, 1);
    onUpdateSentence(next);
  };

  const clearSentence = () => {
    onUpdateSentence([]);
  };

  const loadPreset = (presetTokens: ISPATokenId[]) => {
    onUpdateSentence(presetTokens);
  };

  const playSingleToken = (e: React.MouseEvent, token: ISPATokenId) => {
    e.stopPropagation();
    bioacousticSynth.playToken(token);
  };

  // Group tokens by functional bioacoustic categories
  const adultDisplayTokens: ISPATokenId[] = ['POP', 'SAV', 'BR', 'SN', 'RR'];
  const juvenileTokens: ISPATokenId[] = ['HC', 'CC', 'DC'];
  const agonisticWarningTokens: ISPATokenId[] = ['HS', 'JC', 'GW', 'GR'];
  const courtshipTokens: ISPATokenId[] = ['BB'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          <h2 className="text-sm font-bold text-white tracking-wide">
            ISPA Sentence Composer &amp; Sparrow Playback
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">
            &bull; Synthesize or Broadcast Bioacoustic Sequences
          </span>
        </div>

        {/* Preset Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden md:inline">Presets:</span>
          <select
            id="preset-sequence-selector"
            onChange={(e) => {
              const preset = PRESET_SEQUENCES.find((p) => p.title === e.target.value);
              if (preset) loadPreset(preset.tokens);
            }}
            defaultValue=""
            className="bg-slate-900 text-xs text-emerald-300 border border-slate-700 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="" disabled>
              Select Dr. Anil Kumar Benchmark Sequence...
            </option>
            {PRESET_SEQUENCES.map((p) => (
              <option key={p.title} value={p.title}>
                {p.title} ({p.tokens.join(' → ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Assembly Track */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Active ISPA Sentence:</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              {sentence.length > 0 ? sentence.join('  →  ') : 'Empty sequence — click tokens below to compose'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              Tokens: <strong className="text-slate-200">{sentence.length}</strong>
            </span>
            <button
              onClick={clearSentence}
              disabled={sentence.length === 0}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Visual Token Sequence Strip */}
        <div className="min-h-[76px] bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center gap-2 overflow-x-auto">
          {sentence.length === 0 ? (
            <div className="flex items-center justify-center w-full text-xs text-slate-500 italic py-3">
              Click any ISPA token from the repertoire below, or load a preset sequence to transmit through Microsoft Sparrow.
            </div>
          ) : (
            sentence.map((tok, index) => {
              const def = ISPA_VOCABULARY[tok];
              const isCurrentPlaying = playingTokenIndex === index;
              return (
                <React.Fragment key={`${tok}-${index}`}>
                  <div
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 shrink-0 select-none ${
                      isCurrentPlaying
                        ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400 scale-105 shadow-lg shadow-emerald-950'
                        : 'bg-slate-800/90 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-400">#{index + 1}</span>
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: def?.color || '#38bdf8' }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-white text-sm">
                          {tok}
                        </span>
                        <span className="text-[11px] text-slate-300 font-medium hidden sm:inline">
                          {def?.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {def?.acousticDescriptor.durationMs}ms &bull; {def?.acousticDescriptor.dominantFreq}Hz
                      </span>
                    </div>

                    <button
                      onClick={(e) => playSingleToken(e, tok)}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-emerald-400 transition-colors ml-1"
                      title="Preview this sound token"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => removeToken(index)}
                      className="p-1 hover:bg-rose-950 rounded text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove token from sentence"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {index < sentence.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Playback & Transmission Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <button
                id="stop-sentence-playback-btn"
                onClick={onStopSentence}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-md"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Playback</span>
              </button>
            ) : (
              <button
                id="play-sentence-btn"
                onClick={onPlaySentence}
                disabled={sentence.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs transition-colors shadow-md"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play ISPA Sentence</span>
              </button>
            )}

            <button
              id="transmit-to-sparrow-btn"
              onClick={() => onTransmitToSparrow(sentence)}
              disabled={sentence.length === 0 || isPlaying}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs transition-colors shadow-md"
              title="Play and stream through Sparrow hydrophone to test MegaDetector Acoustic"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Transmit &bull; MegaDetector Listen</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <span>Token Interval:</span>
              <input
                type="range"
                min="100"
                max="800"
                step="50"
                value={tokenGapMs}
                onChange={(e) => setTokenGapMs(Number(e.target.value))}
                className="w-20 accent-emerald-500 cursor-pointer"
              />
              <span className="font-mono text-slate-200">{tokenGapMs}ms</span>
            </label>
          </div>
        </div>
      </div>

      {/* ISPA Token Palette by Biological Functional Categories */}
      <div className="p-4 bg-slate-900 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            ISPA Repertoire Token Bank (Click token to append to sentence):
          </span>
          <span className="text-[11px] text-slate-500">13 Repertoire Phonemes</span>
        </div>

        {/* Group 1: Adult Advertisement & Displays */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Male Adult Advertisement &amp; Displays:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {adultDisplayTokens.map((tok) => {
              const def = ISPA_VOCABULARY[tok];
              return (
                <button
                  key={tok}
                  onClick={() => addToken(tok)}
                  className="flex flex-col p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all duration-150 group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-white text-xs px-1.5 py-0.5 rounded bg-slate-800 group-hover:bg-emerald-950 group-hover:text-emerald-300">
                      {tok}
                    </span>
                    <button
                      onClick={(e) => playSingleToken(e, tok)}
                      className="text-slate-500 hover:text-emerald-400 p-0.5"
                      title="Preview sound"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs font-medium text-slate-200 truncate">{def.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">{def.soundDescription}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Group 2: Juvenile & Hatchlings */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Juvenile &amp; Hatchling Vocalizations:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {juvenileTokens.map((tok) => {
              const def = ISPA_VOCABULARY[tok];
              return (
                <button
                  key={tok}
                  onClick={() => addToken(tok)}
                  className="flex flex-col p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all duration-150 group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-white text-xs px-1.5 py-0.5 rounded bg-slate-800 group-hover:bg-emerald-950 group-hover:text-emerald-300">
                      {tok}
                    </span>
                    <button
                      onClick={(e) => playSingleToken(e, tok)}
                      className="text-slate-500 hover:text-emerald-400 p-0.5"
                      title="Preview sound"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs font-medium text-slate-200 truncate">{def.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">{def.soundDescription}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Group 3: Agonistic, Warning & Courtship */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Defensive Warnings, Agonistic Standoff &amp; Courtship:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[...agonisticWarningTokens, ...courtshipTokens].map((tok) => {
              const def = ISPA_VOCABULARY[tok];
              return (
                <button
                  key={tok}
                  onClick={() => addToken(tok)}
                  className="flex flex-col p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all duration-150 group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-white text-xs px-1.5 py-0.5 rounded bg-slate-800 group-hover:bg-emerald-950 group-hover:text-emerald-300">
                      {tok}
                    </span>
                    <button
                      onClick={(e) => playSingleToken(e, tok)}
                      className="text-slate-500 hover:text-emerald-400 p-0.5"
                      title="Preview sound"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs font-medium text-slate-200 truncate">{def.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">{def.soundDescription}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

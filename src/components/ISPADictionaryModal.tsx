import React, { useState } from 'react';
import { X, Volume2, Search, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import { ISPATokenId, ISPADefinition } from '../types';
import { ISPA_VOCABULARY } from '../data/ispaData';
import { bioacousticSynth } from '../utils/audioSynth';

interface ISPADictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToSentence?: (token: ISPATokenId) => void;
}

export const ISPADictionaryModal: React.FC<ISPADictionaryModalProps> = ({
  isOpen,
  onClose,
  onInsertToSentence,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<ISPADefinition>(ISPA_VOCABULARY.POP);

  const tokens = Object.values(ISPA_VOCABULARY);
  const filteredTokens = tokens.filter(
    (t) =>
      t.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.behavioralContext.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.soundDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlaySound = (token: ISPATokenId) => {
    bioacousticSynth.playToken(token);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col text-slate-100 shadow-2xl my-6 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Gharial Interspecies Phonetic Alphabet (ISPA) Repertoire
              </h2>
              <p className="text-xs text-slate-400">
                Draft Annotation Standard for Microsoft Sparrow &bull; Madras Crocodile Bank Trust (MCBT) &bull; Dr. Bheemaiah Anil Kumar Proposal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Token List & Search (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-800 p-4 flex flex-col h-[520px] bg-slate-950/50">
            {/* Search Box */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tokens, sounds, behaviors..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Token List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredTokens.map((item) => {
                const isSelected = selectedToken.token === item.token;
                return (
                  <div
                    key={item.token}
                    onClick={() => setSelectedToken(item)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500'
                        : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="px-2 py-0.5 rounded font-mono font-bold text-xs text-white shrink-0"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.token}
                      </span>
                      <div className="truncate">
                        <h4 className="text-xs font-semibold truncate">{item.name}</h4>
                        <span className="text-[10px] text-slate-400 block truncate">{item.soundDescription}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySound(item.token);
                      }}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-emerald-400 shrink-0"
                      title="Play sound"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deep Profile Details (7 cols) */}
          <div className="md:col-span-7 p-6 overflow-y-auto h-[520px] bg-slate-900/60 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header Profile */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="px-3 py-1 rounded-md font-mono font-extrabold text-base text-white shadow"
                      style={{ backgroundColor: selectedToken.color }}
                    >
                      {selectedToken.token}
                    </span>
                    <h3 className="text-lg font-bold text-white">{selectedToken.name}</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{selectedToken.soundDescription}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlaySound(selectedToken.token)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Play Audio</span>
                  </button>

                  {onInsertToSentence && (
                    <button
                      onClick={() => {
                        onInsertToSentence(selectedToken.token);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
                    >
                      + Add to Sentence
                    </button>
                  )}
                </div>
              </div>

              {/* Core Attributes Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">BEHAVIORAL CONTEXT</span>
                  <span className="text-slate-200 font-semibold mt-1 block">
                    {selectedToken.behavioralContext}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">CONFIDENCE IN LITERATURE</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {selectedToken.confidence} Confidence
                  </span>
                </div>
              </div>

              {/* Acoustic Descriptors & MFCCs */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Acoustic Descriptors (Spectral &amp; Temporal Parameters):</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Frequency Band:</span>
                    <strong className="text-slate-200">{selectedToken.acousticDescriptor.freqRange}</strong>
                  </div>

                  <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Dominant Freq:</span>
                    <strong className="text-slate-200">{selectedToken.acousticDescriptor.dominantFreq} Hz</strong>
                  </div>

                  <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Duration:</span>
                    <strong className="text-slate-200">{selectedToken.acousticDescriptor.durationMs} ms</strong>
                  </div>

                  <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Impulsive Cavitation:</span>
                    <strong className={selectedToken.acousticDescriptor.impulsive ? 'text-amber-300' : 'text-slate-400'}>
                      {selectedToken.acousticDescriptor.impulsive ? 'Yes (Percussive)' : 'No'}
                    </strong>
                  </div>

                  <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Infrasonic Band:</span>
                    <strong className={selectedToken.acousticDescriptor.infrasonic ? 'text-indigo-300' : 'text-slate-400'}>
                      {selectedToken.acousticDescriptor.infrasonic ? 'Yes (<20Hz Seismic)' : 'No'}
                    </strong>
                  </div>

                  <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Waveform Model:</span>
                    <strong className="text-slate-200 capitalize">{selectedToken.acousticDescriptor.waveformType}</strong>
                  </div>
                </div>
              </div>

              {/* Caller Identity & Environmental Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">CALLER DEMOGRAPHIC</span>
                  <span className="text-slate-300 mt-1 block">{selectedToken.callerIdentity}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">HABITAT &amp; MICRO-ENVIRONMENT</span>
                  <span className="text-slate-300 mt-1 block">{selectedToken.environmentalContext}</span>
                </div>
              </div>
            </div>

            {/* Proposal Citation Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Standard Proposed by Dr. Bheemaiah Anil Kumar</span>
              <span>Suitable for RLHF / HITL Bioacoustic Workflows</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

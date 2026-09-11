import React from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ChevronRight, Activity, Zap, ThumbsUp, ThumbsDown, Sliders } from 'lucide-react';
import { MegaDetectorDetection, ISPATokenId } from '../types';
import { ISPA_VOCABULARY } from '../data/ispaData';

interface MegaDetectorAcousticPanelProps {
  detections: MegaDetectorDetection[];
  selectedDetection: MegaDetectorDetection | null;
  onSelectDetection: (detection: MegaDetectorDetection) => void;
  onQuickFeedback: (detection: MegaDetectorDetection, accept: boolean) => void;
  onOpenDetailedReview: (detection: MegaDetectorDetection) => void;
  isProcessing: boolean;
}

export const MegaDetectorAcousticPanel: React.FC<MegaDetectorAcousticPanelProps> = ({
  detections,
  selectedDetection,
  onSelectDetection,
  onQuickFeedback,
  onOpenDetailedReview,
  isProcessing,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            MegaDetector Acoustic Conversion Feed
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Acoustic Inference Running...
            </span>
          )}
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
            {detections.length} Events
          </span>
        </div>
      </div>

      {/* Sub-header description */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Acoustic segmentation &rarr; ISPA Token classification &rarr; Behavioral tagging</span>
        <span className="text-emerald-400 font-medium">Auto-tagging active</span>
      </div>

      {/* Detections List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-2 space-y-1.5 max-h-[360px]">
        {detections.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 italic">
            No acoustic events logged yet. Transmit an ISPA sequence from above or trigger a sanctuary call from the video monitor to run MegaDetector Acoustic.
          </div>
        ) : (
          detections.map((d) => {
            const def = ISPA_VOCABULARY[d.token];
            const isSelected = selectedDetection?.id === d.id;
            const confPercent = Math.round(d.confidence * 100);

            return (
              <div
                key={d.id}
                onClick={() => onSelectDetection(d)}
                className={`p-3 rounded-lg border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                    : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {/* Token Badge */}
                    <span
                      className="px-2 py-0.5 rounded font-mono font-extrabold text-xs text-white shadow-sm"
                      style={{ backgroundColor: def?.color || '#059669' }}
                    >
                      {d.token}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{def?.name || d.token}</h4>
                      <span className="text-[10px] text-slate-400 block">{def?.soundDescription}</span>
                    </div>
                  </div>

                  {/* Confidence Badge */}
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                        confPercent >= 85
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : confPercent >= 70
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {confPercent >= 85 ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                      )}
                      {confPercent}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      +{d.timestamp.toFixed(1)}s
                    </span>
                  </div>
                </div>

                {/* Behavioral Auto-Tag */}
                <div className="bg-slate-900/90 rounded px-2.5 py-1.5 border border-slate-800 mb-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-slate-500 font-medium text-[10px]">BEHAVIOR TAG:</span>
                    <span className="font-semibold text-emerald-300">{d.predictedBehavior}</span>
                  </div>
                  {d.acousticFeatures.infrasoundEnergy > 0.4 && (
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800">
                      Infrasonic &lt;20Hz
                    </span>
                  )}
                </div>

                {/* Acoustic Features Bar */}
                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-slate-400 mb-2">
                  <div>
                    <span className="text-slate-500 block">Peak Freq:</span>
                    <strong className="text-slate-300">{d.acousticFeatures.peakFreqHz} Hz</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bandwidth:</span>
                    <strong className="text-slate-300">{d.acousticFeatures.bandwidthHz} Hz</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duration:</span>
                    <strong className="text-slate-300">{d.acousticFeatures.durationMs} ms</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SNR:</span>
                    <strong className="text-slate-300">{d.acousticFeatures.snrDb} dB</strong>
                  </div>
                </div>

                {/* Human Feedback Controls (Inline & Detailed) */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickFeedback(d, true);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[11px] font-medium transition-colors"
                      title="Quick Accept (Reward +1.0)"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickFeedback(d, false);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[11px] font-medium transition-colors"
                      title="Quick Reject (Reward -1.0)"
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>Reject</span>
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetailedReview(d);
                    }}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    <Sliders className="w-3 h-3 text-emerald-400" />
                    <span>RLHF Review</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

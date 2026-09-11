import React from 'react';
import { Download, CheckCircle2, AlertCircle, Trash2, ArrowUpRight, Award, FileJson } from 'lucide-react';
import { RLHFFeedbackItem, BioacousticMetrics } from '../types';
import { ISPA_VOCABULARY } from '../data/ispaData';

interface RLHFFeedbackQueueProps {
  feedbackHistory: RLHFFeedbackItem[];
  metrics: BioacousticMetrics;
  onClearHistory: () => void;
  onExportSparrowManifest: () => void;
}

export const RLHFFeedbackQueue: React.FC<RLHFFeedbackQueueProps> = ({
  feedbackHistory,
  metrics,
  onClearHistory,
  onExportSparrowManifest,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Top Banner & KPI Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Human-in-the-Loop (RLHF) Dataset &amp; Reward Registry
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="export-sparrow-manifest-btn"
            onClick={onExportSparrowManifest}
            disabled={feedbackHistory.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold transition-colors shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Sparrow Dataset (JSON)</span>
          </button>

          <button
            onClick={onClearHistory}
            disabled={feedbackHistory.length === 0}
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            title="Clear feedback history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-950/60 border-b border-slate-800 text-xs">
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">TOTAL REVIEWS</span>
          <span className="text-base font-bold text-white">{feedbackHistory.length}</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">Annotated events</span>
        </div>

        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">HUMAN AGREEMENT</span>
          <span className="text-base font-bold text-emerald-300">
            {metrics.acceptanceRate.toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Model acceptance</span>
        </div>

        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">AVG REWARD SCORE</span>
          <span className="text-base font-bold text-indigo-300">
            {metrics.averageRewardScore > 0 ? `+${metrics.averageRewardScore.toFixed(2)}` : metrics.averageRewardScore.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Scale: -1.0 to +1.0</span>
        </div>

        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">ACTIVE LEARNING QUEUE</span>
          <span className="text-base font-bold text-amber-300">
            {metrics.activeQueueCount}
          </span>
          <span className="text-[10px] text-amber-400/80 block mt-0.5">Flagged for review</span>
        </div>
      </div>

      {/* Review History Table / List */}
      <div className="overflow-x-auto p-3">
        {feedbackHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 italic">
            No feedback entries recorded yet. Approve, reject, or modify tokens in the MegaDetector Acoustic feed above to build the Sparrow RLHF training corpus.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Predicted Sequence</th>
                <th className="py-2 px-3">Validated Ground Truth</th>
                <th className="py-2 px-3">Reward</th>
                <th className="py-2 px-3">Behavior Label</th>
                <th className="py-2 px-3">Caller Identity</th>
                <th className="py-2 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {feedbackHistory.map((item) => {
                const isApproved = item.reviewStatus === 'APPROVED';
                const isModified = item.reviewStatus === 'MODIFIED';

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isApproved
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : isModified
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {isApproved ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                        )}
                        {item.reviewStatus}
                      </span>
                    </td>

                    {/* Original Sequence */}
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-300">
                      {item.originalSequence.join(' → ')}
                    </td>

                    {/* Validated Sequence */}
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                        {item.validatedSequence.join(' → ')}
                      </span>
                    </td>

                    {/* Reward Score */}
                    <td className="py-2.5 px-3 font-mono font-bold">
                      <span
                        className={
                          item.rewardScore > 0
                            ? 'text-emerald-400'
                            : item.rewardScore < 0
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }
                      >
                        {item.rewardScore > 0 ? `+${item.rewardScore.toFixed(2)}` : item.rewardScore.toFixed(2)}
                      </span>
                    </td>

                    {/* Behavior Label */}
                    <td className="py-2.5 px-3 text-slate-200 truncate max-w-[180px]" title={item.correctedBehavior}>
                      {item.correctedBehavior}
                    </td>

                    {/* Caller */}
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-[140px]">
                      {item.callerIdentityConfirmed}
                    </td>

                    {/* Time */}
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                      {item.reviewedAt ? new Date(item.reviewedAt).toLocaleTimeString() : 'Just now'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

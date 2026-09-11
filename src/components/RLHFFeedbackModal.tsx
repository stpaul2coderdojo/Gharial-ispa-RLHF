import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Sparkles, Sliders, Volume2, ShieldAlert, CheckCircle } from 'lucide-react';
import { MegaDetectorDetection, ISPATokenId, RLHFFeedbackItem } from '../types';
import { ISPA_VOCABULARY } from '../data/ispaData';
import { bioacousticSynth } from '../utils/audioSynth';

interface RLHFFeedbackModalProps {
  detection: MegaDetectorDetection | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (feedback: Omit<RLHFFeedbackItem, 'id' | 'reviewedAt'>) => void;
  streamLocation: string;
}

export const RLHFFeedbackModal: React.FC<RLHFFeedbackModalProps> = ({
  detection,
  isOpen,
  onClose,
  onSubmitFeedback,
  streamLocation,
}) => {
  if (!isOpen || !detection) return null;

  const originalToken = detection.token;
  const originalDef = ISPA_VOCABULARY[originalToken];

  const [selectedToken, setSelectedToken] = useState<ISPATokenId>(originalToken);
  const [behavior, setBehavior] = useState<string>(detection.predictedBehavior);
  const [customBehavior, setCustomBehavior] = useState<string>('');
  const [rewardScore, setRewardScore] = useState<number>(0.8);
  const [callerIdentity, setCallerIdentity] = useState<string>(originalDef?.callerIdentity || 'Adult Male');
  const [environmentalNotes, setEnvironmentalNotes] = useState<string>(`Madras Crocodile Bank Trust (MCBT) hydrophone array; water temp 28.2°C; ${streamLocation}`);
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [geminiAnalysis, setGeminiAnalysis] = useState<any>(null);
  const [isLoadingGemini, setIsLoadingGemini] = useState<boolean>(false);

  useEffect(() => {
    setSelectedToken(detection.token);
    setBehavior(detection.predictedBehavior);
    setRewardScore(detection.confidence > 0.8 ? 1.0 : 0.6);
    setCallerIdentity(originalDef?.callerIdentity || 'Adult Male');
    setEnvironmentalNotes(`Madras Crocodile Bank Trust (MCBT) bioacoustic sensor array; ${streamLocation}`);
    setGeminiAnalysis(null);

    // Call server-side Gemini bioacoustic analysis
    const fetchGeminiInsight = async () => {
      setIsLoadingGemini(true);
      try {
        const res = await fetch('/api/gemini/analyze-acoustic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sequence: [detection.token],
            context: {
              streamLocation,
              callerIdentity: originalDef?.callerIdentity,
            },
            features: detection.acousticFeatures,
            candidateBehaviors: [detection.predictedBehavior, originalDef?.behavioralContext],
          }),
        });
        const data = await res.json();
        if (data.analysis) {
          setGeminiAnalysis(data.analysis);
        }
      } catch (err) {
        console.warn('Gemini analysis failed or offline:', err);
      } finally {
        setIsLoadingGemini(false);
      }
    };

    fetchGeminiInsight();
  }, [detection]);

  const allTokens = Object.keys(ISPA_VOCABULARY) as ISPATokenId[];

  const handlePlaySound = (token: ISPATokenId) => {
    bioacousticSynth.playToken(token);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBehavior = customBehavior.trim() ? customBehavior.trim() : behavior;
    const isModified = selectedToken !== originalToken || finalBehavior !== detection.predictedBehavior;

    onSubmitFeedback({
      detectionId: detection.id,
      detectionTimestamp: new Date().toISOString(),
      originalSequence: [originalToken],
      validatedSequence: [selectedToken],
      originalBehavior: detection.predictedBehavior,
      correctedBehavior: finalBehavior,
      rewardScore: Number(rewardScore.toFixed(2)),
      reviewStatus: isModified ? 'MODIFIED' : rewardScore >= 0 ? 'APPROVED' : 'REJECTED',
      callerIdentityConfirmed: callerIdentity,
      environmentalNotes,
      feedbackNotes: reviewerNotes,
      confidenceDelta: Number((rewardScore - detection.confidence).toFixed(2)),
      reviewedBy: 'Dr. Bheemaiah Anil Kumar Lab (Sparrow Reviewer)',
    });

    onClose();
  };

  const selectedDef = ISPA_VOCABULARY[selectedToken];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Human-in-the-Loop (RLHF) Feedback Terminal
              </h3>
              <p className="text-xs text-slate-400">
                Validate MegaDetector Acoustic conversion &amp; assign training reward
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Top Comparison: Machine Output vs Human Ground Truth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: MegaDetector Model Prediction */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
                <span>Model Candidate Output</span>
                <span className="text-emerald-400 font-bold">{Math.round(detection.confidence * 100)}% Conf</span>
              </div>

              <div className="flex items-center gap-3 my-2">
                <span
                  className="px-2.5 py-1 rounded font-mono font-extrabold text-sm text-white"
                  style={{ backgroundColor: originalDef?.color || '#059669' }}
                >
                  {originalToken}
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-white">{originalDef?.name}</h4>
                  <span className="text-xs text-slate-400">{originalDef?.soundDescription}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handlePlaySound(originalToken)}
                  className="ml-auto p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400"
                  title="Play original acoustic token"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-300 mt-2 bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">PREDICTED BEHAVIOR:</span>
                <strong>{detection.predictedBehavior}</strong>
              </div>
            </div>

            {/* Right: Human Ground Truth Token Selection */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[10px] font-mono uppercase text-emerald-400 mb-1 flex items-center justify-between">
                <span>Validated Ground Truth Token</span>
                <span>Select from 13 ISPA</span>
              </div>

              <div className="flex items-center gap-3 my-2">
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value as ISPATokenId)}
                  className="bg-slate-900 border border-emerald-500/60 rounded px-2.5 py-1 text-sm font-mono font-bold text-emerald-300 focus:ring-1 focus:ring-emerald-500"
                >
                  {allTokens.map((t) => (
                    <option key={t} value={t}>
                      {t} &mdash; {ISPA_VOCABULARY[t].name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handlePlaySound(selectedToken)}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400"
                  title="Play selected ground truth sound"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-300 mt-2 bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">STANDARD ACOUSTIC DESCRIPTOR:</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {selectedDef?.acousticDescriptor.freqRange} &bull; {selectedDef?.acousticDescriptor.durationMs}ms
                </span>
              </div>
            </div>
          </div>

          {/* Quick Token Selector Chips */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">
              Quick Change ISPA Token:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allTokens.map((t) => {
                const isCur = selectedToken === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedToken(t)}
                    className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                      isCur
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 scale-105'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Behavioral Classification Tagging */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Validated Behavioral Label:
              </label>
              <select
                value={behavior}
                onChange={(e) => setBehavior(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Long-distance breeding advertisement">Long-distance breeding advertisement</option>
                <option value="Precedes display; infrasonic vibration">Precedes display; infrasonic vibration</option>
                <option value="Adult male advertisement; individually distinctive">Adult male advertisement; individually distinctive</option>
                <option value="Male display using the ghara">Male display using the ghara</option>
                <option value="Hatching synchronization, maternal contact">Hatching synchronization, maternal contact</option>
                <option value="Juvenile group cohesion">Juvenile group cohesion</option>
                <option value="Agonistic/display behavior">Agonistic/display behavior</option>
                <option value="Defensive warning / territorial stand">Defensive warning / territorial stand</option>
                <option value="Capture or predator threat">Capture or predator threat</option>
                <option value="Courtship/social interaction">Courtship/social interaction</option>
                <option value="Adult disturbance">Adult disturbance</option>
                <option value="Other (Specify below)">Other (Specify below)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Confirmed Caller Identity:
              </label>
              <select
                value={callerIdentity}
                onChange={(e) => setCallerIdentity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Alpha Adult Male with Ghara">Alpha Adult Male with Ghara</option>
                <option value="Mature Adult Male (>4.5m)">Mature Adult Male (&gt;4.5m)</option>
                <option value="Adult Female on Nesting Sandbank">Adult Female on Nesting Sandbank</option>
                <option value="Juvenile Pod (1–3 years)">Juvenile Pod (1–3 years)</option>
                <option value="Hatchling / Neonate (<30cm)">Hatchling / Neonate (&lt;30cm)</option>
                <option value="Subadult in territorial buffer">Subadult in territorial buffer</option>
              </select>
            </div>
          </div>

          {/* Reward Score Slider (RLHF Critical Component) */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>RLHF Reward Score for Sparrow Model Training:</span>
                <span className="font-mono text-emerald-400 font-extrabold text-sm">
                  {rewardScore > 0 ? `+${rewardScore.toFixed(2)}` : rewardScore.toFixed(2)}
                </span>
              </label>
              <div className="text-[11px] text-slate-400">
                {rewardScore >= 0.8
                  ? 'Strong Positive Feedback (Gold Ground Truth)'
                  : rewardScore >= 0.3
                  ? 'Acceptable / Partial Match'
                  : rewardScore >= -0.3
                  ? 'Neutral / Ambiguous Audio'
                  : 'Penalty / Severe Misclassification'}
              </div>
            </div>

            <input
              type="range"
              min="-1.0"
              max="1.0"
              step="0.05"
              value={rewardScore}
              onChange={(e) => setRewardScore(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span className="text-rose-400">-1.0 (Severe Error)</span>
              <span>-0.5</span>
              <span>0.0 (Neutral)</span>
              <span>+0.5</span>
              <span className="text-emerald-400">+1.0 (Perfect Prediction)</span>
            </div>
          </div>

          {/* Gemini Bioacoustic Copilot Reasoning */}
          {isLoadingGemini ? (
            <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl flex items-center gap-2 text-xs text-indigo-300">
              <span className="w-3 h-3 rounded-full bg-indigo-400 animate-ping"></span>
              <span>Querying Gemini 3.8 Flash Bioacoustic Knowledge Base...</span>
            </div>
          ) : geminiAnalysis ? (
            <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/60 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Gemini Bioacoustic Analysis (Dr. Anil Kumar ISPA Reference):</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {geminiAnalysis.acousticVerification}
              </p>
              {geminiAnalysis.rlhfSuggestion && (
                <div className="text-[11px] text-amber-300 bg-amber-950/40 px-2 py-1 rounded border border-amber-900/50">
                  <strong>RLHF Guidance:</strong> {geminiAnalysis.rlhfSuggestion}
                </div>
              )}
            </div>
          ) : null}

          {/* Reviewer Freeform Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">
              Bioacoustic Reviewer Notes (Sparrow Dataset Record):
            </label>
            <input
              type="text"
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="e.g., Visually verified narial vibration on camera; underwater hydrophone pop preceded infrasound by 1.2s"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-lg shadow-emerald-950"
            >
              <Check className="w-4 h-4" />
              <span>Submit RLHF Validation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

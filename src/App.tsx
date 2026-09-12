import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SparrowVideoMonitor } from './components/SparrowVideoMonitor';
import { ISPASentenceComposer } from './components/ISPASentenceComposer';
import { MegaDetectorAcousticPanel } from './components/MegaDetectorAcousticPanel';
import { RLHFFeedbackModal } from './components/RLHFFeedbackModal';
import { RLHFFeedbackQueue } from './components/RLHFFeedbackQueue';
import { ISPADictionaryModal } from './components/ISPADictionaryModal';
import { ONNXStudioModal, ONNXStudioTab } from './components/ONNXStudio/ONNXStudioModal';
import {
  ISPATokenId,
  SparrowStreamChannel,
  MegaDetectorDetection,
  RLHFFeedbackItem,
  BioacousticMetrics,
  GharialDatasetItem,
  VisionBoundingBox,
} from './types';
import { SPARROW_STREAM_CHANNELS, ISPA_VOCABULARY } from './data/ispaData';
import { INITIAL_GHARIAL_DATASETS } from './data/gharialDatasets';
import { bioacousticSynth } from './utils/audioSynth';

export default function App() {
  // Streams & Channels
  const [channels] = useState<SparrowStreamChannel[]>(SPARROW_STREAM_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<SparrowStreamChannel>(SPARROW_STREAM_CHANNELS[0]);

  // Audio State
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Active Sentence Sequence (Default to Dr. Anil Kumar's Adult Display: POP → SAV → BR)
  const [sentence, setSentence] = useState<ISPATokenId[]>(['POP', 'SAV', 'BR']);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingTokenIndex, setPlayingTokenIndex] = useState<number | null>(null);
  const [activeTokenOnStream, setActiveTokenOnStream] = useState<ISPATokenId | null>(null);
  const playbackCancelRef = useRef<(() => void) | null>(null);

  // MegaDetector Detections
  const [detections, setDetections] = useState<MegaDetectorDetection[]>([
    {
      id: 'det-mcbt-001',
      streamId: 'mcbt-gharial-lagoon',
      timestamp: 14.2,
      token: 'POP',
      predictedBehavior: 'Adult male advertisement; individually distinctive',
      confidence: 0.96,
      acousticFeatures: {
        peakFreqHz: 260,
        bandwidthHz: 1850,
        durationMs: 65,
        snrDb: 24.2,
        infrasoundEnergy: 0.28,
        gharaResonanceIndex: 0.88,
      },
      flaggedForReview: false,
      modelConfidenceCategory: 'High',
    },
    {
      id: 'det-mcbt-002',
      streamId: 'mcbt-gharial-lagoon',
      timestamp: 15.6,
      token: 'SAV',
      predictedBehavior: 'Precedes display; infrasonic torso vibration',
      confidence: 0.88,
      acousticFeatures: {
        peakFreqHz: 22,
        bandwidthHz: 35,
        durationMs: 1200,
        snrDb: 18.5,
        infrasoundEnergy: 0.94,
        gharaResonanceIndex: 0.42,
      },
      flaggedForReview: false,
      modelConfidenceCategory: 'High',
    },
    {
      id: 'det-mcbt-003',
      streamId: 'mcbt-gharial-lagoon',
      timestamp: 17.2,
      token: 'BR',
      predictedBehavior: 'Long-distance breeding advertisement',
      confidence: 0.91,
      acousticFeatures: {
        peakFreqHz: 210,
        bandwidthHz: 1600,
        durationMs: 1850,
        snrDb: 22.0,
        infrasoundEnergy: 0.35,
        gharaResonanceIndex: 0.76,
      },
      flaggedForReview: false,
      modelConfidenceCategory: 'High',
    },
  ]);
  const [selectedDetection, setSelectedDetection] = useState<MegaDetectorDetection | null>(null);
  const [isProcessingMegaDetector, setIsProcessingMegaDetector] = useState<boolean>(false);

  // Gharial Multimodal Datasets Corpus
  const [datasets, setDatasets] = useState<GharialDatasetItem[]>(INITIAL_GHARIAL_DATASETS);

  // RLHF Feedback History
  const [feedbackHistory, setFeedbackHistory] = useState<RLHFFeedbackItem[]>([
    {
      id: 'rlhf-001',
      detectionId: 'det-mcbt-001',
      detectionTimestamp: '2026-09-11T03:45:00.000Z',
      originalSequence: ['POP'],
      validatedSequence: ['POP'],
      originalBehavior: 'Adult male advertisement; individually distinctive',
      correctedBehavior: 'Adult male advertisement; individually distinctive',
      rewardScore: 1.0,
      reviewStatus: 'APPROVED',
      callerIdentityConfirmed: 'Alpha Adult Male with Ghara',
      environmentalNotes: 'Madras Crocodile Bank Trust (MCBT) lagoon hydrophone; sharp acoustic impulse cavitation',
      feedbackNotes: 'Confirmed individually distinctive hydrophone signature',
      confidenceDelta: 0.04,
      reviewedBy: 'Dr. Bheemaiah Anil Kumar Lab',
      reviewedAt: '2026-09-11T03:46:12.000Z',
    },
    {
      id: 'rlhf-002',
      detectionId: 'det-mcbt-002',
      detectionTimestamp: '2026-09-11T03:45:02.000Z',
      originalSequence: ['SAV'],
      validatedSequence: ['SAV'],
      originalBehavior: 'Precedes display; infrasonic torso vibration',
      correctedBehavior: 'Precedes display; infrasonic torso vibration',
      rewardScore: 1.0,
      reviewStatus: 'APPROVED',
      callerIdentityConfirmed: 'Alpha Adult Male with Ghara',
      environmentalNotes: 'Water dance ripples observed bouncing off scutes at MCBT sandbank',
      feedbackNotes: 'Infrasonic energy confirmed <20Hz',
      confidenceDelta: 0.12,
      reviewedBy: 'Dr. Bheemaiah Anil Kumar Lab',
      reviewedAt: '2026-09-11T03:47:05.000Z',
    },
  ]);

  // Modals
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [isDictionaryModalOpen, setIsDictionaryModalOpen] = useState<boolean>(false);
  const [isOnnxStudioOpen, setIsOnnxStudioOpen] = useState<boolean>(false);
  const [onnxStudioTab, setOnnxStudioTab] = useState<ONNXStudioTab>('MODELS');

  // Backend Gemini status
  const [geminiActive, setGeminiActive] = useState<boolean>(false);

  // Check health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.geminiConfigured) setGeminiActive(true);
      })
      .catch((err) => console.log('Backend health check:', err));
  }, []);

  // Compute RLHF Metrics
  const totalReviews = feedbackHistory.length;
  const approvedCount = feedbackHistory.filter((f) => f.reviewStatus === 'APPROVED').length;
  const acceptanceRate = totalReviews > 0 ? (approvedCount / totalReviews) * 100 : 85.0;
  const avgReward =
    totalReviews > 0
      ? feedbackHistory.reduce((acc, curr) => acc + curr.rewardScore, 0) / totalReviews
      : 0.85;

  const metrics: BioacousticMetrics = {
    totalDetections: detections.length,
    humanReviewedCount: totalReviews,
    acceptanceRate,
    averageRewardScore: avgReward,
    activeQueueCount: detections.filter((d) => d.confidence < 0.85).length,
  };

  // Playback handlers
  const handlePlaySentence = () => {
    if (sentence.length === 0) return;
    setIsPlaying(true);

    const { cancel } = bioacousticSynth.playSequence(
      sentence,
      300,
      (idx, tok) => {
        setPlayingTokenIndex(idx);
        setActiveTokenOnStream(tok);
      },
      () => {
        setIsPlaying(false);
        setPlayingTokenIndex(null);
        setActiveTokenOnStream(null);
      }
    );

    playbackCancelRef.current = cancel;
  };

  const handleStopSentence = () => {
    if (playbackCancelRef.current) {
      playbackCancelRef.current();
      playbackCancelRef.current = null;
    }
    setIsPlaying(false);
    setPlayingTokenIndex(null);
    setActiveTokenOnStream(null);
  };

  // Transmit to Sparrow & Run MegaDetector Acoustic
  const handleTransmitToSparrow = (tokensToTransmit: ISPATokenId[]) => {
    if (tokensToTransmit.length === 0) return;

    handlePlaySentence();
    setIsProcessingMegaDetector(true);

    // Simulate MegaDetector Acoustic segmentation and automatic behavioral tagging
    setTimeout(() => {
      const newDetections: MegaDetectorDetection[] = tokensToTransmit.map((tok, i) => {
        const def = ISPA_VOCABULARY[tok];
        const isLowConf = Math.random() < 0.2;
        const conf = isLowConf ? 0.72 + Math.random() * 0.1 : 0.88 + Math.random() * 0.1;

        return {
          id: `det-${Date.now()}-${i}`,
          streamId: selectedChannel.id,
          timestamp: Number((Math.random() * 10 + 20).toFixed(1)),
          token: tok,
          predictedBehavior: def?.behavioralContext || 'Acoustic communication',
          confidence: Number(conf.toFixed(2)),
          acousticFeatures: {
            peakFreqHz: def?.acousticDescriptor.dominantFreq || 400,
            bandwidthHz: 1200 + Math.floor(Math.random() * 600),
            durationMs: def?.acousticDescriptor.durationMs || 400,
            snrDb: Number((18 + Math.random() * 12).toFixed(1)),
            infrasoundEnergy: def?.acousticDescriptor.infrasonic ? 0.92 : 0.15,
            gharaResonanceIndex: tok === 'SN' || tok === 'POP' ? 0.85 : 0.25,
          },
          flaggedForReview: isLowConf,
          modelConfidenceCategory: conf >= 0.85 ? 'High' : 'Moderate',
        };
      });

      setDetections((prev) => [...newDetections, ...prev]);
      setIsProcessingMegaDetector(false);
      setSelectedDetection(newDetections[0]);
    }, tokensToTransmit.length * 600 + 400);
  };

  // Simulate single enclosure call
  const handleSimulateDetection = (token: ISPATokenId) => {
    bioacousticSynth.playToken(token);
    setActiveTokenOnStream(token);
    setTimeout(() => setActiveTokenOnStream(null), 1800);

    const def = ISPA_VOCABULARY[token];
    const newDet: MegaDetectorDetection = {
      id: `det-live-${Date.now()}`,
      streamId: selectedChannel.id,
      timestamp: Number((Math.random() * 15 + 30).toFixed(1)),
      token,
      predictedBehavior: def?.behavioralContext || 'MCBT bioacoustic activity',
      confidence: Number((0.85 + Math.random() * 0.13).toFixed(2)),
      acousticFeatures: {
        peakFreqHz: def?.acousticDescriptor.dominantFreq || 350,
        bandwidthHz: 1100,
        durationMs: def?.acousticDescriptor.durationMs || 500,
        snrDb: 22.4,
        infrasoundEnergy: def?.acousticDescriptor.infrasonic ? 0.95 : 0.12,
        gharaResonanceIndex: token === 'SN' ? 0.89 : 0.3,
      },
      flaggedForReview: false,
      modelConfidenceCategory: 'High',
    };

    setDetections((prev) => [newDet, ...prev]);
    setSelectedDetection(newDet);
  };

  // Save current camera snapshot & bounding boxes directly as a dataset record
  const handleSaveFrameToDataset = (frameData: {
    imageUrl: string;
    boundingBoxes: VisionBoundingBox[];
    token: ISPATokenId | null;
  }) => {
    const curToken = frameData.token || 'POP';
    const def = ISPA_VOCABULARY[curToken];

    const newRecord: GharialDatasetItem = {
      id: `gharial-ds-${Date.now().toString().slice(-4)}`,
      title: `Live Stream Capture: ${curToken} Event at ${selectedChannel.name}`,
      sourceStream: selectedChannel.id,
      location: selectedChannel.location,
      timestamp: new Date().toISOString(),
      ispaSequence: [curToken],
      behaviorDescription: def?.behavioralContext || 'Live synchronized visual-acoustic observation',
      hasGharaAdultMale: selectedChannel.maleGharaObserved,
      juvenileCount: 2,
      environmentalContext: {
        waterTempC: selectedChannel.waterTempC,
        flowVelocityMs: selectedChannel.flowVelocityMs,
        habitatType: 'MCBT Sandbank & River Channel',
        infrasoundPeakHz: curToken === 'SAV' ? 18.2 : 240,
      },
      imageSnapshotUrl: frameData.imageUrl,
      audioFeatures: {
        peakFrequencyHz: def?.acousticDescriptor.dominantFreq || 320,
        bandwidthHz: 1400,
        durationMs: def?.acousticDescriptor.durationMs || 600,
        snrDb: 24.5,
      },
      boundingBoxes: frameData.boundingBoxes,
      annotator: 'Sparrow Stream Auto-Snapshot',
      rlhfStatus: 'VERIFIED',
      tags: ['live_stream', 'camera_snapshot', curToken.toLowerCase(), 'mcbt'],
    };

    setDatasets((prev) => [newRecord, ...prev]);
  };

  // Quick feedback handlers (Inline Approve/Reject)
  const handleQuickFeedback = (detection: MegaDetectorDetection, accept: boolean) => {
    const newFeedback: RLHFFeedbackItem = {
      id: `rlhf-${Date.now()}`,
      detectionId: detection.id,
      detectionTimestamp: new Date().toISOString(),
      originalSequence: [detection.token],
      validatedSequence: [detection.token],
      originalBehavior: detection.predictedBehavior,
      correctedBehavior: detection.predictedBehavior,
      rewardScore: accept ? 1.0 : -1.0,
      reviewStatus: accept ? 'APPROVED' : 'REJECTED',
      callerIdentityConfirmed: ISPA_VOCABULARY[detection.token]?.callerIdentity || 'Adult Gharial',
      environmentalNotes: `${selectedChannel.name} hydrophone feed; temp ${selectedChannel.waterTempC}°C`,
      feedbackNotes: accept ? 'Quick 1-click approval' : 'Quick rejection of model conversion',
      confidenceDelta: accept ? 1.0 - detection.confidence : -detection.confidence,
      reviewedBy: 'Dr. Bheemaiah Anil Kumar Lab (Sparrow Reviewer)',
      reviewedAt: new Date().toISOString(),
    };

    setFeedbackHistory((prev) => [newFeedback, ...prev]);
  };

  // Detailed Modal Submission
  const handleDetailedFeedbackSubmit = (feedbackData: Omit<RLHFFeedbackItem, 'id' | 'reviewedAt'>) => {
    const newItem: RLHFFeedbackItem = {
      ...feedbackData,
      id: `rlhf-${Date.now()}`,
      reviewedAt: new Date().toISOString(),
    };
    setFeedbackHistory((prev) => [newItem, ...prev]);
  };

  // Export Sparrow Dataset JSON
  const handleExportSparrowManifest = async () => {
    try {
      const res = await fetch('/api/rlhf/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackItems: feedbackHistory,
          streamId: selectedChannel.id,
        }),
      });
      const data = await res.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sparrow-gharial-ispa-rlhf-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Protocol Header */}
      <Header
        channels={channels}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
        isAudioMuted={isAudioMuted}
        onToggleMute={() => {
          setIsAudioMuted(!isAudioMuted);
          const ctx = bioacousticSynth.getAudioContext();
          if (ctx) {
            if (!isAudioMuted) {
              ctx.suspend();
            } else {
              ctx.resume();
            }
          }
        }}
        onOpenDictionary={() => setIsDictionaryModalOpen(true)}
        onOpenONNXStudio={(tab) => {
          setOnnxStudioTab(tab || 'MODELS');
          setIsOnnxStudioOpen(true);
        }}
        datasetCount={datasets.length}
        geminiActive={geminiActive}
      />

      {/* Main Workbench Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-5">
        {/* Top Split: Live Sparrow Stream & Hydrophone Video on Left, MegaDetector Acoustic Conversion Feed on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Sparrow Video & Hydrophone Monitor (7 cols) */}
          <div className="lg:col-span-7">
            <SparrowVideoMonitor
              channel={selectedChannel}
              activeToken={activeTokenOnStream}
              onSimulateDetection={handleSimulateDetection}
              onSaveFrameToDataset={handleSaveFrameToDataset}
              onOpenONNXStudio={() => {
                setOnnxStudioTab('MODELS');
                setIsOnnxStudioOpen(true);
              }}
              onOpenXiaoFirmware={() => {
                setOnnxStudioTab('XIAO_FIRMWARE');
                setIsOnnxStudioOpen(true);
              }}
            />
          </div>

          {/* Right Column: MegaDetector Acoustic Automatic Conversion & Tagging (5 cols) */}
          <div className="lg:col-span-5">
            <MegaDetectorAcousticPanel
              detections={detections}
              selectedDetection={selectedDetection}
              onSelectDetection={setSelectedDetection}
              onQuickFeedback={handleQuickFeedback}
              onOpenDetailedReview={(det) => {
                setSelectedDetection(det);
                setIsFeedbackModalOpen(true);
              }}
              isProcessing={isProcessingMegaDetector}
            />
          </div>
        </div>

        {/* Center: ISPA Sentence Composer & Microsoft Sparrow Playback Sequencer */}
        <ISPASentenceComposer
          sentence={sentence}
          onUpdateSentence={setSentence}
          onTransmitToSparrow={handleTransmitToSparrow}
          isPlaying={isPlaying}
          playingTokenIndex={playingTokenIndex}
          onPlaySentence={handlePlaySentence}
          onStopSentence={handleStopSentence}
        />

        {/* Bottom: RLHF Feedback Queue & Dataset Registry */}
        <RLHFFeedbackQueue
          feedbackHistory={feedbackHistory}
          metrics={metrics}
          onClearHistory={() => setFeedbackHistory([])}
          onExportSparrowManifest={handleExportSparrowManifest}
        />
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <p>
          Gharial Interspecies Phonetic Alphabet (ISPA) &bull; Standardized Annotation Scheme Proposal by Dr. Bheemaiah Anil Kumar &bull; Microsoft Sparrow &amp; MegaDetector Acoustic Bioacoustic RLHF &bull; XIAO ESP32S3 Meshmatics
        </p>
      </footer>

      {/* Modals */}
      <RLHFFeedbackModal
        detection={selectedDetection}
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmitFeedback={handleDetailedFeedbackSubmit}
        streamLocation={selectedChannel.location}
      />

      <ISPADictionaryModal
        isOpen={isDictionaryModalOpen}
        onClose={() => setIsDictionaryModalOpen(false)}
        onInsertToSentence={(tok) => {
          setSentence((prev) => [...prev, tok]);
        }}
      />

      {/* ONNX Studio Modal */}
      <ONNXStudioModal
        isOpen={isOnnxStudioOpen}
        onClose={() => setIsOnnxStudioOpen(false)}
        initialTab={onnxStudioTab}
        datasets={datasets}
        onAddDataset={(newItem) => setDatasets((prev) => [newItem, ...prev])}
        onDeleteDataset={(id) => setDatasets((prev) => prev.filter((d) => d.id !== id))}
      />
    </div>
  );
}

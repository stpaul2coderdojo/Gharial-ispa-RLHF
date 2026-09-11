export type ISPATokenId =
  | 'HC'
  | 'CC'
  | 'DC'
  | 'HS'
  | 'JC'
  | 'BB'
  | 'GW'
  | 'GR'
  | 'RR'
  | 'SN'
  | 'SAV'
  | 'POP'
  | 'BR';

export interface ISPADefinition {
  token: ISPATokenId;
  name: string;
  soundDescription: string;
  behavioralContext: string;
  confidence: 'High' | 'Medium' | 'Medium–High' | 'Very High';
  callerIdentity: string;
  acousticDescriptor: {
    freqRange: string;
    dominantFreq: number; // Hz
    durationMs: number;
    impulsive: boolean;
    infrasonic: boolean;
    waveformType: 'chirp' | 'hiss' | 'impulse' | 'rumble' | 'complex' | 'bubble';
  };
  environmentalContext: string;
  color: string;
}

export interface SentenceToken {
  id: string;
  token: ISPATokenId;
  pauseAfterMs: number;
  pitchOffset?: number; // -1 to +1
}

export interface SparrowStreamChannel {
  id: string;
  name: string;
  location: string;
  subLocation: string;
  habitatType: string;
  hydrophoneStatus: 'ACTIVE' | 'CALIBRATING' | 'STANDBY';
  videoStatus: 'STREAMING' | 'BUFFERING' | 'OFFLINE';
  waterTempC: number;
  flowVelocityMs: number;
  activeGharialsCount: number;
  maleGharaObserved: boolean;
}

export interface MegaDetectorDetection {
  id: string;
  streamId: string;
  timestamp: number; // seconds
  token: ISPATokenId;
  predictedBehavior: string;
  confidence: number; // 0 to 1
  acousticFeatures: {
    peakFreqHz: number;
    bandwidthHz: number;
    durationMs: number;
    snrDb: number;
    infrasoundEnergy: number; // 0 to 1
    gharaResonanceIndex?: number;
  };
  spectrogramSlice?: number[];
  flaggedForReview: boolean;
  modelConfidenceCategory: 'High' | 'Moderate' | 'Low';
}

export interface RLHFFeedbackItem {
  id: string;
  detectionId: string;
  detectionTimestamp: string;
  originalSequence: ISPATokenId[];
  validatedSequence: ISPATokenId[];
  originalBehavior: string;
  correctedBehavior: string;
  rewardScore: number; // -1.0 to 1.0
  reviewStatus: 'APPROVED' | 'MODIFIED' | 'REJECTED';
  callerIdentityConfirmed: string;
  environmentalNotes: string;
  feedbackNotes: string;
  confidenceDelta: number;
  reviewedBy: string;
  reviewedAt: string;
}

export interface BioacousticMetrics {
  totalDetections: number;
  humanReviewedCount: number;
  acceptanceRate: number;
  averageRewardScore: number;
  activeQueueCount: number;
  topMisclassifiedPair?: [ISPATokenId, ISPATokenId];
}

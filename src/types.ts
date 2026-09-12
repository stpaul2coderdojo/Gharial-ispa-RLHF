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
  coordinates: string;
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

// Vision & ONNX Model Types
export type ONNXCategory =
  | 'MegaDetector'
  | 'Microsoft Sparrow'
  | 'PyTorch Wildlife';

export interface ONNXModelInfo {
  id: string;
  name: string;
  filename: string;
  category: ONNXCategory;
  version: string;
  description: string;
  architecture: string;
  backbone: string;
  inputShape: string;
  outputShape: string;
  opset: number;
  parameters: string;
  quantization: 'FP32' | 'FP16' | 'INT8' | 'ONNX-TensorRT' | 'ESP-NN INT8';
  latencyEdgeMs: number; // Latency on Edge devices (e.g. XIAO ESP32S3 / Jetson)
  latencyCloudMs: number;
  supportedHardware: string[];
  tasks: ('Object Detection' | 'Bioacoustic Classification' | 'Keypoint Estimation' | 'Multimodal Fusion' | 'Infrasound Detection')[];
  classes: string[];
  downloadUrl: string;
  paperOrRepoUrl: string;
}

export interface VisionBoundingBox {
  id: string;
  label: string;
  confidence: number;
  x: number; // 0..1 normalized
  y: number; // 0..1 normalized
  width: number; // 0..1 normalized
  height: number; // 0..1 normalized
  color: string;
  category: 'animal' | 'ghara' | 'juvenile_creche' | 'snout' | 'scutes';
  keypoints?: {
    name: string;
    x: number;
    y: number;
    score: number;
  }[];
}

// XIAO ESP32S3 Sense Meshmatics Firmware Configuration
export interface XiaoSenseFirmwareConfig {
  nodeId: string;
  nodeName: string;
  location: string;
  meshChannel: number;
  meshGroupKey: string;
  cameraResolution: 'QVGA' | 'VGA' | 'SVGA' | 'HD';
  cameraFps: number;
  pdmMicrophoneSampleRate: 16000 | 44100 | 48000;
  pdmGainDb: number;
  infrasoundHighPassFilter: boolean;
  wakeOnSoundThresholdDb: number;
  sparrowGatewayIp: string;
  sparrowGatewayPort: number;
  mqttTelemetryTopic: string;
  sdCardLoggingEnabled: boolean;
  meshmaticsRole: 'ROOT_GATEWAY' | 'REPEATER_NODE' | 'LEAF_SENSOR';
  batteryOptimizationMode: 'CONTINUOUS' | 'LOW_POWER_DUTY' | 'SOLAR_HARVEST';
}

// Gharial Dataset Records
export interface GharialDatasetItem {
  id: string;
  title: string;
  sourceStream: string;
  location: string;
  timestamp: string;
  ispaSequence: ISPATokenId[];
  behaviorDescription: string;
  hasGharaAdultMale: boolean;
  juvenileCount: number;
  environmentalContext: {
    waterTempC: number;
    flowVelocityMs: number;
    habitatType: string;
    infrasoundPeakHz: number;
  };
  imageSnapshotUrl?: string;
  audioFeatures: {
    peakFrequencyHz: number;
    bandwidthHz: number;
    durationMs: number;
    snrDb: number;
  };
  boundingBoxes: VisionBoundingBox[];
  annotator: string;
  rlhfStatus: 'VERIFIED' | 'SYNTHETIC' | 'PENDING';
  tags: string[];
}

export type DatasetExportFormat =
  | 'COCO_VISION_JSON'
  | 'YOLO_TXT_ZIP'
  | 'HUGGINGFACE_DATASETS_JSONL'
  | 'SPARROW_RLHF_MANIFEST_JSON'
  | 'PYTORCH_AUDIO_CSV'
  | 'FULL_BUNDLE_ZIP';


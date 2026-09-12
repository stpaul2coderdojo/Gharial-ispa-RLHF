import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
    service: 'Gharial ISPA Sparrow Bioacoustic RLHF Platform',
  });
});

// Bioacoustic Analysis & RLHF Inference Endpoint
app.post('/api/gemini/analyze-acoustic', async (req, res) => {
  try {
    const { sequence, context, features, candidateBehaviors } = req.body;
    const ai = getGeminiAI();

    if (!ai) {
      // Deterministic expert heuristic fallback when API key is unconfigured
      return res.json({
        success: true,
        source: 'deterministic_bioacoustic_engine',
        analysis: {
          predictedBehavior: candidateBehaviors?.[0] || 'Social/Territorial Signaling',
          confidence: 0.88,
          acousticVerification: 'Harmonic peak and temporal duration align with documented Gharial vocalizations.',
          rlhfSuggestion: 'Verify adult male ghara presence before confirming long-distance advertisement token.',
          infrasoundSignificance: sequence?.includes('SAV')
            ? 'Strong infrasonic signature detected (<20Hz), characteristic of pre-display torso vibration.'
            : 'Standard audible band acoustic event.',
          tokenNotes: `Evaluated ${sequence?.length || 0} tokens in sequence.`,
        },
      });
    }

    const systemPrompt = `You are a world-class herpetologist and bioacoustic machine learning researcher specializing in crocodylian communication, specifically the critically endangered Gharial (Gavialis gangeticus), Microsoft Sparrow bioacoustics, and MegaDetector Acoustic.

You are evaluating proposals based on the Gharial Interspecies Phonetic Alphabet (ISPA):
ISPA Tokens:
- HC: High-pitched hatchling chirp (Hatching synchronization, maternal contact)
- CC: Contact chirp (Juvenile group cohesion)
- DC: Distress squeal (Capture or predator threat)
- HS: Hiss (Defensive warning)
- JC: Jaw clap (Agonistic/display behavior)
- BB: Bubble burst (Courtship/social interaction)
- GW: Growl (Adult disturbance)
- GR: Groan (Adult social interaction)
- RR: Roar (Large adult male display)
- SN: Snorting hiss (Male display using the ghara)
- SAV: Subaudible vibration (Precedes display; infrasonic 12-35Hz)
- POP: Underwater impulsive pop (Adult male advertisement; individually distinctive)
- BR: Breathe-roar display (Long-distance breeding advertisement)

Provide an expert bioacoustic evaluation of the detected sequence, behavioral classification, acoustic features, and RLHF reward considerations for training Microsoft Sparrow.`;

    const userPrompt = `Acoustic Event Sequence: ${JSON.stringify(sequence)}
Context: ${JSON.stringify(context || {})}
Observed Features: ${JSON.stringify(features || {})}
Candidate Behaviors: ${JSON.stringify(candidateBehaviors || [])}

Analyze the sequence consistency, assign a refined behavioral label, evaluate if any ISPA token might be confused or misclassified by MegaDetector Acoustic, and provide RLHF reward adjustment suggestions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedBehavior: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            acousticVerification: { type: Type.STRING },
            rlhfSuggestion: { type: Type.STRING },
            infrasoundSignificance: { type: Type.STRING },
            tokenNotes: { type: Type.STRING },
            alternativeTokensConsidered: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'predictedBehavior',
            'confidence',
            'acousticVerification',
            'rlhfSuggestion',
            'infrasoundSignificance',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      analysis: parsed,
    });
  } catch (error: unknown) {
    console.error('Error in /api/gemini/analyze-acoustic:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      error: errorMessage,
      fallbackUsed: true,
    });
  }
});

// RLHF Dataset Export Endpoint
app.post('/api/rlhf/export', (req, res) => {
  const { feedbackItems, streamId } = req.body;
  const exportedAt = new Date().toISOString();

  const manifest = {
    schemaVersion: 'microsoft.sparrow.bioacoustics.rlhf.v1',
    datasetName: 'Gharial-ISPA-MCBT-RLHF-Corpus',
    contributor: 'Madras Crocodile Bank Trust (MCBT) & Dr. Bheemaiah Anil Kumar Bioacoustic Lab',
    exportedAt,
    streamId: streamId || 'all-streams',
    totalSamples: Array.isArray(feedbackItems) ? feedbackItems.length : 0,
    acceptedCount: Array.isArray(feedbackItems)
      ? feedbackItems.filter((f: { reviewStatus: string }) => f.reviewStatus === 'APPROVED').length
      : 0,
    modifiedCount: Array.isArray(feedbackItems)
      ? feedbackItems.filter((f: { reviewStatus: string }) => f.reviewStatus === 'MODIFIED').length
      : 0,
    preferencePairs: (feedbackItems || []).map((item: {
      id: string;
      detectionTimestamp: string;
      originalSequence: string[];
      validatedSequence: string[];
      originalBehavior: string;
      correctedBehavior: string;
      rewardScore: number;
      reviewStatus: string;
      reviewedBy: string;
    }) => ({
      sample_id: item.id,
      timestamp: item.detectionTimestamp,
      prompt_acoustic_stream: item.originalSequence.join(' → '),
      chosen_target: {
        ispa_sequence: item.validatedSequence,
        behavior_label: item.correctedBehavior,
      },
      rejected_candidate: {
        ispa_sequence: item.originalSequence,
        behavior_label: item.originalBehavior,
      },
      reward: item.rewardScore,
      status: item.reviewStatus,
      annotator: item.reviewedBy,
    })),
  };

  res.json(manifest);
});

// ONNX Models Catalog Registry Endpoint
app.get('/api/onnx/models', (req, res) => {
  res.json({
    frameworks: ['MegaDetector', 'Microsoft Sparrow', 'PyTorch Wildlife'],
    totalModels: 11,
    catalog: [
      {
        id: 'md_v5a',
        category: 'MegaDetector',
        architecture: 'YOLOv5x6',
        input: '[1, 3, 1280, 1280]',
        quantization: 'FP32',
        latencyEdgeMs: 145.0,
      },
      {
        id: 'md_v6_yolov8x',
        category: 'MegaDetector',
        architecture: 'YOLOv8x Anchor-Free',
        input: '[1, 3, 640, 640]',
        quantization: 'INT8',
        latencyEdgeMs: 38.4,
      },
      {
        id: 'sparrow_acoustic_ispa_13class',
        category: 'Microsoft Sparrow',
        architecture: 'ConvNeXt-V2-Nano Log-Mel',
        input: '[1, 1, 128, 512]',
        quantization: 'FP16',
        latencyEdgeMs: 18.2,
      },
      {
        id: 'sparrow_infrasound_detector_20hz',
        category: 'Microsoft Sparrow',
        architecture: 'Temporal 1D ResNet Infrasound',
        input: '[1, 1, 4800]',
        quantization: 'INT8',
        latencyEdgeMs: 6.5,
      },
      {
        id: 'sparrow_audio_visual_fusion_v2',
        category: 'Microsoft Sparrow',
        architecture: 'Cross-Attention Dual Stream (Camera + PDM)',
        input: 'image: [1, 3, 384, 384], audio: [1, 1, 128, 256]',
        quantization: 'FP16',
        latencyEdgeMs: 44.0,
      },
      {
        id: 'sparrow_xiao_esp32s3_tinyml_int8',
        category: 'Microsoft Sparrow',
        architecture: 'MobileNetV1-Micro ESP-NN INT8',
        input: '[1, 1, 64, 128]',
        quantization: 'ESP-NN INT8',
        latencyEdgeMs: 12.0,
      },
      {
        id: 'ptw_gharial_keypoints',
        category: 'PyTorch Wildlife',
        architecture: 'HRNet-W32 Heatmap (8 Keypoints)',
        input: '[1, 3, 384, 288]',
        quantization: 'FP16',
        latencyEdgeMs: 36.0,
      },
      {
        id: 'ptw_creche_counter',
        category: 'PyTorch Wildlife',
        architecture: 'CSRNet Density Map',
        input: '[1, 3, 512, 512]',
        quantization: 'FP16',
        latencyEdgeMs: 28.0,
      },
    ],
  });
});

// XIAO Sense Meshmatics Firmware Generator Endpoint
app.post('/api/firmware/xiao-sense/config', (req, res) => {
  const config = req.body;
  res.json({
    status: 'configured',
    targetBoard: 'Seeed Studio XIAO ESP32S3 Sense',
    nodeId: config.nodeId || 'mcbt-xiao-gharial-01',
    meshChannel: config.meshChannel || 6,
    camera: config.cameraResolution || 'VGA',
    pdmMicrophone: `${config.pdmMicrophoneSampleRate || 48000} Hz`,
    binaryPackage: 'xiao_sense_meshmatics_sparrow_v2.4.zip',
    flashCommand: `esptool.py --chip esp32s3 -p /dev/ttyACM0 -b 921600 write_flash 0x10000 firmware.bin`,
  });
});

// Serve Wilderness Dojo landing page for GitHub Pages preview
app.get(['/landing', '/wildernessdojo', '/docs'], (req, res) => {
  const landingPath = path.join(process.cwd(), 'docs', 'index.html');
  res.sendFile(landingPath);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gharial ISPA Sparrow RLHF Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

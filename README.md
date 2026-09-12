# Gharial ISPA Sparrow RLHF

> **Interspecies Phonetic Alphabet (ISPA) Annotation & RLHF Feedback Pipeline for Critically Endangered Gharials (*Gavialis gangeticus*)**  
> *Developed in collaboration with the Madras Crocodile Bank Trust and Centre for Herpetology (MCBT), Mahabalipuram, Tamil Nadu & Dr. Bheemaiah Anil Kumar Bioacoustics Lab.*

[![Live Cloud Build](https://img.shields.io/badge/Live_Cloud_Build-Google_Cloud_Run-emerald?style=for-the-badge&logo=googlecloud)](https://ais-pre-mmuuwcpohdumz46mslp3qu-219346993343.asia-southeast1.run.app)
[![Website: wildernessdojo.github.io](https://img.shields.io/badge/Website-wildernessdojo.github.io-blue?style=for-the-badge&logo=github)](https://wildernessdojo.github.io)
[![WebAPK](https://img.shields.io/badge/WebAPK-Android_PWA-green?style=for-the-badge&logo=android)](https://ais-pre-mmuuwcpohdumz46mslp3qu-219346993343.asia-southeast1.run.app)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://github.com/bheemaiah/gharial-ispa-sparrow-rlhf)

---

## Live Deployments & Web Access

| Resource | URL | Description |
| :--- | :--- | :--- |
| **Live Cloud Build (Production)** | [ais-pre-mmuuwcpohdumz46mslp3qu-219346993343.asia-southeast1.run.app](https://ais-pre-mmuuwcpohdumz46mslp3qu-219346993343.asia-southeast1.run.app) | Real-time bioacoustic annotation workbench running on Google Cloud Run |
| **Development Cloud URL** | [ais-dev-mmuuwcpohdumz46mslp3qu-219346993343.asia-southeast1.run.app](https://ais-dev-mmuuwcpohdumz46mslp3qu-219346993343.asia-southeast1.run.app) | Active continuous integration preview endpoint |
| **Official Website & Landing Page** | [wildernessdojo.github.io](https://wildernessdojo.github.io) | Public educational landing page & interactive ISPA sound synthesizer (served from `/docs`) |
| **Local Preview of Landing Page** | [http://localhost:3000/landing](http://localhost:3000/landing) | Built-in Express route rendering `docs/index.html` |

---

## Overview

The **Gharial ISPA Sparrow RLHF** system is a specialized human-in-the-loop (HITL) bioacoustic annotation and Reinforcement Learning from Human Feedback (RLHF) workbench. Tailored specifically for the critically endangered gharial (*Gavialis gangeticus*), the application integrates **Microsoft Sparrow** edge telemetry streaming with **MegaDetector Acoustic** signal parsing to build standardized, high-confidence training corpuses for machine learning models.

Monitoring stations are situated at the **Madras Crocodile Bank Trust (MCBT)** in Tamil Nadu, recording multi-channel hydrophone and acoustic telemetry across breeding sandbanks, nursery creches, and research lagoons.

---

## Core Capabilities

### 1. Microsoft Sparrow Bioacoustic Telemetry
- **Multi-Station Feeds**: Real-time switching between MCBT monitoring enclosures:
  - *Main Gharial Lagoon* (Enclosure 14 &bull; Deep Riverine Lagoon & Sandbar Observatory &bull; `12.7563°N 80.2415°E`)
  - *Juvenile Nursery Complex* (Rearing Hatchery & Juvenile Bioacoustic Creche #2 &bull; `12.7565°N 80.2418°E`)
  - *Bioacoustic Research Pen* (Acoustic Enclosure B & Calibrated Hydrophone Array &bull; `12.7560°N 80.2412°E`)
- **Real-Time Spectrogram & Waterfall Display**: Live 60 FPS visual audio rendering with dynamic hydrophone peak frequency mapping and SNR indicators.
- **Biometric OSD**: Real-time environmental telemetry (water temperature, stream flow velocity, water depth, and gharial census counts).

### 2. ISPA Phoneme Composer & Acoustic Synthesizer
- **Physiologically Accurate Audio Engine**: Uses the Web Audio API to reproduce the acoustic signatures of gharials:
  - **Adult Advertisement**: `BOP` / `POP` (Underwater cavitation bubble-pop), `SAV` (Sub-audible infrasound tremor / torso dance), `BR` (Bellow-roar resonant ghara amplification), `RR` (Rolling water growl), `BSS` (Blow-snort spume burst).
  - **Juvenile Vocalizations**: `JQU` (Juvenile contact quack), `PIP` (Hatching emergence call), `WHI` (High-pitched distress whine), `HSS` (Defensive juvenile hiss).
  - **Agonistic & Courtship**: `HAP` (Head-slap acoustic shockwave), `CLK` (Jaw-clap territorial snap), `GRL` (Territorial growl), `JCL` (Juvenile creche rally call).
- **Sequence Composer**: Construct multi-token vocalization chains with playback preview, tempo control, and transmission directly to the Sparrow telemetry pipeline.

### 3. MegaDetector Acoustic Ingestion
- **Automated Detection Feed**: Continuous ingestion of acoustic trigger events with automated boundary bounding, peak frequency tagging, duration metrics, and model confidence scoring.
- **Acoustic Waveform Inspector**: Micro-level temporal and frequency breakdown for each detected event.

### 4. Human-in-the-Loop RLHF Annotation Studio
- **Sequence Verification**: Review automated predictions against ground truth, correcting tokens using the ISPA palette.
- **Reward Modeling**: Assign scalar reward scores ($-1.0$ to $+1.0$) for reinforcement learning from expert feedback.
- **Caller Demographic Confirmation**: Validate morphological traits (e.g., presence of adult male *ghara* narial bulb, subadult, or creche hatchling).
- **Gemini Ethological Verification**: Integrated server-side Gemini 2.5 Flash agent evaluating acoustic parameters against peer-reviewed crocodilian bioacoustic literature.

### 5. Training Corpus Export Pipeline
- Export validated preference pairs formatted for:
  - Microsoft Sparrow edge model fine-tuning (`microsoft.sparrow.bioacoustics.rlhf.v1`)
  - PyTorch / HuggingFace `datasets` JSON manifests
  - Bioacoustic acoustic wave segmentation libraries

---

## ISPA Phonetic Vocabulary Reference

| Token | Acoustic Name | Dominant Freq | Description & Behavioral Context |
| :---: | :--- | :---: | :--- |
| **`POP`** | Bubble Pop / Ghara Cavitation | 40&ndash;180 Hz | Rapid underwater acoustic impulse generated by adult male jaw closure and ghara cavitation. Distinctive to individuals. |
| **`SAV`** | Sub-Audible Vibration | 6&ndash;18 Hz | Infrasonic torso vibration ("water dance") creating Faraday surface ripples during courtship display. |
| **`BR`** | Resonant Bellow-Roar | 120&ndash;340 Hz | Prolonged acoustic expulsion modulated by the cartilaginous ghara chamber; long-range breeding advertisement. |
| **`RR`** | Low Rolling Growl | 70&ndash;210 Hz | Low guttural growl signaling territorial presence and male-male boundary displays. |
| **`BSS`** | Blow-Snort Spray | 200&ndash;850 Hz | Forced exhalation expelling air and water spray from the narial naris. |
| **`HAP`** | Head-Slap Shockwave | 30&ndash;260 Hz | Explosive downward head strike onto water surface producing a wideband acoustic shockwave. |
| **`CLK`** | Jaw Clap / Snap | 300&ndash;1400 Hz | High-speed mandibular snap functioning as agonistic warning or prey capture sound. |
| **`JQU`** | Juvenile Creche Quack | 800&ndash;2200 Hz | High-pitched harmonic call maintaining contact among hatchlings within protected creches. |
| **`PIP`** | Hatching Emergence Pip | 1200&ndash;3500 Hz | High-frequency vocalization emitted inside egg or sand nest chamber to synchronize hatching. |
| **`WHI`** | Juvenile Distress Whine | 900&ndash;2800 Hz | Ascending tonal distress whine that summons adult guarding males or females to the nursery. |

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons
- **Backend & Middleware**: Node.js, Express, Vite
- **AI / LLM Integration**: Google Gemini 2.5 Flash (`@google/genai`) for bioacoustic ethology validation
- **Audio Engine**: Web Audio API (custom dual-stage synthesis for ghara resonant cavities, infrasonic oscillators, and cavitation impulses)

---

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or bun

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bheemaiah/gharial-ispa-sparrow-rlhf.git
   cd gharial-ispa-sparrow-rlhf
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Provide your Gemini API key in `.env`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## Docker & Containerized Deployment

A production-grade multi-stage `Dockerfile` and `docker-compose.yml` are included in the repository for one-command deployment.

### Quick Run with Docker Compose

```bash
# Clone the repository
git clone https://github.com/bheemaiah/gharial-ispa-sparrow-rlhf.git
cd gharial-ispa-sparrow-rlhf

# Launch the containerized application
docker compose up -d --build
```
The application will be accessible at [http://localhost:3000](http://localhost:3000) with automatic healthchecks against `/api/health`.

### Standalone Docker Build & Run

```bash
# Build the production image
docker build -t gharial-ispa:latest .

# Run the container with environment variables
docker run -d \
  -p 3000:3000 \
  --name gharial-sparrow-rlhf \
  -e GEMINI_API_KEY="your-gemini-api-key" \
  gharial-ispa:latest
```

---

## Android WebAPK & PWA Minting

The application meets all Chromium criteria for **automatic WebAPK generation** via Google Play's WebAPK minting service on Android devices:

- **Web App Manifest**: Configured at `/manifest.json` with `id: "/"`, `display: "standalone"`, and high-resolution icons.
- **Service Worker**: Precaches UI assets, ISPA token dictionaries, and spectrogram renderers for offline operation in field enclosures.
- **Adaptive Maskable Icons**: 192&times;192 and 512&times;512 PNG assets generated with safe-zone margins (`/public/pwa-maskable-512x512.png`).
- **In-App Installation**: Tap the **Install WebAPK** button in the application header or select "Install app" in Google Chrome for Android.

---

## GitHub Pages Landing Page (`wildernessdojo.github.io`)

The public website and interactive bioacoustic landing page is located in [`docs/index.html`](docs/index.html):

- **Deployment Source**: Standard GitHub Pages directory (`/docs` branch configuration or root of the `wildernessdojo.github.io` repository).
- **Interactive Bioacoustic Synthesizer**: Visitors can audition synthesized gharial bubble-pops (`POP`), infrasound vibrations (`SAV`), and roar-bellows (`BR`) directly in the browser via the Web Audio API.
- **Direct Links**: Immediate launch buttons linking directly to the live Cloud Run application:
  `https://ais-pre-mmuuwcpohdumz46mslp3qu-219346993343.asia-southeast1.run.app`.
- **Local Testing**: Preview the landing page at [http://localhost:3000/landing](http://localhost:3000/landing) when running the local server.

---

## Microsoft Sparrow & MegaDetector ONNX Studio

The **ONNX Studio** is an integrated workbench accessible from the application header or the video monitor HUD. It provides real-time model cataloging, edge latency benchmarking, dataset curation, and firmware generation.

---

## Complete ONNX Model Registry (Microsoft Sparrow, MegaDetector, PyTorch Wildlife)

The platform registers and benchmarks **11 production ONNX models** designed for edge wildlife monitoring, hydrophone bioacoustics, and anatomical computer vision:

### 1. MegaDetector Wildlife Detection Models

| Model Filename | Architecture | Input Tensor | Output Shape | Precision | Edge Latency | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `md_v5a.onnx` | YOLOv5x6 + P6 | `[1, 3, 1280, 1280]` | `[1, 100800, 8]` | FP32 | 145.0 ms | Gold-standard global wildlife detection model. High recall for small camouflaged animals on sandbanks. |
| `md_v5b.onnx` | YOLOv5x | `[1, 3, 1280, 1280]` | `[1, 75600, 8]` | FP16 | 88.0 ms | Compact edge model for lower-memory field gateways and Raspberry Pi 5. |
| `md_v6_yolov8x.onnx` | YOLOv8x Anchor-Free | `[1, 3, 640, 640]` | `[1, 7, 8400]` | INT8 | 38.4 ms | Anchor-free detection head with enhanced sensitivity for creche juveniles. |
| `md_v6_rtdetr.onnx` | RT-DETR Transformer | `[1, 3, 640, 640]` | `[1, 300, 4]`, `[1, 300, 3]` | FP16 | 52.0 ms | Real-Time Detection Transformer eliminating NMS latency jitter. |

### 2. Microsoft Sparrow Bioacoustic & Multimodal Models

| Model Filename | Architecture | Input Tensor | Output Shape | Precision | Edge Latency | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `sparrow_acoustic_ispa_13class.onnx` | ConvNeXt-V2-Nano | `[1, 1, 128, 512]` | `[1, 13]` | FP16 | 18.2 ms | Classifies all 13 ISPA phonetic tokens (POP, SAV, BR, HC, CC, DC, HS, JC, BB, GW, GR, RR, SN). |
| `sparrow_infrasound_detector_20hz.onnx` | Temporal 1D ResNet | `[1, 1, 4800]` | `[1, 2]` | INT8 | 6.5 ms | Subaudible (<20Hz) hydrophone vibration detector for male torso water-dances. |
| `sparrow_audio_visual_fusion_v2.onnx` | Dual-Stream Transformer | `[1, 3, 384, 384]`, `[1, 1, 128, 256]` | `[1, 13]`, `[1, 1]` | FP16 | 44.0 ms | Fuses OV2640 camera stream with PDM hydrophone audio for synchronized behavioral classification. |
| `sparrow_xiao_esp32s3_tinyml_int8.onnx` | MobileNetV1-Micro | `[1, 1, 64, 128]` | `[1, 6]` | ESP-NN INT8 | 12.0 ms | Ultra-quantized model executing directly on Seeed Studio XIAO ESP32S3 Sense @ 240MHz. |

### 3. PyTorch Wildlife (PTW) Models

| Model Filename | Architecture | Input Tensor | Output Shape | Precision | Edge Latency | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ptw_crocodylia_classifier.onnx` | EfficientNet-B3 Wildlife | `[1, 3, 300, 300]` | `[1, 4]` | FP16 | 22.5 ms | Morphometric taxa differentiator (Gharial vs Mugger crocodile vs Saltwater crocodile). |
| `ptw_gharial_keypoints.onnx` | HRNet-W32 Heatmap | `[1, 3, 384, 288]` | `[1, 8, 96, 72]` | FP16 | 36.0 ms | 8-point landmark estimator for ghara narial bulb, rostral tip, nostril apertures, and eyes. |
| `ptw_creche_counter.onnx` | CSRNet Dilated Conv | `[1, 3, 512, 512]` | `[1, 1, 64, 64]` | FP16 | 28.0 ms | Congested scene density-map regression counting dozens of basking hatchlings. |
| `ptw_bioacoustic_encoder_efficientnet.onnx` | EfficientNet-Audio-V2 | `[1, 1, 128, 256]` | `[1, 512]` | FP16 | 14.5 ms | Generates 512-dim bioacoustic embeddings for individual adult male re-identification. |

---

## Seeed Studio XIAO ESP32S3 Sense Firmware & Meshmatics

The platform includes a built-in firmware configurator and one-click package downloader for the **Seeed Studio XIAO ESP32S3 Sense** micro-edge sensor:

- **Target Hardware**:
  - Xtensa Dual-Core 32-bit LX7 @ 240 MHz, 8 MB PSRAM, 8 MB Flash
  - Integrated OV2640 DVP Camera (QVGA / VGA / SVGA JPEG DMA streaming)
  - Onboard MSM261D3526H1CPM Digital PDM Microphone (I2S DMA audio capture)
- **Protocol**: **XIAO Meshmatics** (ESP-NOW / 802.11 Long-Range Mesh broadcasting to Microsoft Sparrow base stations)
- **Infrasound Optimization**: High-Pass Filter bypass configured to record <20Hz seismic hydrophone waves.
- **One-Click Download Artifacts**:
  - `xiao_sense_meshmatics.ino`: Complete Arduino C++ sketch
  - `flash_xiao_sense.sh`: Automated flashing script using `esptool.py` (baud: 921600)
  - `platformio.ini`: PlatformIO embedded build definition
  - `meshmatics_config.json`: Node network credentials and trigger thresholds
  - Complete `.zip` package via the ONNX Studio

### Quick Flashing Instructions

```bash
# 1. Connect XIAO ESP32S3 Sense via USB-C
# 2. Extract firmware bundle and run:
chmod +x flash_xiao_sense.sh
./flash_xiao_sense.sh /dev/ttyACM0

# 3. Monitor live telemetry over serial:
python -m serial.tools.miniterm /dev/ttyACM0 115200
```

---

## Gharial Multimodal Datasets & Export Formats

Every live camera frame and acoustic observation can be saved to the **Gharial Dataset Corpus** with one click. Datasets store synchronized:
1. Video camera snapshot & high-resolution JPEG frame
2. Normalised bounding boxes (animal, ghara, juvenile creche, rostral tip)
3. ISPA token sequence (`POP`, `SAV`, `BR`, `HC`, `CC`, `SN`, etc.)
4. Hydrophone audio features (peak frequency, duration, bandwidth, SNR, infrasound RMS)
5. Environmental telemetry (water temperature, flow velocity, location)

### Supported Dataset Export Formats

- **Full Bundle ZIP**: Single `.zip` containing all formats below with complete README and licenses.
- **COCO 1.0 JSON** (`coco_annotations.json`): Standard format for Computer Vision training in MegaDetector & PyTorch Wildlife.
- **YOLO Format** (`labels/*.txt` & `data.yaml`): Formatted for Ultralytics YOLOv8 / YOLOv11 object detection.
- **HuggingFace Datasets JSONL** (`dataset.jsonl`): Ready for direct streaming into `datasets` Python library.
- **Microsoft Sparrow RLHF Manifest** (`sparrow_rlhf_manifest.json`): Structured preference pairs for reward model fine-tuning.
- **PyTorch Bioacoustic CSV** (`audio_manifest.csv`): Tabular spectrogram features and behavioral labels.

---

## Research Site & Attribution

- **Field Research Partner**: [Madras Crocodile Bank Trust and Centre for Herpetology (MCBT)](https://madrascrocodilebank.org/), Mahabalipuram, Tamil Nadu, India.
- **Lead Investigator**: Dr. Bheemaiah Anil Kumar
- **Project Proposal**: *Bioacoustic Identification and Interspecies Phonetic Alphabet (ISPA) Annotation for Crocodilian Conservation via Microsoft Sparrow Telemetry and Human-in-the-Loop RLHF.*

---

## License

This project is licensed under the MIT License &mdash; see the [LICENSE](LICENSE) file for details.

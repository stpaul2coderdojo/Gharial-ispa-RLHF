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

## Research Site & Attribution

- **Field Research Partner**: [Madras Crocodile Bank Trust and Centre for Herpetology (MCBT)](https://madrascrocodilebank.org/), Mahabalipuram, Tamil Nadu, India.
- **Lead Investigator**: Dr. Bheemaiah Anil Kumar
- **Project Proposal**: *Bioacoustic Identification and Interspecies Phonetic Alphabet (ISPA) Annotation for Crocodilian Conservation via Microsoft Sparrow Telemetry and Human-in-the-Loop RLHF.*

---

## License

This project is licensed under the MIT License &mdash; see the [LICENSE](LICENSE) file for details.

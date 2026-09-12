import JSZip from 'jszip';
import { GharialDatasetItem, DatasetExportFormat } from '../types';

export function exportDatasetToCOCO(items: GharialDatasetItem[]) {
  const categories = [
    { id: 1, name: 'animal', supercategory: 'wildlife' },
    { id: 2, name: 'ghara', supercategory: 'anatomy' },
    { id: 3, name: 'juvenile_creche', supercategory: 'behavior' },
    { id: 4, name: 'snout', supercategory: 'anatomy' },
    { id: 5, name: 'scutes', supercategory: 'anatomy' },
  ];

  const categoryMap: Record<string, number> = {
    animal: 1,
    ghara: 2,
    juvenile_creche: 3,
    snout: 4,
    scutes: 5,
  };

  const images = items.map((item, idx) => ({
    id: idx + 1,
    file_name: `${item.id}.jpg`,
    width: 1280,
    height: 720,
    date_captured: item.timestamp,
    location: item.location,
    ispa_sequence: item.ispaSequence,
    environmental_context: item.environmentalContext,
  }));

  let annotationId = 1;
  const annotations: Array<Record<string, unknown>> = [];

  items.forEach((item, imgIdx) => {
    item.boundingBoxes.forEach((box) => {
      const x = Math.round(box.x * 1280);
      const y = Math.round(box.y * 720);
      const w = Math.round(box.width * 1280);
      const h = Math.round(box.height * 720);

      annotations.push({
        id: annotationId++,
        image_id: imgIdx + 1,
        category_id: categoryMap[box.category] || 1,
        bbox: [x, y, w, h],
        area: w * h,
        score: box.confidence,
        iscrowd: box.category === 'juvenile_creche' ? 1 : 0,
        label: box.label,
        keypoints: box.keypoints
          ? box.keypoints.flatMap((kp) => [Math.round(kp.x * 1280), Math.round(kp.y * 720), 2])
          : undefined,
      });
    });
  });

  return {
    info: {
      description: 'MCBT Gharial (Gavialis gangeticus) Multi-Modal Bioacoustic & Vision Dataset',
      version: '1.4.0',
      year: 2026,
      contributor: 'Madras Crocodile Bank Trust (MCBT) & Dr. Bheemaiah Anil Kumar Bioacoustics Lab',
      url: 'https://wildernessdojo.github.io',
      date_created: new Date().toISOString(),
    },
    licenses: [
      {
        id: 1,
        name: 'Creative Commons Attribution-NonCommercial 4.0 International',
        url: 'https://creativecommons.org/licenses/by-nc/4.0/',
      },
    ],
    categories,
    images,
    annotations,
  };
}

export function exportDatasetToYOLO(items: GharialDatasetItem[]) {
  const categoryIndices: Record<string, number> = {
    animal: 0,
    ghara: 1,
    juvenile_creche: 2,
    snout: 3,
    scutes: 4,
  };

  const files: Record<string, string> = {};

  items.forEach((item) => {
    const lines = item.boundingBoxes.map((box) => {
      const cls = categoryIndices[box.category] ?? 0;
      const xCenter = (box.x + box.width / 2).toFixed(6);
      const yCenter = (box.y + box.height / 2).toFixed(6);
      const w = box.width.toFixed(6);
      const h = box.height.toFixed(6);
      return `${cls} ${xCenter} ${yCenter} ${w} ${h}`;
    });
    files[`labels/${item.id}.txt`] = lines.join('\n');
  });

  files['data.yaml'] = `# YOLOv8 / YOLOv11 Dataset Configuration for Gharial ISPA Wildlife Detection
path: ./gharial_dataset
train: images/train
val: images/val
names:
  0: adult_male_gharial
  1: ghara_narial_bulb
  2: juvenile_creche
  3: snout_commissure
  4: dorsal_scutes
`;

  return files;
}

export function exportDatasetToHuggingFace(items: GharialDatasetItem[]): string {
  return items
    .map((item) =>
      JSON.stringify({
        id: item.id,
        title: item.title,
        timestamp: item.timestamp,
        location: item.location,
        stream_id: item.sourceStream,
        ispa_sequence: item.ispaSequence,
        behavior_description: item.behaviorDescription,
        has_ghara_adult_male: item.hasGharaAdultMale,
        juvenile_count: item.juvenileCount,
        environmental_context: item.environmentalContext,
        audio_features: item.audioFeatures,
        bounding_boxes: item.boundingBoxes,
        annotator: item.annotator,
        rlhf_status: item.rlhfStatus,
        tags: item.tags,
      })
    )
    .join('\n');
}

export function exportDatasetToPyTorchCSV(items: GharialDatasetItem[]): string {
  const headers = [
    'sample_id',
    'timestamp',
    'location',
    'ispa_tokens',
    'behavior_label',
    'peak_freq_hz',
    'bandwidth_hz',
    'duration_ms',
    'snr_db',
    'infrasound_hz',
    'has_ghara',
    'num_bounding_boxes',
    'rlhf_verified',
  ];

  const rows = items.map((item) => [
    item.id,
    item.timestamp,
    `"${item.location}"`,
    `"${item.ispaSequence.join('-')}"`,
    `"${item.behaviorDescription.replace(/"/g, '""')}"`,
    item.audioFeatures.peakFrequencyHz,
    item.audioFeatures.bandwidthHz,
    item.audioFeatures.durationMs,
    item.audioFeatures.snrDb,
    item.environmentalContext.infrasoundPeakHz,
    item.hasGharaAdultMale ? 1 : 0,
    item.boundingBoxes.length,
    item.rlhfStatus === 'VERIFIED' ? 1 : 0,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export async function exportDatasetBundleZip(items: GharialDatasetItem[]): Promise<Blob> {
  const zip = new JSZip();

  // 1. COCO JSON
  const coco = exportDatasetToCOCO(items);
  zip.file('coco_annotations.json', JSON.stringify(coco, null, 2));

  // 2. YOLO TXT
  const yolo = exportDatasetToYOLO(items);
  Object.entries(yolo).forEach(([filename, content]) => {
    zip.file(filename, content);
  });

  // 3. HuggingFace JSONL
  const hf = exportDatasetToHuggingFace(items);
  zip.file('dataset.jsonl', hf);

  // 4. PyTorch Audio CSV
  const csv = exportDatasetToPyTorchCSV(items);
  zip.file('audio_manifest.csv', csv);

  // 5. Readme & Dataset Summary
  zip.file(
    'README.md',
    `# Gharial (Gavialis gangeticus) Multi-Modal Bioacoustic & Vision Dataset
- Contributor: Madras Crocodile Bank Trust (MCBT) & Dr. Bheemaiah Anil Kumar Bioacoustics Lab
- Total Samples: ${items.length}
- ISPA Vocabulary: 13 Phonetic Tokens (POP, SAV, BR, HC, CC, DC, HS, JC, BB, GW, GR, RR, SN)
- Supported Frameworks: Microsoft Sparrow, MegaDetector v5/v6, PyTorch Wildlife, Ultralytics YOLOv8/v11, HuggingFace Datasets.
`
  );

  return zip.generateAsync({ type: 'blob' });
}

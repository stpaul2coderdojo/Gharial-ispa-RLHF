import React, { useState } from 'react';
import {
  Database,
  Download,
  Plus,
  FileJson,
  FileSpreadsheet,
  Package,
  Layers,
  CheckCircle,
  Tag,
  MapPin,
  Clock,
  Waves,
  Eye,
  Trash2,
} from 'lucide-react';
import { GharialDatasetItem, DatasetExportFormat, ISPATokenId } from '../../types';
import {
  exportDatasetToCOCO,
  exportDatasetToYOLO,
  exportDatasetToHuggingFace,
  exportDatasetToPyTorchCSV,
  exportDatasetBundleZip,
} from '../../utils/datasetExporter';

interface DatasetsTabProps {
  datasets: GharialDatasetItem[];
  onAddDataset: (item: GharialDatasetItem) => void;
  onDeleteDataset?: (id: string) => void;
}

export const DatasetsTab: React.FC<DatasetsTabProps> = ({
  datasets,
  onAddDataset,
  onDeleteDataset,
}) => {
  const [selectedDataset, setSelectedDataset] = useState<GharialDatasetItem>(datasets[0] || null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New dataset form state
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('MCBT Lagoon Enclosure #14');
  const [newTokens, setNewTokens] = useState<ISPATokenId[]>(['POP', 'SAV', 'BR']);
  const [newBehavior, setNewBehavior] = useState('Stereotypic adult male courtship display');
  const [newHasGhara, setNewHasGhara] = useState(true);
  const [newJuveniles, setNewJuveniles] = useState(0);

  const handleExport = async (format: DatasetExportFormat) => {
    setIsExporting(true);
    try {
      if (format === 'FULL_BUNDLE_ZIP') {
        const blob = await exportDatasetBundleZip(datasets);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gharial_ispa_multimodal_dataset_${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportNotice('Exported full dataset bundle (.zip with COCO, YOLO, HuggingFace & PyTorch formats)');
      } else if (format === 'COCO_VISION_JSON') {
        const coco = exportDatasetToCOCO(datasets);
        const blob = new Blob([JSON.stringify(coco, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'coco_annotations.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportNotice('Exported COCO 1.0 Vision JSON');
      } else if (format === 'HUGGINGFACE_DATASETS_JSONL') {
        const hf = exportDatasetToHuggingFace(datasets);
        const blob = new Blob([hf], { type: 'application/x-jsonlines' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gharial_dataset.jsonl';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportNotice('Exported HuggingFace Datasets JSONL');
      } else if (format === 'PYTORCH_AUDIO_CSV') {
        const csv = exportDatasetToPyTorchCSV(datasets);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audio_manifest.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportNotice('Exported PyTorch Bioacoustic CSV');
      } else if (format === 'SPARROW_RLHF_MANIFEST_JSON') {
        const manifest = {
          export_id: `sparrow-manifest-${Date.now()}`,
          records: datasets,
          metadata: {
            organization: 'Madras Crocodile Bank Trust (MCBT)',
            ispa_version: '2026.1',
            total_samples: datasets.length,
          },
        };
        const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sparrow_rlhf_manifest.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportNotice('Exported Microsoft Sparrow RLHF Manifest JSON');
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  const handleCreateCustomDataset = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: GharialDatasetItem = {
      id: `gharial-ds-${Date.now().toString().slice(-4)}`,
      title: newTitle || 'Custom Gharial Bioacoustic Observation',
      sourceStream: 'mcbt-gharial-lagoon',
      location: newLocation,
      timestamp: new Date().toISOString(),
      ispaSequence: newTokens,
      behaviorDescription: newBehavior,
      hasGharaAdultMale: newHasGhara,
      juvenileCount: newJuveniles,
      environmentalContext: {
        waterTempC: 27.5,
        flowVelocityMs: 0.3,
        habitatType: 'Lagoon Sandbank',
        infrasoundPeakHz: 18.2,
      },
      audioFeatures: {
        peakFrequencyHz: 260,
        bandwidthHz: 1900,
        durationMs: 2800,
        snrDb: 22.0,
      },
      boundingBoxes: [
        {
          id: `box-${Date.now()}`,
          label: 'Adult Male Gharial (Gavialis gangeticus)',
          confidence: 0.96,
          x: 0.3,
          y: 0.45,
          width: 0.55,
          height: 0.35,
          color: '#10b981',
          category: 'animal',
        },
      ],
      annotator: 'Curator User Session',
      rlhfStatus: 'VERIFIED',
      tags: ['user_annotated', 'mcbt', ...newTokens.map((t) => t.toLowerCase())],
    };

    onAddDataset(newItem);
    setSelectedDataset(newItem);
    setShowAddForm(false);
    setNewTitle('');
    setExportNotice(`Saved new dataset record "${newItem.title}" to Corpus`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notice */}
      {exportNotice && (
        <div className="p-3 bg-emerald-950 border border-emerald-600 rounded-lg text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{exportNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-400">Dataset Synchronized</span>
        </div>
      )}

      {/* Top Controls & Export Suite Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
        <div>
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Database className="w-4 h-4 text-emerald-400" />
            Gharial Multimodal Dataset Corpus ({datasets.length} records)
          </span>
          <p className="text-[11px] text-slate-400">
            Export synchronized camera frames, bounding boxes, ISPA sequences, and hydrophone FFTs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Record</span>
          </button>

          <button
            onClick={() => handleExport('FULL_BUNDLE_ZIP')}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Package className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Packaging...' : 'Export ZIP Bundle'}</span>
          </button>

          {/* Format dropdown button */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => handleExport('COCO_VISION_JSON')}
              className="px-2 py-0.5 rounded text-slate-300 hover:bg-slate-800 text-[11px]"
              title="COCO 1.0 JSON format for MegaDetector"
            >
              COCO
            </button>
            <button
              onClick={() => handleExport('HUGGINGFACE_DATASETS_JSONL')}
              className="px-2 py-0.5 rounded text-slate-300 hover:bg-slate-800 text-[11px]"
              title="HuggingFace Datasets JSONL format"
            >
              HF JSONL
            </button>
            <button
              onClick={() => handleExport('PYTORCH_AUDIO_CSV')}
              className="px-2 py-0.5 rounded text-slate-300 hover:bg-slate-800 text-[11px]"
              title="PyTorch Audio Manifest CSV"
            >
              Audio CSV
            </button>
          </div>
        </div>
      </div>

      {/* Add Custom Record Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleCreateCustomDataset}
          className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 text-xs animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm">Create New Gharial Dataset Record</h4>
            <span className="text-slate-400 text-[11px]">Save as Ground Truth in Corpus</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Observation Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Morning Courtship Torso Vibration & Resonant Roar"
                className="w-full bg-slate-950 text-slate-200 px-3 py-1.5 rounded border border-slate-700"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Field Location / Enclosure</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 px-3 py-1.5 rounded border border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Behavior &amp; Ethogram Description</label>
            <textarea
              value={newBehavior}
              onChange={(e) => setNewBehavior(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 text-slate-200 px-3 py-1.5 rounded border border-slate-700 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Adult Male Ghara Present?</label>
              <select
                value={newHasGhara ? 'yes' : 'no'}
                onChange={(e) => setNewHasGhara(e.target.value === 'yes')}
                className="w-full bg-slate-950 text-slate-200 px-3 py-1.5 rounded border border-slate-700"
              >
                <option value="yes">Yes (Dominant Alpha Male)</option>
                <option value="no">No (Female / Subadult)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Creche Juvenile Count</label>
              <input
                type="number"
                value={newJuveniles}
                onChange={(e) => setNewJuveniles(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 text-slate-200 px-3 py-1.5 rounded border border-slate-700"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
              >
                Save Record to Corpus
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Dataset Browser: List on Left, Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Dataset List (6 Cols) */}
        <div className="lg:col-span-6 space-y-2 max-h-[580px] overflow-y-auto pr-1">
          {datasets.map((item) => {
            const isSelected = selectedDataset?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedDataset(item)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-white text-xs leading-snug">{item.title}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      item.rlhfStatus === 'VERIFIED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {item.rlhfStatus}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span className="truncate max-w-[150px]">{item.location}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* ISPA Tokens Badges */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">ISPA:</span>
                  {item.ispaSequence.map((tok, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px] border border-indigo-800"
                    >
                      {tok}
                    </span>
                  ))}
                  {item.hasGharaAdultMale && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 text-[10px] border border-amber-800 ml-auto">
                      Ghara Male
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dataset Detail View (6 Cols) */}
        {selectedDataset && (
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                    {selectedDataset.id}
                  </span>
                  <h3 className="text-sm font-bold text-white">{selectedDataset.title}</h3>
                  <span className="text-xs text-slate-400">{selectedDataset.location}</span>
                </div>
                {onDeleteDataset && datasets.length > 1 && (
                  <button
                    onClick={() => onDeleteDataset(selectedDataset.id)}
                    className="p-1.5 rounded text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300 my-2.5 leading-relaxed">
                {selectedDataset.behaviorDescription}
              </p>

              {/* Bioacoustic Audio Features */}
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Bioacoustic &amp; Infrasound Telemetry
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="bg-slate-900/80 p-1.5 rounded">
                    <span className="text-[9px] font-sans text-slate-400 block">Peak Frequency</span>
                    <span className="text-emerald-300">{selectedDataset.audioFeatures.peakFrequencyHz} Hz</span>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded">
                    <span className="text-[9px] font-sans text-slate-400 block">Bandwidth</span>
                    <span className="text-sky-300">{selectedDataset.audioFeatures.bandwidthHz} Hz</span>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded">
                    <span className="text-[9px] font-sans text-slate-400 block">Duration</span>
                    <span className="text-amber-300">{selectedDataset.audioFeatures.durationMs} ms</span>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded">
                    <span className="text-[9px] font-sans text-slate-400 block">Infrasound Peak</span>
                    <span className="text-indigo-300">{selectedDataset.environmentalContext.infrasoundPeakHz} Hz</span>
                  </div>
                </div>
              </div>

              {/* Vision Bounding Boxes */}
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1.5 text-xs mt-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Annotated Bounding Boxes ({selectedDataset.boundingBoxes.length})
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {selectedDataset.boundingBoxes.map((box) => (
                    <div
                      key={box.id}
                      className="p-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: box.color }}></span>
                        <span className="text-slate-200 font-medium">{box.label}</span>
                      </div>
                      <span className="font-mono text-emerald-400 text-[10px]">
                        {Math.round(box.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedDataset.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Annotator: {selectedDataset.annotator}</span>
              <span className="text-emerald-400 font-semibold">&bull; Ground-Truth RLHF Corpus</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

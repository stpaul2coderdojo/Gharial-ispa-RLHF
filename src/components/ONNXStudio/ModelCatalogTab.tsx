import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Zap,
  Download,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  Activity,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { ONNXCategory, ONNXModelInfo } from '../../types';
import { ALL_ONNX_MODELS } from '../../data/onnxModelsData';

export const ModelCatalogTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ONNXCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<ONNXModelInfo>(ALL_ONNX_MODELS[0]);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  const filteredModels = ALL_ONNX_MODELS.filter((model) => {
    const matchesCategory = selectedCategory === 'ALL' || model.category === selectedCategory;
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.architecture.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.classes.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleDownloadModel = (model: ONNXModelInfo) => {
    // Generate a mock ONNX model blob or download instruction
    const dummyManifest = {
      model_id: model.id,
      model_name: model.name,
      filename: model.filename,
      category: model.category,
      version: model.version,
      architecture: model.architecture,
      input_shape: model.inputShape,
      output_shape: model.outputShape,
      opset: model.opset,
      quantization: model.quantization,
      classes: model.classes,
      download_source: model.downloadUrl,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dummyManifest, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccessNotice(`Downloaded ONNX configuration for ${model.filename}`);
    setTimeout(() => setDownloadSuccessNotice(null), 3500);
  };

  return (
    <div className="space-y-4">
      {/* Download Alert Toast */}
      {downloadSuccessNotice && (
        <div className="p-3 bg-emerald-950 border border-emerald-600 rounded-lg text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccessNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-400">Ready for ONNX Runtime / WebGL</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'MegaDetector', 'Microsoft Sparrow', 'PyTorch Wildlife'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'All Models (11)' : cat}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search architecture, tokens, classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Main Split: Model Cards on Left, Detailed Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Model Cards Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
          {filteredModels.map((model) => {
            const isSelected = selectedModel.id === model.id;
            return (
              <div
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        model.category === 'MegaDetector'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : model.category === 'Microsoft Sparrow'
                          ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {model.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">v{model.version}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {model.quantization}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                    <Zap className="w-3 h-3" />
                    {model.latencyEdgeMs}ms
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-1.5 mb-1">{model.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{model.description}</p>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                  <span className="font-mono text-slate-300">Arch: {model.architecture}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Params: {model.parameters}</span>
                    <span className="text-[10px] text-slate-500">Opset {model.opset}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Model Inspector (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                  {selectedModel.category} Model Spec
                </span>
                <h3 className="text-base font-bold text-white">{selectedModel.name}</h3>
                <span className="font-mono text-xs text-slate-400">{selectedModel.filename}</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <Cpu className="w-5 h-5" />
              </div>
            </div>

            <p className="text-xs text-slate-300 my-3 leading-relaxed">{selectedModel.description}</p>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                  Architecture &amp; Backbone
                </span>
                <span className="text-slate-200 font-mono block">{selectedModel.architecture}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">{selectedModel.backbone}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div>
                  <span className="text-[10px] font-sans font-semibold uppercase text-slate-400 block">
                    Input Tensor
                  </span>
                  <span className="text-emerald-300">{selectedModel.inputShape}</span>
                </div>
                <div>
                  <span className="text-[10px] font-sans font-semibold uppercase text-slate-400 block">
                    Output Tensor
                  </span>
                  <span className="text-sky-300">{selectedModel.outputShape}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                  Target Edge &amp; Cloud Hardware
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedModel.supportedHardware.map((hw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700"
                    >
                      {hw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                  Output Classes / Phonetic Tokens ({selectedModel.classes.length})
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {selectedModel.classes.map((cls, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 font-mono text-[10px]"
                    >
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
            <a
              href={selectedModel.paperOrRepoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Official Repository</span>
            </a>

            <button
              onClick={() => handleDownloadModel(selectedModel)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Model Package</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

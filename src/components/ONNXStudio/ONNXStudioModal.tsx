import React, { useState } from 'react';
import {
  X,
  Cpu,
  Database,
  Download,
  BookOpen,
  Sparkles,
  Layers,
  Radio,
  Sliders,
} from 'lucide-react';
import { GharialDatasetItem } from '../../types';
import { ModelCatalogTab } from './ModelCatalogTab';
import { DatasetsTab } from './DatasetsTab';
import { XiaoMeshmaticsTab } from './XiaoMeshmaticsTab';
import { ModelDocumentationTab } from './ModelDocumentationTab';

export type ONNXStudioTab = 'MODELS' | 'DATASETS' | 'XIAO_FIRMWARE' | 'DOCUMENTATION';

interface ONNXStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ONNXStudioTab;
  datasets: GharialDatasetItem[];
  onAddDataset: (item: GharialDatasetItem) => void;
  onDeleteDataset?: (id: string) => void;
}

export const ONNXStudioModal: React.FC<ONNXStudioModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'MODELS',
  datasets,
  onAddDataset,
  onDeleteDataset,
}) => {
  const [activeTab, setActiveTab] = useState<ONNXStudioTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Microsoft Sparrow &amp; MegaDetector ONNX Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px] font-bold">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PyTorch Wildlife Inference Engine, Model Catalog, Dataset Registry &amp; XIAO Meshmatics Firmware
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close ONNX Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Tab Navigation Bar */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('MODELS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'MODELS'
                ? 'border-emerald-500 text-white bg-slate-800/80 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>ONNX Models Catalog (11)</span>
          </button>

          <button
            onClick={() => setActiveTab('DATASETS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'DATASETS'
                ? 'border-emerald-500 text-white bg-slate-800/80 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Gharial Datasets ({datasets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('XIAO_FIRMWARE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'XIAO_FIRMWARE'
                ? 'border-emerald-500 text-white bg-slate-800/80 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>XIAO Sense Firmware &amp; Meshmatics</span>
          </button>

          <button
            onClick={() => setActiveTab('DOCUMENTATION')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'DOCUMENTATION'
                ? 'border-emerald-500 text-white bg-slate-800/80 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Model Documentation</span>
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-5 overflow-y-auto flex-1 max-h-[calc(92vh-140px)]">
          {activeTab === 'MODELS' && <ModelCatalogTab />}
          {activeTab === 'DATASETS' && (
            <DatasetsTab
              datasets={datasets}
              onAddDataset={onAddDataset}
              onDeleteDataset={onDeleteDataset}
            />
          )}
          {activeTab === 'XIAO_FIRMWARE' && <XiaoMeshmaticsTab />}
          {activeTab === 'DOCUMENTATION' && <ModelDocumentationTab />}
        </div>
      </div>
    </div>
  );
};

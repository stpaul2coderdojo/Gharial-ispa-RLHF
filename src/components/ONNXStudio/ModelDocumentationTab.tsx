import React from 'react';
import {
  FileText,
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  ExternalLink,
  Code,
  ShieldAlert,
} from 'lucide-react';
import { ALL_ONNX_MODELS } from '../../data/onnxModelsData';

export const ModelDocumentationTab: React.FC = () => {
  return (
    <div className="space-y-6 text-xs text-slate-300">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          Comprehensive ONNX Model Documentation: Microsoft Sparrow, MegaDetector &amp; PyTorch Wildlife
        </h3>
        <p className="text-slate-400 mt-1 leading-relaxed">
          Technical specifications, tensor shapes, quantization schemes, and hardware deployment references for all
          11 pre-trained ONNX models integrated into the Gharial ISPA Bioacoustic &amp; Visual Surveillance platform.
        </p>
      </div>

      {/* Comparison Master Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3 bg-slate-950 border-b border-slate-800 font-bold text-white text-xs flex items-center justify-between">
          <span>Master Architecture &amp; Latency Reference</span>
          <span className="text-[10px] text-slate-400 font-mono">11 Models Registered</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/70 text-[10px] text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Model Filename</th>
                <th className="p-2.5">Architecture</th>
                <th className="p-2.5">Input Shape</th>
                <th className="p-2.5">Precision</th>
                <th className="p-2.5">Edge Latency</th>
                <th className="p-2.5">Primary Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
              {ALL_ONNX_MODELS.map((model) => (
                <tr key={model.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-2.5 font-sans">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        model.category === 'MegaDetector'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : model.category === 'Microsoft Sparrow'
                          ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {model.category}
                    </span>
                  </td>
                  <td className="p-2.5 text-white font-semibold">{model.filename}</td>
                  <td className="p-2.5 text-slate-300">{model.architecture}</td>
                  <td className="p-2.5 text-emerald-400">{model.inputShape}</td>
                  <td className="p-2.5 text-sky-400">{model.quantization}</td>
                  <td className="p-2.5 text-amber-300 font-bold">{model.latencyEdgeMs} ms</td>
                  <td className="p-2.5 text-slate-400 text-[10px] font-sans">
                    {model.supportedHardware[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep-Dive Sections */}
      <div className="space-y-4">
        {/* MegaDetector Suite */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              1. MegaDetector Wildlife Detection Family
            </h4>
            <span className="text-[10px] text-slate-400">Maintained by Microsoft AI for Earth &amp; AgentMorris</span>
          </div>
          <p className="leading-relaxed">
            MegaDetector is the global standard for wildlife camera trap object detection. In this platform, MegaDetector
            runs in real time over incoming camera streams (OV2640, Enclosure 4K, or USB Webcam) to isolate wild animals,
            exclude false positives from vegetation or enclosure maintenance crew, and bound regions of interest.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-white block mb-1">MegaDetector v5a (YOLOv5x6)</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Trained on over 4.5 million camera trap images. Features 1280x1280 high-resolution input resolution
                specifically optimized for small, camouflaged hatchlings basking against coarse river sandbanks.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-white block mb-1">MegaDetector v6 (YOLOv8x &amp; RT-DETR)</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Anchor-free object detection head eliminates hyperparameter tuning for bounding box priors. RT-DETR
                transformer variant removes non-maximum suppression (NMS) latency spikes on embedded edge devices.
              </p>
            </div>
          </div>
        </div>

        {/* Microsoft Sparrow Bioacoustic Suite */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4" />
              2. Microsoft Sparrow Bioacoustic &amp; Infrasound Models
            </h4>
            <span className="text-[10px] text-slate-400">Specialized for MCBT Gharial ISPA Dictionary</span>
          </div>
          <p className="leading-relaxed">
            Microsoft Sparrow models process raw hydrophone waveforms and PDM digital microphone streams. They provide
            real-time phoneme classification across the 13 Interspecies Phonetic Alphabet (ISPA) tokens, along with specialized
            infrasonic analysis below 20Hz.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-white block mb-1">sparrow_acoustic_ispa_13class.onnx</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                ConvNeXt-V2-Nano backbone processing 128-band Mel-spectrograms. Classifies POP (impulsive pop), SAV (subaudible
                torso vibration), BR (breathe-roar), HC (hatchling chirp), CC (contact quack), SN (snorting hiss), and JC (jaw clap).
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-white block mb-1">sparrow_infrasound_detector_20hz.onnx</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Operates in the 12 Hz &ndash; 35 Hz seismic hydrophone channel to detect male gharial "water dance" torso vibrations
                inaudible to human ears before the audible roar erupts.
              </p>
            </div>
          </div>
        </div>

        {/* PyTorch Wildlife Suite */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              3. PyTorch Wildlife (PTW) Morphometrics &amp; Keypoints
            </h4>
            <span className="text-[10px] text-slate-400">Ecological Computer Vision &amp; Taxa Delineation</span>
          </div>
          <p className="leading-relaxed">
            PyTorch Wildlife models provide anatomical landmarks and fine-grained species classification to distinguish
            Gavialis gangeticus from sympatric crocodilians like Mugger (Crocodylus palustris) and Saltwater crocodiles.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-white block mb-1">ptw_gharial_keypoints.onnx</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                8-point skeletal landmark estimator locating the ghara narial bulb, rostral tip, nostril apertures, and eye orbits
                for biometric sexual dimorphism and individual identification.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-white block mb-1">ptw_creche_counter.onnx</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Congested scene density map regression model counting up to 60 individual hatchlings clustered on a sandbank
                under maternal or adult male creche guardianship.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

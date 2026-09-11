import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, ExternalLink, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already installed, show small badge or return null
  if (isInstalled) {
    return (
      <div
        className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-mono"
        title="Running as an installed WebAPK / PWA"
      >
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span>WebAPK Active</span>
      </div>
    );
  }

  const handleAction = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        id="pwa-install-btn"
        onClick={handleAction}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-colors shadow-sm cursor-pointer"
        title="Install as Android WebAPK or Desktop PWA"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install WebAPK</span>
        <span className="sm:hidden">Install</span>
      </button>

      {/* Guide Modal for WebAPK & PWA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Install WebAPK / PWA</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed">
              <p className="text-slate-300">
                Install the <strong>Gharial ISPA Sparrow RLHF</strong> workbench to your Android device, tablet, or desktop for zero-latency bioacoustic monitoring at MCBT:
              </p>

              {isIOS ? (
                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 space-y-1.5">
                  <span className="font-semibold text-sky-300 block">iOS / Safari Instructions:</span>
                  <p className="text-slate-300">
                    1. Tap the <strong>Share</strong> icon in the Safari bottom bar.<br />
                    2. Scroll down and select <strong>Add to Home Screen</strong>.<br />
                    3. Launch from your home screen for standalone fullscreen experience.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 space-y-1.5">
                  <span className="font-semibold text-emerald-300 block">Android (WebAPK) & Chrome / Edge:</span>
                  <p className="text-slate-300">
                    1. Tap the browser menu (<strong className="text-white">&vellip;</strong>) in Chrome on Android.<br />
                    2. Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.<br />
                    3. Android automatically compiles a native <strong>WebAPK</strong> registered with Android Package Manager with offline hydrophone caching!
                  </p>
                </div>
              )}

              <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/60 space-y-1">
                <span className="font-semibold text-emerald-300 block">Live Cloud Build URL:</span>
                <a
                  href="https://ais-pre-mmuuwcpohdumz46mslp3qu-219346993343.asia-southeast1.run.app"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px] break-all"
                >
                  https://ais-pre-mmuuwcpohdumz46mslp3qu-219346993343.asia-southeast1.run.app
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                Close
              </button>
              {isInstallable && (
                <button
                  onClick={async () => {
                    await install();
                    setShowModal(false);
                  }}
                  className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors"
                >
                  Prompt Install
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

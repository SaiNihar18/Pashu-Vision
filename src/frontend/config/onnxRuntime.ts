/**
 * ONNX Runtime Web setup for Vite.
 * Uses the CDN for WASM binaries ? avoids /public import errors.
 */
import * as ort from 'onnxruntime-web';
import type { ProgressReporter } from '../services/modelLoadProgress';

const ONNX_VERSION = '1.22.0';
const WASM_CDN_BASE = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ONNX_VERSION}/dist/`;

ort.env.wasm.wasmPaths = WASM_CDN_BASE;
ort.env.wasm.numThreads = 1;
ort.env.logLevel = 'warning';

let runtimeReadyPromise: Promise<void> | null = null;

/** Pre-download WASM/MJS from CDN once per session (shows real download progress). */
export async function ensureOnnxRuntimeReady(onProgress?: ProgressReporter): Promise<void> {
  if (runtimeReadyPromise) {
    return runtimeReadyPromise;
  }

  runtimeReadyPromise = (async () => {
    const assets = [
      { name: 'ort-wasm-simd-threaded.jsep.wasm', weight: 0.92 },
      { name: 'ort-wasm-simd-threaded.jsep.mjs', weight: 0.08 },
    ];

    let completedWeight = 0;

    for (const asset of assets) {
      const url = `${WASM_CDN_BASE}${asset.name}`;
      onProgress?.({
        stage: 'wasm',
        percent: 5 + Math.round(completedWeight * 14),
        message: 'Downloading AI engine',
        subMessage: `Fetching ${asset.name} from CDN`,
      });

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download ONNX runtime file: ${asset.name}`);
      }

      await response.arrayBuffer();
      onProgress?.({
        stage: 'wasm',
        percent: 5 + Math.round((completedWeight + asset.weight) * 14),
        message: 'Downloading AI engine',
        subMessage: `${asset.name} downloaded`,
      });

      completedWeight += asset.weight;
    }

    onProgress?.({
      stage: 'wasm',
      percent: 20,
      message: 'AI engine ready',
      subMessage: 'ONNX Runtime loaded',
    });
  })();

  return runtimeReadyPromise;
}

export { ort };

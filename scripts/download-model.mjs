/**
 * Post-build script: ensures the real ONNX model binary is in dist/.
 *
 * On Vercel the Git LFS pointer (~130 bytes) ends up in dist/ instead of
 * the actual 90 MB model. This script detects that and downloads the real
 * model from GitHub Releases so Vercel serves the correct file.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
import { get } from 'https';

const MODEL_DIR  = join('dist', 'models', 'breed_classifier');
const MODEL_FILE = join(MODEL_DIR, 'breed_classifier.onnx');
const MIN_SIZE   = 1_000_000; // 1 MB — anything smaller is an LFS pointer

const GITHUB_RELEASES_URL =
  'https://github.com/SaiNihar18/Pashu-Vision/releases/download/v1.0-model/breed_classifier.onnx';

function isLfsPointer(filePath) {
  try {
    const buf = readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    return buf.startsWith('version https://git-lfs.github.com/spec/');
  } catch {
    return false;
  }
}

function needsDownload() {
  if (!existsSync(MODEL_FILE)) {
    console.log('📦 Model file not found in dist — will download.');
    return true;
  }
  const size = statSync(MODEL_FILE).size;
  if (size < MIN_SIZE) {
    console.log(`📦 Model file is only ${size} bytes (LFS pointer?) — will download.`);
    return true;
  }
  if (isLfsPointer(MODEL_FILE)) {
    console.log('📦 Model file is a Git LFS pointer — will download.');
    return true;
  }
  console.log(`✅ Model file looks valid (${(size / (1024 * 1024)).toFixed(1)} MB). Skipping download.`);
  return false;
}

/**
 * Follow redirects (GitHub releases redirect to a CDN).
 * Returns a Promise that resolves with the full response body as a Buffer.
 */
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const request = get(url, (res) => {
      // Handle redirects (301, 302)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`  ↳ Redirect → ${res.headers.location.slice(0, 80)}…`);
        return downloadFile(res.headers.location).then(resolve, reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }

      const contentLength = parseInt(res.headers['content-length'] || '0', 10);
      console.log(`  ↳ Downloading ${contentLength ? (contentLength / (1024 * 1024)).toFixed(1) + ' MB' : 'unknown size'}…`);

      const chunks = [];
      let received = 0;
      let lastPct = -1;

      res.on('data', (chunk) => {
        chunks.push(chunk);
        received += chunk.length;
        if (contentLength) {
          const pct = Math.floor((received / contentLength) * 100);
          if (pct % 10 === 0 && pct !== lastPct) {
            lastPct = pct;
            process.stdout.write(`  ↳ ${pct}% (${(received / (1024 * 1024)).toFixed(1)} MB)\n`);
          }
        }
      });

      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log(`  ✅ Download complete: ${(buffer.length / (1024 * 1024)).toFixed(1)} MB`);
        resolve(buffer);
      });

      res.on('error', reject);
    });

    request.on('error', reject);
    request.setTimeout(120_000, () => {
      request.destroy();
      reject(new Error('Download timed out after 120 seconds'));
    });
  });
}

async function main() {
  console.log('\n🔍 Checking ONNX model in build output…');

  if (!needsDownload()) {
    return;
  }

  console.log(`\n⬇️  Downloading model from GitHub Releases…`);
  console.log(`   ${GITHUB_RELEASES_URL}\n`);

  try {
    const data = await downloadFile(GITHUB_RELEASES_URL);

    // Verify minimum size
    if (data.length < MIN_SIZE) {
      throw new Error(`Downloaded file is too small (${data.length} bytes). Expected ~90 MB.`);
    }

    // Ensure output directory exists
    mkdirSync(MODEL_DIR, { recursive: true });
    writeFileSync(MODEL_FILE, data);

    console.log(`\n✅ Model saved to ${MODEL_FILE} (${(data.length / (1024 * 1024)).toFixed(1)} MB)`);
  } catch (err) {
    console.error(`\n❌ Failed to download model: ${err.message}`);
    console.error('   The app will fall back to the intelligent predictor on Vercel.');
    // Don't fail the build — the app has a fallback
    process.exit(0);
  }
}

main();

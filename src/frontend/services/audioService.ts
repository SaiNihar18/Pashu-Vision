/**
 * Audio helpers for handling text-to-speech playback from the Gemini API.
 */

const playWithAudioElement = (audioData: string, mimeType: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    try {
      const dataUrl = `data:${mimeType};base64,${audioData}`;
      const audio = new Audio(dataUrl);
      audio.preload = 'auto';
      resolve(audio);
      audio.onerror = (ev) => {
        const detail = (ev && (ev as any).message) || 'onerror';
        reject(new Error(`Audio element playback ${mimeType} failed: ${detail}`));
      };
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)));
    }
  });
};

export type PlaybackHandle = {
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  isPaused: () => boolean;
  isPlaying: () => boolean;
  finished: Promise<void>;
};

export const playPcmAudio = (audioData: string): PlaybackHandle => {
  // If audioData empty, resolve immediately
  if (!audioData || audioData.trim() === '') {
    return {
      play: async () => {},
      pause: () => {},
      stop: () => {},
      isPaused: () => false,
      isPlaying: () => false,
      finished: Promise.resolve(),
    };
  }

  let audioElement: HTMLAudioElement | null = null;
  let finishedResolve: (() => void) | null = null;
  let finishedReject: ((error: unknown) => void) | null = null;
  const finished = new Promise<void>((resolve, reject) => {
    finishedResolve = resolve;
    finishedReject = reject;
  });

  const detectMimeFromBase64 = (b64: string): string | null => {
    try {
      const binaryString = atob(audioData);
      const header = binaryString.slice(0, 4);
      const bytes = Array.from(header).map((c) => c.charCodeAt(0));
      // 'RIFF' -> WAV
      if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return 'audio/wav';
      // 'ID3' -> MP3 with ID3 tag
      if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return 'audio/mpeg';
      // OggS -> OGG
      if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return 'audio/ogg';
      // WebM/Matroska signature 0x1A 0x45 0xDF 0xA3
      if (bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) return 'audio/webm';
      // MP3 frame sync 0xFF 0xFB or 0xFF 0xF3 or 0xFF 0xF2
      if (bytes[0] === 0xFF && (bytes[1] === 0xFB || bytes[1] === 0xF3 || bytes[1] === 0xF2)) return 'audio/mpeg';
    } catch (err) {
      // ignore
    }
    return null;
  };

  const ensureAudioElement = async (): Promise<HTMLAudioElement> => {
    if (audioElement) {
      return audioElement;
    }

    const guessed = detectMimeFromBase64(audioData);
    const mimeTypes = guessed
      ? [guessed, 'audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm']
      : ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm'];

    let lastErr: unknown = null;
    for (const mime of mimeTypes) {
      try {
        audioElement = await playWithAudioElement(audioData, mime);
        audioElement.onended = () => {
          finishedResolve?.();
        };
        audioElement.onerror = (ev) => {
          const detail = (ev && (ev as any).message) || 'onerror';
          finishedReject?.(new Error(`Audio element playback failed: ${detail}`));
        };
        return audioElement;
      } catch (e) {
        lastErr = e;
        console.warn(`Audio element playback failed for mime ${mime}:`, e);
      }
    }

    throw lastErr || new Error('Audio element playback failed for all tried mime types');
  };

  const play = async () => {
    const audio = await ensureAudioElement();
    try {
      await audio.play();
    } catch (err) {
      finishedReject?.(err);
      throw err;
    }
  };

  const pause = () => {
    try {
      audioElement?.pause();
    } catch (_) {}
  };

  const stop = () => {
    try {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    } catch (_) {}
  };

  return {
    play,
    pause,
    stop,
    isPaused: () => !!audioElement?.paused,
    isPlaying: () => !!audioElement && !audioElement.paused && !audioElement.ended,
    finished,
  };
};
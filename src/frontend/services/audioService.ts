/**
 * Audio service for handling PCM audio playback from text-to-speech responses
 */

/**
 * Plays PCM audio data from the TTS API
 * Since we're using Web Speech API fallback, this function will handle both cases
 * @param audioData - Base64 encoded PCM audio data (or empty string for Web Speech API)
 */
let activeAudio: HTMLAudioElement | null = null;
let activeSource: AudioBufferSourceNode | null = null;
let activeContext: AudioContext | null = null;

export const stopAudioPlayback = (): void => {
  if (activeSource) {
    try {
      activeSource.stop();
    } catch {
      // ignore stop errors
    }
    activeSource.disconnect();
    activeSource = null;
  }

  if (activeContext) {
    activeContext.close().catch(() => {});
    activeContext = null;
  }

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
};

const playWithAudioElement = (audioData: string, mimeType: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    stopAudioPlayback();
    const audio = new Audio(`data:${mimeType};base64,${audioData}`);
    activeAudio = audio;
    audio.onended = () => {
      activeAudio = null;
      resolve();
    };
    audio.onerror = () => {
      activeAudio = null;
      reject(new Error('Failed to play audio'));
    };
    audio.play().catch(() => {
      activeAudio = null;
      reject(new Error('Failed to play audio'));
    });
  });
};

export const playPcmAudio = async (audioData: string): Promise<void> => {
  try {
    // If audioData is empty, it means the Web Speech API was used directly
    // and the speech has already been played
    if (!audioData || audioData.trim() === '') {
      return Promise.resolve();
    }

    // Convert base64 to ArrayBuffer
    const binaryString = atob(audioData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    activeContext = audioContext;
    
    try {
      // Try decoding as raw audio first
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);

      const source = audioContext.createBufferSource();
      activeSource = source;
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);

      return new Promise((resolve) => {
        source.onended = () => {
          activeSource = null;
          audioContext.close().catch(() => {});
          activeContext = null;
          resolve();
        };
      });
    } catch (decodeError) {
      // Fallback to browser audio element for encoded audio formats
      try {
        await playWithAudioElement(audioData, 'audio/wav');
        return;
      } catch {
        try {
          await playWithAudioElement(audioData, 'audio/mpeg');
          return;
        } catch {
          await playWithAudioElement(audioData, 'audio/mp3');
        }
      }
    }
  } catch (error) {
    console.error('Error playing PCM audio:', error);
    throw new Error('Failed to play audio');
  }
};
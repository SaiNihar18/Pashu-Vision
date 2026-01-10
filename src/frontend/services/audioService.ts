/**
 * Audio service for handling PCM audio playback from text-to-speech responses
 */

/**
 * Plays PCM audio data from the TTS API
 * Since we're using Web Speech API fallback, this function will handle both cases
 * @param audioData - Base64 encoded PCM audio data (or empty string for Web Speech API)
 */
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
    
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
    
    // Create and connect audio source
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    // Play the audio
    source.start(0);
    
    // Return a promise that resolves when audio finishes playing
    return new Promise((resolve) => {
      source.onended = () => {
        audioContext.close();
        resolve();
      };
    });
  } catch (error) {
    console.error('Error playing PCM audio:', error);
    throw new Error('Failed to play audio');
  }
};
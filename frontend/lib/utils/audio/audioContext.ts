interface WindowWithWebkit extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const windowWithWebkit = window as WindowWithWebkit;
  const AudioContextConstructor = window.AudioContext || windowWithWebkit.webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  return new AudioContextConstructor();
}

export function isAudioContextSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const windowWithWebkit = window as WindowWithWebkit;
  return !!(window.AudioContext || windowWithWebkit.webkitAudioContext);
}

export const isLowEndDevice = () => {
  if (typeof navigator === "undefined") {
    return false;
  }

  const nav = navigator as Navigator & {
    deviceMemory?: number;
  };
  const memory = nav.deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency || 4;

  return memory <= 4 || cores <= 4;
};

export const getPreferredPixelRatio = (lowEnd = isLowEndDevice()) => {
  if (typeof window === "undefined") {
    return 1;
  }

  return lowEnd ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
};

export const getTargetFrameInterval = (lowEnd = isLowEndDevice()) =>
  lowEnd ? 48 : 32;

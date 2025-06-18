
export const DEVICE_SPECS = {
  mobile: {
    width: 375,
    height: 812,
    scale: 1,
    name: 'iPhone 13'
  },
  tablet: {
    width: 768,
    height: 1024,
    scale: 0.8,
    name: 'iPad'
  }
};

// Updated mobile format specs for 1080×1920px with better preview scale
export const MOBILE_FORMAT_SPECS = {
  width: 1080,
  height: 1920,
  aspectRatio: 1080 / 1920,
  previewScale: 0.35 // Increased scale for better visibility
};

export const PREVIEW_CONTAINER_SPECS = {
  mobile: {
    width: MOBILE_FORMAT_SPECS.width * MOBILE_FORMAT_SPECS.previewScale,
    height: MOBILE_FORMAT_SPECS.height * MOBILE_FORMAT_SPECS.previewScale,
    scale: MOBILE_FORMAT_SPECS.previewScale
  },
  tablet: {
    width: 768,
    height: 1024,
    scale: 0.8
  }
};

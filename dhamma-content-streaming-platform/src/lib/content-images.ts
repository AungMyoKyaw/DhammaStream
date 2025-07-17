/**
 * Utility functions for handling content cover images
 */

export type ContentType = "video" | "audio" | "ebook" | "other";

/**
 * Returns a default cover image data URL for the given content type
 */
export function getDefaultCoverImage(contentType: ContentType): string {
  const baseSize = 400;

  switch (contentType) {
    case "video": {
      const videoSvg = `<svg width="${baseSize}" height="${Math.round(baseSize * 0.5625)}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="videoGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" /><stop offset="100%" style="stop-color:#ee5a52;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#videoGrad)"/><text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="24" fill="white">VIDEO</text></svg>`;
      return `data:image/svg+xml,${encodeURIComponent(videoSvg)}`;
    }

    case "audio": {
      const audioSvg = `<svg width="${baseSize}" height="${baseSize}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="audioGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#4ecdc4;stop-opacity:1" /><stop offset="100%" style="stop-color:#44a08d;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" rx="8" fill="url(#audioGrad)"/><text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="24" fill="white">AUDIO</text></svg>`;
      return `data:image/svg+xml,${encodeURIComponent(audioSvg)}`;
    }

    case "ebook": {
      const ebookSvg = `<svg width="${baseSize}" height="${Math.round(baseSize * 1.333)}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#a8e6cf;stop-opacity:1" /><stop offset="100%" style="stop-color:#81c784;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" rx="8" fill="url(#bookGrad)"/><text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="24" fill="white">BOOK</text></svg>`;
      return `data:image/svg+xml,${encodeURIComponent(ebookSvg)}`;
    }

    default: {
      const defaultSvg = `<svg width="${baseSize}" height="${baseSize}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ddd6fe;stop-opacity:1" /><stop offset="100%" style="stop-color:#c4b5fd;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" rx="8" fill="url(#defaultGrad)"/><text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="24" fill="white">FILE</text></svg>`;
      return `data:image/svg+xml,${encodeURIComponent(defaultSvg)}`;
    }
  }
}

/**
 * Returns the aspect ratio class for different content types
 */
export function getContentAspectRatio(contentType: ContentType): string {
  switch (contentType) {
    case "video":
      return "aspect-video";
    case "ebook":
      return "aspect-[3/4]";
    case "audio":
    default:
      return "aspect-square";
  }
}

/**
 * Returns the content type configuration
 */
export function getContentTypeConfig(contentType: ContentType) {
  const configs = {
    video: { icon: "📹", color: "red" },
    audio: { icon: "🎧", color: "blue" },
    ebook: { icon: "📚", color: "green" },
    other: { icon: "📄", color: "gray" }
  } as const;

  return configs[contentType] || configs.other;
}

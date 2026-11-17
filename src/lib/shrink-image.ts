// Turns a photo or a frame of a video into a small JPEG the AI can read.
export async function fileToSmallJpeg(file: File, max = 1024): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    let src: CanvasImageSource; let w: number; let h: number;
    if (file.type.startsWith("video/")) {
      const v = document.createElement("video");
      v.muted = true; v.playsInline = true; v.src = url;
      await new Promise((r, j) => { v.onloadeddata = r; v.onerror = j; });
      v.currentTime = Math.min(1, (v.duration || 2) / 2);
      await new Promise((r) => { v.onseeked = r; });
      src = v; w = v.videoWidth; h = v.videoHeight;
    } else {
      const img = new Image(); img.src = url; await img.decode();
      src = img; w = img.naturalWidth; h = img.naturalHeight;
    }
    const s = Math.min(1, max / Math.max(w, h));
    const c = document.createElement("canvas");
    c.width = Math.round(w * s); c.height = Math.round(h * s);
    c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.8);
  } finally { URL.revokeObjectURL(url); }
}

export type VirtualTourKind = 'model3d' | 'panorama';

const MODEL_VIEWER_SCRIPT = 'https://unpkg.com/@google/model-viewer@3/dist/model-viewer.min.js';
const PANNELLUM_CSS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
const PANNELLUM_JS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';

export function safeTourUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function buildTourHtml(url: string, kind: VirtualTourKind): string {
  const safeUrl = safeTourUrl(url);
  if (!safeUrl) throw new Error('Invalid virtual tour URL');

  if (kind === 'model3d') {
    const attributeUrl = safeUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<script type="module" src="${MODEL_VIEWER_SCRIPT}"></script>
<style>html,body{margin:0;height:100%;background:#0e0e0f}model-viewer{width:100%;height:100%}</style></head>
<body><model-viewer src="${attributeUrl}" camera-controls auto-rotate shadow-intensity="1" exposure="1" ar></model-viewer></body></html>`;
  }

  const scriptUrl = JSON.stringify(safeUrl).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="${PANNELLUM_CSS}">
<script src="${PANNELLUM_JS}"></script>
<style>html,body{margin:0;height:100%}#panorama{width:100%;height:100%}</style></head>
<body><div id="panorama"></div>
<script>
pannellum.viewer('panorama', { type: 'equirectangular', panorama: ${scriptUrl}, autoLoad: true, showZoomCtrl: false });
</script></body></html>`;
}

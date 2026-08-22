// Web entry. CanvasKit (Skia's WebAssembly build) must finish loading before
// any module that imports @shopify/react-native-skia is evaluated — otherwise
// rendering the field canvas throws "CanvasKit is not defined". So we wait for
// it here, before the router (and its lazily-loaded show route) is rendered.
// The wasm itself is served from public/canvaskit.wasm (see setup-skia-web).
// In the static export the JS bundle lives at /_expo/static/js/web/, and
// CanvasKit resolves the wasm relative to that URL, so point it at the root.
import '@expo/metro-runtime';

import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

// Show a minimal loading state while CanvasKit downloads (~3MB gzipped);
// expo-splash-screen is not supported on web.
const loadingEl = typeof document !== 'undefined'
    ? document.createElement('div')
    : null;
if (loadingEl) {
    loadingEl.textContent = 'Loading…';
    loadingEl.style.cssText =
        'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;' +
        'font-family:system-ui,sans-serif;color:#9e9e9e;background:#fff';
    document.body.appendChild(loadingEl);
}

LoadSkiaWeb({ locateFile: () => '/canvaskit.wasm' }).then(async () => {
    renderRootComponent(App);
    loadingEl?.remove();
});

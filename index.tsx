// Native entry. Mirrors `expo-router/entry` (entry-classic); the web entry
// (index.web.tsx) additionally waits for CanvasKit before rendering.
import '@expo/metro-runtime';

import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

// This file should only import and register the root. No components or exports
// should be added here.
renderRootComponent(App);

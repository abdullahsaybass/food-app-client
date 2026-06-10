// ─── Font patch must be first — before any component is imported ───────────
import './src/setup/fontPatch';
// ──────────────────────────────────────────────────────────────────────────

import { registerRootComponent } from 'expo';
import App from './app';

registerRootComponent(App);
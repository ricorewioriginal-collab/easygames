/* Einstieg: stellt Babylon.js für das Spiel bereit (window.AMC_BJS). */
import { createRenderer } from './renderer.js';
import * as B from './babylon.js';
import { fx } from './fx.js';
const api = { createRenderer, fx, B, version: '9.37.1' };
if (typeof window !== 'undefined') window.AMC_BJS = api;
export default api;

/**
 * Video Service — re-exports from videoGenerationService
 */
export { generateVideo } from './videoGenerationService';

import type { VideoEngine } from '../types';

const ENGINE_COSTS: Record<string, number> = {
  'ltx-2': 50,
  'sora-2-pro': 200,
  'veo-3': 150,
  'luma': 100,
  'kling': 80,
};

export function getEngineCost(engine: VideoEngine): number {
  return ENGINE_COSTS[engine] || 100;
}

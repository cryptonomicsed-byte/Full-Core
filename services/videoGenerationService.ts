import { VideoGenerationRequest } from '../types-extended';
import { hybridStorage } from './hybridStorageService';
import { useStore } from '../store';
import { costTrackingService } from './costTrackingService';

interface GeneratedVideo {
  id: string;
  prompt: string;
  provider: string;
  url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration: number;
  aspectRatio: string;
  cost?: number;
  createdAt: Date;
  completedAt?: Date;
}

class VideoGenerationService {
  private providerConfigs: Map<string, any> = new Map();

  async initialize(): Promise<void> {
    const stored = await hybridStorage.get('video-provider-configs');
    if (stored) {
      Object.entries(stored).forEach(([provider, config]) => {
        this.providerConfigs.set(provider, config);
      });
    }
    console.log('✅ Video generation service initialized');
  }

  async generate(request: VideoGenerationRequest): Promise<GeneratedVideo> {
    const { providers } = useStore.getState();
    const activeVideo = providers.activeVideo || 'google-veo';
    const provider = request.provider || activeVideo;
    const duration = request.duration || 5;
    const aspectRatio = request.aspectRatio || '16:9';

    let video: GeneratedVideo;

    try {
      switch (provider) {
        case 'openai-sora':
          video = await this.generateWithSora(request, duration, aspectRatio);
          break;
        case 'google-veo':
          video = await this.generateWithGoogleVeo(request, duration, aspectRatio);
          break;
        case 'runway':
          video = await this.generateWithRunway(request, duration, aspectRatio);
          break;
        case 'kling':
          video = await this.generateWithKling(request, duration, aspectRatio);
          break;
        case 'luma':
          video = await this.generateWithLuma(request, duration, aspectRatio);
          break;
        case 'ltx-2':
          video = await this.generateWithLTX2(request, duration, aspectRatio);
          break;
        default:
          video = await this.generateWithGoogleVeo(request, duration, aspectRatio);
      }
    } catch (error) {
      console.error(`Video generation failed (${provider}):`, error);
      // Fallback to Google Veo
      video = await this.generateWithGoogleVeo(request, duration, aspectRatio);
    }

    // Track cost
    if (video.cost) {
      await costTrackingService.logUsage({
        provider,
        operationType: 'video_generation',
        cost: video.cost,
        metadata: { duration, aspectRatio }
      });
    }

    // Log
    const videos = (await hybridStorage.get('video-generations')) || [];
    videos.push(video);
    await hybridStorage.set('video-generations', videos);

    console.log(`✅ Video queued: ${video.id} (${provider})`);
    return video;
  }

  private async generateWithSora(
    request: VideoGenerationRequest,
    duration: number,
    aspectRatio: string
  ): Promise<GeneratedVideo> {
    console.log('🎬 Queuing with OpenAI Sora...');
    
    return {
      id: `sora-${Date.now()}`,
      prompt: request.prompt,
      provider: 'openai-sora',
      status: 'pending',
      duration,
      aspectRatio,
      cost: 0.20,
      createdAt: new Date()
    };
  }

  private async generateWithGoogleVeo(
    request: VideoGenerationRequest,
    duration: number,
    aspectRatio: string
  ): Promise<GeneratedVideo> {
    console.log('🎬 Queuing with Google Veo...');
    
    return {
      id: `veo-${Date.now()}`,
      prompt: request.prompt,
      provider: 'google-veo',
      status: 'pending',
      duration,
      aspectRatio,
      cost: 0.15,
      createdAt: new Date()
    };
  }

  private async generateWithRunway(
    request: VideoGenerationRequest,
    duration: number,
    aspectRatio: string
  ): Promise<GeneratedVideo> {
    console.log('🎬 Queuing with Runway...');
    
    return {
      id: `runway-${Date.now()}`,
      prompt: request.prompt,
      provider: 'runway',
      status: 'pending',
      duration,
      aspectRatio,
      cost: 0.10,
      createdAt: new Date()
    };
  }

  private async generateWithKling(
    request: VideoGenerationRequest,
    duration: number,
    aspectRatio: string
  ): Promise<GeneratedVideo> {
    console.log('🎬 Queuing with Kling...');
    
    return {
      id: `kling-${Date.now()}`,
      prompt: request.prompt,
      provider: 'kling',
      status: 'pending',
      duration,
      aspectRatio,
      cost: 0.05,
      createdAt: new Date()
    };
  }

  private async generateWithLuma(
    request: VideoGenerationRequest,
    duration: number,
    aspectRatio: string
  ): Promise<GeneratedVideo> {
    console.log('🎬 Queuing with Luma...');
    
    return {
      id: `luma-${Date.now()}`,
      prompt: request.prompt,
      provider: 'luma',
      status: 'pending',
      duration,
      aspectRatio,
      cost: 0.08,
      createdAt: new Date()
    };
  }

  private async generateWithLTX2(
    request: VideoGenerationRequest,
    duration: number,
    aspectRatio: string
  ): Promise<GeneratedVideo> {
    console.log('🎬 Queuing with LTX-2...');
    
    return {
      id: `ltx2-${Date.now()}`,
      prompt: request.prompt,
      provider: 'ltx-2',
      status: 'pending',
      duration,
      aspectRatio,
      cost: 0.12,
      createdAt: new Date()
    };
  }

  private async generateWithBBB(
    request: VideoGenerationRequest,
    duration: number,
    aspectRatio: string
  ): Promise<GeneratedVideo> {
    console.log('🎬 Using Big Buck Bunny fallback video...');
    
    // Big Buck Bunny - free, open-source demo video
    return {
      id: `bbb-${Date.now()}`,
      prompt: request.prompt,
      provider: 'bbb-fallback',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
      status: 'completed',
      duration: 9, // BBB is 9:56
      aspectRatio: '16:9',
      cost: 0,
      createdAt: new Date(),
      completedAt: new Date()
    };
  }

  async generateBatch(requests: VideoGenerationRequest[]): Promise<GeneratedVideo[]> {
    console.log(`🎬 Batch queuing ${requests.length} videos...`);
    
    const results = await Promise.all(
      requests.map(req => this.generate(req))
    );

    console.log(`✅ Batch queued: ${results.length} videos`);
    return results;
  }

  async getVideoStatus(id: string): Promise<GeneratedVideo | null> {
    const videos = (await hybridStorage.get('video-generations')) || [];
    return videos.find((v: GeneratedVideo) => v.id === id) || null;
  }

  async getGenerationHistory(limit = 50): Promise<GeneratedVideo[]> {
    const videos = (await hybridStorage.get('video-generations')) || [];
    return videos.slice(-limit);
  }

  async updateStatus(id: string, status: 'pending' | 'processing' | 'completed' | 'failed', url?: string): Promise<void> {
    const videos = (await hybridStorage.get('video-generations')) || [];
    const video = videos.find((v: GeneratedVideo) => v.id === id);
    
    if (video) {
      video.status = status;
      if (url) video.url = url;
      if (status === 'completed') video.completedAt = new Date();
      
      await hybridStorage.set('video-generations', videos);
      console.log(`✅ Video status updated: ${id} -> ${status}`);
    }
  }

  getAvailableProviders(): string[] {
    return [
      'openai-sora',
      'google-veo',
      'runway',
      'kling',
      'luma',
      'ltx-2',
      'hunyuan-video',
      'mochi',
      'pika',
      'heygen',
      'synthesia',
      'deepbrain',
      'replicate',
      'bbb-fallback'
    ];
  }

  async estimateCost(provider: string, count = 1, duration = 5): Promise<number> {
    const costs: Record<string, number> = {
      'openai-sora': 0.20,
      'google-veo': 0.15,
      'runway': 0.10,
      'kling': 0.05,
      'luma': 0.08,
      'ltx-2': 0.12,
      'heygen': 0.15,
      'synthesia': 0.20,
      'bbb-fallback': 0
    };

    return (costs[provider] || 0.10) * count * (duration / 5);
  }

  async waitForCompletion(id: string, maxWaitSeconds = 300): Promise<GeneratedVideo | null> {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    while (Date.now() - startTime < maxWaitSeconds * 1000) {
      const video = await this.getVideoStatus(id);
      
      if (!video) return null;
      if (video.status === 'completed' || video.status === 'failed') {
        return video;
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Video generation timeout: ${id}`);
  }
}

export const videoGenerationService = new VideoGenerationService();

export async function generateVideo(
  prompt: string,
  provider: string,
  onComplete?: (url: string) => void
): Promise<GeneratedVideo> {
  const video = await videoGenerationService.generate({
    prompt,
    provider,
  } as any);
  if (video.url && onComplete) {
    onComplete(video.url);
  }
  return video;
}

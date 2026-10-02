// Sonic Service - Audio branding and sonic identity generation
export interface SonicBrand {
  id: string;
  name: string;
  description?: string;
  audioUrl?: string;
  duration: number; // ms
  format: 'mp3' | 'wav' | 'ogg' | 'aac';
  useCases: SonicUseCase[];
  brandColors: string[];
  tempo: number; // BPM
  mood: 'energetic' | 'calm' | 'professional' | 'playful' | 'luxury';
  createdAt: Date;
  updatedAt: Date;
}

export interface SonicUseCase {
  name: string;
  type: 'logo' | 'notification' | 'transition' | 'alert' | 'theme' | 'jingle';
  duration: number;
  volume: number; // 0-100
}

export interface VoiceProfile {
  id: string;
  name: string;
  voiceId: string;
  provider: 'google' | 'azure' | 'amazon' | 'elevenlabs';
  language: string;
  gender: 'male' | 'female' | 'neutral';
  accent: string;
  style: string;
  sampleUrl?: string;
}

export interface SonicGeneration {
  id: string;
  brandId: string;
  type: 'logo' | 'notification' | 'transition' | 'custom';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  prompt: string;
  generatedUrl?: string;
  duration: number;
  createdAt: Date;
  completedAt?: Date;
}

class SonicService {
  private brands: Map<string, SonicBrand> = new Map();
  private voiceProfiles: Map<string, VoiceProfile> = new Map();
  private generations: Map<string, SonicGeneration> = new Map();
  private sonicLibrary: Map<string, { data: ArrayBuffer; metadata: Record<string, unknown> }> = new Map();

  async initialize(): Promise<void> {
    this.setupDefaultVoices();
  }

  private setupDefaultVoices(): void {
    const voices: VoiceProfile[] = [
      {
        id: 'voice_google_en',
        name: 'Google English (US)',
        voiceId: 'en-US-Neural2-A',
        provider: 'google',
        language: 'en-US',
        gender: 'female',
        accent: 'American',
        style: 'natural'
      },
      {
        id: 'voice_azure_en',
        name: 'Azure English (UK)',
        voiceId: 'en-GB-Ryan',
        provider: 'azure',
        language: 'en-GB',
        gender: 'male',
        accent: 'British',
        style: 'professional'
      },
      {
        id: 'voice_elevenlabs_premium',
        name: 'ElevenLabs Premium',
        voiceId: 'pNInz6obpgDQGcFmaJqB',
        provider: 'elevenlabs',
        language: 'en',
        gender: 'male',
        accent: 'American',
        style: 'premium'
      }
    ];

    voices.forEach(v => this.voiceProfiles.set(v.id, v));
  }

  async createSonicBrand(name: string, mood: SonicBrand['mood']): Promise<SonicBrand> {
    const brand: SonicBrand = {
      id: `sonic_${Date.now()}`,
      name,
      description: `${name} brand sonic identity`,
      duration: 5000,
      format: 'mp3',
      useCases: [],
      brandColors: this.generateBrandColors(),
      tempo: this.getTempoBPM(mood),
      mood,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.brands.set(brand.id, brand);
    return brand;
  }

  private generateBrandColors(): string[] {
    return [
      `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      `#${Math.floor(Math.random() * 16777215).toString(16)}`
    ];
  }

  private getTempoBPM(mood: SonicBrand['mood']): number {
    const tempos: Record<SonicBrand['mood'], number> = {
      energetic: 140,
      calm: 60,
      professional: 100,
      playful: 120,
      luxury: 80
    };
    return tempos[mood];
  }

  async addUseCase(brandId: string, useCase: SonicUseCase): Promise<void> {
    const brand = this.brands.get(brandId);
    if (!brand) {
      throw new Error(`Brand ${brandId} not found`);
    }

    brand.useCases.push(useCase);
    brand.updatedAt = new Date();
    this.brands.set(brandId, brand);
  }

  async generateSonicElement(
    brandId: string,
    type: 'logo' | 'notification' | 'transition' | 'custom',
    prompt: string
  ): Promise<SonicGeneration> {
    const brand = this.brands.get(brandId);
    if (!brand) {
      throw new Error(`Brand ${brandId} not found`);
    }

    const generation: SonicGeneration = {
      id: `sonic_gen_${Date.now()}`,
      brandId,
      type,
      status: 'pending',
      prompt,
      duration: this.getDefaultDuration(type),
      createdAt: new Date()
    };

    this.generations.set(generation.id, generation);

    // Simulate generation
    setTimeout(async () => {
      await this.completeGeneration(generation.id);
    }, 2000);

    return generation;
  }

  private getDefaultDuration(type: 'logo' | 'notification' | 'transition' | 'custom' | 'alert' | 'theme' | 'jingle'): number {
    const durations: Record<string, number> = {
      logo: 3000,
      notification: 1000,
      transition: 2000,
      alert: 1500,
      theme: 5000,
      jingle: 10000,
      custom: 4000
    };
    return durations[type] || 3000;
  }

  private async completeGeneration(generationId: string): Promise<void> {
    const generation = this.generations.get(generationId);
    if (!generation) return;

    // Mock audio buffer
    const audioData = new ArrayBuffer(44100); // 1 second at 44.1kHz
    this.sonicLibrary.set(generationId, {
      data: audioData,
      metadata: { format: 'wav', sampleRate: 44100 }
    });

    generation.status = 'completed';
    generation.generatedUrl = `/api/sonic/${generationId}`;
    generation.completedAt = new Date();
    this.generations.set(generationId, generation);
  }

  async synthesizeVoiceOver(voiceId: string, text: string, options?: Record<string, unknown>): Promise<ArrayBuffer> {
    const voice = this.voiceProfiles.get(voiceId);
    if (!voice) {
      throw new Error(`Voice ${voiceId} not found`);
    }

    // Mock voice synthesis
    // In production, call actual TTS API
    const audioData = new ArrayBuffer(44100 * 5); // 5 seconds
    return audioData;
  }

  async composeSonicIdentity(
    brandId: string,
    elements: Array<{ type: string; voiceId?: string; duration: number }>
  ): Promise<SonicBrand> {
    const brand = this.brands.get(brandId);
    if (!brand) {
      throw new Error(`Brand ${brandId} not found`);
    }

    const totalDuration = elements.reduce((sum, e) => sum + e.duration, 0);
    brand.duration = totalDuration;
    brand.audioUrl = `/api/sonic/identity/${brandId}`;
    brand.updatedAt = new Date();

    this.brands.set(brandId, brand);
    return brand;
  }

  async getSonicBrand(brandId: string): Promise<SonicBrand | null> {
    return this.brands.get(brandId) || null;
  }

  async listBrands(limit: number = 50): Promise<SonicBrand[]> {
    return Array.from(this.brands.values()).slice(-limit);
  }

  async getVoiceProfiles(): Promise<VoiceProfile[]> {
    return Array.from(this.voiceProfiles.values());
  }

  async getGeneration(generationId: string): Promise<SonicGeneration | null> {
    return this.generations.get(generationId) || null;
  }

  async listGenerations(brandId: string, limit: number = 50): Promise<SonicGeneration[]> {
    return Array.from(this.generations.values())
      .filter(g => g.brandId === brandId)
      .slice(-limit);
  }

  async downloadSonicFile(sonicId: string, format: 'mp3' | 'wav' | 'ogg'): Promise<ArrayBuffer | null> {
    return this.sonicLibrary.get(sonicId)?.data || null;
  }

  async getAudioFile(fileId: string): Promise<{ data: ArrayBuffer; metadata: Record<string, unknown> } | null> {
    return this.sonicLibrary.get(fileId) || null;
  }

  async getSonicStats(): Promise<{
    totalBrands: number;
    totalGenerations: number;
    completedGenerations: number;
    failedGenerations: number;
    totalAudioLibrarySize: number;
  }> {
    const generations = Array.from(this.generations.values());
    const completed = generations.filter(g => g.status === 'completed').length;
    const failed = generations.filter(g => g.status === 'failed').length;

    const totalSize = Array.from(this.sonicLibrary.values())
      .reduce((sum, item) => sum + item.data.byteLength, 0);

    return {
      totalBrands: this.brands.size,
      totalGenerations: generations.length,
      completedGenerations: completed,
      failedGenerations: failed,
      totalAudioLibrarySize: totalSize
    };
  }

  async getMoodSuggestions(brandKeywords: string[]): Promise<SonicBrand['mood'][]> {
    const moods: SonicBrand['mood'][] = ['energetic', 'calm', 'professional', 'playful', 'luxury'];

    // Simple matching
    if (brandKeywords.some(k => ['startup', 'tech', 'innovation'].includes(k))) {
      return ['energetic', 'professional'];
    }

    if (brandKeywords.some(k => ['luxury', 'premium', 'elite'].includes(k))) {
      return ['luxury', 'professional'];
    }

    if (brandKeywords.some(k => ['playful', 'fun', 'kids'].includes(k))) {
      return ['playful', 'energetic'];
    }

    return moods;
  }

  async exportSonicBrand(brandId: string): Promise<{ brand: SonicBrand; elements: SonicGeneration[] }> {
    const brand = this.brands.get(brandId);
    if (!brand) {
      throw new Error(`Brand ${brandId} not found`);
    }

    const elements = Array.from(this.generations.values()).filter(g => g.brandId === brandId);

    return { brand, elements };
  }
}

export const sonicService = new SonicService();

/**
 * Get brand trends — standalone exported function used by TrendPulse component
 */
export async function getBrandTrends(
  brand?: import('../types').BrandDNA,
  force = false
): Promise<(import('../types').TrendItem & { isSimulated?: boolean })[]> {
  const brandName = brand?.name || 'General';
  const keywords = brand?.coreValues || ['technology', 'innovation'];

  const trendTopics = [
    { topic: `${brandName} industry shifts`, category: 'Industry', volume: '12.5K' },
    { topic: `AI in ${keywords[0] || 'business'}`, category: 'Technology', volume: '45.2K' },
    { topic: `${brandName} competitor moves`, category: 'Competitive', volume: '8.1K' },
    { topic: `Social media ${keywords[0] || 'trends'}`, category: 'Social', volume: '32.7K' },
    { topic: `Consumer sentiment ${brandName}`, category: 'Sentiment', volume: '5.3K' },
  ];

  return trendTopics.map((t, i) => ({
    id: `trend-${Date.now()}-${i}`,
    topic: t.topic,
    category: t.category,
    volume: t.volume,
    relevanceScore: Math.round((0.65 + Math.random() * 0.3) * 100) / 100,
    summary: `Trending topic related to ${brandName} in the ${t.category.toLowerCase()} space.`,
    suggestedAngles: [
      `Create content around ${t.topic}`,
      `Engage audience with ${t.category.toLowerCase()} insights`,
    ],
    isSimulated: true,
  }));
}

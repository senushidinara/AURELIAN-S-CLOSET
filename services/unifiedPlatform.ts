/**
 * Unified AI Fashion Platform
 * Main orchestrator integrating FIBO, Datadog, Confluent, and ElevenLabs
 */

import { generateFIBOOutfit, FIBOOutfitSpec } from './fiboService';
import { datadogMonitor, GenerationTelemetry } from './datadogService';
import { streamingPipeline, KAFKA_TOPICS, OutfitGenerationEvent } from './confluentService';
import { voiceAssistant, VoiceResponse } from './elevenLabsService';
import { generateOutfitImage } from './geminiService';
import { OutfitParams } from '../types';
import { AI_MODELS, CHARS_PER_TOKEN } from './serviceConstants';

export interface UnifiedRequest {
  user_id: string;
  input: string | Buffer;
  input_type: 'text' | 'voice';
  params?: OutfitParams;
}

export interface UnifiedResponse {
  outfit_spec?: FIBOOutfitSpec;
  image_url?: string;
  voice_response?: VoiceResponse;
  text_response?: string;
  request_id: string;
  processing_time_ms: number;
  telemetry: GenerationTelemetry;
}

/**
 * Unified AI Fashion Platform
 * Integrates all services into cohesive system
 */
export class UnifiedAIFashionPlatform {
  private monitoring = datadogMonitor;
  private streaming = streamingPipeline;
  private voice = voiceAssistant;
  private initialized = false;

  constructor() {
    console.log('[UNIFIED PLATFORM] Initializing multi-service integration');
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('[UNIFIED PLATFORM] Starting service initialization');

    try {
      // Initialize Kafka producer
      await this.streaming.initProducer();
      
      // Initialize Kafka consumer for monitoring
      await this.streaming.initConsumer([
        KAFKA_TOPICS.OUTFIT_GENERATIONS,
        KAFKA_TOPICS.QUALITY_METRICS,
        KAFKA_TOPICS.SYSTEM_ALERTS
      ]);

      this.initialized = true;
      console.log('[UNIFIED PLATFORM] All services initialized successfully');
    } catch (error) {
      console.error('[UNIFIED PLATFORM] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Process any type of user request
   * Main entry point for unified platform
   */
  async processUserRequest(request: UnifiedRequest): Promise<UnifiedResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    console.log(`[UNIFIED PLATFORM] Processing ${request.input_type} request: ${requestId}`);

    // Start monitoring span
    try {
      // Log event to Datadog
      console.log('[MONITORING] Logging user interaction event');

      // Stream to Confluent
      await this.streaming.produceUserInteraction({
        type: 'generation',
        user_id: request.user_id,
        timestamp: new Date().toISOString(),
        data: {
          input_type: request.input_type,
          request_id: requestId
        }
      });

      let result: UnifiedResponse;

      // Process based on input type
      if (request.input_type === 'voice' && request.input instanceof Buffer) {
        result = await this.processVoiceInput(request, requestId, startTime);
      } else {
        result = await this.processTextInput(request, requestId, startTime);
      }

      // Stream result to Kafka
      if (result.outfit_spec) {
        await this.streaming.produceOutfitGeneration({
          user_id: request.user_id,
          outfit_id: requestId,
          timestamp: new Date().toISOString(),
          params: request.params,
          spec: result.outfit_spec,
          quality_score: result.telemetry.quality_score
        });
      }

      // Send telemetry to Datadog
      await this.monitoring.streamLLMTelemetry(result.telemetry);

      return result;

    } catch (error) {
      console.error('[UNIFIED PLATFORM] Request processing error:', error);
      
      const processingTime = Date.now() - startTime;
      
      // Log error to monitoring
      const errorTelemetry: GenerationTelemetry = {
        input_tokens: 0,
        output_tokens: 0,
        generation_ms: processingTime,
        model: 'gemini-2.5-flash',
        success: false,
        user_id: request.user_id,
        endpoint: 'outfit_generation'
      };

      await this.monitoring.streamLLMTelemetry(errorTelemetry);

      throw error;
    }
  }

  /**
   * Process voice input through full pipeline
   */
  private async processVoiceInput(
    request: UnifiedRequest,
    requestId: string,
    startTime: number
  ): Promise<UnifiedResponse> {
    console.log('[UNIFIED PLATFORM] Processing voice input');

    // Voice conversation
    const voiceResponse = await this.voice.voiceConversation(
      request.input as Buffer,
      request.user_id
    );

    // If voice includes outfit generation request, generate outfit
    let outfitSpec: FIBOOutfitSpec | undefined;
    let imageUrl: string | undefined;

    if (this.isOutfitGenerationRequest(voiceResponse.text)) {
      const params = this.extractParamsFromText(voiceResponse.text);
      outfitSpec = await generateFIBOOutfit(params);
      imageUrl = await generateOutfitImage(outfitSpec);
    }

    const processingTime = Date.now() - startTime;

    return {
      outfit_spec: outfitSpec,
      image_url: imageUrl,
      voice_response: voiceResponse,
      text_response: voiceResponse.text,
      request_id: requestId,
      processing_time_ms: processingTime,
      telemetry: this.createTelemetry(request, processingTime, true, outfitSpec)
    };
  }

  /**
   * Process text input through full pipeline
   */
  private async processTextInput(
    request: UnifiedRequest,
    requestId: string,
    startTime: number
  ): Promise<UnifiedResponse> {
    console.log('[UNIFIED PLATFORM] Processing text input');

    const params = request.params || this.extractParamsFromText(request.input as string);

    // Generate outfit with FIBO
    const outfitSpec = await generateFIBOOutfit(params);

    // Generate image
    const imageUrl = await generateOutfitImage(outfitSpec);

    const processingTime = Date.now() - startTime;

    return {
      outfit_spec: outfitSpec,
      image_url: imageUrl,
      text_response: outfitSpec.description,
      request_id: requestId,
      processing_time_ms: processingTime,
      telemetry: this.createTelemetry(request, processingTime, true, outfitSpec)
    };
  }

  /**
   * Check if text indicates outfit generation request
   */
  private isOutfitGenerationRequest(text: string): boolean {
    const keywords = ['outfit', 'clothes', 'wear', 'dress', 'generate', 'create', 'style'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  /**
   * Extract outfit parameters from text
   */
  private extractParamsFromText(text: string): OutfitParams {
    // Simple extraction - in production this would use NLP
    return {
      occasion: this.extractOccasion(text),
      weather: 'moderate',
      mood: 'confident',
      style: 'modern professional'
    };
  }

  /**
   * Extract occasion from text
   */
  private extractOccasion(text: string): string {
    const occasionMap: { [key: string]: string } = {
      'work': 'work',
      'business': 'business meeting',
      'meeting': 'business meeting',
      'casual': 'casual',
      'dinner': 'dinner',
      'date': 'date night',
      'party': 'party',
      'formal': 'formal event',
      'gala': 'evening gala'
    };

    for (const [keyword, occasion] of Object.entries(occasionMap)) {
      if (text.toLowerCase().includes(keyword)) {
        return occasion;
      }
    }

    return 'casual';
  }

  /**
   * Create telemetry data for monitoring
   */
  private createTelemetry(
    request: UnifiedRequest,
    processingTime: number,
    success: boolean,
    outfitSpec?: FIBOOutfitSpec
  ): GenerationTelemetry {
    // Estimate token counts based on data
    const inputTokens = this.estimateTokens(
      typeof request.input === 'string' ? request.input : 'voice_input'
    );
    const outputTokens = outfitSpec ? this.estimateTokens(JSON.stringify(outfitSpec)) : 0;

    return {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      generation_ms: processingTime,
      model: AI_MODELS.GEMINI_FLASH,
      camera_angle: outfitSpec?.camera?.angle,
      lighting: outfitSpec?.camera?.lighting,
      success: success,
      quality_score: this.calculateQualityScore(outfitSpec),
      user_id: request.user_id,
      endpoint: 'outfit_generation'
    };
  }

  /**
   * Estimate token count from text
   */
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / CHARS_PER_TOKEN);
  }

  /**
   * Calculate quality score for outfit
   */
  private calculateQualityScore(outfitSpec?: FIBOOutfitSpec): number {
    if (!outfitSpec) return 0;

    let score = 0.7; // Base score

    // Check completeness
    if (outfitSpec.color_scheme) score += 0.1;
    if (outfitSpec.texture_layers && outfitSpec.texture_layers.length > 0) score += 0.1;
    if (outfitSpec.camera) score += 0.05;
    if (outfitSpec.description && outfitSpec.description.length > 50) score += 0.05;

    return Math.min(score, 1.0);
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Shutdown platform gracefully
   */
  async shutdown(): Promise<void> {
    console.log('[UNIFIED PLATFORM] Shutting down services');
    await this.streaming.disconnect();
  }
}

/**
 * Complete System Flow Example
 * Demonstrates end-to-end integration
 */
export async function demonstrateCompleteFlow(): Promise<void> {
  console.log('\n=== Demonstrating Complete System Flow ===\n');

  const platform = new UnifiedAIFashionPlatform();
  await platform.initialize();

  // Example 1: Text-based outfit generation
  console.log('\n--- Example 1: Text Request ---');
  const textRequest: UnifiedRequest = {
    user_id: 'user_123',
    input: 'I need a professional outfit for a business meeting',
    input_type: 'text',
    params: {
      occasion: 'Business Meeting',
      weather: 'Cool 15°C',
      mood: 'Confident',
      style: 'Professional Modern'
    }
  };

  const textResponse = await platform.processUserRequest(textRequest);
  console.log('Generated outfit:', textResponse.outfit_spec?.occasion);
  console.log('Processing time:', textResponse.processing_time_ms, 'ms');
  console.log('Quality score:', textResponse.telemetry.quality_score);

  // Example 2: Voice-based request (simulated)
  console.log('\n--- Example 2: Voice Request (Simulated) ---');
  const voiceRequest: UnifiedRequest = {
    user_id: 'user_456',
    input: Buffer.from('voice_data_placeholder'),
    input_type: 'voice'
  };

  // In production, this would process actual voice data
  console.log('Voice request would be processed through:');
  console.log('1. ElevenLabs Speech-to-Text');
  console.log('2. Gemini NLU Processing');
  console.log('3. Confluent Kafka (Event Streaming)');
  console.log('4. Vertex AI (Real-time Predictions)');
  console.log('5. FIBO (Outfit Generation)');
  console.log('6. Datadog (Monitoring & Observability)');
  console.log('7. ElevenLabs Text-to-Speech');
  console.log('8. Voice Response to User');

  await platform.shutdown();
  
  console.log('\n=== Flow Demonstration Complete ===\n');
}

// Export singleton instance
export const unifiedPlatform = new UnifiedAIFashionPlatform();

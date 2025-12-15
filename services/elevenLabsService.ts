/**
 * ElevenLabs Voice Assistant Service
 * Voice-driven conversational AI for fashion platform
 */

import { GoogleGenAI } from "@google/genai";
import { FIBOOutfitSpec } from './fiboService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const modelFlash = 'gemini-2.5-flash';

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost?: boolean;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence: number;
  speaker_diarization?: boolean;
}

export interface VoiceResponse {
  audio: string;
  text: string;
  voice_id: string;
}

/**
 * ElevenLabs Voice Assistant
 * Provides voice-driven fashion assistance using ElevenLabs & Vertex AI
 */
export class VoiceFashionAssistant {
  private apiKey: string;
  private enabled: boolean;
  private conversationHistory: Map<string, any[]> = new Map();

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
    this.enabled = !!this.apiKey;

    if (!this.enabled) {
      console.warn('ElevenLabs voice assistant disabled: API key not configured');
    }
  }

  /**
   * Full voice conversation pipeline
   * Transcribe -> Process -> Respond with voice
   */
  async voiceConversation(userAudio: Buffer, userId: string): Promise<VoiceResponse> {
    if (!this.enabled) {
      console.log('[ELEVENLABS SIMULATION] Would process voice conversation');
      return {
        audio: '',
        text: 'Voice assistant is not configured. Please provide an ElevenLabs API key.',
        voice_id: 'rachel'
      };
    }

    // Step 1: Transcribe speech
    const transcription = await this.speechToText(userAudio);

    // Step 2: Process with Gemini
    const context = this.getConversationContext(userId);
    const responseText = await this.generateResponse(transcription.text, context);

    // Step 3: Generate voice response
    const voiceResponse = await this.textToSpeech(responseText, {
      voice_id: 'rachel',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.6,
        use_speaker_boost: true
      }
    });

    // Step 4: Update conversation history
    this.updateConversationHistory(userId, transcription.text, responseText);

    return voiceResponse;
  }

  /**
   * Speech to text conversion
   */
  async speechToText(audio: Buffer): Promise<TranscriptionResult> {
    if (!this.enabled) {
      console.log('[ELEVENLABS SIMULATION] Would transcribe audio');
      return {
        text: 'Mock transcription',
        language: 'en',
        confidence: 0.95,
        speaker_diarization: true
      };
    }

    // Simulate ElevenLabs speech-to-text API call
    console.log('[ELEVENLABS] Transcribing audio...');
    
    return {
      text: 'I need a professional outfit for a business meeting',
      language: 'en',
      confidence: 0.95,
      speaker_diarization: true
    };
  }

  /**
   * Text to speech conversion with personality
   */
  async textToSpeech(
    text: string,
    options: {
      voice_id: string;
      voice_settings: VoiceSettings;
      model?: string;
    }
  ): Promise<VoiceResponse> {
    if (!this.enabled) {
      console.log('[ELEVENLABS SIMULATION] Would generate speech:', text.substring(0, 50) + '...');
      return {
        audio: '',
        text: text,
        voice_id: options.voice_id
      };
    }

    console.log(`[ELEVENLABS] Generating speech with voice ${options.voice_id}`);
    
    // Simulate ElevenLabs TTS API call
    return {
      audio: 'base64_encoded_audio_data',
      text: text,
      voice_id: options.voice_id
    };
  }

  /**
   * Generate response using Gemini
   */
  private async generateResponse(userMessage: string, context: any[]): Promise<string> {
    const conversationContext = context
      .map(c => `User: ${c.user}\nAssistant: ${c.assistant}`)
      .join('\n\n');

    const prompt = `
You are Aria, a professional fashion stylist with 10 years of experience.
You are warm, knowledgeable, and encouraging. Your style is classic with modern twists.

Previous conversation:
${conversationContext}

User's latest message: ${userMessage}

Provide specific, actionable fashion advice. Ask clarifying questions about occasion, weather, and personal style when needed.
Suggest complete outfits, not just individual pieces. Always mention why each suggestion works.

Keep your response conversational and natural, as it will be spoken aloud.
    `;

    try {
      const response = await ai.models.generateContent({
        model: modelFlash,
        contents: prompt
      });

      return response.text || "I'm here to help you find the perfect outfit. What occasion are you dressing for?";
    } catch (error) {
      console.error('Gemini response generation error:', error);
      return "I'd be happy to help you with your outfit selection. Could you tell me more about the occasion?";
    }
  }

  /**
   * Get conversation context for user
   */
  private getConversationContext(userId: string): any[] {
    return this.conversationHistory.get(userId) || [];
  }

  /**
   * Update conversation history
   */
  private updateConversationHistory(userId: string, userMessage: string, assistantMessage: string): void {
    const history = this.conversationHistory.get(userId) || [];
    history.push({
      user: userMessage,
      assistant: assistantMessage,
      timestamp: new Date().toISOString()
    });

    // Keep only last 10 exchanges
    if (history.length > 10) {
      history.shift();
    }

    this.conversationHistory.set(userId, history);
  }
}

/**
 * Multi-Modal Fashion Assistant
 * Combines voice with visual understanding
 */
export class MultiModalAssistant {
  private voiceAssistant: VoiceFashionAssistant;

  constructor(voiceAssistant: VoiceFashionAssistant) {
    this.voiceAssistant = voiceAssistant;
  }

  /**
   * Describe outfit from image using voice
   */
  async describeOutfit(imageData: string, voiceQuery?: string): Promise<any> {
    console.log('[MULTIMODAL] Analyzing outfit image with voice description');

    // Use Gemini Vision for image understanding
    const visionPrompt = `
Describe this outfit in detail, including:
- Colors and color combinations
- Materials and textures
- Style and aesthetic
- Suitable occasions
- Styling suggestions
${voiceQuery ? `\nUser's specific question: ${voiceQuery}` : ''}
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { text: visionPrompt },
            // Note: In production, this would include the actual image data
            { text: '[Image data would be included here in production]' }
          ]
        }
      });

      const description = response.text || 'Unable to analyze the outfit image.';

      // Generate voice description
      const voiceDescription = await this.voiceAssistant.textToSpeech(
        description,
        {
          voice_id: 'matilda',
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.9,
            style: 0.7
          }
        }
      );

      return {
        text_description: description,
        audio_description: voiceDescription.audio,
        style_tags: this.extractStyleTags(description)
      };
    } catch (error) {
      console.error('Multi-modal analysis error:', error);
      return {
        text_description: 'Unable to analyze outfit at this time.',
        audio_description: '',
        style_tags: []
      };
    }
  }

  /**
   * Extract style tags from description
   */
  private extractStyleTags(description: string): string[] {
    const commonStyles = [
      'professional', 'casual', 'formal', 'elegant', 'modern',
      'classic', 'minimalist', 'bohemian', 'avant-garde', 'vintage'
    ];

    return commonStyles.filter(style => 
      description.toLowerCase().includes(style)
    );
  }
}

/**
 * Voice-Controlled Outfit Generator
 * Generate outfits through voice commands
 */
export class VoiceControlledGenerator {
  private voiceAssistant: VoiceFashionAssistant;

  constructor(voiceAssistant: VoiceFashionAssistant) {
    this.voiceAssistant = voiceAssistant;
  }

  /**
   * Convert voice command to outfit generation parameters
   */
  async processVoiceCommand(commandAudio: Buffer): Promise<any> {
    console.log('[VOICE GENERATOR] Processing voice command for outfit generation');

    // Step 1: Transcribe command
    const transcription = await this.voiceAssistant.speechToText(commandAudio);

    // Step 2: Extract parameters using Gemini
    const paramsPrompt = `
Extract outfit generation parameters from this voice command:
"${transcription.text}"

Return as JSON with these fields:
- occasion: string (e.g., "work", "dinner", "casual")
- colors: array of color names/hex codes
- materials: array of preferred materials
- style_adjectives: array of style descriptors
- camera_angle: string (if mentioned: "front", "three_quarter", etc.)
- mood: string describing the desired emotional tone

Return ONLY valid JSON.
    `;

    try {
      const response = await ai.models.generateContent({
        model: modelFlash,
        contents: paramsPrompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const params = JSON.parse(response.text || '{}');

      // Convert to FIBO schema format
      const fiboSchema = this.convertToFIBOSchema(params);

      // Create voice response describing what will be generated
      const confirmationText = this.createConfirmationText(params);
      const voiceConfirmation = await this.voiceAssistant.textToSpeech(
        confirmationText,
        {
          voice_id: 'rachel',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.6
          }
        }
      );

      return {
        extracted_params: params,
        fibo_schema: fiboSchema,
        voice_confirmation: voiceConfirmation,
        transcription: transcription.text
      };
    } catch (error) {
      console.error('Voice command processing error:', error);
      return {
        error: 'Unable to process voice command',
        transcription: transcription.text
      };
    }
  }

  /**
   * Convert extracted parameters to FIBO schema format
   */
  private convertToFIBOSchema(params: any): any {
    return {
      occasion: params.occasion || 'casual',
      weather: params.weather || 'moderate',
      mood: params.mood || 'confident',
      style: params.style_adjectives?.join(' ') || 'modern',
      colors: params.colors || [],
      materials: params.materials || [],
      camera_angle: params.camera_angle || 'three_quarter'
    };
  }

  /**
   * Create confirmation text for voice output
   */
  private createConfirmationText(params: any): string {
    let text = "I'll create ";
    
    if (params.style_adjectives && params.style_adjectives.length > 0) {
      text += `a ${params.style_adjectives.join(' and ')} `;
    }
    
    text += `outfit for ${params.occasion || 'your event'}`;
    
    if (params.colors && params.colors.length > 0) {
      text += ` featuring ${params.colors.join(' and ')} colors`;
    }
    
    if (params.materials && params.materials.length > 0) {
      text += ` with ${params.materials.join(' and ')} materials`;
    }
    
    text += ". Let me generate that for you now.";
    
    return text;
  }
}

/**
 * Style Advisor Agent
 * ElevenLabs Agent with fashion expertise
 */
export class StyleAdvisorAgent {
  private voiceAssistant: VoiceFashionAssistant;
  private agentPersonality: string;

  constructor(voiceAssistant: VoiceFashionAssistant) {
    this.voiceAssistant = voiceAssistant;
    this.agentPersonality = `
You are Aria, a professional fashion stylist with 10 years of experience.

Personality:
- Warm, knowledgeable, and encouraging
- Professional but approachable
- Detail-oriented and specific

Style Philosophy:
- Classic with modern twists
- Quality over quantity
- Personal expression through fashion

Communication Style:
- Always provide specific, actionable advice
- Ask clarifying questions about occasion, weather, and personal style
- Suggest complete outfits, not just individual pieces
- Explain why each suggestion works
- Be enthusiastic but not pushy
    `;
  }

  /**
   * Have a style consultation conversation
   */
  async styleConsultation(userAudio: Buffer, userId: string): Promise<VoiceResponse> {
    console.log('[STYLE ADVISOR] Starting style consultation');

    // Get user's style profile if available
    const styleProfile = this.getUserStyleProfile(userId);

    // Process conversation with personality context
    const transcription = await this.voiceAssistant.speechToText(userAudio);
    
    const contextualPrompt = `
${this.agentPersonality}

User's style profile: ${JSON.stringify(styleProfile)}

User says: ${transcription.text}

Provide personalized style advice based on this user's history and current request.
    `;

    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: contextualPrompt
    });

    const responseText = response.text || "Let's explore your style together!";

    return await this.voiceAssistant.textToSpeech(
      responseText,
      {
        voice_id: 'aria',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.7,
          use_speaker_boost: true
        }
      }
    );
  }

  /**
   * Get user's style profile
   */
  private getUserStyleProfile(userId: string): any {
    // In production, this would fetch from database
    return {
      preferred_styles: ['modern', 'minimalist'],
      preferred_colors: ['black', 'white', 'navy'],
      body_type: 'unknown',
      occasions: ['work', 'casual']
    };
  }
}

// Export singleton instance
export const voiceAssistant = new VoiceFashionAssistant();
export const multiModalAssistant = new MultiModalAssistant(voiceAssistant);
export const voiceGenerator = new VoiceControlledGenerator(voiceAssistant);
export const styleAdvisor = new StyleAdvisorAgent(voiceAssistant);

/**
 * Shared constants for AI services
 */

// Model names
export const AI_MODELS = {
  GEMINI_FLASH: 'gemini-2.5-flash',
  GEMINI_FLASH_IMAGE: 'gemini-2.5-flash-image',
  GEMINI_PRO: 'gemini-pro'
} as const;

// Voice IDs for ElevenLabs
export const VOICE_IDS = {
  RACHEL: 'rachel',
  MATILDA: 'matilda',
  ARIA: 'aria'
} as const;

// Default voice settings
export const DEFAULT_VOICE_SETTINGS = {
  stability: 0.75,
  similarity_boost: 0.85,
  style: 0.6,
  use_speaker_boost: true
} as const;

// Kafka topic names
export const KAFKA_TOPICS = {
  USER_CLICKS: 'user.clicks',
  USER_INTERACTIONS: 'user.interactions',
  OUTFIT_GENERATIONS: 'outfit.generations',
  STYLE_PREFERENCES: 'style.preferences',
  FEEDBACK_EVENTS: 'feedback.events',
  VOICE_COMMANDS: 'voice.commands',
  TEXT_TRANSCRIPTIONS: 'text.transcriptions',
  INTENT_PREDICTIONS: 'intent.predictions',
  QUALITY_METRICS: 'quality.metrics',
  SYSTEM_ALERTS: 'system.alerts',
  TREND_UPDATES: 'trend.updates'
} as const;

// Datadog metric names
export const DATADOG_METRICS = {
  VERTEX_AI_TOKENS_INPUT: 'vertexai.tokens.input',
  VERTEX_AI_TOKENS_OUTPUT: 'vertexai.tokens.output',
  FIBO_GENERATION_DURATION: 'fibo.generation.duration',
  FIBO_API_SUCCESS_RATE: 'fibo.api.success_rate',
  OUTFIT_QUALITY: 'outfit.generation.quality'
} as const;

// Token estimation constant
export const CHARS_PER_TOKEN = 4;

// Quality score thresholds
export const QUALITY_THRESHOLDS = {
  EXCELLENT: 0.9,
  GOOD: 0.8,
  ACCEPTABLE: 0.7,
  POOR: 0.6
} as const;

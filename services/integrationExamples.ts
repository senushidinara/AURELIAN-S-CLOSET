/**
 * Demo Examples for Multi-Challenge Integration
 * Shows how to use FIBO, Datadog, Confluent, and ElevenLabs together
 */

import { unifiedPlatform, UnifiedRequest } from './services/unifiedPlatform';
import { generateFIBOOutfit } from './services/fiboService';
import { datadogMonitor } from './services/datadogService';
import { streamingPipeline, RealTimeRecommender, StreamingPersonalization } from './services/confluentService';
import { voiceAssistant, multiModalAssistant, voiceGenerator, styleAdvisor } from './services/elevenLabsService';

/**
 * Example 1: Basic FIBO Outfit Generation
 */
export async function demoFIBOGeneration() {
  console.log('\n=== Example 1: FIBO Outfit Generation ===\n');

  const outfit = await generateFIBOOutfit({
    occasion: 'Evening Gala',
    weather: 'Cool 15°C',
    mood: 'Elegant',
    style: 'Classic Evening Wear'
  });

  console.log('Generated Outfit Specification:');
  console.log('- Occasion:', outfit.occasion);
  console.log('- Primary Color:', outfit.color_scheme.primary.hex);
  console.log('- Camera Angle:', outfit.camera.angle);
  console.log('- Lighting:', outfit.camera.lighting);
  console.log('- Materials:', outfit.texture_layers.map(l => l.material).join(', '));
  console.log('- Realism Score:', outfit.style_parameters.realism);

  if (outfit.fibo_structured_params) {
    console.log('\nFIBO Structured Parameters:');
    console.log('- FOV:', outfit.fibo_structured_params.parameters.camera.fov);
    console.log('- Lighting Temperature:', outfit.fibo_structured_params.parameters.lighting.temperature);
    console.log('- Color Harmony:', outfit.fibo_structured_params.parameters.colors.harmony);
  }
}

/**
 * Example 2: Datadog Monitoring Integration
 */
export async function demoDatadogMonitoring() {
  console.log('\n=== Example 2: Datadog Monitoring ===\n');

  // Stream telemetry data
  await datadogMonitor.streamLLMTelemetry({
    input_tokens: 150,
    output_tokens: 450,
    generation_ms: 2341,
    model: 'gemini-2.5-flash',
    camera_angle: 'three_quarter',
    lighting: 'studio',
    success: true,
    quality_score: 0.92,
    user_id: 'demo_user',
    endpoint: 'outfit_generation'
  });

  console.log('✓ Telemetry streamed to Datadog');

  // Get detection rules
  const rules = datadogMonitor.createDetectionRules();
  console.log(`\n✓ Created ${rules.length} detection rules:`);
  rules.forEach(rule => {
    console.log(`  - ${rule.name}`);
  });

  // Create an incident (simulation)
  const incident = await datadogMonitor.createAIIncident({
    rule_name: 'Quality Degradation Detected',
    severity: 'high',
    model: 'gemini-2.5-flash'
  });

  console.log('\n✓ AI Incident Created:');
  console.log(`  - Title: ${incident.title}`);
  console.log(`  - Severity: ${incident.severity}`);
  console.log(`  - Affected Users: ${incident.content.affected_users}`);
  console.log(`  - Business Impact: ${incident.content.business_impact}`);
}

/**
 * Example 3: Confluent Real-Time Streaming
 */
export async function demoConfluentStreaming() {
  console.log('\n=== Example 3: Confluent Streaming ===\n');

  // Initialize streaming
  await streamingPipeline.initProducer();
  console.log('✓ Kafka producer initialized');

  // Stream user interaction
  await streamingPipeline.produceUserInteraction({
    type: 'click',
    user_id: 'demo_user_123',
    timestamp: new Date().toISOString(),
    data: {
      page: 'outfit_generator',
      action: 'generate_clicked'
    }
  });

  console.log('✓ User interaction event streamed');

  // Stream outfit generation
  await streamingPipeline.produceOutfitGeneration({
    user_id: 'demo_user_123',
    outfit_id: 'outfit_789',
    timestamp: new Date().toISOString(),
    params: {
      occasion: 'Business Meeting',
      weather: 'Cool',
      mood: 'Confident',
      style: 'Professional'
    },
    spec: {
      occasion: 'business_meeting',
      weather: { temperature: 15, conditions: 'cool' },
      color_scheme: {
        primary: { hex: '#2C3E50', role: 'base' },
        accent: { hex: '#ECF0F1', role: 'accent' }
      },
      texture_layers: [
        { material: 'wool', weight: 'medium', sheen: 0.2 }
      ],
      camera: { angle: 'three_quarter', lighting: 'studio' },
      style_parameters: { realism: 0.95, aesthetic: 'professional' },
      description: 'Professional business attire'
    },
    quality_score: 0.89
  });

  console.log('✓ Outfit generation event streamed');

  // Create recommender
  const recommender = new RealTimeRecommender(streamingPipeline);
  console.log('✓ Real-time recommender initialized');

  // Create personalization engine
  const personalization = new StreamingPersonalization(streamingPipeline);
  console.log('✓ Personalization engine initialized');
}

/**
 * Example 4: ElevenLabs Voice Integration
 */
export async function demoVoiceIntegration() {
  console.log('\n=== Example 4: ElevenLabs Voice Assistant ===\n');

  // Simulate voice conversation
  const mockAudioBuffer = Buffer.from('mock_audio_data');
  
  const voiceResponse = await voiceAssistant.voiceConversation(
    mockAudioBuffer,
    'demo_user_456'
  );

  console.log('✓ Voice conversation processed');
  console.log('  - Response Text:', voiceResponse.text);
  console.log('  - Voice ID:', voiceResponse.voice_id);

  // Multi-modal assistance
  const imageDescription = await multiModalAssistant.describeOutfit(
    'base64_image_data',
    'What style is this outfit?'
  );

  console.log('\n✓ Multi-modal analysis completed');
  console.log('  - Description:', imageDescription.text_description.substring(0, 100) + '...');
  console.log('  - Style Tags:', imageDescription.style_tags.join(', '));

  // Voice-controlled generation
  const voiceCommand = await voiceGenerator.processVoiceCommand(mockAudioBuffer);

  console.log('\n✓ Voice command processed');
  console.log('  - Transcription:', voiceCommand.transcription);
  console.log('  - Extracted Occasion:', voiceCommand.extracted_params?.occasion || 'N/A');
}

/**
 * Example 5: Complete Unified Platform Flow
 */
export async function demoUnifiedPlatform() {
  console.log('\n=== Example 5: Unified Platform Flow ===\n');

  // Initialize platform
  await unifiedPlatform.initialize();
  console.log('✓ Unified platform initialized');

  // Text-based request
  const textRequest: UnifiedRequest = {
    user_id: 'demo_user_789',
    input: 'I need a professional outfit for a business meeting tomorrow',
    input_type: 'text',
    params: {
      occasion: 'Business Meeting',
      weather: 'Cool 15°C',
      mood: 'Confident',
      style: 'Modern Professional'
    }
  };

  console.log('\nProcessing text request...');
  const textResponse = await unifiedPlatform.processUserRequest(textRequest);

  console.log('✓ Text request completed');
  console.log('  - Request ID:', textResponse.request_id);
  console.log('  - Processing Time:', textResponse.processing_time_ms, 'ms');
  console.log('  - Quality Score:', textResponse.telemetry.quality_score);
  console.log('  - Occasion:', textResponse.outfit_spec?.occasion);

  // Voice-based request (simulated)
  console.log('\nVoice request flow (simulated):');
  console.log('  1. ✓ ElevenLabs Speech-to-Text');
  console.log('  2. ✓ Gemini NLU Processing');
  console.log('  3. ✓ Confluent Kafka (Event Streaming)');
  console.log('  4. ✓ Vertex AI (Real-time Predictions)');
  console.log('  5. ✓ FIBO (Outfit Generation)');
  console.log('  6. ✓ Datadog (Monitoring & Observability)');
  console.log('  7. ✓ ElevenLabs Text-to-Speech');
  console.log('  8. ✓ Voice Response to User');

  // Cleanup
  await unifiedPlatform.shutdown();
  console.log('\n✓ Platform shut down gracefully');
}

/**
 * Example 6: Real-Time Analytics Dashboard
 */
export async function demoDashboardMetrics() {
  console.log('\n=== Example 6: Dashboard Metrics ===\n');

  // Correlate metrics
  const correlation = await datadogMonitor.correlateMetrics([
    'fibo.generation.duration',
    'user.satisfaction.score'
  ]);

  console.log('✓ Metric Correlation Analysis:');
  console.log('  - Correlation Coefficient:', correlation);
  console.log('  - Interpretation:', correlation < -0.5 ? 'Strong negative correlation' : 'Weak correlation');
  console.log('  - Insight: Higher generation time → Lower satisfaction');

  // Forecast demand
  const forecast = await datadogMonitor.forecastMetric(
    'vertexai.requests.count',
    'next_4h'
  );

  console.log('\n✓ Demand Forecast:');
  console.log('  - Predicted Value:', forecast.predicted_value);
  console.log('  - Confidence Interval:', forecast.confidence_interval);
  console.log('  - Algorithm:', forecast.algorithm);

  // Detect anomalies
  const anomalies = await datadogMonitor.detectAnomalies(
    'outfit.quality_score',
    ['user_segment', 'time_of_day', 'occasion_type']
  );

  console.log('\n✓ Anomaly Detection:');
  console.log('  - Anomalies Found:', anomalies.length);
}

/**
 * Run all demos
 */
export async function runAllDemos() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  AURELIAN\'S CLOSET - Multi-Challenge Integration Demo    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    await demoFIBOGeneration();
    await demoDatadogMonitoring();
    await demoConfluentStreaming();
    await demoVoiceIntegration();
    await demoUnifiedPlatform();
    await demoDashboardMetrics();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✓ All Demos Completed Successfully!                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n✗ Demo Error:', error);
  }
}

// Export individual demo functions
export {
  demoFIBOGeneration,
  demoDatadogMonitoring,
  demoConfluentStreaming,
  demoVoiceIntegration,
  demoUnifiedPlatform,
  demoDashboardMetrics
};

// Run all demos if executed directly
if (require.main === module) {
  runAllDemos().catch(console.error);
}

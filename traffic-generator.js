/**
 * Traffic Generator for Aurelian's Closet
 * 
 * Generates realistic traffic patterns to demonstrate Datadog detection rules in action.
 * Simulates various scenarios including:
 * - Normal operation
 * - Performance degradation
 * - Quality issues
 * - Token anomalies
 * - High error rates
 * 
 * Usage:
 *   npm install
 *   node traffic-generator.js [scenario]
 * 
 * Scenarios:
 *   normal          - Normal traffic pattern (default)
 *   performance     - Simulate performance degradation
 *   quality         - Simulate quality degradation
 *   token-spike     - Simulate anomalous token usage
 *   high-errors     - Simulate high error rate
 *   all-incidents   - Run all incident scenarios sequentially
 */

// Mock Datadog service for standalone execution
const datadogMonitor = {
  async streamLLMTelemetry(data) {
    console.log('[DATADOG SIMULATION] Streaming telemetry:', {
      endpoint: data.endpoint,
      latency: `${data.generation_ms}ms`,
      quality: data.quality_score?.toFixed(2),
      tokens: data.input_tokens + data.output_tokens,
      success: data.success
    });
  }
};

// Configuration
const CONFIG = {
  baseUrl: process.env.APP_URL || 'http://localhost:5173',
  requestsPerMinute: {
    low: 10,
    medium: 30,
    high: 100
  },
  scenarios: {
    normal: {
      errorRate: 0.01,
      avgLatency: 2000,
      latencyVariance: 500,
      qualityScore: 0.85,
      qualityVariance: 0.1
    },
    performance: {
      errorRate: 0.02,
      avgLatency: 6000, // Will trigger performance alert
      latencyVariance: 1000,
      qualityScore: 0.85,
      qualityVariance: 0.05
    },
    quality: {
      errorRate: 0.01,
      avgLatency: 2000,
      latencyVariance: 500,
      qualityScore: 0.65, // Will trigger quality alert
      qualityVariance: 0.05
    },
    tokenSpike: {
      errorRate: 0.01,
      avgLatency: 2000,
      latencyVariance: 500,
      qualityScore: 0.85,
      qualityVariance: 0.1,
      tokenMultiplier: 5 // Will trigger token anomaly
    },
    highErrors: {
      errorRate: 0.08, // Will trigger error rate alert
      avgLatency: 2000,
      latencyVariance: 500,
      qualityScore: 0.85,
      qualityVariance: 0.1
    }
  }
};

// Sample outfit generation parameters
const OUTFIT_PARAMS = [
  {
    occasion: 'Business Meeting',
    weather: 'Cool 15°C',
    mood: 'Confident',
    style: 'Professional Modern'
  },
  {
    occasion: 'Evening Gala',
    weather: 'Warm 25°C',
    mood: 'Elegant',
    style: 'Luxury Formal'
  },
  {
    occasion: 'Casual Outing',
    weather: 'Mild 20°C',
    mood: 'Relaxed',
    style: 'Smart Casual'
  },
  {
    occasion: 'Date Night',
    weather: 'Cool 18°C',
    mood: 'Romantic',
    style: 'Sophisticated'
  },
  {
    occasion: 'Weekend Brunch',
    weather: 'Sunny 22°C',
    mood: 'Cheerful',
    style: 'Casual Chic'
  }
];

const CAMERA_ANGLES = ['hero_shot', 'three_quarter', 'full_body', 'close_up', 'low_angle_hero'];
const LIGHTING_TYPES = ['natural_daylight', 'studio_soft', 'rembrandt_contrast', 'golden_hour', 'high_key'];

class TrafficGenerator {
  constructor(scenario = 'normal') {
    this.scenario = scenario;
    this.config = CONFIG.scenarios[scenario] || CONFIG.scenarios.normal;
    this.requestCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
  }

  /**
   * Generate random value within variance
   */
  randomWithVariance(base, variance) {
    return base + (Math.random() - 0.5) * 2 * variance;
  }

  /**
   * Simulate a single outfit generation request
   */
  async generateRequest() {
    this.requestCount++;
    
    // Randomly select parameters
    const params = OUTFIT_PARAMS[Math.floor(Math.random() * OUTFIT_PARAMS.length)];
    const cameraAngle = CAMERA_ANGLES[Math.floor(Math.random() * CAMERA_ANGLES.length)];
    const lighting = LIGHTING_TYPES[Math.floor(Math.random() * LIGHTING_TYPES.length)];
    
    // Determine if this request should fail
    const shouldFail = Math.random() < this.config.errorRate;
    
    // Generate metrics
    const latency = Math.max(100, this.randomWithVariance(
      this.config.avgLatency,
      this.config.latencyVariance
    ));
    
    const qualityScore = shouldFail ? 0 : Math.min(1, Math.max(0, this.randomWithVariance(
      this.config.qualityScore,
      this.config.qualityVariance
    )));
    
    // Token calculation (more realistic based on complexity)
    const baseInputTokens = 150 + Math.floor(Math.random() * 100);
    const baseOutputTokens = 300 + Math.floor(Math.random() * 200);
    const tokenMultiplier = this.config.tokenMultiplier || 1;
    
    const inputTokens = Math.floor(baseInputTokens * tokenMultiplier);
    const outputTokens = Math.floor(baseOutputTokens * tokenMultiplier);
    
    if (shouldFail) {
      this.errorCount++;
    }
    
    // Stream telemetry to Datadog
    await datadogMonitor.streamLLMTelemetry({
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      generation_ms: latency,
      model: 'gemini-2.5-flash',
      camera_angle: cameraAngle,
      lighting: lighting,
      success: !shouldFail,
      quality_score: qualityScore,
      user_id: `user_${Math.floor(Math.random() * 100)}`,
      endpoint: 'outfit_generation'
    });
    
    // Log request details
    const status = shouldFail ? '❌ FAILED' : '✅ SUCCESS';
    console.log(
      `[${this.requestCount}] ${status} | ` +
      `Latency: ${Math.round(latency)}ms | ` +
      `Quality: ${qualityScore.toFixed(2)} | ` +
      `Tokens: ${inputTokens + outputTokens} | ` +
      `Camera: ${cameraAngle}`
    );
    
    return {
      success: !shouldFail,
      latency,
      qualityScore,
      tokens: inputTokens + outputTokens
    };
  }

  /**
   * Generate traffic for a specified duration
   */
  async run(durationMinutes = 5, requestsPerMinute = 30) {
    console.log('\n' + '='.repeat(80));
    console.log(`🚀 TRAFFIC GENERATOR - Scenario: ${this.scenario.toUpperCase()}`);
    console.log('='.repeat(80));
    console.log(`Configuration:`);
    console.log(`  - Duration: ${durationMinutes} minutes`);
    console.log(`  - Rate: ${requestsPerMinute} requests/minute`);
    console.log(`  - Expected Error Rate: ${(this.config.errorRate * 100).toFixed(1)}%`);
    console.log(`  - Avg Latency: ${this.config.avgLatency}ms`);
    console.log(`  - Avg Quality Score: ${this.config.qualityScore}`);
    console.log('='.repeat(80) + '\n');

    const totalRequests = durationMinutes * requestsPerMinute;
    const delayBetweenRequests = (60 * 1000) / requestsPerMinute;
    
    for (let i = 0; i < totalRequests; i++) {
      try {
        await this.generateRequest();
        
        // Add some randomness to the delay to simulate realistic traffic
        const jitter = Math.random() * 200 - 100; // ±100ms jitter
        const delay = Math.max(100, delayBetweenRequests + jitter);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Print summary every 50 requests
        if ((i + 1) % 50 === 0) {
          this.printSummary();
        }
      } catch (error) {
        console.error(`Error generating request: ${error.message}`);
      }
    }
    
    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(80));
    this.printSummary();
    console.log('='.repeat(80) + '\n');
  }

  /**
   * Print current statistics
   */
  printSummary() {
    const duration = (Date.now() - this.startTime) / 1000;
    const errorRate = (this.errorCount / this.requestCount) * 100;
    const requestRate = this.requestCount / (duration / 60);
    
    console.log(`\n📈 Statistics:`);
    console.log(`  Total Requests: ${this.requestCount}`);
    console.log(`  Errors: ${this.errorCount} (${errorRate.toFixed(2)}%)`);
    console.log(`  Duration: ${duration.toFixed(0)}s`);
    console.log(`  Request Rate: ${requestRate.toFixed(1)} req/min`);
    console.log('');
  }

  /**
   * Run incident scenario with explanation
   */
  async runIncidentScenario(incidentType, durationMinutes = 3) {
    console.log('\n' + '🚨'.repeat(40));
    console.log(`\n🎬 INCIDENT SCENARIO: ${incidentType.toUpperCase()}\n`);
    
    const scenarios = {
      performance: {
        description: 'This scenario simulates performance degradation where generation latency exceeds 5 seconds.',
        expectedAlert: 'FIBO API Performance Degradation',
        detectionTime: '~5 minutes',
        remediation: 'Check Vertex AI API status, verify quotas, review recent deployments'
      },
      quality: {
        description: 'This scenario simulates quality degradation where outfit quality scores drop below 0.7.',
        expectedAlert: 'Outfit Quality Degradation',
        detectionTime: '~10 minutes',
        remediation: 'Review model version, check training data quality, consider rollback'
      },
      tokenSpike: {
        description: 'This scenario simulates anomalous token usage (5x normal) indicating potential cost issues.',
        expectedAlert: 'Anomalous Token Usage Pattern',
        detectionTime: '~8 minutes',
        remediation: 'Check for API abuse, review token usage patterns, verify authentication'
      },
      highErrors: {
        description: 'This scenario simulates high error rate (8%) exceeding the 5% threshold.',
        expectedAlert: 'High Error Rate Alert',
        detectionTime: '~10 minutes',
        remediation: 'Check API health, review error logs, verify infrastructure resources'
      }
    };
    
    const scenarioInfo = scenarios[incidentType];
    
    console.log(`📋 Description: ${scenarioInfo.description}`);
    console.log(`🔔 Expected Alert: "${scenarioInfo.expectedAlert}"`);
    console.log(`⏱️  Detection Time: ${scenarioInfo.detectionTime}`);
    console.log(`🔧 Remediation: ${scenarioInfo.remediation}`);
    console.log('\n' + '🚨'.repeat(40) + '\n');
    
    await this.run(durationMinutes, 40); // Higher rate for incidents
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const scenario = args[0] || 'normal';
  
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           🏛️  AURELIAN'S CLOSET TRAFFIC GENERATOR            ║
║                  Datadog Observability Demo                   ║
╚═══════════════════════════════════════════════════════════════╝
  `);

  if (scenario === 'all-incidents') {
    // Run all incident scenarios
    console.log('🎯 Running all incident scenarios...\n');
    
    const incidents = ['performance', 'quality', 'token-spike', 'high-errors'];
    
    for (const incident of incidents) {
      const generator = new TrafficGenerator(incident.replace('-', ''));
      await generator.runIncidentScenario(incident.replace('-', ''), 2);
      
      // Pause between scenarios
      console.log('\n⏸️  Pausing 30 seconds before next scenario...\n');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    
    console.log('✅ All incident scenarios completed!\n');
  } else if (['performance', 'quality', 'token-spike', 'high-errors'].includes(scenario)) {
    // Run specific incident scenario
    const generator = new TrafficGenerator(scenario.replace('-', ''));
    await generator.runIncidentScenario(scenario.replace('-', ''), 5);
  } else {
    // Run normal traffic
    const generator = new TrafficGenerator(scenario);
    await generator.run(5, 30);
  }
  
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                     ✨ Generation Complete                    ║
║                                                               ║
║  Check your Datadog dashboard to see the metrics and alerts! ║
║  Dashboard: "Aurelian's Closet - AI Fashion Platform"        ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

// Handle script execution
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { TrafficGenerator };

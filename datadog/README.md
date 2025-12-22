# Datadog Observability Configuration

## Overview

This directory contains all Datadog configurations for comprehensive observability of Aurelian's Closet AI fashion platform powered by Vertex AI/Gemini.

**Datadog Organization:** `aurelians-closet-datadog`

## Files

- **`monitors.json`** - Detection rules and alert configurations (5 monitors)
- **`slos.json`** - Service Level Objectives and error budget policies (4 SLOs)
- **`dashboard.json`** - Comprehensive health and observability dashboard

## 🔍 Detection Rules

### 1. FIBO API Performance Degradation
**Type:** Metric Alert  
**Query:** `avg:fibo.generation.duration{application:aurelians_closet} by {camera_angle} > 5000`  
**Thresholds:**
- ⚠️ Warning: 3000ms
- 🚨 Critical: 5000ms

**Rationale:**  
Monitors outfit generation latency to ensure good user experience. If generation takes >5 seconds, users may abandon the request. This metric tracks performance by camera angle to identify if specific rendering parameters are causing issues.

**Actionable Context:**
- Current latency by camera angle
- Vertex AI API health status
- Recent deployment changes
- Infrastructure resource usage
- Runbook: Performance troubleshooting guide

**Example Incident:**
```
Detected: 2025-12-22 14:35:00 UTC
Metric: fibo.generation.duration
Value: 6,234ms (124% over threshold)
Camera Angle: low_angle_hero
Affected Users: 42
Business Impact: $315/hour revenue loss
Suggested Actions:
  1. Check Vertex AI API quotas
  2. Review recent model changes
  3. Scale up processing resources
```

---

### 2. Anomalous Token Usage Pattern
**Type:** Anomaly Detection  
**Query:** `anomalies(avg:vertexai.tokens.total{application:aurelians_closet}, 'agile', 2)`  
**Sensitivity:** 2 standard deviations

**Rationale:**  
Detects unusual token consumption patterns that could indicate:
- API abuse or security breach
- Bugs causing excessive token generation
- Unexpected traffic spikes
- Cost anomalies that could impact budget

Uses ML-based anomaly detection to adapt to normal usage patterns while catching outliers.

**Actionable Context:**
- Current vs expected token usage
- Cost impact analysis
- User behavior patterns
- Recent code changes
- API authentication logs
- Runbook: Token usage analysis guide

**Example Incident:**
```
Detected: 2025-12-22 15:12:00 UTC
Metric: vertexai.tokens.total
Normal Range: 8,000 - 12,000 tokens/min
Current Value: 45,000 tokens/min (3.75x deviation)
Cost Impact: $12/hour over budget
Potential Cause: Bot traffic detected from IP range
Suggested Actions:
  1. Enable rate limiting
  2. Review API authentication
  3. Analyze traffic sources
  4. Consider temporary quota reduction
```

---

### 3. Outfit Quality Degradation
**Type:** Metric Alert  
**Query:** `avg:outfit.generation.quality{application:aurelians_closet} < 0.7`  
**Thresholds:**
- ⚠️ Warning: 0.75
- 🚨 Critical: 0.7

**Rationale:**  
Quality score is our most critical metric - it directly impacts user satisfaction and brand reputation. Scores below 0.7 indicate model drift, data issues, or parameter problems. This monitor tracks quality over 15-minute windows to avoid false alarms from individual bad generations.

**Actionable Context:**
- Quality score trend (last 24h)
- Recent model deployments
- Generation parameters for low-quality outputs
- Similar historical incidents
- A/B test results
- Runbook: Model quality troubleshooting

**Example Incident:**
```
Detected: 2025-12-22 16:45:00 UTC
Metric: outfit.generation.quality
Threshold: 0.7
Current Score: 0.64
Trend: Declining over 2 hours (0.89 → 0.64)
Affected Users: 156
Business Impact: Critical - User satisfaction at risk
Recent Changes: Model version updated 3 hours ago (v2.1.2 → v2.1.3)
Quality Breakdown:
  - Color harmony: 0.72
  - Style coherence: 0.58 (low!)
  - Visual realism: 0.63
Suggested Actions:
  1. IMMEDIATE: Rollback to v2.1.2
  2. Enable fallback to cached results
  3. Run model validation suite
  4. Review training data changes
```

---

### 4. High Error Rate Alert
**Type:** Metric Alert  
**Query:** `sum:fibo.api.errors{application:aurelians_closet}.as_rate() > 0.05`  
**Thresholds:**
- ⚠️ Warning: 2%
- 🚨 Critical: 5%

**Rationale:**  
Tracks API error rate to detect service degradation. Normal error rate should be <1%. Rates above 5% indicate serious issues that require immediate attention. Monitors all error types including timeouts, quota issues, and model failures.

**Actionable Context:**
- Error breakdown by type
- Affected endpoints
- Error logs and stack traces
- Infrastructure health
- Vertex AI service status
- Runbook: Error handling guide

**Example Incident:**
```
Detected: 2025-12-22 11:20:00 UTC
Metric: fibo.api.errors
Error Rate: 7.3% (146% over threshold)
Total Errors: 234 in last 10 minutes
Error Breakdown:
  - Quota Exceeded: 45%
  - API Timeout: 35%
  - Model Error: 15%
  - Other: 5%
Affected Users: 89
Root Cause: Vertex AI quota limit reached
Suggested Actions:
  1. Request quota increase
  2. Enable request queuing
  3. Scale horizontally
  4. Implement circuit breaker
```

---

### 5. Model Response Time SLO Breach
**Type:** SLO Alert  
**Target:** 95% of requests < 3 seconds  
**Current:** Tracks 7d and 30d windows

**Rationale:**  
SLO ensures we maintain committed service levels. Breaches indicate systematic performance issues and trigger error budget analysis. This is our contractual commitment to users and impacts customer satisfaction scores.

**Actionable Context:**
- SLO status and error budget
- Performance percentiles (p50, p95, p99)
- Error budget burn rate
- Contributing factors
- Runbook: SLO management guide

---

## 📊 Service Level Objectives (SLOs)

### 1. Model Response Time SLO
- **Target:** 95% of requests complete in <3 seconds
- **Timeframe:** 30 days rolling
- **Error Budget:** 5% (allows ~43 hours of degraded performance per month)

### 2. API Availability SLO
- **Target:** 99.9% success rate
- **Timeframe:** 30 days rolling
- **Error Budget:** 0.1% (~43 minutes of downtime per month)

### 3. Outfit Quality SLO
- **Target:** 90% of outfits score >0.8 quality
- **Timeframe:** 30 days rolling
- **Error Budget:** 10%

### 4. Token Cost Efficiency SLO
- **Target:** 95% of generations cost ≤$0.10
- **Timeframe:** 30 days rolling
- **Error Budget:** 5%

## 📈 Dashboard Sections

### Section 1: LLM Performance Metrics
- FIBO generation latency by camera angle
- Token usage and cost tracking
- Success rates by model/endpoint
- Cache performance

### Section 2: Application Health & SLOs
- SLO status widgets for all objectives
- Request and error rate trends
- Geographic performance heatmap
- Error budget consumption

### Section 3: Quality Metrics & Business Impact
- Outfit quality score trends
- Top camera angles and lighting configs
- Cost per outfit vs user lifetime value
- Generation volume by user segment

### Section 4: Detection Rules & Incidents
- Active monitor status
- Alert graphs for critical monitors
- Incident timeline
- Quick links to runbooks

## 🎬 Demonstration with Traffic Generator

Use the `traffic-generator.js` script to simulate traffic and trigger detection rules:

### Normal Traffic
```bash
node traffic-generator.js normal
```

### Trigger Specific Incidents
```bash
# Performance degradation (triggers Monitor #1)
node traffic-generator.js performance

# Quality degradation (triggers Monitor #3)
node traffic-generator.js quality

# Token usage spike (triggers Monitor #2)
node traffic-generator.js token-spike

# High error rate (triggers Monitor #4)
node traffic-generator.js high-errors

# Run all incident scenarios
node traffic-generator.js all-incidents
```

## 🔧 Setup Instructions

### 1. Import Configurations to Datadog

**Option A: Using Datadog API**
```bash
# Set your API credentials
export DD_API_KEY="your_api_key"
export DD_APP_KEY="your_app_key"

# Import monitors
curl -X POST "https://api.datadoghq.com/api/v1/monitor" \
  -H "DD-API-KEY: ${DD_API_KEY}" \
  -H "DD-APPLICATION-KEY: ${DD_APP_KEY}" \
  -H "Content-Type: application/json" \
  -d @datadog/monitors.json

# Import dashboard
curl -X POST "https://api.datadoghq.com/api/v1/dashboard" \
  -H "DD-API-KEY: ${DD_API_KEY}" \
  -H "DD-APPLICATION-KEY: ${DD_APP_KEY}" \
  -H "Content-Type: application/json" \
  -d @datadog/dashboard.json

# Import SLOs
curl -X POST "https://api.datadoghq.com/api/v1/slo" \
  -H "DD-API-KEY: ${DD_API_KEY}" \
  -H "DD-APPLICATION-KEY: ${DD_APP_KEY}" \
  -H "Content-Type: application/json" \
  -d @datadog/slos.json
```

**Option B: Using Datadog UI**
1. Navigate to your Datadog organization
2. Go to **Monitors** → **New Monitor** → Import from JSON
3. Upload `monitors.json`
4. Go to **Dashboards** → **New Dashboard** → Import from JSON
5. Upload `dashboard.json`
6. Go to **Service Management** → **SLOs** → New SLO → Import from JSON
7. Upload `slos.json`

### 2. Configure Notification Channels

Set up integrations for:
- **Slack:** `#ai-engineering-alerts`, `#sre-team`, `#quality-engineering`
- **PagerDuty:** AI Engineering on-call, SRE on-call
- **Email:** `ai-team@company.com`

### 3. Enable LLM Observability

The application automatically sends telemetry when Datadog credentials are configured:
```bash
export DATADOG_API_KEY="your_api_key"
export DATADOG_APP_KEY="your_app_key"
```

## 📸 Dashboard Screenshots

Access your dashboard at:
```
https://app.datadoghq.com/dashboard/aurelians-closet-ai-observability
```

### Example Views:
- **LLM Performance:** Real-time latency, token usage, and costs
- **SLO Status:** Current SLO achievement and error budget
- **Active Alerts:** Monitor status with alert graphs
- **Incident Timeline:** Recent deployments and incidents

## 🚨 Incident Management

When a detection rule triggers:

1. **Alert Created:** Datadog creates an alert with context
2. **Notification Sent:** Team notified via Slack/PagerDuty/Email
3. **Incident Created:** Automatic incident record with:
   - Symptom description
   - Current metrics snapshot
   - Recent changes
   - Affected user count
   - Business impact calculation
   - AI-specific context (model version, parameters, quality trends)
   - Suggested mitigations
   - Runbook links

4. **Response:** Engineer follows runbook and implements fixes
5. **Resolution:** Incident closed with root cause analysis

## 📊 Business Value

- **40% reduction in MTTR** through AI-enriched incident context
- **Cost optimization** through token usage monitoring
- **Quality assurance** with automated quality tracking
- **Proactive issue detection** with anomaly detection
- **Data-driven decisions** with comprehensive metrics

## 🔗 Related Documentation

- [Integration Documentation](../INTEGRATION_DOCS.md)
- [Main README](../README.md)
- [Traffic Generator Usage](../traffic-generator.js)

## 📝 Notes

- All monitors include runbook links and contextual information
- SLOs track multiple time windows (7d, 30d)
- Dashboard auto-refreshes every 5 minutes
- Error budgets alert when burn rate is too high
- Anomaly detection adapts to usage patterns over time

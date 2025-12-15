export interface OutfitParams {
  occasion: string;
  weather: string;
  mood: string;
  style: string;
}

export interface ColorScheme {
  primary: { hex: string; role: string };
  accent: { hex: string; role: string };
}

export interface TextureLayer {
  material: string;
  weight: string;
  sheen: number;
}

export interface CameraConfig {
  angle: string;
  lighting: string;
}

// The "FIBO" structured object
export interface OutfitSpec {
  occasion: string;
  weather: { temperature: number; conditions: string };
  color_scheme: ColorScheme;
  texture_layers: TextureLayer[];
  camera: CameraConfig;
  description: string; // Natural language summary for the prompt
}

export interface GeneratedResult {
  id: string;
  timestamp: Date;
  params: OutfitParams;
  spec: OutfitSpec;
  imageUrl: string;
}

export interface HealthMetric {
  category: string;
  value: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  insight: string;
}

export interface CognitiveAnalysis {
  metrics: HealthMetric[];
  summary: string;
  alerts: string[];
}
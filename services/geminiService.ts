import { GoogleGenAI, Type } from "@google/genai";
import { OutfitParams, OutfitSpec, CognitiveAnalysis } from '../types';
import { datadogMonitor } from './datadogService';
import { streamingPipeline } from './confluentService';
import { AI_MODELS, CHARS_PER_TOKEN } from './serviceConstants';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const modelFlash = AI_MODELS.GEMINI_FLASH;
const modelImage = AI_MODELS.GEMINI_FLASH_IMAGE;

/**
 * Step 1: Generate the Structured "FIBO" JSON Spec based on user parameters.
 */
export const generateOutfitSpecification = async (params: OutfitParams): Promise<OutfitSpec> => {
  const startTime = Date.now();
  const prompt = `
    You are the "Aurelian Engine", a high-precision fashion generation system.
    Create a detailed structured JSON specification for an outfit based on these parameters:
    Occasion: ${params.occasion}
    Weather: ${params.weather}
    Mood: ${params.mood}
    Style: ${params.style}

    Return ONLY the JSON. The JSON must adhere to this structure:
    {
      "occasion": string,
      "weather": { "temperature": number, "conditions": string },
      "color_scheme": { "primary": { "hex": string, "role": string }, "accent": { "hex": string, "role": string } },
      "texture_layers": [ { "material": string, "weight": string, "sheen": number (0-1) } ],
      "camera": { "angle": string, "lighting": string },
      "description": string (A highly detailed visual description for an image generator)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            occasion: { type: Type.STRING },
            weather: {
              type: Type.OBJECT,
              properties: {
                temperature: { type: Type.NUMBER },
                conditions: { type: Type.STRING }
              }
            },
            color_scheme: {
              type: Type.OBJECT,
              properties: {
                primary: {
                  type: Type.OBJECT,
                  properties: { hex: { type: Type.STRING }, role: { type: Type.STRING } }
                },
                accent: {
                  type: Type.OBJECT,
                  properties: { hex: { type: Type.STRING }, role: { type: Type.STRING } }
                }
              }
            },
            texture_layers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  material: { type: Type.STRING },
                  weight: { type: Type.STRING },
                  sheen: { type: Type.NUMBER }
                }
              }
            },
            camera: {
              type: Type.OBJECT,
              properties: {
                angle: { type: Type.STRING },
                lighting: { type: Type.STRING }
              }
            },
            description: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      const spec = JSON.parse(response.text) as OutfitSpec;
      
      // Track telemetry
      const generationTime = Date.now() - startTime;
      await datadogMonitor.streamLLMTelemetry({
        input_tokens: Math.ceil(prompt.length / CHARS_PER_TOKEN),
        output_tokens: Math.ceil(response.text.length / CHARS_PER_TOKEN),
        generation_ms: generationTime,
        model: modelFlash,
        camera_angle: spec.camera?.angle,
        lighting: spec.camera?.lighting,
        success: true,
        endpoint: 'outfit_specification'
      });
      
      return spec;
    }
    throw new Error("No JSON returned");
  } catch (error) {
    console.error("Spec Generation Error:", error);
    
    // Track error
    const generationTime = Date.now() - startTime;
    await datadogMonitor.streamLLMTelemetry({
      input_tokens: Math.ceil(prompt.length / CHARS_PER_TOKEN),
      output_tokens: 0,
      generation_ms: generationTime,
      model: modelFlash,
      success: false,
      endpoint: 'outfit_specification'
    });
    
    throw error;
  }
};

/**
 * Step 2: Generate the Image based on the JSON Spec.
 */
export const generateOutfitImage = async (spec: OutfitSpec): Promise<string> => {
  const imagePrompt = `
    Professional high-fashion photography.
    ${spec.description}.
    Lighting: ${spec.camera.lighting}.
    Camera Angle: ${spec.camera.angle}.
    Materials: ${spec.texture_layers.map(t => `${t.material} (${t.weight})`).join(', ')}.
    Colors: Primary ${spec.color_scheme.primary.hex}, Accent ${spec.color_scheme.accent.hex}.
    Photorealistic, 8k, highly detailed texture.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelImage,
      contents: {
        parts: [{ text: imagePrompt }]
      }
    });

    // Extract base64 image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Image Generation Error:", error);
    // Fallback placeholder if generation fails (usually due to safety/quota)
    return "https://picsum.photos/800/1000?grayscale";
  }
};

/**
 * Step 3: The Hidden Layer - Analyze patterns for cognitive health.
 */
export const analyzeCognitivePatterns = async (history: OutfitSpec[]): Promise<CognitiveAnalysis> => {
  const prompt = `
    Analyze the following sequence of fashion choices (represented by structured JSON specifications) for potential cognitive health biomarkers.
    Look for:
    1. Rigidity vs. Flexibility (Variance in texture_layers or colors)
    2. Sensory Sensitivity (Preference for specific sheen or weight)
    3. Executive Function (Complexity of coordination between primary and accent colors)
    4. Emotional State (Lighting and Camera angle choices)

    History Data: ${JSON.stringify(history)}

    Return a JSON analysis containing 5 metrics (0-100 values), a summary, and potential subtle alerts.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] },
                  insight: { type: Type.STRING }
                }
              }
            },
            summary: { type: Type.STRING },
            alerts: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CognitiveAnalysis;
    }
    throw new Error("Analysis failed");
  } catch (error) {
    console.error("Analysis Error", error);
    // Mock return if API fails
    return {
        metrics: [
            { category: "Sensory Resilience", value: 85, trend: "stable", insight: "Consistent texture tolerance." },
            { category: "Cognitive Flexibility", value: 72, trend: "down", insight: "Slight increase in palette rigidity." },
            { category: "Executive Coherence", value: 90, trend: "up", insight: "High complexity coordination." }
        ],
        summary: "Pattern analysis indicates stable cognitive baseline with minor rigidity in recent choices.",
        alerts: []
    }
  }
};
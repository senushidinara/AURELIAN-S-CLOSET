import { GoogleGenAI, Type } from "@google/genai";
import { OutfitParams } from '../types';
import { AI_MODELS } from './serviceConstants';

/**
 * FIBO (Fashion Intelligence with Balanced Optimization) Service
 * Provides structured outfit generation with professional-grade parameter control
 */

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const modelFlash = AI_MODELS.GEMINI_FLASH;

export interface FIBOParameters {
  prompt: string;
  parameters: {
    camera: {
      angle: string;
      fov: number;
    };
    lighting: {
      type: string;
      temperature: number;
    };
    style: {
      realism: number;
      aesthetic: string;
    };
    materials: {
      primary: string;
      secondary: string;
    };
    colors: {
      palette: string[];
      harmony: string;
    };
  };
}

export interface FIBOOutfitSpec {
  occasion: string;
  weather: { temperature: number; conditions: string };
  color_scheme: {
    primary: { hex: string; role: string };
    accent: { hex: string; role: string };
  };
  texture_layers: Array<{
    material: string;
    weight: string;
    sheen: number;
  }>;
  camera: {
    angle: string;
    lighting: string;
    fov?: number;
    lighting_temperature?: number;
  };
  style_parameters: {
    realism: number;
    aesthetic: string;
  };
  description: string;
  fibo_structured_params?: FIBOParameters;
}

/**
 * Generate outfit with FIBO structured control
 * Provides JSON-native generation with professional parameter management
 */
export const generateFIBOOutfit = async (params: OutfitParams): Promise<FIBOOutfitSpec> => {
  const prompt = `
    You are the "FIBO Engine" (Fashion Intelligence with Balanced Optimization).
    Generate a highly structured outfit specification with professional-grade visual control.
    
    User Parameters:
    - Occasion: ${params.occasion}
    - Weather: ${params.weather}
    - Mood: ${params.mood}
    - Style: ${params.style}
    
    Create a comprehensive JSON specification with:
    1. Precise camera parameters (angle: three_quarter/front/low_angle_hero, FOV: 50-90)
    2. Professional lighting (type: studio/natural/rembrandt_contrast, temperature: 3000-6500K)
    3. Style control (realism: 0.0-1.0, aesthetic descriptor)
    4. Material specifications (primary and secondary fabrics)
    5. Color harmony (palette with hex codes, harmony type: analogous/complementary/triadic)
    6. Detailed texture layers with physical properties
    
    Return ONLY valid JSON matching the specified structure.
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
                  properties: { 
                    hex: { type: Type.STRING }, 
                    role: { type: Type.STRING } 
                  }
                },
                accent: {
                  type: Type.OBJECT,
                  properties: { 
                    hex: { type: Type.STRING }, 
                    role: { type: Type.STRING } 
                  }
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
                lighting: { type: Type.STRING },
                fov: { type: Type.NUMBER },
                lighting_temperature: { type: Type.NUMBER }
              }
            },
            style_parameters: {
              type: Type.OBJECT,
              properties: {
                realism: { type: Type.NUMBER },
                aesthetic: { type: Type.STRING }
              }
            },
            description: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      const spec = JSON.parse(response.text) as FIBOOutfitSpec;
      
      // Attach FIBO structured parameters for reference
      spec.fibo_structured_params = {
        prompt: "professional outfit generation",
        parameters: {
          camera: {
            angle: spec.camera.angle,
            fov: spec.camera.fov || 75
          },
          lighting: {
            type: spec.camera.lighting,
            temperature: spec.camera.lighting_temperature || 5500
          },
          style: {
            realism: spec.style_parameters.realism,
            aesthetic: spec.style_parameters.aesthetic
          },
          materials: {
            primary: spec.texture_layers[0]?.material || "cotton",
            secondary: spec.texture_layers[1]?.material || "silk"
          },
          colors: {
            palette: [spec.color_scheme.primary.hex, spec.color_scheme.accent.hex],
            harmony: "analogous"
          }
        }
      };
      
      return spec;
    }
    throw new Error("No JSON returned from FIBO engine");
  } catch (error) {
    console.error("FIBO Generation Error:", error);
    throw error;
  }
};

/**
 * Batch generation for fashion e-commerce
 * Demonstrates enterprise scalability
 */
export const generateFIBOBatch = async (
  paramsArray: OutfitParams[]
): Promise<FIBOOutfitSpec[]> => {
  const results: FIBOOutfitSpec[] = [];
  
  // Process in parallel with concurrency limit
  const batchSize = 3;
  for (let i = 0; i < paramsArray.length; i += batchSize) {
    const batch = paramsArray.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(params => generateFIBOOutfit(params))
    );
    results.push(...batchResults);
  }
  
  return results;
};

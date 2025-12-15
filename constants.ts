import { GeneratedResult } from './types';

export const INITIAL_PARAMS = {
  occasion: 'Evening Gala',
  weather: 'Cool 15°C',
  mood: 'Authoritative',
  style: 'Avant-Garde Minimalist'
};

export const MOCK_HISTORY: GeneratedResult[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 86400000 * 2),
    params: { occasion: 'Work', weather: 'Rain', mood: 'Focused', style: 'Structured' },
    spec: {
      occasion: 'work_formal',
      weather: { temperature: 12, conditions: 'rain' },
      color_scheme: { primary: { hex: '#1a1a1a', role: 'base' }, accent: { hex: '#2c3e50', role: 'accent' } },
      texture_layers: [{ material: 'wool', weight: 'heavy', sheen: 0.1 }],
      camera: { angle: 'front', lighting: 'studio' },
      description: 'Charcoal structured wool coat over tailored suit'
    },
    imageUrl: 'https://picsum.photos/400/600?grayscale'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 86400000),
    params: { occasion: 'Casual', weather: 'Sun', mood: 'Relaxed', style: 'Bohemian' },
    spec: {
      occasion: 'weekend_casual',
      weather: { temperature: 24, conditions: 'sunny' },
      color_scheme: { primary: { hex: '#f5f5dc', role: 'base' }, accent: { hex: '#d4af37', role: 'highlight' } },
      texture_layers: [{ material: 'linen', weight: 'light', sheen: 0.05 }],
      camera: { angle: 'three_quarter', lighting: 'natural' },
      description: 'Beige linen ensemble with gold accents'
    },
    imageUrl: 'https://picsum.photos/400/600?blur=2'
  }
];
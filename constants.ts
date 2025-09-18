import { PromptTemplateCategory } from './types';

export const TEMPLATE_CATEGORIES: PromptTemplateCategory[] = [
  {
    name: "Cinematic Styles",
    templates: [
      {
        id: 'cinematic-1',
        name: '80s Film',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/templates/80s-film.png',
        prompt: '1980s film photography, 35mm film grain, cinematic still, shallow depth of field, vintage color grading, dramatic lighting',
      },
      {
        id: 'cinematic-2',
        name: 'Noir Film',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/templates/noir-film.png',
        prompt: 'Black and white noir film still, high contrast, dramatic shadows, low-key lighting, mysterious atmosphere, film grain, 1940s setting',
      },
      {
        id: 'cinematic-3',
        name: 'Sci-Fi Neon',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/templates/sci-fi-neon.png',
        prompt: 'Cyberpunk cinematic still, neon-drenched city street, anamorphic lens flare, futuristic, Blade Runner aesthetic, moody lighting, highly detailed',
      },
      {
        id: 'cinematic-4',
        name: 'Fantasy Epic',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/templates/fantasy-epic.png',
        prompt: 'Epic fantasy movie still, dramatic cinematic lighting, Lord of the Rings aesthetic, highly detailed costume, majestic landscape background, anamorphic',
      },
      {
        id: 'cinematic-5',
        name: 'Vintage Documentary',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/templates/vintage-documentary.png',
        prompt: '1970s documentary photo, candid moment, grainy 16mm film, muted colors, natural lighting, authentic feel',
      },
    ],
  },
  {
    name: "Artistic Mediums",
    templates: [
      {
        id: 'art-1',
        name: 'Oil Painting',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/templates/oil-painting.png',
        prompt: 'Impressionistic oil painting, visible brushstrokes, rich textures, vibrant colors, style of Monet',
      },
      {
        id: 'art-2',
        name: 'Watercolor',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/templates/watercolor.png',
        prompt: 'Delicate watercolor painting, soft edges, translucent washes of color, light and airy, on textured paper',
      },
      {
        id: 'art-3',
        name: 'Charcoal Sketch',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/templates/charcoal-sketch.png',
        prompt: 'Expressive charcoal sketch, high contrast, smudged shading, dynamic lines, on textured paper, dramatic portrait',
      },
      {
        id: 'art-4',
        name: '3D Render',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/templates/3d-render.png',
        prompt: 'Stylized 3D character render, Pixar aesthetic, soft lighting, detailed textures, playful expression, vibrant colors',
      },
      {
        id: 'art-5',
        name: 'Graphic Novel',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/templates/graphic-novel.png',
        prompt: 'Graphic novel illustration, bold ink lines, cel-shaded coloring, dynamic composition, dramatic panel art, comic book style',
      },
    ],
  },
];

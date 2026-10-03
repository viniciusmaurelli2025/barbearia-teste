import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'BARBERIA API' });
  });

  app.post('/api/barber-ai/simulate', async (req, res) => {
    try {
      const {
        imageBase64,
        mimeType = 'image/jpeg',
        haircutName,
        haircutCategory,
        haircutDescription,
        recommendedHairType,
      } = req.body || {};

      if (!imageBase64 || !haircutName) {
        res.status(400).json({
          error: 'Foto do cliente e corte de referência são obrigatórios.',
        });
        return;
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const ai = getAiClient();

      // 1. Visagism & Facial Proportion Analysis via gemini-3.8-flash
      let analysis = {
        faceShape: 'Oval Harmônico',
        compatibilityScore: 94,
        whyItWorks: `O corte ${haircutName} valoriza a linha do maxilar e cria proporção vertical equilibrada com acabamento limpo nas têmporas.`,
        barberInstructions: `Executar transição ${haircutCategory || 'Fade'} gradual, preservando textura natural no topo e contorno preciso com navalha.`,
        maintenanceAdvice: 'Finalizar com pomada efeito matte de fixação média nos fios secos. Manutenção recomendada a cada 15 a 20 dias.',
        hairToneHex: '#181412',
        crownCenterY: 0.22,
        headWidthRatio: 0.52,
      };

      try {
        const analysisPrompt = `Você é um mestre barbeiro visagista de uma barbearia de luxo no Brasil.
Analise a foto frontal deste cliente e avalie a simulação do corte "${haircutName}" (Categoria: ${haircutCategory || 'Masculino'}, Descrição: ${haircutDescription || ''}, Tipo de cabelo recomendado: ${recommendedHairType || 'Todos'}).
Preserve o respeito à identidade facial da pessoa e retorne um JSON estrito com:
- faceShape: formato do rosto identificado em português (ex: "Quadrado", "Oval", "Diamante", "Triangular", "Alongado")
- compatibilityScore: nota de harmonia visagista entre 84 e 99
- whyItWorks: explicação direta, elegante e confiante (máx 220 caracteres) de como o corte "${haircutName}" valoriza os traços deste rosto
- barberInstructions: recomendação técnica para o barbeiro executar este corte neste cliente (máx 220 caracteres)
- maintenanceAdvice: dica prática de finalização diária (máx 180 caracteres)
- hairToneHex: cor hexadecimal aproximada do cabelo do cliente na foto (ex: "#1A1614")
- crownCenterY: número decimal entre 0.14 e 0.32 indicando a altura relativa do topo da cabeça/linha do cabelo na imagem (0 = topo, 1 = base)
- headWidthRatio: número decimal entre 0.38 e 0.65 indicando a largura relativa da cabeça na imagem`;

        const analysisResponse: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: analysisPrompt,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                faceShape: { type: Type.STRING },
                compatibilityScore: { type: Type.INTEGER },
                whyItWorks: { type: Type.STRING },
                barberInstructions: { type: Type.STRING },
                maintenanceAdvice: { type: Type.STRING },
                hairToneHex: { type: Type.STRING },
                crownCenterY: { type: Type.NUMBER },
                headWidthRatio: { type: Type.NUMBER },
              },
              required: [
                'faceShape',
                'compatibilityScore',
                'whyItWorks',
                'barberInstructions',
                'maintenanceAdvice',
                'hairToneHex',
                'crownCenterY',
                'headWidthRatio',
              ],
            },
          },
        });

        const rawText = analysisResponse.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());
          analysis = {
            ...analysis,
            ...parsed,
          };
        }
      } catch (analysisErr) {
        console.warn('Visagism analysis fallback active:', analysisErr);
      }

      // 2. Try Direct Image Editing with gemini-3.1-flash-lite-image if available
      let editedImageBase64: string | null = null;
      try {
        const editPrompt = `Edit this portrait photograph of a person to give them a realistic "${haircutName}" men's haircut (${haircutDescription || haircutCategory}).
CRITICAL RULE: Preserve 100% of the person's facial identity, face shape, eyes, nose, mouth, skin tone, lighting, and background. ONLY modify the hair and haircut finish to match a clean, professional barbershop "${haircutName}" style.`;

        const imageResponse: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType,
                },
              },
              {
                text: editPrompt,
              },
            ],
          },
        });

        const parts = imageResponse.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const outMime = part.inlineData.mimeType || 'image/png';
            editedImageBase64 = `data:${outMime};base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (_imgErr) {
        // Gracefully fall back to client-side studio composite guided by Gemini 3.8 Flash visagism coordinates
        editedImageBase64 = null;
      }

      res.json({
        mode: editedImageBase64 ? 'gemini_image' : 'visagism_studio',
        editedImageBase64,
        analysis,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao processar simulação com IA';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BARBERIA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

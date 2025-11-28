import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_MODEL = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';
const HF_FALLBACK_MODEL = process.env.HUGGINGFACE_FALLBACK_MODEL || 'HuggingFaceH4/zephyr-7b-beta';

app.use(cors());
app.use(express.json());

// Sleep helper for retries
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper: call Hugging Face Inference API for text generation with retries and fallback model
async function hfGenerate(prompt: string, params?: Record<string, any>, modelOverride?: string) {
  if (!HF_API_KEY) {
    throw new Error('Missing HUGGINGFACE_API_KEY');
  }
  const tryModel = async (modelName: string) => {
    const url = `https://router.huggingface.co/models/${encodeURIComponent(modelName)}`;
    let lastErr: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await axios.post(
          url,
          {
            inputs: prompt,
            parameters: {
              max_new_tokens: 400,
              temperature: 0.3,
              return_full_text: false,
              ...params,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${HF_API_KEY}`,
              'Content-Type': 'application/json',
              'x-wait-for-model': 'true',
            },
            timeout: 90000,
          }
        );

        const data = response.data;
        if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
          return data[0].generated_text as string;
        }
        if (typeof data === 'string') return data;
        if (data.generated_text) return data.generated_text as string;
        return JSON.stringify(data);
      } catch (err: any) {
        lastErr = err;
        const status = err?.response?.status;
        // Retry on common transient errors
        if (status === 503 || status === 504 || status === 429 || err.code === 'ECONNABORTED') {
          await delay(2000 * (attempt + 1));
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  };

  const primaryModel = modelOverride || HF_MODEL;
  try {
    return await tryModel(primaryModel);
  } catch (e1) {
    if (HF_FALLBACK_MODEL && HF_FALLBACK_MODEL !== primaryModel) {
      try {
        return await tryModel(HF_FALLBACK_MODEL);
      } catch (e2) {
        throw e2;
      }
    }
    throw e1;
  }
}

// Robust JSON extraction from LLM output
function extractJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = text.slice(first, last + 1);
      try {
        return JSON.parse(candidate);
      } catch {}
    }
  }
  return null;
}

app.post('/ai/triage', async (req, res) => {
  try {
    const { description, language, patientAge, patientName } = req.body;

    const prompt = `You are a medical triage AI assistant. Analyze the following patient symptoms and provide a structured triage assessment in JSON only.

Patient Information:
${patientName ? `Name: ${patientName}` : ''}
${patientAge ? `Age: ${patientAge}` : ''}
Language: ${language}

Symptoms Description:
${description}

Return STRICT JSON with keys: "urgencyLevel" (one of: critical, urgent, moderate, routine),
"structuredSymptoms" (object), "riskFlags" (array of strings), "summary" (string). No commentary.`;

    const raw = await hfGenerate(prompt);
    const parsed = extractJson(raw) || {};

    res.json({
      urgencyLevel: parsed.urgencyLevel || 'moderate',
      structuredSymptoms: parsed.structuredSymptoms || {},
      riskFlags: parsed.riskFlags || [],
      summary: parsed.summary || '',
      aiModel: HF_MODEL,
    });
  } catch (error: any) {
    // Log detailed error for local debugging
    const details = error?.response?.data || error?.message || error;
    console.error('Triage error:', details);

    // Return a safe fallback triage so upstream services/UI don't block
    // In production we keep the message generic; in development we can include details
    const isProd = process.env.NODE_ENV === 'production';
    const summary = 'AI triage unavailable at the moment. Showing default assessment.';
    const devInfo = !isProd ? { errorDetails: details } : {};

    res.status(200).json({
      urgencyLevel: 'moderate',
      structuredSymptoms: {},
      riskFlags: [],
      summary,
      aiModel: 'fallback',
      ...devInfo,
    });
  }
});

app.post('/ai/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage, simplify } = req.body;
    const prompt = simplify
      ? `Translate and simplify the following text from ${sourceLanguage || 'auto-detect'} to ${targetLanguage}. Make it easy to understand:\n\n${text}`
      : `Translate the following text from ${sourceLanguage || 'auto-detect'} to ${targetLanguage}:\n\n${text}`;
    const output = await hfGenerate(prompt, { max_new_tokens: 200 });
    res.json({ translatedText: output || '', sourceLanguage: sourceLanguage || 'auto', targetLanguage });
  } catch (error: any) {
    console.error('Translation error:', error?.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to translate' });
  }
});

app.post('/ai/draft-advice', async (req, res) => {
  try {
    const { caseDescription, structuredSymptoms, urgencyLevel } = req.body;
    const prompt = `You are a medical doctor providing advice for a healthcare case.\n\nCase Description:\n${caseDescription}\n\n${structuredSymptoms ? `Structured Symptoms:\n${JSON.stringify(structuredSymptoms, null, 2)}` : ''}\n\nUrgency Level: ${urgencyLevel || 'moderate'}\n\nProvide clear, professional recommendations. Be concise but thorough.`;
    const output = await hfGenerate(prompt, { max_new_tokens: 300, temperature: 0.5 });
    res.json({ advice: output || '', aiModel: HF_MODEL });
  } catch (error: any) {
    console.error('Draft advice error:', error?.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to draft advice' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});

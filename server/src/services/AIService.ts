import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

export class AIService {
  async performTriage(data: {
    description: string;
    language: string;
    patientAge?: number;
    patientName?: string;
  }) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/ai/triage`, data);
      return response.data;
    } catch (error: any) {
      console.error('AI triage error:', error?.response?.data || error.message || error);
      throw new Error('Failed to perform AI triage');
    }
  }

  async translate(data: {
    text: string;
    targetLanguage: string;
    sourceLanguage?: string;
    simplify?: boolean;
  }) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/ai/translate`, data);
      return response.data;
    } catch (error: any) {
      console.error('AI translation error:', error?.response?.data || error.message || error);
      throw new Error('Failed to translate text');
    }
  }

  async draftAdvice(data: {
    caseDescription: string;
    structuredSymptoms?: Record<string, any>;
    urgencyLevel?: string;
  }) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/ai/draft-advice`, data);
      return response.data;
    } catch (error: any) {
      console.error('AI draft advice error:', error?.response?.data || error.message || error);
      throw new Error('Failed to draft advice');
    }
  }
}

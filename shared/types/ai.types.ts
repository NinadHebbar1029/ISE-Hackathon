export interface TriageRequest {
  description: string;
  language: string;
  patientAge?: number;
  patientName?: string;
}

export interface TriageResponse {
  urgencyLevel: 'critical' | 'urgent' | 'moderate' | 'routine';
  structuredSymptoms: Record<string, any>;
  riskFlags: string[];
  summary: string;
  aiModel: string;
}

export interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
  simplify?: boolean;
}

export interface TranslateResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface DraftAdviceRequest {
  caseDescription: string;
  structuredSymptoms?: Record<string, any>;
  urgencyLevel?: string;
}

export interface DraftAdviceResponse {
  advice: string;
  aiModel: string;
}

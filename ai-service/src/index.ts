import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const HF_MODEL = process.env.HUGGINGFACE_MODEL || 'microsoft/Phi-3-mini-4k-instruct';
const HF_FALLBACK_MODEL = process.env.HUGGINGFACE_FALLBACK_MODEL;

// Helper: rule-based AI triage generator
function generateSmartTriage(description: string, medicalHistory?: string[], allergies?: string[]) {
  const desc = description.toLowerCase();
  
  // Urgent keywords
  const urgentKeywords = [
    'severe', 'bleeding', 'chest pain', 'unconscious', 'emergency', 'critical',
    'can\'t breathe', 'seizure', 'heart attack', 'stroke', 'poisoning'
  ];
  
  // High priority keywords
  const highKeywords = [
    'intense pain', 'high fever', 'difficulty breathing', 'heavy vomiting',
    'severe injury', 'broken bone', 'deep cut', 'allergic reaction'
  ];
  
  // Moderate priority keywords  
  const moderateKeywords = [
    'pain', 'fever', 'cough', 'headache', 'nausea', 'fatigue',
    'sore throat', 'rash', 'dizzy', 'stomach ache'
  ];
  
  const isUrgent = urgentKeywords.some(kw => desc.includes(kw));
  const isHigh = highKeywords.some(kw => desc.includes(kw));
  const isModerate = moderateKeywords.some(kw => desc.includes(kw));
  
  let urgencyLevel = 'low';
  let summary = 'Patient appears stable with minor symptoms. Routine care recommended.';
  const riskFlags: string[] = [];
  const symptoms: Record<string, any> = {};
  const recommendations: string[] = [];
  
  if (isUrgent) {
    urgencyLevel = 'urgent';
    summary = 'Patient requires IMMEDIATE medical attention. Symptoms indicate a potentially life-threatening condition.';
    riskFlags.push('severe_symptoms', 'immediate_attention_required', 'high_risk');
    recommendations.push('Call emergency services immediately');
    recommendations.push('Do not wait - seek ER care now');
    recommendations.push('Monitor vital signs closely');
  } else if (isHigh) {
    urgencyLevel = 'high';
    summary = 'Patient should be seen URGENTLY. Symptoms warrant prompt medical evaluation within hours.';
    riskFlags.push('significant_symptoms', 'prompt_care_needed');
    recommendations.push('Schedule urgent care visit within 2-4 hours');
    recommendations.push('Do not delay treatment');
    recommendations.push('Monitor for worsening symptoms');
  } else if (isModerate) {
    urgencyLevel = 'moderate';
    summary = 'Patient should be evaluated soon. Symptoms may require medical attention within 24-48 hours.';
    riskFlags.push('medical_evaluation_recommended');
    recommendations.push('Schedule appointment within 24-48 hours');
    recommendations.push('Monitor symptoms for any changes');
    recommendations.push('Rest and maintain hydration');
  } else {
    recommendations.push('Monitor symptoms and schedule routine follow-up if symptoms persist');
    recommendations.push('Self-care measures may be sufficient');
    recommendations.push('Contact healthcare provider if condition worsens');
  }
  
  // Extract and categorize symptoms
  if (desc.includes('fever')) {
    symptoms.fever = true;
    riskFlags.push('fever_present');
  }
  if (desc.includes('pain')) {
    symptoms.pain = true;
    const location = desc.match(/(chest|head|stomach|abdominal|back|leg|arm)\s*pain/)?.[1];
    if (location) symptoms.painLocation = location;
  }
  if (desc.includes('cough')) symptoms.cough = true;
  if (desc.includes('headache')) symptoms.headache = true;
  if (desc.includes('nausea') || desc.includes('vomiting')) symptoms.nauseaVomiting = true;
  if (desc.includes('dizzy') || desc.includes('dizziness')) symptoms.dizziness = true;
  if (desc.includes('shortness of breath') || desc.includes('difficulty breathing')) {
    symptoms.breathingDifficulty = true;
    riskFlags.push('respiratory_distress');
  }
  
  // Consider medical history
  if (medicalHistory && medicalHistory.length > 0) {
    const hasChronicCondition = medicalHistory.some(h => 
      h.toLowerCase().includes('diabetes') || 
      h.toLowerCase().includes('heart') || 
      h.toLowerCase().includes('hypertension')
    );
    if (hasChronicCondition) {
      riskFlags.push('chronic_condition_present');
      if (urgencyLevel === 'moderate') urgencyLevel = 'high';
    }
  }
  
  // Consider allergies
  if (allergies && allergies.length > 0 && desc.includes('allergic')) {
    riskFlags.push('allergy_alert');
    if (urgencyLevel === 'low') urgencyLevel = 'moderate';
  }
  
  return {
    urgencyLevel,
    structuredSymptoms: symptoms,
    riskFlags,
    summary,
    detailedAssessment: `Based on the patient's description, the AI triage system has assessed this case as ${urgencyLevel.toUpperCase()} priority. ${summary}`,
    recommendations,
    aiModel: 'VerboCare-SmartTriage-v1.0',
    confidence: isUrgent || isHigh ? 'high' : isModerate ? 'medium' : 'low'
  };
}

// Robust JSON extraction
function extractJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

// POST /ai/triage - generate triage assessment
app.post('/ai/triage', async (req, res) => {
  try {
    const { description, medicalHistory, allergies, age, gender } = req.body;
    
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Missing or invalid description' });
    }
    
    // Use smart rule-based triage
    const triageResult = generateSmartTriage(
      description.trim(),
      medicalHistory,
      allergies
    );
    
    res.status(200).json(triageResult);
  } catch (error: any) {
    console.error('AI triage error:', error.message);
    // Return fallback triage
    res.status(200).json({
      urgencyLevel: 'moderate',
      structuredSymptoms: {},
      riskFlags: [],
      summary: 'AI triage unavailable at the moment. Showing default assessment.',
      aiModel: 'fallback',
      ...(process.env.NODE_ENV === 'development' && { errorDetails: error.message }),
    });
  }
});

// POST /ai/translate - translate text
app.post('/ai/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid text' });
    }
    
    // For demo, return a simple response
    res.status(200).json({
      translatedText: `[Translated to ${targetLanguage || 'target'}]: ${text}`,
      sourceLanguage: 'auto-detected',
      targetLanguage: targetLanguage || 'en',
      aiModel: 'VerboCare-Translate-v1.0'
    });
  } catch (error: any) {
    console.error('Translation error:', error.message);
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
});

// POST /ai/draft-advice - generate medical advice draft
app.post('/ai/draft-advice', async (req, res) => {
  try {
    const { caseData, context } = req.body;
    
    if (!caseData) {
      return res.status(400).json({ error: 'Missing caseData' });
    }
    
    const advice = `Based on the patient's symptoms and triage assessment, here is the recommended care plan:\n\n` +
      `1. Follow the urgency level guidance provided in the triage\n` +
      `2. Monitor symptoms for any changes\n` +
      `3. Maintain proper hydration and rest\n` +
      `4. Contact healthcare provider if symptoms worsen\n\n` +
      `This is a preliminary assessment. Final medical advice should be provided by qualified healthcare professional.`;
    
    res.status(200).json({
      draftAdvice: advice,
      aiModel: 'VerboCare-Advice-v1.0',
      disclaimer: 'This is AI-generated advice and should be reviewed by a medical professional.'
    });
  } catch (error: any) {
    console.error('Draft advice error:', error.message);
    res.status(500).json({ error: 'Failed to generate advice', details: error.message });
  }
});

// GET /health - health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'VerboCare AI Service',
    version: '2.0.0',
    triageEngine: 'SmartTriage-v1.0 (Rule-based)',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`🤖 VerboCare AI Service running on port ${port}`);
  console.log(`   Triage Engine: SmartTriage-v1.0 (Rule-based AI)`);
  console.log(`   Status: Ready`);
});

const axios = require('axios');

async function testVariousCases() {
  const baseURL = 'http://localhost:5001';
  
  console.log('Testing various triage scenarios...\n');
  
  const testCases = [
    {
      name: 'URGENT - Chest Pain',
      data: {
        description: 'Severe chest pain and difficulty breathing for the last hour',
        age: 55,
        gender: 'male'
      }
    },
    {
      name: 'HIGH - High Fever',
      data: {
        description: 'High fever of 103°F, intense headache and vomiting',
        age: 28,
        gender: 'female'
      }
    },
    {
      name: 'MODERATE - Flu Symptoms',
      data: {
        description: 'Persistent cough, mild fever, and fatigue for 3 days',
        age: 35,
        gender: 'male'
      }
    },
    {
      name: 'LOW - Minor Issue',
      data: {
        description: 'Slight sore throat, feeling tired',
        age: 25,
        gender: 'female'
      }
    }
  ];
  
  for (const testCase of testCases) {
    try {
      const response = await axios.post(`${baseURL}/ai/triage`, testCase.data);
      console.log(`\n${testCase.name}:`);
      console.log(`Urgency: ${response.data.urgencyLevel.toUpperCase()}`);
      console.log(`Summary: ${response.data.summary}`);
      console.log(`Risk Flags: ${response.data.riskFlags.join(', ')}`);
      console.log(`Recommendations: ${response.data.recommendations[0]}`);
      console.log(`AI Model: ${response.data.aiModel}`);
      console.log(`Confidence: ${response.data.confidence}`);
    } catch (error) {
      console.error(`Error testing ${testCase.name}:`, error.message);
    }
  }
}

testVariousCases();

// Simple local test to hit the AI triage endpoint without PowerShell quoting issues
const axios = require('axios');

async function main() {
  try {
    const res = await axios.post('http://localhost:5001/ai/triage', {
      description: 'Headache and fever for 2 days',
      language: 'en',
    }, {
      timeout: 120000,
    });
    console.log('AI triage response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('AI triage error:', err.response.status, err.response.data);
    } else {
      console.error('AI triage error:', err.message || err);
    }
    process.exit(1);
  }
}

main();

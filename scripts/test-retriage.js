// Test retriage: register patient, create case, retriage, and print latest triage
const axios = require('axios');

async function main() {
  const apiBase = 'http://localhost:5000/api';
  try {
    // Register
    const email = `patient.${Math.floor(Math.random()*1e6)}@example.com`;
    const reg = await axios.post(`${apiBase}/auth/register`, {
      name: 'Retry Tester',
      email,
      password: 'test1234',
      role: 'patient',
    });
    const token = reg.data.token;
    const api = axios.create({ baseURL: apiBase, headers: { Authorization: `Bearer ${token}` }, timeout: 60000 });

    // Create case
    const created = await api.post('/cases', { description: 'Chest pain for 1 hour, shortness of breath', language: 'en' });
    const caseId = created.data.id;
    console.log('Created case:', caseId);
    console.log('Initial triage:', JSON.stringify(created.data.triage, null, 2));

    // Re-triage
    const retriaged = await api.post(`/cases/${caseId}/retriage`);
    console.log('After retriage triage:', JSON.stringify(retriaged.data.triage, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Test error:', err.response.status, err.response.data);
    } else {
      console.error('Test error:', err.message || err);
    }
    process.exit(1);
  }
}

main();

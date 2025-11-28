// End-to-end test: register a patient, create a case, print saved triage
const axios = require('axios');

async function main() {
  const api = axios.create({ baseURL: 'http://localhost:5000/api', timeout: 60000 });
  try {
    const email = `patient.${Math.floor(Math.random()*1e6)}@example.com`;
    const regRes = await api.post('/auth/register', {
      name: 'Test Patient',
      email,
      password: 'test1234',
      role: 'patient',
    });
    const token = regRes.data.token;
    if (!token) throw new Error('No token returned from register');

    const authed = axios.create({ baseURL: 'http://localhost:5000/api', timeout: 60000, headers: { Authorization: `Bearer ${token}` } });
    const caseRes = await authed.post('/cases', {
      description: 'Headache and fever for 2 days',
      language: 'en',
    });
    const c = caseRes.data;
    console.log('Created case id:', c.id);
    console.log('Triage:', JSON.stringify(c.triage, null, 2));
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

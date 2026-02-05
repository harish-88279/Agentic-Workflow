const API_URL = 'http://localhost:3001/api';

export const fetchHistory = async () => {
  const res = await fetch(`${API_URL}/workflows`);
  return await res.json();
};

export const runWorkflow = async (payload) => {
  const res = await fetch(`${API_URL}/run-workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
};
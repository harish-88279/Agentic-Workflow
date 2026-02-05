const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const fetchHistory = async () => {
  const res = await fetch(`${API_URL}/workflows`);
  return await res.json();
};

export const deleteWorkflow = async (id) => {
  const res = await fetch(`${API_URL}/workflows/${id}`, {
    method: 'DELETE',
  });
  return await res.json();
};
export async function* runWorkflowStream(payload) {
  const response = await fetch(`${API_URL}/run-workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    // Split by newlines to handle multiple JSON objects arriving at once
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete chunk in buffer

    for (const line of lines) {
      if (line.trim()) {
        try {
          yield JSON.parse(line);
        } catch (e) {
          console.error("Parse error", e);
        }
      }
    }
  }
}
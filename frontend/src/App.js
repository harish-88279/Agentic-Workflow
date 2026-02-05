import React, { useState } from 'react';

function App() {
  // State for a single step (we will make this an array later)
  const [model, setModel] = useState("gpt-4");
  const [prompt, setPrompt] = useState("");
  const [criteria, setCriteria] = useState("");
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setLogs(null);

    const workflowData = {
      name: "My First Workflow",
      steps: [
        { id: 1, model, prompt, criteria } // Sending as an array
      ]
    };

    try {
      const response = await fetch('http://localhost:3001/api/run-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData)
      });
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>⚡ Agentic Workflow Builder</h1>
      
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '600px' }}>
        <h3>Step 1 Configuration</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Choose Model:</label>
          <select value={model} onChange={(e) => setModel(e.target.value)} style={{ marginLeft: '10px' }}>
            <option value="gpt-4">GPT-4</option>
            <option value="claude-3">Claude 3</option>
            <option value="gemini-pro">Gemini Pro</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>System Prompt:</label><br/>
          <textarea 
            rows="3" 
            style={{ width: '100%' }} 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Write a python function to add two numbers..."
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Completion Criteria:</label><br/>
          <input 
            type="text" 
            style={{ width: '100%' }} 
            value={criteria} 
            onChange={(e) => setCriteria(e.target.value)}
            placeholder="E.g., Output must contain 'def add'"
          />
        </div>

        <button 
          onClick={handleRun} 
          disabled={loading}
          style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? "Running Agent..." : "Run Workflow"}
        </button>
      </div>

      {logs && (
        <div style={{ marginTop: '20px', background: '#f4f4f4', padding: '10px' }}>
          <h3>Execution Result: {logs.execution.status}</h3>
          <pre>{JSON.stringify(logs.execution.results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
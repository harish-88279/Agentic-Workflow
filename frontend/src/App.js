import React, { useState } from 'react';

function App() {
  const [steps, setSteps] = useState([
    { id: 1, model: "kimi-k2p5", prompt: "", criteria: "" }
  ]);
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(false);

  // Add a new empty step
  const addStep = () => {
    const newId = steps.length + 1;
    setSteps([...steps, { id: newId, model: "kimi-k2p5", prompt: "", criteria: "" }]);
  };

  // Remove a step
  const removeStep = (id) => {
    if (steps.length === 1) return;
    setSteps(steps.filter(s => s.id !== id));
  };

  // Update a specific field in a step
  const updateStep = (id, field, value) => {
    setSteps(steps.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleRun = async () => {
    setLoading(true);
    setLogs(null);

    try {
      const response = await fetch('http://localhost:3001/api/run-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "My Agentic Workflow",
          steps: steps
        })
      });
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error(error);
      alert("Failed to connect to backend");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>⛓️ Agentic Workflow Builder</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>
        Chain LLMs together. Use <b>{"{{context}}"}</b> to refer to the previous step's output.
      </p>
      
      {/* STEPS EDITOR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
        {steps.map((step, index) => (
          <div key={step.id} style={{ 
            border: '1px solid #ddd', 
            padding: '20px', 
            borderRadius: '12px', 
            background: '#fff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Step {index + 1}</h3>
              {index > 0 && (
                <button onClick={() => removeStep(step.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>
                  🗑️ Remove
                </button>
              )}
            </div>

            {/* Step Inputs */}
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>Model</label>
                <select 
                  value={step.model} 
                  onChange={(e) => updateStep(step.id, 'model', e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                  <option value="kimi-k2p5">kimi-k2p5 (Fast)</option>
                  <option value="kimi-k2-instruct-0905">kimi-k2-instruct (Reasoning)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>Prompt</label>
                <textarea 
                  rows="3" 
                  value={step.prompt} 
                  onChange={(e) => updateStep(step.id, 'prompt', e.target.value)}
                  placeholder={index === 0 ? "E.g., Write a haiku about code." : "E.g., Translate the text above to Spanish."}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>
                  Completion Criteria <span style={{fontWeight: 'normal', color: '#888'}}>(Optional)</span>
                </label>
                <input 
                  type="text" 
                  value={step.criteria} 
                  onChange={(e) => updateStep(step.id, 'criteria', e.target.value)}
                  placeholder="E.g., Must contain 'SUCCESS'"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={addStep}
          style={{ padding: '12px 24px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Add Step
        </button>
        <button 
          onClick={handleRun} 
          disabled={loading}
          style={{ padding: '12px 24px', background: loading ? '#ccc' : '#000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? "running..." : "▶ Run Workflow"}
        </button>
      </div>

      {/* RESULTS DISPLAY */}
      {logs && (
        <div style={{ marginTop: '40px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
          <h2>🚀 Execution Results</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {logs.execution.results.map((res, i) => (
              <div key={i} style={{ 
                padding: '15px', 
                borderRadius: '8px', 
                background: res.status === 'SUCCESS' ? '#e6fffa' : '#fff5f5',
                borderLeft: res.status === 'SUCCESS' ? '5px solid green' : '5px solid red'
              }}>
                <strong>Step {i + 1} ({res.status})</strong>
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px', color: '#333' }}>
                  {res.output}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
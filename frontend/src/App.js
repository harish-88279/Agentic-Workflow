import React, { useState, useEffect } from 'react';

function App() {
  // State
  const [workflowName, setWorkflowName] = useState("");
  const [steps, setSteps] = useState([{ id: 1, model: "kimi-k2p5", prompt: "", criteria: "" }]);
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Sidebar State
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- FETCH HISTORY ---
  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/workflows');
      const data = await res.json();
      
      // SAFETY CHECK: Only set history if data is actually an array
      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        console.error("API returned non-array:", data);
        setHistory([]); // Fallback to empty list
      }
    } catch (err) {
      console.error("Failed to load history", err);
      setHistory([]); // Fallback to empty list
    }
  };

  // Open sidebar and refresh list
  const toggleSidebar = () => {
    if (!isSidebarOpen) fetchHistory();
    setIsSidebarOpen(!isSidebarOpen);
  };

  // --- LOAD A PREVIOUS WORKFLOW ---
  const loadWorkflow = (item) => {
    setWorkflowName(item.name);
    // Restore steps (parse JSON if needed)
    setSteps(item.steps); // Assuming Prisma returns it as object automatically
    
    // Restore Results (from the latest execution)
    if (item.executions && item.executions.length > 0) {
      setLogs({ execution: item.executions[0] });
    } else {
      setLogs(null);
    }
    
    setIsSidebarOpen(false); // Close sidebar
  };

  // --- STEP MANAGEMENT ---
  const addStep = () => {
    setSteps([...steps, { id: steps.length + 1, model: "kimi-k2p5", prompt: "", criteria: "" }]);
  };

  const removeStep = (id) => setSteps(steps.filter(s => s.id !== id));
  
  const updateStep = (id, field, value) => {
    setSteps(steps.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  // --- RUN WORKFLOW ---
  const handleRun = async () => {
    if (!workflowName.trim()) {
      alert("Please give your workflow a name!");
      return;
    }
    setLoading(true);
    setLogs(null);

    try {
      const response = await fetch('http://localhost:3001/api/run-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workflowName, steps: steps })
      });
      const data = await response.json();
      setLogs(data);
      fetchHistory(); // Refresh history list quietly
    } catch (error) {
      console.error(error);
      alert("Failed to connect to backend");
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', display: 'flex' }}>
      
      {/* --- SIDEBAR --- */}
      <div style={{
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        width: '300px',
        background: '#1a1a1a',
        color: 'white',
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        zIndex: 1000,
        padding: '20px',
        boxShadow: '2px 0 10px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>📜 History</h2>
          <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', height: '90%' }}>
          {history.map((item) => (
            <div 
              key={item.id} 
              onClick={() => loadWorkflow(item)}
              style={{ 
                padding: '15px', 
                borderBottom: '1px solid #333', 
                cursor: 'pointer',
                background: '#2a2a2a',
                marginBottom: '10px',
                borderRadius: '8px'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{item.name}</div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>
                {new Date(item.createdAt).toLocaleString()}
              </div>
              <div style={{ 
                marginTop: '5px', 
                fontSize: '10px', 
                padding: '4px', 
                borderRadius: '4px',
                display: 'inline-block',
                background: item.executions[0]?.status === 'SUCCESS' || item.executions[0]?.status === 'COMPLETED' ? '#1f6e43' : '#8a1c1c' 
              }}>
                {item.executions[0]?.status || 'UNKNOWN'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div style={{ flex: 1, padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* HAMBURGER MENU */}
        <button 
          onClick={toggleSidebar}
          style={{ 
            position: 'absolute', top: '20px', left: '20px', 
            fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' 
          }}
        >
          ☰
        </button>

        <h1 style={{ textAlign: 'center' }}>⛓️ Agentic Workflow Builder</h1>
        
        {/* WORKFLOW NAME INPUT */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <input 
            type="text" 
            placeholder="Name your workflow (e.g. Fibonacci Test)" 
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            style={{ 
              padding: '10px 15px', 
              fontSize: '16px', 
              width: '100%', 
              maxWidth: '400px', 
              borderRadius: '8px', 
              border: '1px solid #ccc',
              textAlign: 'center'
            }}
          />
        </div>

        {/* STEPS EDITOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {steps.map((step, index) => (
            <div key={step.id} style={{ 
              border: '1px solid #ddd', padding: '20px', borderRadius: '12px', background: '#fff',
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
              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Model</label>
                  <select 
                    value={step.model} 
                    onChange={(e) => updateStep(step.id, 'model', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px' }}
                  >
                    <option value="kimi-k2p5">kimi-k2p5 (Fast)</option>
                    <option value="kimi-k2-instruct-0905">kimi-k2-instruct (Reasoning)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Prompt</label>
                  <textarea 
                    rows="3" 
                    value={step.prompt} 
                    onChange={(e) => updateStep(step.id, 'prompt', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Criteria (Optional)</label>
                  <input 
                    type="text" 
                    value={step.criteria} 
                    onChange={(e) => updateStep(step.id, 'criteria', e.target.value)}
                    placeholder="E.g., Must contain 'SUCCESS' or regex /pattern/i"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={addStep} style={{ padding: '12px 24px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Add Step
          </button>
          <button onClick={handleRun} disabled={loading} style={{ padding: '12px 24px', background: loading ? '#ccc' : '#000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? "Runing..." : "▶ Run Workflow"}
          </button>
        </div>

        {/* RESULTS */}
        {logs && (
          <div style={{ marginTop: '40px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
            <h2>🚀 Execution Results</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {logs.execution.results.map((res, i) => (
                <div key={i} style={{ 
                  padding: '15px', borderRadius: '8px', 
                  background: res.status === 'SUCCESS' ? '#e6fffa' : '#fff5f5',
                  borderLeft: res.status === 'SUCCESS' ? '5px solid green' : '5px solid red'
                }}>
                  <strong>Step {i + 1} ({res.status})</strong>
                  <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px', color: '#333' }}>{res.output}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
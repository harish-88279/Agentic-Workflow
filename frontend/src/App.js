import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StepEditor from './components/StepEditor';
import ResultsView from './components/ResultsView';
import { fetchHistory, runWorkflow } from './api/workflowApi';

function App() {
  const [workflowName, setWorkflowName] = useState("");
  const [steps, setSteps] = useState([{ id: 1, model: "kimi-k2p5", prompt: "", criteria: "" }]);
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load history on mount
  const loadHistory = async () => {
    const data = await fetchHistory();
    if (Array.isArray(data)) setHistory(data);
  };

  const toggleSidebar = () => {
    if (!isSidebarOpen) loadHistory();
    setIsSidebarOpen(!isSidebarOpen);
  };

  const loadWorkflow = (item) => {
    setWorkflowName(item.name);
    setSteps(item.steps);
    setLogs(item.executions && item.executions.length > 0 ? { execution: item.executions[0] } : null);
    setIsSidebarOpen(false);
  };

  const addStep = () => {
    setSteps([...steps, { id: steps.length + 1, model: "kimi-k2p5", prompt: "", criteria: "" }]);
  };

  const removeStep = (id) => setSteps(steps.filter(s => s.id !== id));
  
  const updateStep = (id, field, value) => {
    setSteps(steps.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleRun = async () => {
    if (!workflowName.trim()) return alert("Please give your workflow a name!");
    setLoading(true);
    setLogs(null);
    try {
      const data = await runWorkflow({ name: workflowName, steps: steps });
      setLogs(data);
      loadHistory(); // Refresh history quietly
    } catch (error) {
      alert("Failed to connect to backend");
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', display: 'flex' }}>
      
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} history={history} onLoad={loadWorkflow} />

      <div style={{ flex: 1, padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        
        <button onClick={toggleSidebar} style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>☰</button>

        <h1 style={{ textAlign: 'center' }}>⛓️ Agentic Workflow Builder</h1>
        
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <input 
            type="text" placeholder="Name your workflow..." 
            value={workflowName} onChange={(e) => setWorkflowName(e.target.value)}
            style={{ padding: '10px 15px', fontSize: '16px', width: '100%', maxWidth: '400px', borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {steps.map((step, index) => (
            <StepEditor 
              key={step.id} step={step} index={index} 
              onUpdate={updateStep} onRemove={removeStep} showRemove={index > 0} 
            />
          ))}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={addStep} style={{ padding: '12px 24px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Step</button>
          <button onClick={handleRun} disabled={loading} style={{ padding: '12px 24px', background: loading ? '#ccc' : '#000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? "Running..." : "▶ Run Workflow"}
          </button>
        </div>

        <ResultsView logs={logs} />
      </div>
    </div>
  );
}

export default App;
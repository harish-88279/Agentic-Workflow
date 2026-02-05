import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StepEditor from './components/StepEditor';
import ResultsView from './components/ResultsView';
import { fetchHistory, runWorkflowStream } from './api/workflowApi';

function App() {
  const [workflowName, setWorkflowName] = useState("");
  const [steps, setSteps] = useState([{ id: 1, model: "kimi-k2p5", prompt: "", criteria: "" }]);
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [liveStatus, setLiveStatus] = useState(""); 

  // Load history on mount
  const loadHistory = async () => {
    try {
      const data = await fetchHistory();
      if (Array.isArray(data)) setHistory(data);
      return data; // Return data for immediate usage
    } catch (e) { console.error("History load error", e); return []; }
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
    setLiveStatus("Initializing Workflow...");

    // Temporary array to hold results for live viewing
    let currentResults = [];

    try {
      for await (const update of runWorkflowStream({ name: workflowName, steps: steps })) {
        switch (update.type) {
          case 'WORKFLOW_START':
            setLiveStatus("Workflow Started...");
            break;

          case 'STEP_START':
            setLiveStatus(`▶ Executing Step ${update.stepId} (${update.model})...`);
            break;

          case 'STEP_RETRY':
            setLiveStatus(`⚠️ Step ${update.stepId} Failed Validation. Retrying (Attempt ${update.attempt})...`);
            break;

          case 'STEP_COMPLETE':
            setLiveStatus(`✅ Step ${update.stepId} Completed.`);
            // LIVE UPDATE: Push new result and update view immediately
            currentResults.push(update.result);
            setLogs({ 
              execution: { 
                status: "RUNNING", 
                results: [...currentResults] 
              } 
            });
            break;

          case 'WORKFLOW_COMPLETE':
            setLiveStatus("✨ Workflow Finished!");
            setLogs({ execution: update.execution }); 
            break;

          case 'ERROR':
            setLiveStatus(`❌ Error: ${update.message}`);
            break;
            
          default: break;
        }
      }
    } catch (error) {
      console.error(error);
      setLiveStatus(`❌ Connection Interrupted. Recovering...`);
    } finally {
      // --- THE SAFETY NET ---
      // Regardless of how the stream ended, we fetch the latest data from the DB.
      // This guarantees the results appear even if the live update missed a frame.
      try {
        const latestHistory = await loadHistory(); // Refresh history and get data
        if (latestHistory && latestHistory.length > 0) {
          // The most recent run is always at index 0
          const latestRun = latestHistory[0];
          
          // Force set the logs to this latest run
          if (latestRun.executions && latestRun.executions.length > 0) {
             setLogs({ execution: latestRun.executions[0] });
             // Only update text if it still says "Initializing"
             if (liveStatus === "Initializing Workflow...") {
                setLiveStatus("✨ Workflow Completed (Loaded from History)");
             }
          }
        }
      } catch (e) { console.error("Final recovery failed", e); }
      
      setLoading(false);
    }
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

        {/* Status Bar: Visible if loading OR if there's a status message */}
        {(loading || liveStatus) && (
          <div style={{ 
            marginTop: '20px', padding: '15px', 
            background: liveStatus.includes('❌') ? '#fff5f5' : '#e3f2fd', 
            color: liveStatus.includes('❌') ? '#c53030' : '#0d47a1', 
            borderRadius: '8px', 
            border: liveStatus.includes('❌') ? '1px solid #feb2b2' : '1px solid #90caf9',
            fontWeight: 'bold', textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            {liveStatus}
          </div>
        )}

        <ResultsView logs={logs} />
      </div>
    </div>
  );
}

export default App;
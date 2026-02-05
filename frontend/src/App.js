import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StepEditor from './components/StepEditor';
import ResultsView from './components/ResultsView';
import { fetchHistory, runWorkflowStream, deleteWorkflow } from './api/workflowApi';

function App() {
  // --- STATE WITH PERSISTENCE ---
  // We initialize state from localStorage if it exists
  const [workflowName, setWorkflowName] = useState(() => localStorage.getItem("wf_name") || "");
  const [steps, setSteps] = useState(() => {
    const saved = localStorage.getItem("wf_steps");
    return saved ? JSON.parse(saved) : [{ id: 1, model: "kimi-k2p5", prompt: "", criteria: "" }];
  });
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("wf_logs");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [liveStatus, setLiveStatus] = useState(""); 

  // --- EFFECT: AUTO-SAVE TO LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem("wf_name", workflowName);
    localStorage.setItem("wf_steps", JSON.stringify(steps));
    if (logs) localStorage.setItem("wf_logs", JSON.stringify(logs));
  }, [workflowName, steps, logs]);

  // Load history on mount
  const loadHistory = async () => {
    try {
      const data = await fetchHistory();
      if (Array.isArray(data)) setHistory(data);
    } catch (e) { console.error("History error", e); }
  };

  const toggleSidebar = () => {
    if (!isSidebarOpen) loadHistory();
    setIsSidebarOpen(!isSidebarOpen);
  };

  // --- ACTIONS ---

  const handleNewWorkflow = () => {
    if (window.confirm("Start a new workflow? Unsaved changes will be lost.")) {
      setWorkflowName("");
      setSteps([{ id: 1, model: "kimi-k2p5", prompt: "", criteria: "" }]);
      setLogs(null);
      setLiveStatus("");
      // Clear storage
      localStorage.removeItem("wf_name");
      localStorage.removeItem("wf_steps");
      localStorage.removeItem("wf_logs");
    }
  };

  const loadWorkflow = (item) => {
    setWorkflowName(item.name);
    setSteps(item.steps);
    const loadedLogs = item.executions && item.executions.length > 0 ? { execution: item.executions[0] } : null;
    setLogs(loadedLogs);
    setLiveStatus(loadedLogs ? "Loaded from History" : "");
    setIsSidebarOpen(false);
  };

  const handleDeleteWorkflow = async (id) => {
    if (window.confirm("Are you sure you want to delete this workflow?")) {
      await deleteWorkflow(id);
      loadHistory(); // Refresh list
    }
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

    let currentResults = [];

    try {
      for await (const update of runWorkflowStream({ name: workflowName, steps: steps })) {
        switch (update.type) {
          case 'WORKFLOW_START': setLiveStatus("Workflow Started..."); break;
          case 'STEP_START': setLiveStatus(`▶ Executing Step ${update.stepId} (${update.model})...`); break;
          case 'STEP_RETRY': setLiveStatus(`⚠️ Step ${update.stepId} Retrying (Attempt ${update.attempt})...`); break;
          
          case 'STEP_COMPLETE':
            setLiveStatus(`✅ Step ${update.stepId} Completed.`);
            currentResults.push(update.result);
            setLogs({ execution: { status: "RUNNING", results: [...currentResults] } });
            break;

          case 'WORKFLOW_COMPLETE':
            setLiveStatus("✨ Workflow Finished!");
            setLogs({ execution: update.execution }); 
            break;

          case 'ERROR': setLiveStatus(`❌ Error: ${update.message}`); break;
          default: break;
        }
      }
    } catch (error) {
      console.error(error);
      setLiveStatus(`❌ Connection Interrupted.`);
    } finally {
      // Safety Net: Fetch latest if stream failed
      try {
        const latestHistory = await fetchHistory();
        if (latestHistory && latestHistory.length > 0 && latestHistory[0].name === workflowName) {
           const latestRun = latestHistory[0];
           if (latestRun.executions.length > 0) {
              setLogs({ execution: latestRun.executions[0] });
           }
        }
      } catch (e) {}
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!workflowName) return alert("Please name your workflow before exporting.");
    
    const workflowData = {
      name: workflowName,
      steps: steps,
      exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workflowData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${workflowName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', display: 'flex' }}>
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggle={toggleSidebar} 
        history={history} 
        onLoad={loadWorkflow}
        onNew={handleNewWorkflow}
        onDelete={handleDeleteWorkflow}
      />

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
          
          {/* NEW EXPORT BUTTON */}
          <button onClick={handleExport} style={{ padding: '12px 24px', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ⬇ Export JSON
          </button>

          <button onClick={handleRun} disabled={loading} style={{ padding: '12px 24px', background: loading ? '#ccc' : '#000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? "Running..." : "▶ Run Workflow"}
          </button>
        </div>

        {(loading || liveStatus) && (
          <div style={{ 
            marginTop: '20px', padding: '15px', 
            background: liveStatus.includes('❌') ? '#fff5f5' : '#e3f2fd', 
            color: liveStatus.includes('❌') ? '#c53030' : '#0d47a1', 
            borderRadius: '8px', border: liveStatus.includes('❌') ? '1px solid #feb2b2' : '1px solid #90caf9',
            fontWeight: 'bold', textAlign: 'center'
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
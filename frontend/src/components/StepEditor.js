import React from 'react';

const StepEditor = ({ step, index, onUpdate, onRemove, showRemove }) => {
  return (
    <div style={{ 
      border: '1px solid #ddd', padding: '20px', borderRadius: '12px', background: '#fff',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Step {index + 1}</h3>
        {showRemove && (
          <button onClick={() => onRemove(step.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>
            🗑️ Remove
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Model</label>
          <select 
            value={step.model} 
            onChange={(e) => onUpdate(step.id, 'model', e.target.value)}
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
            onChange={(e) => onUpdate(step.id, 'prompt', e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', fontFamily: 'monospace' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Criteria (Optional)</label>
          <input 
            type="text" 
            value={step.criteria} 
            onChange={(e) => onUpdate(step.id, 'criteria', e.target.value)}
            placeholder="E.g., Must contain 'SUCCESS' or regex /pattern/i"
            style={{ width: '100%', padding: '8px', borderRadius: '6px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default StepEditor;
import React from 'react';

const StepEditor = ({ step, index, onUpdate, onRemove, showRemove }) => {
  return (
    <div style={{ 
      background: '#fff', padding: '20px', borderRadius: '12px', 
      border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#333' }}>Step {index + 1}</h3>
        {showRemove && (
          <button onClick={() => onRemove(step.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Remove
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '15px' }}>
        {/* MODEL SELECTOR */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#666' }}>MODEL</label>
          <select 
            value={step.model} 
            onChange={(e) => onUpdate(step.id, 'model', e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="kimi-k2p5">Kimi k2p5 (Fast)</option>
            <option value="kimi-k2-instruct">Kimi k2-instruct (Reasoning)</option>
            <option value="gpt-4o-mini">GPT-4o Mini (Balanced)</option>
          </select>
        </div>

        {/* RETRY CONFIGURATION (NEW) */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#666' }}>RETRIES</label>
          <input 
            type="number" 
            min="0" 
            max="5"
            value={step.retryLimit !== undefined ? step.retryLimit : 3} 
            onChange={(e) => onUpdate(step.id, 'retryLimit', parseInt(e.target.value) || 0)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#666' }}>PROMPT</label>
        <textarea 
          value={step.prompt} 
          onChange={(e) => onUpdate(step.id, 'prompt', e.target.value)}
          placeholder="What should the AI do?"
          rows={3}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontFamily: 'inherit', resize: 'vertical' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#666' }}>COMPLETION CRITERIA (Regex or Text)</label>
        <input 
          type="text" 
          value={step.criteria} 
          onChange={(e) => onUpdate(step.id, 'criteria', e.target.value)}
          placeholder="e.g. 'Success' or /def \w+/"
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
      </div>
    </div>
  );
};

export default StepEditor;
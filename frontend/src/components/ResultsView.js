import React from 'react';

const ResultsView = ({ logs }) => {
  if (!logs) return null;
  
  return (
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
  );
};

export default ResultsView;
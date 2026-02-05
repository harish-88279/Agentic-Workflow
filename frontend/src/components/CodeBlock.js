import React, { useState } from 'react';

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2s
  };

  return (
    <div style={{ margin: '20px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
      {/* HEADER: Language + Copy Button */}
      <div style={{ 
        background: '#f5f5f5', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #ddd', fontSize: '12px', color: '#666', fontWeight: 'bold'
      }}>
        <span style={{ textTransform: 'uppercase' }}>{language || 'CODE'}</span>
        <button 
          onClick={handleCopy}
          style={{ 
            background: copied ? '#4caf50' : '#fff', 
            color: copied ? '#fff' : '#333',
            border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '12px' 
          }}
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>

      {/* BODY: The Actual Code */}
      <div style={{ background: '#fafafa', padding: '15px', overflowX: 'auto' }}>
        <pre style={{ margin: 0, fontFamily: 'Consolas, monospace', fontSize: '14px', color: '#333' }}>
          {code}
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
import React from 'react';
import CodeBlock from './CodeBlock';

const ResultsView = ({ logs }) => {
  if (!logs) return null;

  // --- THE REGEX MAGIC ---
  const parseContent = (text) => {
    // 1. Split text by code blocks (```...```)
    // Regex explanation: /(```[\s\S]*?```)/g captures the delimiter too so we can process it
    const parts = text.split(/(```[\w-]*\n[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // 2. Check if this part is a Code Block
      if (part.startsWith('```')) {
        // Extract Language and Code
        // content lines: ["```java", "code line 1", "code line 2", "```"]
        const lines = part.split('\n');
        const language = lines[0].replace('```', '').trim(); // "java"
        const code = lines.slice(1, -1).join('\n'); // The code inside
        
        return <CodeBlock key={index} language={language} code={code} />;
      } 
      
      // 3. Otherwise, it's regular text
      // We perform basic cleanup (handling bold text **...**)
      return (
        <div key={index} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#333', marginBottom: '10px' }}>
          {part.split('\n').map((line, i) => (
            <div key={i}>
              {/* Simple Bold Parser: Replaces **text** with <strong>text</strong> */}
              {line.split(/(\*\*.*?\*\*)/g).map((chunk, j) => 
                chunk.startsWith('**') && chunk.endsWith('**') 
                  ? <strong key={j}>{chunk.slice(2, -2)}</strong> 
                  : <span key={j}>{chunk}</span>
              )}
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <div style={{ marginTop: '40px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>🚀 Workflow Results</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {logs.execution.results.map((res, i) => (
          <div key={i} style={{ 
            borderRadius: '12px', 
            background: '#fff', 
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            {/* Status Header */}
            <div style={{ 
              padding: '10px 20px', 
              background: res.status === 'SUCCESS' ? '#e6fffa' : '#fff5f5', 
              borderBottom: res.status === 'SUCCESS' ? '1px solid #b2f5ea' : '1px solid #feb2b2',
              color: res.status === 'SUCCESS' ? '#2c7a7b' : '#c53030',
              fontWeight: 'bold', display: 'flex', justifyContent: 'space-between'
            }}>
              <span>Step {i + 1}</span>
              <span>{res.status}</span>
            </div>

            {/* Smart Parsed Content */}
            <div style={{ padding: '20px' }}>
              {parseContent(res.output)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsView;
import React from 'react';

const Sidebar = ({ isOpen, toggle, history, onLoad }) => {
  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: '300px',
      background: '#1a1a1a', color: 'white',
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease', zIndex: 1000, padding: '20px',
      boxShadow: '2px 0 10px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>📜 History</h2>
        <button onClick={toggle} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ overflowY: 'auto', height: '90%' }}>
        {Array.isArray(history) && history.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onLoad(item)}
            style={{ 
              padding: '15px', borderBottom: '1px solid #333', cursor: 'pointer',
              background: '#2a2a2a', marginBottom: '10px', borderRadius: '8px'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{item.name}</div>
            <div style={{ fontSize: '12px', color: '#aaa' }}>{new Date(item.createdAt).toLocaleString()}</div>
            <div style={{ 
              marginTop: '5px', fontSize: '10px', padding: '4px', borderRadius: '4px', display: 'inline-block',
              background: item.executions[0]?.status === 'SUCCESS' || item.executions[0]?.status === 'COMPLETED' ? '#1f6e43' : '#8a1c1c' 
            }}>
              {item.executions[0]?.status || 'UNKNOWN'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
import React from 'react';

const Sidebar = ({ isOpen, toggle, history, onLoad, onNew, onDelete }) => {
  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: '300px',
      background: '#1a1a1a', color: 'white',
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease', zIndex: 1000, padding: '20px',
      boxShadow: '2px 0 10px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>📜 History</h2>
        <button onClick={toggle} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>✕</button>
      </div>

      {/* NEW WORKFLOW BUTTON */}
      <button 
        onClick={() => { onNew(); toggle(); }}
        style={{
          width: '100%', padding: '12px', marginBottom: '20px',
          background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px',
          fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        <span>+</span> New Workflow
      </button>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {Array.isArray(history) && history.map((item) => (
          <div 
            key={item.id} 
            style={{ 
              padding: '15px', borderBottom: '1px solid #333',
              background: '#2a2a2a', marginBottom: '10px', borderRadius: '8px',
              position: 'relative', group: 'parent' // For hover effects logic
            }}
          >
            {/* CLICK AREA (Loads Workflow) */}
            <div onClick={() => onLoad(item)} style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px', paddingRight: '20px' }}>{item.name}</div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>{new Date(item.createdAt).toLocaleString()}</div>
              <div style={{ 
                marginTop: '5px', fontSize: '10px', padding: '4px', borderRadius: '4px', display: 'inline-block',
                background: item.executions[0]?.status === 'SUCCESS' || item.executions[0]?.status === 'COMPLETED' ? '#1f6e43' : '#8a1c1c' 
              }}>
                {item.executions[0]?.status || 'UNKNOWN'}
              </div>
            </div>

            {/* DELETE BUTTON */}
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              style={{
                position: 'absolute', top: '10px', right: '10px',
                background: 'none', border: 'none', color: '#ef4444', 
                cursor: 'pointer', fontSize: '16px', opacity: 0.7
              }}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
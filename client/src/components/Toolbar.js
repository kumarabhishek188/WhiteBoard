import React from 'react';

const colors = ['black', 'red', 'blue', 'green'];

const Toolbar = ({ tool, setTool, canvasRef, canvasElRef }) => {
  const handleExport = () => {
    if (canvasElRef.current) {
      const url = canvasElRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `whiteboard-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 'clamp(8px, 2vw, 16px)',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      minWidth: 0
    }}>
      {/* Color Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <label style={{ 
          fontSize: 'clamp(12px, 2vw, 14px)',
          whiteSpace: 'nowrap'
        }}>Color:</label>
        {colors.map(c => (
          <button
            key={c}
            style={{ 
              background: c, 
              width: 'clamp(20px, 4vw, 24px)', 
              height: 'clamp(20px, 4vw, 24px)', 
              border: tool.color === c ? '2px solid #333' : '1px solid #ccc', 
              borderRadius: '50%', 
              cursor: 'pointer',
              minWidth: '20px',
              minHeight: '20px'
            }}
            onClick={() => setTool(t => ({ ...t, color: c }))}
          />
        ))}
      </div>

      {/* Width Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <label style={{ 
          fontSize: 'clamp(12px, 2vw, 14px)',
          whiteSpace: 'nowrap'
        }}>Width:</label>
        <input
          type="range"
          min={2}
          max={16}
          value={tool.width}
          onChange={e => setTool(t => ({ ...t, width: parseInt(e.target.value) }))}
          style={{ 
            verticalAlign: 'middle', 
            accentColor: tool.color,
            width: 'clamp(60px, 8vw, 100px)',
            minWidth: '60px'
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button 
          style={{ 
            fontSize: 'clamp(12px, 2vw, 14px)',
            padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: '#fff',
            whiteSpace: 'nowrap'
          }} 
          onClick={() => canvasRef.current?.clear()}
        >
          Clear
        </button>
        <button 
          style={{ 
            fontSize: 'clamp(12px, 2vw, 14px)',
            padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: '#fff',
            whiteSpace: 'nowrap'
          }} 
          onClick={handleExport}
        >
          Export
        </button>
      </div>
    </div>
  );
};

export default Toolbar; 
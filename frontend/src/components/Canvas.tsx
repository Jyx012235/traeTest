import React, { useRef, useEffect, useState } from 'react';

interface CanvasProps {
  onExport?: (dataUrl: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({ onExport }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  
  // History for undo/redo
  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set initial canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Initial state in history
    setHistory([canvas.toDataURL()]);
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setHistory(prev => [...prev, dataUrl]);
      setRedoStack([]); // Clear redo stack on new action
      if (onExport) onExport(dataUrl);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
    saveToHistory();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const undo = () => {
    if (history.length <= 1) return;
    
    const current = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    const prev = newHistory[newHistory.length - 1];
    
    setRedoStack(prevRedo => [current, ...prevRedo]);
    setHistory(newHistory);
    
    restoreCanvas(prev);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const next = redoStack[0];
    const newRedo = redoStack.slice(1);
    
    setRedoStack(newRedo);
    setHistory(prevHistory => [...prevHistory, next]);
    
    restoreCanvas(next);
  };

  const restoreCanvas = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      if (onExport) onExport(dataUrl);
    };
  };

  return (
    <div className="canvas-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
      <div className="toolbar" style={{ 
        display: 'flex', 
        gap: '15px', 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label>Color:</label>
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)} 
            style={{ border: 'none', width: '30px', height: '30px', cursor: 'pointer' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label>Size:</label>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={lineWidth} 
            onChange={(e) => setLineWidth(parseInt(e.target.value))} 
          />
        </div>

        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={undo} disabled={history.length <= 1} title="Undo">↩️</button>
          <button onClick={redo} disabled={redoStack.length === 0} title="Redo">↪️</button>
          <button onClick={clearCanvas} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}>Clear</button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{ 
          border: '4px solid #333', 
          borderRadius: '8px',
          cursor: 'crosshair', 
          backgroundColor: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
      />
    </div>
  );
};

export default Canvas;

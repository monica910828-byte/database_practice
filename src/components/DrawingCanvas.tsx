import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface DrawingCanvasHandle {
  getImageData: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

const DrawingCanvas = forwardRef<DrawingCanvasHandle>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useImperativeHandle(ref, () => ({
    getImageData: () => {
      if (canvasRef.current && hasDrawn) {
        // Return as JPG
        return canvasRef.current.toDataURL('image/jpeg', 0.8);
      }
      return null;
    },
    clear: () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          setHasDrawn(false);
        }
      }
    },
    isEmpty: () => !hasDrawn,
  }));

  // Initialize canvas background to white (important for JPG so it's not black)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(getX(e, canvas), getY(e, canvas));
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(getX(e, canvas), getY(e, canvas));
    ctx.strokeStyle = '#4a4a4a'; // Dark gray/brownish for drawing
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasDrawn(true);
  };

  const endDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const getX = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    }
    return (e.clientX - rect.left) * (canvas.width / rect.width);
  };

  const getY = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    }
    return (e.clientY - rect.top) * (canvas.height / rect.height);
  };

  return (
    <div className="card">
      <div className="input-group">
        <label>마음속 기분을 그려볼까요?</label>
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={(e) => {
              // Prevent scrolling when drawing on touch devices
              if (e.cancelable) {
                // Not calling preventDefault here directly due to React's passive event listeners,
                // handled via CSS touch-action: none;
              }
              startDrawing(e);
            }}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
            onTouchCancel={endDrawing}
          />
          <button type="button" className="btn btn-secondary" onClick={() => {
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                setHasDrawn(false);
              }
            }
          }}>
            지우기 (다시 그리기)
          </button>
        </div>
      </div>
    </div>
  );
});

export default DrawingCanvas;

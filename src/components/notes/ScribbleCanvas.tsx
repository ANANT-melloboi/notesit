
"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Pencil, RotateCcw } from 'lucide-react';

interface ScribbleCanvasProps {
  onSave: (dataUrl: string) => void;
  initialValue?: string;
}

export function ScribbleCanvas({ onSave, initialValue }: ScribbleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 300;

    if (initialValue) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = initialValue;
    }

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = mode === 'draw' ? 3 : 20;
    ctx.strokeStyle = mode === 'draw' ? '#000000' : '#ffffff';
  }, [initialValue, mode]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSave('');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 mb-2">
        <Button 
          variant={mode === 'draw' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setMode('draw')}
        >
          <Pencil className="w-4 h-4 mr-2" /> Pencil
        </Button>
        <Button 
          variant={mode === 'erase' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setMode('erase')}
        >
          <Eraser className="w-4 h-4 mr-2" /> Eraser
        </Button>
        <Button variant="outline" size="sm" onClick={clear}>
          <RotateCcw className="w-4 h-4 mr-2" /> Clear
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full bg-white border rounded-md cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
      />
    </div>
  );
}

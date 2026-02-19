"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onSave: (audioUrl: string) => void;
  initialValue?: string;
}

export function VoiceRecorder({ onSave, initialValue }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(initialValue || null);
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Convert to data URI to persist in Firestore mediaUrl field
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setRecordedUrl(base64data);
          onSave(base64data);
        };
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimer(0);
      setRecordedUrl(null);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        variant: 'destructive',
        title: 'Microphone Error',
        description: 'Please grant microphone access to record voice notes.',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setRecordedUrl(null);
    onSave('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center p-6 border-2 border-dashed rounded-lg bg-muted/30">
      {isRecording ? (
        <div className="flex flex-col items-center gap-4">
          <div className="text-2xl font-mono text-destructive animate-pulse">
            {formatTime(timer)}
          </div>
          <div className="flex gap-4">
            <div className="w-1 h-8 bg-primary animate-bounce delay-75" />
            <div className="w-1 h-12 bg-primary animate-bounce delay-100" />
            <div className="w-1 h-6 bg-primary animate-bounce delay-150" />
            <div className="w-1 h-10 bg-primary animate-bounce delay-200" />
            <div className="w-1 h-8 bg-primary animate-bounce delay-75" />
          </div>
          <Button variant="destructive" size="lg" className="rounded-full h-16 w-16" onClick={stopRecording}>
            <Square className="h-6 w-6" />
          </Button>
          <p className="text-sm text-muted-foreground">Recording in progress...</p>
        </div>
      ) : recordedUrl ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <audio controls className="w-full">
            <source src={recordedUrl} />
            Your browser does not support the audio element.
          </audio>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={startRecording}>
              <Mic className="h-4 w-4 mr-2" /> Re-record
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={deleteRecording}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Button 
            className="rounded-full h-20 w-20 shadow-lg hover:scale-105 transition-transform bg-primary" 
            onClick={startRecording}
          >
            <Mic className="h-10 w-10 text-primary-foreground" />
          </Button>
          <p className="font-medium text-muted-foreground">Tap to record voice note</p>
        </div>
      )}
    </div>
  );
}

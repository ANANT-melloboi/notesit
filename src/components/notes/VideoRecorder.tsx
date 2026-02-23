
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Square, Trash2, Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VideoRecorderProps {
  onSave: (videoUrl: string) => void;
  initialValue?: string;
}

export function VideoRecorder({ onSave, initialValue }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(initialValue || null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [timer, setTimer] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (initialValue && initialValue !== recordedUrl) {
      setRecordedUrl(initialValue);
    }
  }, [initialValue, recordedUrl]);

  // Handle Camera Lifecycle with strict hardware release
  useEffect(() => {
    let isMounted = true;
    let localStream: MediaStream | null = null;

    async function startCamera() {
      // Don't restart if already recorded or if stream exists
      if (recordedUrl || streamRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }, 
          audio: true 
        });
        
        // If component unmounted while waiting for promise, kill stream immediately
        if (!isMounted) {
          stream.getTracks().forEach(track => {
            track.stop();
            track.enabled = false;
          });
          return;
        }

        localStream = stream;
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        if (isMounted) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions to record video notes.',
          });
        }
      }
    }

    startCamera();

    // FORCE hardware release on unmount or mode change
    return () => {
      isMounted = false;
      
      // Stop the local reference obtained during init
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
      }

      // Stop the shared ref just in case
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        streamRef.current = null;
      }

      // Release video element binding and force reset
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.load();
      }
    };
  }, [recordedUrl, toast]);

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

  const startRecording = () => {
    if (!streamRef.current) return;
    
    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setRecordedUrl(base64data);
        onSave(base64data);
      };
    };

    mediaRecorder.start();
    setIsRecording(true);
    setTimer(0);
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
    <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-2xl bg-muted/30 gap-4">
      {!recordedUrl ? (
        <div className="w-full space-y-4">
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border shadow-inner">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover mirror" 
              autoPlay 
              muted 
              playsInline
            />
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-destructive px-3 py-1 rounded-full animate-pulse z-10">
                <div className="h-2 w-2 rounded-full bg-white" />
                <span className="text-[10px] font-bold text-white uppercase">{formatTime(timer)}</span>
              </div>
            )}
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
                <Alert variant="destructive">
                  <Camera className="h-4 w-4" />
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access in your browser settings to record video notes.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            {hasCameraPermission === null && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            {isRecording ? (
              <Button 
                variant="destructive" 
                size="lg" 
                className="rounded-full h-16 w-16 glow-accent shadow-xl" 
                onClick={stopRecording}
              >
                <Square className="h-6 w-6" />
              </Button>
            ) : (
              <Button 
                className="rounded-full h-16 w-16 glow-primary bg-primary shadow-xl hover:scale-105 transition-transform" 
                onClick={startRecording}
                disabled={hasCameraPermission !== true}
              >
                <Video className="h-6 w-6 text-primary-foreground" />
              </Button>
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground font-bold uppercase tracking-widest">
            {isRecording ? "Recording clip..." : "Tap to start recording"}
          </p>
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="aspect-video bg-black rounded-xl overflow-hidden border shadow-2xl relative">
            <video 
              src={recordedUrl} 
              className="w-full h-full object-contain" 
              controls
            />
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => setRecordedUrl(null)}>
              <Video className="h-4 w-4 mr-2" /> Re-record
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive rounded-xl font-bold hover:bg-destructive/10" onClick={deleteRecording}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

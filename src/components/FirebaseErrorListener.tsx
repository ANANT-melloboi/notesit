
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It provides a more graceful user experience in production while maintaining 
 * the debug loop for development.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // In development, we want the hard crash only for real permission issues.
      // For size errors, we show a toast to prevent Application Error screen.
      const isSizeError = error.message.toLowerCase().includes('limit') || 
                          error.message.toLowerCase().includes('large');

      if (process.env.NODE_ENV === 'development' && !isSizeError) {
        setError(error);
      } else {
        // In production or for size errors, we show a non-crashing toast
        console.error("Firebase Operation Error:", error.message);
        toast({
          variant: "destructive",
          title: "Cloud Sync Error",
          description: isSizeError 
            ? "This note is too large for cloud sync (1MB limit). It's saved locally for now." 
            : "We couldn't save your note to the vault. Please check your connection or sign in again.",
        });
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  // Only throw if we have a critical permission error in dev
  if (error) {
    throw error;
  }

  return null;
}

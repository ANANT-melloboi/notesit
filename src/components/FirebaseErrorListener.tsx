
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
      // In development, we want the hard crash to catch issues
      if (process.env.NODE_ENV === 'development') {
        setError(error);
      } else {
        // In production/deployment, we show a non-crashing toast
        console.error("Firebase Operation Error:", error.message);
        toast({
          variant: "destructive",
          title: "Cloud Sync Error",
          description: "We couldn't save your note to the vault. It might be too large or you might need to sign in again.",
        });
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  // On re-render in dev, if an error exists in state, throw it.
  if (error) {
    throw error;
  }

  return null;
}

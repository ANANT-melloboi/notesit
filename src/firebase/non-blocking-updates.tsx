
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

/**
 * Initiates a setDoc operation for a document reference.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions = { merge: true }) {
  const promise = setDoc(docRef, data, options).catch(error => {
    const isSizeError = error.message.toLowerCase().includes('limit') || 
                        error.message.toLowerCase().includes('large');
    
    toast({
      variant: "destructive",
      title: isSizeError ? "Sync Limit Exceeded" : "Sync Failed",
      description: isSizeError 
        ? "This note is too large for the cloud vault (1MB limit). It will not be found after refresh." 
        : "The vault rejected this update. Please check your connection.",
    });

    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: data,
      })
    );
    throw error;
  });
  return promise;
}

/**
 * Initiates an addDoc operation for a collection reference.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      const isSizeError = error.message.toLowerCase().includes('limit') || 
                          error.message.toLowerCase().includes('large');

      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: isSizeError 
          ? "The note exceeds the 1MB cloud sync limit. It won't be saved." 
          : "Could not add note to the vault.",
      });
      const contextualError = new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', contextualError);
      throw contextualError;
    });
  return promise;
}

/**
 * Initiates an updateDoc operation for a document reference.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      const isSizeError = error.message.toLowerCase().includes('limit') || 
                          error.message.toLowerCase().includes('large');
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: isSizeError 
          ? "Note is now too large to sync (1MB limit)." 
          : "The server rejected the update.",
      });
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      );
    });
}

/**
 * Initiates a deleteDoc operation for a document reference.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not remove the note from the cloud vault.",
      });
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      );
    });
}

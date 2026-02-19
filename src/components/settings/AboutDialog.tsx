
"use client";

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { ShieldCheck, Info } from 'lucide-react';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About MediaVault
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center text-center space-y-4 py-6">
          <div className="bg-primary p-4 rounded-3xl shadow-lg shadow-primary/20">
            <ShieldCheck className="h-12 w-12 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">MediaVault</h2>
            <p className="text-sm text-muted-foreground font-mono">Version 1.0.0 (Beta)</p>
          </div>
          <div className="space-y-4 text-sm text-foreground/80 leading-relaxed max-w-[280px]">
            <p>
              MediaVault is a secure, privacy-focused media notepad designed for images, voice, text, and scribbles.
            </p>
            <p className="text-xs text-muted-foreground italic">
              All notes are encrypted and stored using industry-standard Firebase security protocols.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

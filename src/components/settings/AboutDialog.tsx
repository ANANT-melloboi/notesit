
"use client";

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { ShieldCheck, Info, Cloud, HardDrive } from 'lucide-react';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl glass border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            About MediaVault
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center text-center space-y-4 py-6">
          <div className="bg-primary p-4 rounded-3xl shadow-lg shadow-primary/20 glow-primary animate-reveal">
            <ShieldCheck className="h-12 w-12 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">MediaVault</h2>
            <p className="text-sm text-muted-foreground font-mono">Version 1.2.0 (Enhanced Sync)</p>
          </div>
          <div className="space-y-4 text-sm text-foreground/80 leading-relaxed max-w-[300px]">
            <p>
              MediaVault is a secure, privacy-focused media notepad designed for images, voice, text, and scribbles.
            </p>
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-3 text-left">
              <div className="flex items-start gap-3">
                <Cloud className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] leading-normal text-muted-foreground">
                  <strong>Cloud Persistence:</strong> Your media is converted to secure strings and stored in the cloud. 
                </p>
              </div>
              <div className="flex items-start gap-3">
                <HardDrive className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-[11px] leading-normal text-muted-foreground font-bold">
                  Safe to Delete: You can safely delete original photos/voice files from your phone gallery. Your vault remains fully intact and synced.
                </p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              All data is encrypted and tied to your private account.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

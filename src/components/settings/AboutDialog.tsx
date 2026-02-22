
"use client";

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { ShieldCheck, Info, Cloud } from 'lucide-react';

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
            <p className="text-sm text-muted-foreground font-mono">Version 1.1.0 (Cloud Sync Enabled)</p>
          </div>
          <div className="space-y-4 text-sm text-foreground/80 leading-relaxed max-w-[300px]">
            <p>
              MediaVault is a secure, privacy-focused media notepad designed for images, voice, text, and scribbles.
            </p>
            <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10 flex items-start gap-3 text-left">
              <Cloud className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] leading-normal text-muted-foreground">
                <strong>Cloud Persistence:</strong> All media is converted to secure data strings and stored in your private cloud vault. You can safely delete local files from your device; your vault data remains synced and accessible.
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              Powered by Firebase Security Protocols.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

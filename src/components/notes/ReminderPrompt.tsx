
"use client";

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, BellRing, FastForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReminderPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSetReminder: (minutes: number) => void;
  onSkip: () => void;
}

export function ReminderPrompt({ isOpen, onClose, onSetReminder, onSkip }: ReminderPromptProps) {
  const presets = [
    { label: '5m', value: 5 },
    { label: '15m', value: 15 },
    { label: '30m', value: 30 },
    { label: '1h', value: 60 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[350px] rounded-3xl glass border-none shadow-2xl animate-in zoom-in-95 duration-300">
        <DialogHeader className="items-center text-center">
          <div className="bg-primary/20 p-3 rounded-2xl mb-2 glow-primary animate-bounce">
            <BellRing className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">Set a Timer?</DialogTitle>
          <DialogDescription>
            Would you like a reminder for this note?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 py-4">
          {presets.map((preset) => (
            <Button
              key={preset.value}
              variant="outline"
              className="h-14 rounded-2xl border-primary/10 hover:border-primary hover:bg-primary/5 font-bold transition-all hover:scale-105"
              onClick={() => {
                onSetReminder(preset.value);
                onClose();
              }}
            >
              <Clock className="h-4 w-4 mr-2 text-primary" />
              {preset.label}
            </Button>
          ))}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground hover:text-foreground h-10 rounded-xl"
            onClick={() => {
              onSkip();
              onClose();
            }}
          >
            <FastForward className="h-4 w-4 mr-2" />
            Skip for now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

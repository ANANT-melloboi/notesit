
"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Sun, 
  Bell, 
  Volume2, 
  Settings as SettingsIcon,
  Moon,
  VolumeX
} from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [brightness, setBrightness] = useState(80);
  const [notificationInterval, setNotificationInterval] = useState(30);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            App Settings
          </DialogTitle>
          <DialogDescription>
            Personalize your MediaVault experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-8">
          {/* Brightness Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Sun className="h-4 w-4" /> Brightness
              </Label>
              <span className="text-xs text-muted-foreground font-mono">{brightness}%</span>
            </div>
            <div className="flex items-center gap-4">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <Slider 
                value={[brightness]} 
                onValueChange={(val) => setBrightness(val[0])} 
                max={100} 
                step={1} 
                className="flex-1"
              />
              <Sun className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Notification Interval */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Bell className="h-4 w-4" /> Notification Interval
              </Label>
              <span className="text-xs text-muted-foreground font-mono">{notificationInterval} min</span>
            </div>
            <Slider 
              value={[notificationInterval]} 
              onValueChange={(val) => setNotificationInterval(val[0])} 
              max={120} 
              min={5}
              step={5} 
            />
            <p className="text-[10px] text-muted-foreground">Adjust how often reminders appear in your dashboard.</p>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                Notification Sound
              </Label>
              <p className="text-xs text-muted-foreground">Play sound for new alerts</p>
            </div>
            <Switch 
              checked={soundEnabled} 
              onCheckedChange={setSoundEnabled} 
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

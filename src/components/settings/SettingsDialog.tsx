"use client";

import React, { useState, useEffect } from 'react';
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
  VolumeX,
  Palette
} from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [brightness, setBrightness] = useState(100);
  const [notificationInterval, setNotificationInterval] = useState(30);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Initial theme load
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    // Sound setting load
    const sound = localStorage.getItem('soundEnabled') !== 'false';
    setSoundEnabled(sound);

    // Brightness load
    const savedBrightness = localStorage.getItem('appBrightness');
    if (savedBrightness) {
      const b = parseInt(savedBrightness);
      setBrightness(b);
    }
  }, []);

  const applyBrightness = (value: number) => {
    // We apply brightness as a filter on the html element
    const filterValue = value / 100;
    document.documentElement.style.filter = `brightness(${filterValue})`;
    localStorage.setItem('appBrightness', value.toString());
  };

  const handleBrightnessChange = (val: number[]) => {
    const newVal = val[0];
    setBrightness(newVal);
    applyBrightness(newVal);
  };

  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const toggleSound = (checked: boolean) => {
    setSoundEnabled(checked);
    localStorage.setItem('soundEnabled', checked.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl glass border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <SettingsIcon className="h-5 w-5 text-primary" />
            App Settings
          </DialogTitle>
          <DialogDescription>
            Personalize your MediaVault experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-8">
          {/* Theme Section */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Palette className="h-4 w-4 text-primary" /> Appearance
              </Label>
              <p className="text-xs text-muted-foreground">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch 
                checked={isDarkMode} 
                onCheckedChange={toggleTheme} 
                className="data-[state=checked]:bg-primary"
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Brightness Section */}
          <div className="space-y-4 px-1">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Sun className="h-4 w-4 text-primary" /> Display Brightness
              </Label>
              <span className="text-xs text-muted-foreground font-mono">{brightness}%</span>
            </div>
            <div className="flex items-center gap-4">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <Slider 
                value={[brightness]} 
                onValueChange={handleBrightnessChange} 
                max={100} 
                min={20}
                step={1} 
                className="flex-1"
              />
              <Sun className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-[10px] text-muted-foreground italic">Dims the entire interface for comfortable night viewing.</p>
          </div>

          {/* Notification Interval */}
          <div className="space-y-4 px-1">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Bell className="h-4 w-4 text-primary" /> Notification Interval
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
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                Notification Sounds
              </Label>
              <p className="text-xs text-muted-foreground">Play success sound on save</p>
            </div>
            <Switch 
              checked={soundEnabled} 
              onCheckedChange={toggleSound} 
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto rounded-xl glow-primary font-bold">Close Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Note, MediaType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Type, 
  Image as ImageIcon, 
  Mic, 
  PenTool, 
  Save, 
  X,
  Lock,
  Upload,
  Link as LinkIcon,
  Check,
  Plus,
  Trash2
} from 'lucide-react';
import { ScribbleCanvas } from './ScribbleCanvas';
import { VoiceRecorder } from './VoiceRecorder';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  initialNote?: Partial<Note>;
  onSave: (note: Partial<Note>) => void;
  onCancel: () => void;
}

const SUCCESS_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export function NoteEditor({ initialNote, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [mediaType, setMediaType] = useState<MediaType>(initialNote?.mediaType || 'text');
  const [mediaUrls, setMediaUrls] = useState<string[]>(initialNote?.mediaUrls || []);
  const [isLocked, setIsLocked] = useState(initialNote?.isLocked || false);
  const [passkey, setPasskey] = useState(initialNote?.passkey || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const playSuccessSound = () => {
    const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    if (soundEnabled) {
      const audio = new Audio(SUCCESS_SOUND_URL);
      audio.volume = 0.4;
      audio.play().catch(e => console.log("Audio playback failed", e));
    }
  };

  const handleSave = () => {
    if (isLocked && !passkey) {
      toast({
        variant: "destructive",
        title: "Passkey required",
        description: "Please set a passkey to lock this note.",
      });
      return;
    }

    playSuccessSound();
    onSave({
      ...initialNote,
      title: title || 'Untitled Note',
      content,
      mediaType,
      mediaUrls,
      isLocked,
      passkey,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const addMediaByUrl = (url: string) => {
    if (url.trim()) {
      setMediaUrls(prev => [...prev, url]);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-t-4 border-t-primary bg-card overflow-hidden glass">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">
            {initialNote?.id ? 'Edit Note' : 'Create New Note'}
          </CardTitle>
          <p className="text-xs text-muted-foreground">Changes are synced to your vault automatically on save.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSave}
            className="text-primary hover:text-primary hover:bg-primary/10 font-bold"
          >
            <Check className="h-4 w-4 mr-1" /> Save
          </Button>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold">Title</Label>
          <Input 
            id="title"
            placeholder="What's this note about?" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium border-none bg-muted/30 focus-visible:glow-primary transition-all"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Media Content</Label>
          <Tabs value={mediaType} onValueChange={(val) => setMediaType(val as MediaType)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-secondary/50 p-1 rounded-xl">
              <TabsTrigger value="text" className="rounded-lg data-[state=active]:bg-background">
                <Type className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Text</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="rounded-lg data-[state=active]:bg-background">
                <ImageIcon className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Images</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="rounded-lg data-[state=active]:bg-background">
                <Mic className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Voice</span>
              </TabsTrigger>
              <TabsTrigger value="scribble" className="rounded-lg data-[state=active]:bg-background">
                <PenTool className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Scribble</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 border rounded-2xl p-4 min-h-[200px] bg-secondary/5">
              <TabsContent value="text" className="m-0">
                <Textarea 
                  placeholder="Start typing your note here..." 
                  className="min-h-[150px] resize-none border-none focus-visible:ring-0 text-base bg-transparent"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </TabsContent>
              
              <TabsContent value="image" className="m-0 space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Add image URL..." 
                      className="pl-9"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addMediaByUrl(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto rounded-xl"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    multiple
                    className="hidden" 
                  />
                </div>

                {mediaUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {mediaUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-muted border group">
                        <img src={url} alt={`Preview ${idx}`} className="object-cover w-full h-full" />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                          onClick={() => removeMedia(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <Textarea 
                  placeholder="Add a caption..." 
                  className="min-h-[60px] resize-none bg-transparent border-none focus-visible:ring-0"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </TabsContent>

              <TabsContent value="voice" className="m-0">
                <div className="space-y-4">
                  <VoiceRecorder onSave={(url) => setMediaUrls([url])} initialValue={mediaUrls[0]} />
                  <Textarea 
                    placeholder="Transcription or additional details..." 
                    className="min-h-[60px] resize-none bg-transparent border-none focus-visible:ring-0"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="scribble" className="m-0">
                <div className="space-y-4">
                  <ScribbleCanvas onSave={(url) => setMediaUrls([url])} initialValue={mediaUrls[0]} />
                  <Textarea 
                    placeholder="Note details..." 
                    className="min-h-[60px] resize-none bg-transparent border-none focus-visible:ring-0"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex flex-col gap-4 p-4 rounded-2xl bg-accent/5 border border-accent/20 transition-all hover:bg-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-xl transition-all", isLocked ? "bg-accent/20 glow-accent" : "bg-muted")}>
                <Lock className={cn("h-4 w-4 transition-colors", isLocked ? "text-accent" : "text-muted-foreground")} />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="lock-toggle" className="text-sm font-bold cursor-pointer">Security Lock</Label>
                <p className="text-xs text-muted-foreground">Protect this content with a private passkey.</p>
              </div>
            </div>
            <Switch 
              id="lock-toggle" 
              checked={isLocked} 
              onCheckedChange={setIsLocked}
              className="data-[state=checked]:bg-accent"
            />
          </div>
          {isLocked && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <Label htmlFor="passkey" className="text-xs font-semibold uppercase text-muted-foreground">Set Passkey</Label>
              <Input 
                id="passkey"
                type="password"
                placeholder="Enter a secret code" 
                value={passkey} 
                onChange={(e) => setPasskey(e.target.value)}
                className="bg-background focus-visible:glow-accent border-accent/20 rounded-xl"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} className="hover:bg-muted font-medium rounded-xl">
            Discard
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary transition-all active:scale-95 font-bold min-w-[120px] rounded-xl"
          >
            <Save className="h-4 w-4 mr-2" /> Save Note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

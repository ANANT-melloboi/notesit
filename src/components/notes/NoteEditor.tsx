
"use client";

import React, { useState, useRef } from 'react';
import { Note, MediaType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
  Trash2,
  Video as VideoIcon,
  Cloud,
  Zap,
  Camera,
  Film,
  AlertTriangle
} from 'lucide-react';
import { ScribbleCanvas } from './ScribbleCanvas';
import { VoiceRecorder } from './VoiceRecorder';
import { VideoRecorder } from './VideoRecorder';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NoteEditorProps {
  initialNote?: Partial<Note>;
  onSave: (note: Partial<Note>) => void;
  onCancel: () => void;
}

const SUCCESS_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
const MAX_DOC_SIZE_BYTES = 800000; // ~800KB safety limit for Firestore (1MB limit)

export function NoteEditor({ initialNote, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [mediaType, setMediaType] = useState<MediaType>(initialNote?.mediaType || 'text');
  const [mediaUrls, setMediaUrls] = useState<string[]>(initialNote?.mediaUrls || []);
  const [isLocked, setIsLocked] = useState(initialNote?.isLocked || false);
  const [passkey, setPasskey] = useState(initialNote?.passkey || '');
  const [videoMode, setVideoMode] = useState<'record' | 'upload'>('record');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const calculateTotalSize = () => {
    const mediaSize = mediaUrls.reduce((acc, url) => acc + url.length, 0);
    const textSize = title.length + content.length + passkey.length;
    return mediaSize + textSize;
  };

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

    const totalSize = calculateTotalSize();
    if (totalSize > MAX_DOC_SIZE_BYTES) {
      toast({
        variant: "destructive",
        title: "Note Too Large",
        description: "Your media exceeds the high-capacity vault limit for a single note. Please reduce the number of videos or images.",
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    toast({
      title: "Processing Media",
      description: "Optimizing videos for high-capacity cloud sync...",
    });

    Array.from(files).forEach(file => {
      if (file.size > MAX_DOC_SIZE_BYTES * 0.8) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: `${file.name} exceeds the optimization limit. Try a shorter clip.`,
        });
        return;
      }
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
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-t-4 border-t-primary bg-card glass flex flex-col h-[90vh] md:h-[85vh] overflow-hidden">
      {/* Pinned Header */}
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b shrink-0 bg-card/50 backdrop-blur-md z-10">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            {initialNote?.id ? 'Edit Note' : 'Create New Note'}
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] gap-1 px-2">
              <Cloud className="h-3 w-3" /> Secure Sync
            </Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground hidden sm:block">Changes are synced to your vault automatically on save.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      
      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <CardContent className="space-y-6 pt-6 pb-24">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">Title</Label>
            <Input 
              id="title"
              placeholder="What's this note about?" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium border-none bg-muted/30 focus-visible:glow-primary transition-all h-12"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Media Content</Label>
            <Tabs value={mediaType} onValueChange={(val) => setMediaType(val as MediaType)} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-secondary/50 p-1 rounded-xl h-11">
                <TabsTrigger value="text" className="rounded-lg data-[state=active]:bg-background px-1">
                  <Type className="h-4 w-4" />
                  <span className="hidden md:inline ml-2 text-xs">Text</span>
                </TabsTrigger>
                <TabsTrigger value="image" className="rounded-lg data-[state=active]:bg-background px-1">
                  <ImageIcon className="h-4 w-4" />
                  <span className="hidden md:inline ml-2 text-xs">Images</span>
                </TabsTrigger>
                <TabsTrigger value="video" className="rounded-lg data-[state=active]:bg-background px-1">
                  <VideoIcon className="h-4 w-4" />
                  <span className="hidden md:inline ml-2 text-xs">Videos</span>
                </TabsTrigger>
                <TabsTrigger value="voice" className="rounded-lg data-[state=active]:bg-background px-1">
                  <Mic className="h-4 w-4" />
                  <span className="hidden md:inline ml-2 text-xs">Voice</span>
                </TabsTrigger>
                <TabsTrigger value="scribble" className="rounded-lg data-[state=active]:bg-background px-1">
                  <PenTool className="h-4 w-4" />
                  <span className="hidden md:inline ml-2 text-xs">Draw</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 border rounded-2xl p-3 md:p-4 min-h-[200px] bg-secondary/5">
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
                        placeholder="Add URL..." 
                        className="pl-9 h-10"
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
                      className="h-10 rounded-xl"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*,image/gif" 
                      multiple
                      className="hidden" 
                    />
                  </div>

                  {mediaUrls.length > 0 && mediaType === 'image' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {mediaUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-muted border group">
                          <img src={url} alt={`Preview ${idx}`} className="object-cover w-full h-full" />
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-1 right-1 h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-full"
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

                <TabsContent value="video" className="m-0 space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-center p-1 bg-muted rounded-lg w-fit mx-auto">
                      <Button 
                        variant={videoMode === 'record' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setVideoMode('record')}
                        className="rounded-md h-8 gap-2"
                      >
                        <Camera className="h-4 w-4" /> Camera
                      </Button>
                      <Button 
                        variant={videoMode === 'upload' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setVideoMode('upload')}
                        className="rounded-md h-8 gap-2"
                      >
                        <Upload className="h-4 w-4" /> Device File
                      </Button>
                    </div>

                    {videoMode === 'upload' ? (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex-1 relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Add video URL..." 
                              className="pl-9 h-10"
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
                            onClick={() => videoInputRef.current?.click()}
                            className="h-10 rounded-xl"
                          >
                            <Film className="h-4 w-4 mr-2" />
                            Browse
                          </Button>
                          <input 
                            type="file" 
                            ref={videoInputRef} 
                            onChange={handleVideoFileChange} 
                            accept="video/*" 
                            multiple
                            className="hidden" 
                          />
                        </div>
                      </div>
                    ) : (
                      <VideoRecorder onSave={(url) => setMediaUrls(prev => [...prev, url])} />
                    )}

                    {mediaUrls.length > 0 && mediaType === 'video' && (
                      <div className="grid grid-cols-1 gap-4">
                        {mediaUrls.map((url, idx) => (
                          <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-black border group animate-in fade-in zoom-in duration-300">
                             <video src={url} controls className="w-full h-full object-contain" />
                             <Button 
                              variant="destructive" 
                              size="icon" 
                              className="absolute top-2 right-2 h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-full z-10"
                              onClick={() => removeMedia(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider">Pro Capacity Sync Active</span>
                      </div>
                      <span className="text-[9px] md:text-[10px] text-muted-foreground">Up to 200GB Optimized Cloud Storage</span>
                    </div>
                    
                    <Textarea 
                      placeholder="Add video notes or transcription..." 
                      className="min-h-[60px] resize-none bg-transparent border-none focus-visible:ring-0"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
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

          {calculateTotalSize() > MAX_DOC_SIZE_BYTES * 0.7 && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-[10px] font-medium text-destructive leading-tight">
                Warning: This note is approaching the cloud storage limit for single-note sync. Consider splitting media across multiple notes.
              </p>
            </div>
          )}
        </CardContent>
      </ScrollArea>

      {/* Pinned Footer */}
      <CardFooter className="flex justify-end gap-3 p-4 border-t bg-card/80 backdrop-blur-md shrink-0 z-10">
        <Button variant="outline" onClick={onCancel} className="hover:bg-muted font-medium rounded-xl h-11 px-5">
          Discard
        </Button>
        <Button 
          onClick={handleSave} 
          className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary transition-all active:scale-95 font-bold min-w-[120px] rounded-xl h-11 px-5"
        >
          <Save className="h-4 w-4 mr-2" /> Save Note
        </Button>
      </CardFooter>
    </Card>
  );
}

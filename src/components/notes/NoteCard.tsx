"use client";

import React, { useState } from 'react';
import { Note } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lock, 
  Unlock,
  ImageIcon as ImageIconLucide, 
  Mic, 
  PenTool, 
  MoreVertical,
  CheckCircle2,
  Trash2,
  Bot,
  Play,
  Cloud
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { AIAssistantDialog } from './AIAssistantDialog';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [isAttemptingUnlock, setIsAttemptingUnlock] = useState(false);
  const [unlockKey, setUnlockKey] = useState('');
  const [isTemporarilyUnlocked, setIsTemporarilyUnlocked] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  const getMediaIcon = () => {
    switch (note.mediaType) {
      case 'image': return <ImageIconLucide className="h-4 w-4" />;
      case 'voice': return <Mic className="h-4 w-4" />;
      case 'scribble': return <PenTool className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleUnlock = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (unlockKey === note.passkey) {
      setIsTemporarilyUnlocked(true);
      setIsAttemptingUnlock(false);
      setUnlockKey('');
    } else {
      setUnlockKey('');
    }
  };

  const handleRelock = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTemporarilyUnlocked(false);
  };

  const isLocked = note.isLocked && !isTemporarilyUnlocked;

  return (
    <>
      <Card 
        onClick={() => !isLocked && onEdit(note)}
        className={cn(
          "group relative flex flex-col h-fit min-h-[160px] rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-500 cursor-default overflow-hidden animate-in fade-in slide-in-from-bottom-4",
          isLocked ? "bg-muted/20" : "bg-card hover:glow-primary active:scale-[0.98]",
          "hover:border-primary/30"
        )}
      >
        {/* Sync Status Overlay */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
           <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-[10px] gap-1 border-none shadow-sm text-primary">
              <Cloud className="h-3 w-3" /> Saved
           </Badge>
        </div>

        <CardHeader className="p-5 pb-2 flex flex-row items-start justify-between">
          <div className="flex flex-col gap-0.5 w-full">
             <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg leading-tight line-clamp-2 tracking-tight">{note.title}</h3>
                {!isLocked && getMediaIcon() && (
                  <span className="text-primary ml-2 bg-primary/10 p-1.5 rounded-lg">{getMediaIcon()}</span>
                )}
                {note.isLocked && isTemporarilyUnlocked && (
                  <Unlock className="h-5 w-5 text-accent animate-in fade-in zoom-in duration-500" />
                )}
             </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-2 flex-1">
          {isLocked ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="bg-accent/10 p-4 rounded-full animate-glow-pulse border border-accent/20">
                <Lock className="h-10 w-10 text-accent" />
              </div>
              {isAttemptingUnlock ? (
                <div className="flex flex-col gap-2 w-full max-w-[200px] mx-auto animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                  <Input 
                    type="password" 
                    placeholder="Enter Passkey" 
                    autoFocus
                    value={unlockKey}
                    onChange={(e) => setUnlockKey(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock(e)}
                    className="text-center h-10 text-sm rounded-xl glow-primary focus-visible:ring-accent border-none bg-background/50"
                  />
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 h-9 text-xs rounded-lg" onClick={() => setIsAttemptingUnlock(false)}>Cancel</Button>
                    <Button size="sm" className="flex-1 h-9 text-xs bg-accent text-accent-foreground glow-accent rounded-lg" onClick={(e) => handleUnlock(e as any)}>Unlock</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="text-sm font-bold bg-accent text-accent-foreground hover:glow-accent transition-all rounded-full px-6 h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAttemptingUnlock(true);
                    }}
                  >
                    Unlock Content
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAIAssistantOpen(true);
                    }}
                  >
                    <Bot className="h-3.5 w-3.5" /> Identity Verification
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image / Scribble Preview */}
              {(note.mediaType === 'image' || note.mediaType === 'scribble') && note.mediaUrl && (
                <div className="aspect-video relative rounded-xl overflow-hidden bg-muted mb-2 border-2 border-muted group-hover:border-primary/20 transition-colors shadow-inner">
                  <img src={note.mediaUrl} alt={note.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                </div>
              )}
              
              {/* Voice Preview */}
              {note.mediaType === 'voice' && note.mediaUrl && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/10 mb-2">
                  <div className="bg-primary p-2.5 rounded-full shadow-lg glow-primary">
                    <Play className="h-3.5 w-3.5 text-primary-foreground fill-current" />
                  </div>
                  <div className="flex-1 h-1.5 bg-primary/10 rounded-full relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-primary w-1/3 rounded-full animate-pulse" />
                  </div>
                  <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Recording</span>
                </div>
              )}

              <p className="text-sm text-foreground/70 line-clamp-5 leading-relaxed whitespace-pre-wrap font-medium">
                {note.content}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-3 pt-0 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
           {note.isLocked && isTemporarilyUnlocked && (
             <Button 
              variant="secondary" 
              size="icon" 
              className="h-9 w-9 text-accent hover:bg-accent/20 hover:glow-accent rounded-full transition-all" 
              onClick={handleRelock}
              title="Lock again"
            >
               <Lock className="h-4 w-4" />
             </Button>
           )}
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-muted rounded-full transition-all" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl p-2 shadow-2xl border-none glass">
                 <DropdownMenuItem className="rounded-lg focus:bg-primary/10" onClick={() => onEdit(note)}>Edit Note</DropdownMenuItem>
                 <DropdownMenuItem className="text-destructive rounded-lg focus:bg-destructive/10" onClick={() => onDelete(note.id)}>
                   <Trash2 className="h-4 w-4 mr-2" /> Delete Permanently
                 </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </CardFooter>
      </Card>

      <AIAssistantDialog 
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        noteTitle={note.title}
        onUnlock={() => setIsTemporarilyUnlocked(true)}
      />
    </>
  );
}

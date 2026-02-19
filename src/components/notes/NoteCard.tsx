
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
  Play
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
          "group relative flex flex-col h-fit min-h-[140px] rounded-lg border border-border shadow-none hover:shadow-lg transition-all duration-300 cursor-default overflow-hidden",
          isLocked ? "bg-muted/10" : "bg-card",
          !isLocked && "hover:glow-primary"
        )}
      >
        {/* Selection Dot */}
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="bg-background rounded-full p-0.5 shadow-sm border glow-primary">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
           </div>
        </div>

        <CardHeader className="p-4 pb-1 flex flex-row items-start justify-between">
          <div className="flex flex-col gap-0.5 w-full">
             <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base leading-tight line-clamp-2">{note.title}</h3>
                {!isLocked && getMediaIcon() && (
                  <span className="text-muted-foreground ml-2 transition-transform group-hover:scale-110">{getMediaIcon()}</span>
                )}
                {note.isLocked && isTemporarilyUnlocked && (
                  <Unlock className="h-4 w-4 text-accent animate-in fade-in zoom-in duration-300" />
                )}
             </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-1 flex-1">
          {isLocked ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="bg-accent/10 p-3 rounded-full animate-glow-pulse">
                <Lock className="h-8 w-8 text-accent/80" />
              </div>
              {isAttemptingUnlock ? (
                <div className="flex flex-col gap-2 w-full max-w-[180px] mx-auto animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                  <Input 
                    type="password" 
                    placeholder="Passkey" 
                    autoFocus
                    value={unlockKey}
                    onChange={(e) => setUnlockKey(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock(e)}
                    className="text-center h-9 text-sm rounded-lg glow-primary focus-visible:ring-accent"
                  />
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setIsAttemptingUnlock(false)}>Cancel</Button>
                    <Button size="sm" className="flex-1 h-8 text-xs bg-accent text-accent-foreground glow-accent" onClick={(e) => handleUnlock(e as any)}>Unlock</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs font-bold text-accent hover:bg-accent/10 hover:glow-accent transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAttemptingUnlock(true);
                    }}
                  >
                    Unlock Note
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAIAssistantOpen(true);
                    }}
                  >
                    <Bot className="h-3 w-3" /> Forgot? Ask AI
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Image / Scribble Preview */}
              {(note.mediaType === 'image' || note.mediaType === 'scribble') && note.mediaUrl && (
                <div className="aspect-video relative rounded-md overflow-hidden bg-muted mb-2 border">
                  <img src={note.mediaUrl} alt={note.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                </div>
              )}
              
              {/* Voice Preview */}
              {note.mediaType === 'voice' && note.mediaUrl && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 border border-primary/20 mb-2">
                  <div className="bg-primary p-2 rounded-full">
                    <Play className="h-3 w-3 text-primary-foreground fill-current" />
                  </div>
                  <div className="flex-1 h-1 bg-primary/20 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary w-1/3 rounded-full" />
                  </div>
                  <span className="text-[10px] font-mono text-primary font-bold">Voice Note</span>
                </div>
              )}

              <p className="text-sm text-foreground/80 line-clamp-6 leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-2 pt-0 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           {note.isLocked && isTemporarilyUnlocked && (
             <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-accent hover:bg-accent/10 hover:glow-accent" 
              onClick={handleRelock}
              title="Lock again"
            >
               <Lock className="h-4 w-4" />
             </Button>
           )}
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:glow-primary" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuItem onClick={() => onEdit(note)}>Edit</DropdownMenuItem>
                 <DropdownMenuItem className="text-destructive" onClick={() => onDelete(note.id)}>
                   <Trash2 className="h-4 w-4 mr-2" /> Delete
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

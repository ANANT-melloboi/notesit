"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Loader2, Send } from 'lucide-react';
import { unlockAssistant } from '@/ai/flows/unlock-assistant';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIAssistantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  noteTitle: string;
  onUnlock: () => void;
}

export function AIAssistantDialog({ isOpen, onClose, noteTitle, onUnlock }: AIAssistantDialogProps) {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const result = await unlockAssistant({
        noteTitle,
        userMessage: userMsg,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: result.reply }]);
      
      if (result.shouldUnlock) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Identity verified. Unlocking note now..." }]);
        setTimeout(() => {
          onUnlock();
          onClose();
        }, 2000);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble processing that right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] flex flex-col h-[500px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Vault Security Assistant
          </DialogTitle>
          <DialogDescription>
            I can verify your identity and unlock access to your note.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-6 pt-0">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground border border-dashed">
                Hi! I'm the Vault Assistant. I noticed you're trying to access <strong>"{noteTitle}"</strong> but forgot your passkey. Tell me why you need access or what you remember about this note.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-muted text-foreground rounded-tl-none border'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-2 rounded-tl-none border">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input 
              placeholder="Ask for help..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="rounded-full bg-muted/50 border-none focus-visible:ring-1"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading}
              className="rounded-full shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

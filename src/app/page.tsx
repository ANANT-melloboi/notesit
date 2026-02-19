
"use client";

import React, { useState, useEffect } from 'react';
import { Note } from '@/lib/types';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { AboutDialog } from '@/components/settings/AboutDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, doc } from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  Menu as MenuIcon,
  ShieldCheck,
  Lightbulb,
  Bell,
  Pencil,
  Archive,
  Trash2,
  Settings,
  Image as ImageIcon,
  Mic,
  PenTool,
  LogOut,
  Info,
  Loader2,
  Cloud
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { signOut } from 'firebase/auth';

export default function Home() {
  const { user, auth, firestore, isUserLoading } = useFirebase();
  const router = useRouter();
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note> | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Notes');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Memoized query for the user's notes - this ensures cross-device sync via Firestore
  const notesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'notes');
  }, [firestore, user]);

  const { data: notes, isLoading: isNotesLoading } = useCollection<Note>(notesQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSaveNote = (noteData: Partial<Note>) => {
    if (!firestore || !user) return;

    const notesRef = collection(firestore, 'users', user.uid, 'notes');
    
    if (noteData.id) {
      const noteRef = doc(firestore, 'users', user.uid, 'notes', noteData.id);
      updateDocumentNonBlocking(noteRef, {
        ...noteData,
        updatedAt: new Date().toISOString()
      });
    } else {
      addDocumentNonBlocking(notesRef, {
        ...noteData,
        userId: user.uid,
        category: activeCategory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    setIsEditorOpen(false);
    setEditingNote(undefined);
  };

  const handleDeleteNote = (id: string) => {
    if (!firestore || !user) return;
    const noteRef = doc(firestore, 'users', user.uid, 'notes', id);
    deleteDocumentNonBlocking(noteRef);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };

  // Filter notes based on category and search
  const filteredNotes = (notes || []).filter(n => {
    const matchesSearch = (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (n.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = n.category === activeCategory || activeCategory === 'Notes';
    return matchesSearch && matchesCategory;
  });

  const sidebarItems = [
    { name: 'Notes', icon: <Lightbulb className="h-5 w-5" /> },
    { name: 'Reminders', icon: <Bell className="h-5 w-5" /> },
    { name: 'Archive', icon: <Archive className="h-5 w-5" /> },
    { name: 'Trash', icon: <Trash2 className="h-5 w-5" /> },
  ];

  if (isUserLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-body">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 border-r bg-background flex flex-col z-20 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center px-6 gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MenuIcon className="h-6 w-6" />
          </Button>
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg glow-primary">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-medium tracking-tight text-foreground">Vault</span>
            </div>
          )}
        </div>
        <ScrollArea className="flex-1 mt-2">
          <div className="px-3 space-y-1">
            {sidebarItems.map(item => (
              <button
                key={item.name}
                onClick={() => setActiveCategory(item.name)}
                className={`w-full flex items-center gap-5 px-3 py-3 rounded-r-full text-sm font-medium transition-all ${
                  activeCategory === item.name 
                    ? 'bg-primary/20 text-foreground glow-primary shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <div className="min-w-[24px] flex justify-center">{item.icon}</div>
                {isSidebarOpen && <span>{item.name}</span>}
              </button>
            ))}
          </div>
        </ScrollArea>
        {isSidebarOpen && (
          <div className="p-4 space-y-2 border-t">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" onClick={() => setIsAboutOpen(true)}>
              <Info className="h-4 w-4" /> About
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        )}
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center px-4 md:px-8 gap-4 border-b">
          <div className="flex-1 max-w-2xl mx-auto relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </div>
            <Input 
              placeholder="Search your secure notes" 
              className="pl-12 h-12 bg-muted/40 border-none shadow-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:bg-background rounded-lg text-base transition-all focus-visible:glow-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary/60 bg-primary/5 px-2 py-1 rounded-full border border-primary/10">
              <Cloud className="h-3.5 w-3.5" />
              Synced
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:bg-muted" 
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary/20 ml-1 overflow-hidden border glow-primary">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'guest'}`} 
                alt="Avatar" 
              />
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 bg-background">
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
            
            {/* Take a Note Bar */}
            <div 
              className="max-w-xl mx-auto bg-card rounded-lg border shadow-sm p-3 flex items-center gap-4 cursor-text hover:shadow-md transition-all hover:glow-primary group"
              onClick={() => {
                setEditingNote({ category: activeCategory, mediaType: 'text' });
                setIsEditorOpen(true);
              }}
            >
              <p className="flex-1 text-muted-foreground font-medium pl-2">Take a note...</p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary"><ImageIcon className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary"><PenTool className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary"><Mic className="h-5 w-5" /></Button>
              </div>
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
              {isNotesLoading ? (
                 <div className="col-span-full flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                 </div>
              ) : filteredNotes.length > 0 ? (
                filteredNotes.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground/50">
                   <Lightbulb className="h-24 w-24 mb-4 stroke-1 animate-pulse" />
                   <p className="text-lg font-medium">Notes you add appear here</p>
                   <p className="text-xs mt-1">Synced across all your devices</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </main>

      {/* Dialogs */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl animate-in zoom-in-95 duration-200">
            <NoteEditor 
              initialNote={editingNote} 
              onSave={handleSaveNote} 
              onCancel={() => {
                setIsEditorOpen(false);
                setEditingNote(undefined);
              }} 
            />
          </div>
        </div>
      )}

      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AboutDialog isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}

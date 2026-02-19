
export type MediaType = 'text' | 'image' | 'voice' | 'scribble';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  mediaType: MediaType;
  mediaUrl?: string;
  category: string;
  isLocked: boolean;
  passkey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

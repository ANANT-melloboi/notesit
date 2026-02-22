
export type MediaType = 'text' | 'image' | 'voice' | 'scribble';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  mediaType: MediaType;
  mediaUrls?: string[]; // Updated to support multiple URLs
  category: string;
  isLocked: boolean;
  passkey?: string;
  reminderMinutes?: number; // Added for the new timer feature
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

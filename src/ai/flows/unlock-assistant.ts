'use server';
/**
 * @fileOverview AI Assistant flow for helping users unlock forgotten notes.
 * 
 * This flow takes the note title and a user message, and returns a reply
 * along with a decision on whether the note should be unlocked.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const UnlockInputSchema = z.object({
  noteTitle: z.string().describe('The title of the locked note'),
  userMessage: z.string().describe('The user plea or message to the assistant'),
});

const UnlockOutputSchema = z.object({
  reply: z.string().describe('The assistant response to the user'),
  shouldUnlock: z.boolean().describe('Whether the assistant has decided to unlock the note'),
});

export async function unlockAssistant(input: z.infer<typeof UnlockInputSchema>) {
  return unlockAssistantFlow(input);
}

const unlockAssistantFlow = ai.defineFlow(
  {
    name: 'unlockAssistantFlow',
    inputSchema: UnlockInputSchema,
    outputSchema: UnlockOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      system: `You are the MediaVault AI Security Assistant. 
      A user has forgotten their passkey for a note titled "{{{noteTitle}}}".
      Your goal is to be helpful but maintain a "security" persona. 
      Ask the user why they need access or what they remember about the note.
      If their response seems genuine or they mention the content of the note title, you can decide to set 'shouldUnlock' to true.
      Otherwise, keep the conversation going to verify them.
      Be friendly, slightly robotic, and professional.`,
      prompt: input.userMessage,
      output: { schema: UnlockOutputSchema }
    });
    return output!;
  }
);

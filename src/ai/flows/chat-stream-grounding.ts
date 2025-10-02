'use server';

/**
 * @fileOverview A Genkit flow for streaming text responses from the Gemini model, enhanced with Google Search snippets.
 *
 * - chatStreamWithGrounding - A function that initiates the chat stream with grounding.
 * - ChatStreamWithGroundingInput - The input type for the chatStreamWithGrounding function.
 * - ChatStreamWithGroundingOutput - The return type for the chatStreamWithGrounding function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatStreamWithGroundingInputSchema = z.object({
  message: z.string().describe('The user message to send to the Gemini model.'),
});
export type ChatStreamWithGroundingInput = z.infer<typeof ChatStreamWithGroundingInputSchema>;

const CitationSchema = z.object({
  title: z.string().optional(),
  url: z.string().optional(),
  snippet: z.string().optional(),
  cursor: z.string().optional(),
  rank: z.number().optional(),
});

const ChatStreamWithGroundingOutputSchema = z.object({
  response: z.string().describe('The Gemini model response.'),
  citations: z.array(CitationSchema).describe('Citations from Google Search.'),
});
export type ChatStreamWithGroundingOutput = z.infer<typeof ChatStreamWithGroundingOutputSchema>;

export async function chatStreamWithGrounding(input: ChatStreamWithGroundingInput): Promise<ChatStreamWithGroundingOutput> {
  return chatStreamWithGroundingFlow(input);
}

const chatStreamWithGroundingPrompt = ai.definePrompt({
  name: 'chatStreamWithGroundingPrompt',
  input: {schema: ChatStreamWithGroundingInputSchema},
  output: {schema: ChatStreamWithGroundingOutputSchema},
  prompt: `Answer the following question using Google Search to ground the response with the most current information available.\n\nQuestion: {{{message}}} `,
  tools: [],
});

const chatStreamWithGroundingFlow = ai.defineFlow(
  {
    name: 'chatStreamWithGroundingFlow',
    inputSchema: ChatStreamWithGroundingInputSchema,
    outputSchema: ChatStreamWithGroundingOutputSchema,
  },
  async input => {
    const {output} = await chatStreamWithGroundingPrompt(input);
    return output!;
  }
);

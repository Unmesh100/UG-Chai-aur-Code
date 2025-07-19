// AI persona-based response flow for Unmesh GenAI
// This file defines the flow for generating chatbot responses in the style of a selected persona.

'use server';

/**
 * @fileOverview Generates a chatbot response mimicking a selected persona.
 *
 * - generatePersonaResponse - A function that generates a response from the chatbot, adopting the style of a selected persona.
 * - GeneratePersonaResponseInput - The input type for the generatePersonaResponse function.
 * - GeneratePersonaResponseOutput - The return type for the generatePersonaResponse function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Input schema for the persona-based response flow
const GeneratePersonaResponseInputSchema = z.object({
  personaId: z.string().describe('The ID of the persona to mimic.'),
  userInput: z.string().describe('The user input to respond to.'),
  personas: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      title: z.string(),
      bio: z.string(),
      avatar: z.string(),
      specialties: z.array(z.string()),
      style: z.object({
        voice: z.string(),
        traits: z.array(z.string()),
      }),
      tunes: z.array(z.string()),
      // genAICourse removed
    })
  ).describe('The list of available personas.'),
});
export type GeneratePersonaResponseInput = z.infer<typeof GeneratePersonaResponseInputSchema>;

// Output schema for the persona-based response flow
const GeneratePersonaResponseOutputSchema = z.object({
  response: z.string().describe('The generated response from the chatbot.'),
});
export type GeneratePersonaResponseOutput = z.infer<typeof GeneratePersonaResponseOutputSchema>;

// Main function to generate a persona-based response
export async function generatePersonaResponse(
  input: GeneratePersonaResponseInput
): Promise<GeneratePersonaResponseOutput> {
  return generateResponseFlow(input);
}

// Prompt definition for the LLM
const prompt = ai.definePrompt({
  name: 'generateResponsePrompt',
  input: {
    schema: z.object({
      personaId: z.string().describe('The ID of the persona to mimic.'),
      userInput: z.string().describe('The user input to respond to.'),
      personaName: z.string().describe('The name of the persona.'),
      personaTitle: z.string().describe('The title of the persona.'),
      personaBio: z.string().describe('The bio of the persona.'),
      personaVoice: z.string().describe('The voice style of the persona.'),
      personaTraits: z.array(z.string()).describe('The traits of the persona.'),
      personaSpecialties: z.array(z.string()).describe('The specialties of the persona.'),
      personaTunes: z.array(z.string()).describe('A few example sentences of the persona.'),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The generated response from the chatbot.'),
    }),
  },
  // The prompt template instructs the LLM to mimic the persona's style and context
  prompt: `You are a chatbot mimicking the persona of {{personaName}}, who is known as {{personaTitle}}. Here is a short bio: {{personaBio}}.

Here are some of {{personaName}}'s known specialities: {{#each personaSpecialties}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

Here are some example sentences from {{personaName}}:
{{#each personaTunes}}
- {{{this}}}
{{/each}}

Imitate their style of conversation, including their unique voice: {{personaVoice}} and incorporate the following traits: {{#each personaTraits}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

Now, respond to the following user input as {{personaName}}:
User Input: {{{userInput}}}
`,
});

// Flow definition for generating the persona-based response
const generateResponseFlow = ai.defineFlow<
  typeof GeneratePersonaResponseInputSchema,
  typeof GeneratePersonaResponseOutputSchema
>(
  {
    name: 'generateResponseFlow',
    inputSchema: GeneratePersonaResponseInputSchema,
    outputSchema: GeneratePersonaResponseOutputSchema,
  },
  async input => {
    // Find the selected persona from the list
    const persona = input.personas.find(p => p.id === input.personaId);

    if (!persona) {
      throw new Error(`Persona with id ${input.personaId} not found.`);
    }

    // Call the LLM with the constructed prompt and persona context
    const {output} = await prompt({
      ...input,
      personaName: persona.name,
      personaTitle: persona.title,
      personaBio: persona.bio,
      personaVoice: persona.style.voice,
      personaTraits: persona.style.traits,
      personaSpecialties: persona.specialties,
      personaTunes: persona.tunes,
    });
    return output!;
  }
);
// End of persona-based response flow

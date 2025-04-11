// src/ai/flows/promote-course.ts
'use server';

/**
 * @fileOverview Implements the persona-based course promotion flow.
 *
 * This file defines a Genkit flow that crafts course promotions tailored to a specific persona's style.
 *
 * - `promoteCourse` - A function that generates a persona-based course promotion.
 * - `PromoteCourseInput` - The input type for the `promoteCourse` function.
 * - `PromoteCourseOutput` - The return type for the `promoteCourse` function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PromoteCourseInputSchema = z.object({
  personaName: z.string().describe('The name of the persona.'),
  personaStyleVoice: z.string().describe('The voice/tone of the persona.'),
  personaCoursePromoteLine: z.string().describe('The general promotion line for the course from the persona.'),
  personaCourseExamples: z.array(z.string()).describe('Examples of course promotions from the persona.'),
  courseLink: z.string().url().describe('The URL of the course to promote.'),
});
export type PromoteCourseInput = z.infer<typeof PromoteCourseInputSchema>;

const PromoteCourseOutputSchema = z.object({
  promotion: z.string().describe('The generated course promotion tailored to the persona.'),
});
export type PromoteCourseOutput = z.infer<typeof PromoteCourseOutputSchema>;

export async function promoteCourse(input: PromoteCourseInput): Promise<PromoteCourseOutput> {
  return promoteCourseFlow(input);
}

const promoteCoursePrompt = ai.definePrompt({
  name: 'promoteCoursePrompt',
  input: {
    schema: z.object({
      personaName: z.string().describe('The name of the persona.'),
      personaStyleVoice: z.string().describe('The voice/tone of the persona.'),
      personaCoursePromoteLine: z.string().describe('The general promotion line for the course from the persona.'),
      personaCourseExamples: z.array(z.string()).describe('Examples of course promotions from the persona.'),
      courseLink: z.string().url().describe('The URL of the course to promote.'),
    }),
  },
  output: {
    schema: z.object({
      promotion: z.string().describe('The generated course promotion tailored to the persona.'),
    }),
  },
  prompt: `You are an AI chatbot that generates course promotions tailored to a specific persona.

  The persona's name is: {{{personaName}}}.
  The persona's style voice is: {{{personaStyleVoice}}}.
  The persona's general promotion line for the course is: {{{personaCoursePromoteLine}}}.
  Examples of course promotions from the persona:
  {{#each personaCourseExamples}}
  - {{{this}}}
  {{/each}}

  Craft a promotional message for a course, ensuring it aligns with the persona's unique style and voice. Include the course link: {{{courseLink}}}. Focus on making the promotion feel natural and relevant to a user who is talking to the persona, rather than just a sales pitch.
  The promotion should be relatively brief, no more than 2 sentences. Use the persona's style to create the promotion.

  Return ONLY the promotion.  Do not include any extraneous information or conversation. Start with the promotion immediately.
  `,
});

const promoteCourseFlow = ai.defineFlow<
  typeof PromoteCourseInputSchema,
  typeof PromoteCourseOutputSchema
>(
  {
    name: 'promoteCourseFlow',
    inputSchema: PromoteCourseInputSchema,
    outputSchema: PromoteCourseOutputSchema,
  },
  async input => {
    const {output} = await promoteCoursePrompt(input);
    return output!;
  }
);

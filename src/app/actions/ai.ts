"use server";

import { generateText } from "ai";
import { neon } from "@neon/ai-sdk-provider";
import { z } from "zod";

const inputSchema = z.object({
  idea: z.string().trim().min(3).max(300),
  entityType: z.enum(["LLC", "CORPORATION"]),
  state: z.string().max(40),
});

// Calls an LLM through the Neon AI Gateway (NEON_AI_GATEWAY_* env vars, read by the provider).
// The wizard is public, so input and output are kept small.
export async function suggestCompanyNames(input: z.input<typeof inputSchema>): Promise<{ names: string[] } | { error: string }> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { error: "Describe your business in a few words first." };
  const { idea, entityType, state } = parsed.data;
  const suffix = entityType === "LLC" ? "LLC" : "Inc.";

  try {
    const { text } = await generateText({
      model: neon(process.env.AI_MODEL || "claude-haiku-4-5"),
      maxOutputTokens: 200,
      system:
        "You suggest short, distinctive, professional US company names. Reply with exactly 5 names, one per line, no numbering or commentary.",
      prompt: `Business: ${idea}\nState: ${state}\nEach name must end with "${suffix}".`,
    });
    const names = text
      .split("\n")
      .map((l) => l.replace(/^[\s\-*\d.)]+/, "").trim())
      .filter(Boolean)
      .slice(0, 5);
    return names.length ? { names } : { error: "No suggestions came back. Try again." };
  } catch (e) {
    console.error("AI Gateway request failed", e);
    return { error: "Name suggestions are unavailable right now." };
  }
}

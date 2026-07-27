/**
 * Kiro Session Hook
 *
 * Logs prompts, decisions, and iterations as the build happens.
 * Append-only JSONL format — each line is a valid JSON object.
 * Output: kiro-session.log at project root.
 *
 * This is a required deliverable, separate from the app itself.
 * Set up early so it captures the build story in real time.
 */

import fs from "fs";
import path from "path";

export type LogEntryType = "prompt" | "decision" | "iteration" | "milestone";

export interface LogEntry {
  timestamp: string;
  type: LogEntryType;
  context: string;
  content: string;
  tags?: string[];
}

const LOG_PATH = process.env.VERCEL
  ? "/tmp/kiro-session.log"   // Vercel functions have read-only cwd; /tmp is writable
  : path.join(process.cwd(), "kiro-session.log");

function writeEntry(entry: LogEntry): void {
  // Server-side only — fs is not available in browser/edge contexts
  if (typeof window !== "undefined") return;

  try {
    const line = JSON.stringify(entry) + "\n";
    fs.appendFileSync(LOG_PATH, line, "utf8");
  } catch {
    // Non-fatal — log failure should never break the demo
    console.warn("[kiro-session] Failed to write log entry:", entry.context);
  }
}

function createEntry(
  type: LogEntryType,
  context: string,
  content: string,
  tags?: string[]
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    type,
    context,
    content,
    tags,
  };
}

export function logPrompt(context: string, content: string, tags?: string[]): void {
  writeEntry(createEntry("prompt", context, content, tags));
}

export function logDecision(context: string, content: string, tags?: string[]): void {
  writeEntry(createEntry("decision", context, content, tags));
}

export function logIteration(context: string, content: string, tags?: string[]): void {
  writeEntry(createEntry("iteration", context, content, tags));
}

export function logMilestone(context: string, content: string, tags?: string[]): void {
  writeEntry(createEntry("milestone", context, content, tags));
}

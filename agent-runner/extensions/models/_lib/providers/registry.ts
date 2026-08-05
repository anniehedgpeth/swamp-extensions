import type { AgentProvider } from "../types.ts";
import { claudeProvider } from "./claude.ts";
import { codexProvider } from "./codex.ts";

const providers = new Map<string, AgentProvider>([
  ["claude", claudeProvider],
  ["codex", codexProvider],
]);

export function getProvider(name: string): AgentProvider {
  const provider = providers.get(name);
  if (!provider) {
    const available = [...providers.keys()].join(", ");
    throw new Error(
      `Unknown provider '${name}'. Available providers: ${available}`,
    );
  }
  return provider;
}

export function listProviders(): string[] {
  return [...providers.keys()];
}

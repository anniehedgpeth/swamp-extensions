import type { AgentProvider } from "./types.ts";

export function resolveApiKey(
  provider: AgentProvider,
  globalArgs: {
    apiKey?: string;
    apiKeyEnvVar?: string;
  },
): string {
  if (globalArgs.apiKey) {
    return globalArgs.apiKey;
  }

  const envVar = globalArgs.apiKeyEnvVar ?? provider.defaultApiKeyEnvVar;
  const value = Deno.env.get(envVar);
  if (value) {
    return value;
  }

  throw new Error(
    `No API key found for provider '${provider.name}'. ` +
      `Set the ${envVar} environment variable, ` +
      `configure apiKey via a vault reference in global arguments, ` +
      `or set apiKeyEnvVar to a custom environment variable name.`,
  );
}

import type { Platform } from "./types.ts";

export function detectPlatform(): Platform {
  const os = Deno.build.os;
  const arch = Deno.build.arch;

  const osKey = os === "darwin" ? "darwin" : os === "linux" ? "linux" : null;
  if (!osKey) {
    throw new Error(`Unsupported operating system: ${os}`);
  }

  const archKey = arch === "x86_64"
    ? "x64"
    : arch === "aarch64"
    ? "arm64"
    : null;
  if (!archKey) {
    throw new Error(`Unsupported architecture: ${arch}`);
  }

  return `${osKey}-${archKey}` as Platform;
}

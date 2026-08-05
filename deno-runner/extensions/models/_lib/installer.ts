import type { DenoRunnerLogger, Platform } from "./types.ts";

const DOWNLOAD_BASE = "https://dl.deno.land/release";

const CACHE_DIR_NAME = ".swamp/deno-runner/bin";

function archiveFilename(platform: Platform): string {
  const mapping: Record<Platform, string> = {
    "linux-x64": "deno-x86_64-unknown-linux-gnu.zip",
    "linux-arm64": "deno-aarch64-unknown-linux-gnu.zip",
    "darwin-x64": "deno-x86_64-apple-darwin.zip",
    "darwin-arm64": "deno-aarch64-apple-darwin.zip",
  };
  return mapping[platform];
}

function downloadUrl(version: string, platform: Platform): string {
  return `${DOWNLOAD_BASE}/v${version}/${archiveFilename(platform)}`;
}

function checksumUrl(version: string, platform: Platform): string {
  return `${DOWNLOAD_BASE}/v${version}/${archiveFilename(platform)}.sha256`;
}

export async function tryVerifyChecksum(
  binaryData: Uint8Array,
  version: string,
  platform: Platform,
  signal?: AbortSignal,
  baseUrl?: string,
): Promise<"verified" | "skipped"> {
  const url = baseUrl
    ? `${baseUrl}/v${version}/${archiveFilename(platform)}.sha256`
    : checksumUrl(version, platform);

  const resp = await fetch(url, { signal });
  if (!resp.ok) {
    await resp.body?.cancel();
    return "skipped";
  }
  const text = await resp.text();
  const expectedHash = text.trim().split(/\s+/)[0];

  if (!expectedHash) {
    return "skipped";
  }

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new Uint8Array(binaryData).buffer as ArrayBuffer,
  );
  const actualHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (actualHash !== expectedHash) {
    throw new Error(
      `Checksum mismatch for Deno ${version}.\n` +
        `  Expected: ${expectedHash}\n` +
        `  Got:      ${actualHash}`,
    );
  }

  return "verified";
}

async function extractDenoFromZip(
  zipData: Uint8Array,
  destPath: string,
): Promise<void> {
  const tmpZip = `${destPath}.zip.${crypto.randomUUID()}`;
  try {
    await Deno.writeFile(tmpZip, zipData);
    const command = new Deno.Command("unzip", {
      args: ["-o", tmpZip, "deno", "-d", destPath],
      stdout: "piped",
      stderr: "piped",
    });
    const output = await command.output();
    if (output.code !== 0) {
      const stderr = new TextDecoder().decode(output.stderr);
      throw new Error(`Failed to extract Deno binary: ${stderr}`);
    }
  } finally {
    try {
      await Deno.remove(tmpZip);
    } catch {
      // best-effort cleanup
    }
  }
}

export async function ensureDeno(
  version: string,
  baseDir: string,
  platform: Platform,
  signal?: AbortSignal,
  logger?: DenoRunnerLogger,
): Promise<string> {
  const cacheDir = `${baseDir}/${CACHE_DIR_NAME}`;
  const dir = `${cacheDir}/${version}`;
  const binaryPath = `${dir}/deno`;

  try {
    await Deno.stat(binaryPath);
    return binaryPath;
  } catch {
    // Not cached — download
  }

  await Deno.mkdir(dir, { recursive: true });

  const url = downloadUrl(version, platform);
  const resp = await fetch(url, { signal });
  if (!resp.ok) {
    await resp.body?.cancel();
    throw new Error(
      `Failed to download Deno ${version} for ${platform}: ` +
        `${resp.status} ${resp.statusText}`,
    );
  }

  const zipData = new Uint8Array(await resp.arrayBuffer());

  const checksumStatus = await tryVerifyChecksum(
    zipData,
    version,
    platform,
    signal,
  );
  if (checksumStatus === "skipped" && logger) {
    logger.warn(
      `Checksum verification skipped for Deno ${version} — no checksum file available`,
    );
  }

  const tmpDir = `${dir}/extract.${crypto.randomUUID()}`;
  try {
    await Deno.mkdir(tmpDir, { recursive: true });
    await extractDenoFromZip(zipData, tmpDir);
    const extractedBinary = `${tmpDir}/deno`;
    await Deno.chmod(extractedBinary, 0o755);
    await Deno.rename(extractedBinary, binaryPath);
  } catch (error) {
    try {
      await Deno.remove(binaryPath);
    } catch {
      // best-effort cleanup
    }
    throw error;
  } finally {
    try {
      await Deno.remove(tmpDir, { recursive: true });
    } catch {
      // best-effort cleanup
    }
  }

  return binaryPath;
}

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

import { execGit } from "./runner.ts";

export interface CheckContext {
  readonly globalArgs: Record<string, unknown>;
}

export interface CheckResult {
  pass: boolean;
  errors?: string[];
}

export async function checkGitAvailable(
  _ctx: CheckContext,
): Promise<CheckResult> {
  try {
    const result = await execGit(["--version"]);
    if (result.exitCode === 0) {
      return { pass: true };
    }
    return { pass: false, errors: ["git command returned non-zero exit"] };
  } catch {
    return { pass: false, errors: ["git binary not found on PATH"] };
  }
}

export async function checkRepoInitialized(
  ctx: CheckContext,
): Promise<CheckResult> {
  const repoPath = (ctx.globalArgs.repoPath as string) || ".";
  try {
    const result = await execGit(
      ["rev-parse", "--is-inside-work-tree"],
      { cwd: repoPath },
    );
    if (result.exitCode === 0 && result.stdout.trim() === "true") {
      return { pass: true };
    }
    return {
      pass: false,
      errors: [`${repoPath} is not a git repository`],
    };
  } catch {
    return { pass: false, errors: [`could not verify ${repoPath}`] };
  }
}

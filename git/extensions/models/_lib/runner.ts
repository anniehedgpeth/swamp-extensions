import type { ExecResult } from "./types.ts";

export type CommandExecutor = (
  argv: string[],
  opts?: { cwd?: string },
) => ExecResult | Promise<ExecResult>;

async function denoExecutor(
  argv: string[],
  opts?: { cwd?: string },
): Promise<ExecResult> {
  const cmd = new Deno.Command(argv[0], {
    args: argv.slice(1),
    cwd: opts?.cwd,
    stdout: "piped",
    stderr: "piped",
  });
  const output = await cmd.output();
  const decoder = new TextDecoder();
  return {
    stdout: decoder.decode(output.stdout),
    stderr: decoder.decode(output.stderr),
    exitCode: output.code,
  };
}

let executor: CommandExecutor = denoExecutor;

export function setCommandExecutor(exec: CommandExecutor): void {
  executor = exec;
}

export function resetCommandExecutor(): void {
  executor = denoExecutor;
}

export async function execGit(
  args: string[],
  opts?: { cwd?: string },
): Promise<ExecResult> {
  return await executor(["git", ...args], opts);
}

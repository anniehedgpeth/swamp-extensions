export interface DataHandle {
  readonly name: string;
  readonly tags?: Record<string, string>;
}

export interface GitLogger {
  debug(msg: string): void;
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
}

export interface GitContext {
  readonly signal: AbortSignal;
  readonly globalArgs: Record<string, unknown>;
  readonly logger: GitLogger;
  writeResource(
    specName: string,
    name: string,
    data: Record<string, unknown>,
    overrides?: { tags?: Record<string, string> },
  ): Promise<DataHandle>;
  readResource(
    name: string,
    version?: number,
  ): Promise<Record<string, unknown> | null>;
}

export interface ExecResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
}

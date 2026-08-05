import { execGit } from "./runner.ts";
import { Attr, getTracer } from "./tracing.ts";
import { SpanStatusCode } from "npm:@opentelemetry/api@1.9.0";
import { GlobalArgsSchema } from "./schemas.ts";
import type {
  BranchArgs,
  CloneArgs,
  CommitArgs,
  ConfigArgs,
  DiffArgs,
  GlobalArgs,
  LogArgs,
  PushArgs,
  StatusArgs,
} from "./schemas.ts";
import type { DataHandle, GitContext } from "./types.ts";

function resolveGlobalArgs(raw: Record<string, unknown>): GlobalArgs {
  return GlobalArgsSchema.parse(raw);
}

function scrubCredentials(text: string): string {
  return text.replace(/https:\/\/[^@]*@/g, "https://***@");
}

// ---------------------------------------------------------------------------
// clone
// ---------------------------------------------------------------------------

export async function runClone(
  args: CloneArgs,
  ctx: GitContext,
): Promise<{ dataHandles: DataHandle[] }> {
  return await getTracer().startActiveSpan("git.clone", async (span) => {
    try {
      const argv = ["clone"];

      if (args.depth !== undefined && args.depth > 0) {
        argv.push("--depth", String(args.depth));
      }
      if (args.branch) {
        argv.push("--branch", args.branch);
      }

      let url = args.url;
      if (args.token) {
        if (!url.startsWith("https://")) {
          throw new Error(
            "token authentication requires an https:// URL",
          );
        }
        const parsed = new URL(url);
        parsed.username = "x-access-token";
        parsed.password = args.token;
        url = parsed.toString();
      }
      argv.push("--", url);

      if (args.path) {
        argv.push(args.path);
      }

      const result = await execGit(argv);
      if (result.exitCode !== 0) {
        throw new Error(
          `git clone failed (exit ${result.exitCode}): ${
            scrubCredentials(result.stderr)
          }`,
        );
      }

      const clonedPath = args.path ||
        args.url.split("/").pop()?.replace(/\.git$/, "") || "repo";

      span.setAttribute(Attr.METHOD, "clone");
      span.setAttribute(Attr.EXIT_CODE, result.exitCode);

      ctx.logger.info(`cloned ${scrubCredentials(args.url)} to ${clonedPath}`);

      const safeUrl = scrubCredentials(args.url);
      const handle = await ctx.writeResource("cloneResult", "clone", {
        path: clonedPath,
        url: safeUrl,
        ...(args.depth !== undefined ? { depth: args.depth } : {}),
        ...(args.branch ? { branch: args.branch } : {}),
      }, {
        tags: { method: "clone", url: safeUrl },
      });

      return { dataHandles: [handle] };
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: scrubCredentials(
          error instanceof Error ? error.message : String(error),
        ),
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

// ---------------------------------------------------------------------------
// diff
// ---------------------------------------------------------------------------

export async function runDiff(
  args: DiffArgs,
  ctx: GitContext,
): Promise<{ dataHandles: DataHandle[] }> {
  return await getTracer().startActiveSpan("git.diff", async (span) => {
    try {
      const globals = resolveGlobalArgs(ctx.globalArgs);
      const argv = ["diff"];

      if (args.nameOnly) {
        argv.push("--name-only");
      }
      if (args.diffFilter) {
        argv.push(`--diff-filter=${args.diffFilter}`);
      }
      if (args.stat) {
        argv.push("--stat");
      }

      if (args.threeWay) {
        argv.push(`${args.base}...${args.head}`);
      } else {
        argv.push(args.base, args.head);
      }

      if (args.paths && args.paths.length > 0) {
        argv.push("--");
        argv.push(...args.paths);
      }

      const result = await execGit(argv, { cwd: globals.repoPath });
      if (result.exitCode !== 0) {
        throw new Error(
          `git diff failed (exit ${result.exitCode}): ${result.stderr}`,
        );
      }

      const raw = result.stdout;
      const files = args.nameOnly
        ? raw.split("\n").filter((l) => l.trim().length > 0)
        : [];

      span.setAttribute(Attr.METHOD, "diff");
      span.setAttribute(Attr.BASE_REF, args.base);
      span.setAttribute(Attr.HEAD_REF, args.head);
      span.setAttribute(Attr.EXIT_CODE, result.exitCode);

      const handle = await ctx.writeResource("diffResult", "diff", {
        files,
        raw,
        count: files.length,
        base: args.base,
        head: args.head,
      }, {
        tags: { method: "diff", base: args.base, head: args.head },
      });

      return { dataHandles: [handle] };
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

// ---------------------------------------------------------------------------
// status
// ---------------------------------------------------------------------------

export async function runStatus(
  args: StatusArgs,
  ctx: GitContext,
): Promise<{ dataHandles: DataHandle[] }> {
  return await getTracer().startActiveSpan("git.status", async (span) => {
    try {
      const globals = resolveGlobalArgs(ctx.globalArgs);
      const argv = ["status", "--porcelain"];

      if (args.paths && args.paths.length > 0) {
        argv.push("--");
        argv.push(...args.paths);
      }

      const result = await execGit(argv, { cwd: globals.repoPath });
      if (result.exitCode !== 0) {
        throw new Error(
          `git status failed (exit ${result.exitCode}): ${result.stderr}`,
        );
      }

      const raw = result.stdout;
      const lines = raw.split("\n").filter((l) => l.trim().length > 0);

      const entries = lines.map((line) => ({
        status: line.substring(0, 2),
        path: line.substring(3),
      }));

      span.setAttribute(Attr.METHOD, "status");
      span.setAttribute(Attr.REPO_PATH, globals.repoPath);
      span.setAttribute(Attr.EXIT_CODE, result.exitCode);

      const handle = await ctx.writeResource("statusResult", "status", {
        entries,
        clean: lines.length === 0,
        count: lines.length,
        raw,
      }, {
        tags: { method: "status", clean: String(lines.length === 0) },
      });

      return { dataHandles: [handle] };
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

// ---------------------------------------------------------------------------
// log
// ---------------------------------------------------------------------------

const NUL = "\x00";
const GIT_NUL_FORMAT = "%H%x00%an%x00%aI%x00%s%x00";

export async function runLog(
  args: LogArgs,
  ctx: GitContext,
): Promise<{ dataHandles: DataHandle[] }> {
  return await getTracer().startActiveSpan("git.log", async (span) => {
    try {
      const globals = resolveGlobalArgs(ctx.globalArgs);
      const argv = ["log"];

      if (args.format) {
        argv.push(`--format=${args.format}`);
      } else {
        argv.push(`--format=${GIT_NUL_FORMAT}`);
      }

      if (args.maxCount !== undefined) {
        argv.push("-n", String(args.maxCount));
      }

      if (args.paths && args.paths.length > 0) {
        argv.push("--");
        argv.push(...args.paths);
      }

      const result = await execGit(argv, { cwd: globals.repoPath });
      if (result.exitCode !== 0) {
        throw new Error(
          `git log failed (exit ${result.exitCode}): ${result.stderr}`,
        );
      }

      const raw = result.stdout;
      let commits: {
        sha: string;
        author: string;
        date: string;
        message: string;
      }[] = [];

      if (!args.format) {
        commits = raw
          .split(NUL)
          .reduce((records, _field, idx, fields) => {
            if (idx % 4 === 0 && idx + 3 < fields.length) {
              const sha = fields[idx].trim();
              if (sha.length > 0) {
                records.push({
                  sha,
                  author: fields[idx + 1],
                  date: fields[idx + 2],
                  message: fields[idx + 3],
                });
              }
            }
            return records;
          }, [] as typeof commits);
      }

      span.setAttribute(Attr.METHOD, "log");
      span.setAttribute(Attr.REPO_PATH, globals.repoPath);
      span.setAttribute(Attr.EXIT_CODE, result.exitCode);

      const handle = await ctx.writeResource("logResult", "log", {
        commits,
        count: commits.length,
        ...(args.format ? { raw } : {}),
      }, {
        tags: { method: "log" },
      });

      return { dataHandles: [handle] };
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

// ---------------------------------------------------------------------------
// commit
// ---------------------------------------------------------------------------

export async function runCommit(
  args: CommitArgs,
  ctx: GitContext,
): Promise<{ dataHandles: DataHandle[] }> {
  return await getTracer().startActiveSpan("git.commit", async (span) => {
    try {
      const globals = resolveGlobalArgs(ctx.globalArgs);
      const cwd = globals.repoPath;

      if (args.addAll) {
        const addResult = await execGit(["add", "-A"], { cwd });
        if (addResult.exitCode !== 0) {
          throw new Error(
            `git add failed (exit ${addResult.exitCode}): ${addResult.stderr}`,
          );
        }
      } else if (args.paths && args.paths.length > 0) {
        const addResult = await execGit(["add", "--", ...args.paths], { cwd });
        if (addResult.exitCode !== 0) {
          throw new Error(
            `git add failed (exit ${addResult.exitCode}): ${addResult.stderr}`,
          );
        }
      }

      const commitArgv = [];
      if (globals.authorName) {
        commitArgv.push("-c", `user.name=${globals.authorName}`);
      }
      if (globals.authorEmail) {
        commitArgv.push("-c", `user.email=${globals.authorEmail}`);
      }
      commitArgv.push("commit", "-m", args.message);

      const commitResult = await execGit(commitArgv, { cwd });
      if (commitResult.exitCode !== 0) {
        throw new Error(
          `git commit failed (exit ${commitResult.exitCode}): ${commitResult.stderr}`,
        );
      }

      const shaResult = await execGit(["rev-parse", "HEAD"], { cwd });
      if (shaResult.exitCode !== 0) {
        throw new Error(
          `git rev-parse HEAD failed (exit ${shaResult.exitCode}): ${shaResult.stderr}`,
        );
      }
      const sha = shaResult.stdout.trim();

      span.setAttribute(Attr.METHOD, "commit");
      span.setAttribute(Attr.COMMIT_SHA, sha);
      span.setAttribute(Attr.EXIT_CODE, commitResult.exitCode);

      ctx.logger.info(`committed ${sha.substring(0, 8)}: ${args.message}`);

      const handle = await ctx.writeResource(
        "commitResult",
        `commit-${sha.substring(0, 8)}`,
        {
          sha,
          message: args.message,
        },
        {
          tags: { method: "commit", sha },
        },
      );

      return { dataHandles: [handle] };
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

// ---------------------------------------------------------------------------
// push
// ---------------------------------------------------------------------------

export async function runPush(
  args: PushArgs,
  ctx: GitContext,
): Promise<{ dataHandles: DataHandle[] }> {
  return await getTracer().startActiveSpan("git.push", async (span) => {
    try {
      const globals = resolveGlobalArgs(ctx.globalArgs);
      const remote = args.remote || globals.remote;
      const argv = ["push"];

      if (args.force) {
        argv.push("--force");
      }
      if (args.setUpstream) {
        argv.push("-u");
      }

      argv.push(remote, args.branch);

      const result = await execGit(argv, { cwd: globals.repoPath });
      if (result.exitCode !== 0) {
        throw new Error(
          `git push failed (exit ${result.exitCode}): ${result.stderr}`,
        );
      }

      span.setAttribute(Attr.METHOD, "push");
      span.setAttribute(Attr.REMOTE, remote);
      span.setAttribute(Attr.BRANCH, args.branch);
      span.setAttribute(Attr.EXIT_CODE, result.exitCode);

      ctx.logger.info(
        `pushed ${args.branch} to ${remote}${args.force ? " (force)" : ""}`,
      );

      const handle = await ctx.writeResource(
        "pushResult",
        `push-${args.branch}`,
        {
          remote,
          branch: args.branch,
          forced: args.force,
        },
        {
          tags: { method: "push", remote, branch: args.branch },
        },
      );

      return { dataHandles: [handle] };
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

// ---------------------------------------------------------------------------
// branch
// ---------------------------------------------------------------------------

export async function runBranch(
  args: BranchArgs,
  ctx: GitContext,
): Promise<{ dataHandles: DataHandle[] }> {
  return await getTracer().startActiveSpan("git.branch", async (span) => {
    try {
      const globals = resolveGlobalArgs(ctx.globalArgs);
      const cwd = globals.repoPath;

      if (args.list) {
        const result = await execGit(["branch", "--list"], { cwd });
        if (result.exitCode !== 0) {
          throw new Error(
            `git branch --list failed (exit ${result.exitCode}): ${result.stderr}`,
          );
        }

        let current: string | undefined;
        const branches = result.stdout
          .split("\n")
          .filter((l) => l.trim().length > 0)
          .map((line) => {
            const trimmed = line.trim();
            if (trimmed.startsWith("* ")) {
              current = trimmed.substring(2);
              return current;
            }
            return trimmed;
          });

        span.setAttribute(Attr.METHOD, "branch");
        span.setAttribute(Attr.EXIT_CODE, result.exitCode);

        const handle = await ctx.writeResource(
          "branchResult",
          "branch-list",
          { current, branches },
          { tags: { method: "branch", action: "list" } },
        );

        return { dataHandles: [handle] };
      }

      if (!args.name) {
        throw new Error("branch name is required when not listing");
      }

      if (args.create) {
        const argv = ["checkout", "-b", args.name];
        if (args.startPoint) {
          argv.push(args.startPoint);
        }

        const result = await execGit(argv, { cwd });
        if (result.exitCode !== 0) {
          throw new Error(
            `git checkout -b failed (exit ${result.exitCode}): ${result.stderr}`,
          );
        }

        span.setAttribute(Attr.METHOD, "branch");
        span.setAttribute(Attr.BRANCH, args.name);
        span.setAttribute(Attr.EXIT_CODE, result.exitCode);

        ctx.logger.info(`created and switched to branch ${args.name}`);

        const handle = await ctx.writeResource(
          "branchResult",
          `branch-${args.name}`,
          { current: args.name, created: true },
          { tags: { method: "branch", action: "create", branch: args.name } },
        );

        return { dataHandles: [handle] };
      }

      const result = await execGit(["checkout", args.name], { cwd });
      if (result.exitCode !== 0) {
        throw new Error(
          `git checkout failed (exit ${result.exitCode}): ${result.stderr}`,
        );
      }

      span.setAttribute(Attr.METHOD, "branch");
      span.setAttribute(Attr.BRANCH, args.name);
      span.setAttribute(Attr.EXIT_CODE, result.exitCode);

      ctx.logger.info(`switched to branch ${args.name}`);

      const handle = await ctx.writeResource(
        "branchResult",
        `branch-${args.name}`,
        { current: args.name, created: false },
        { tags: { method: "branch", action: "switch", branch: args.name } },
      );

      return { dataHandles: [handle] };
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

// ---------------------------------------------------------------------------
// config
// ---------------------------------------------------------------------------

export async function runConfig(
  args: ConfigArgs,
  ctx: GitContext,
): Promise<{ dataHandles: DataHandle[] }> {
  return await getTracer().startActiveSpan("git.config", async (span) => {
    try {
      const globals = resolveGlobalArgs(ctx.globalArgs);
      const cwd = globals.repoPath;
      const resourceName = `config-${args.key.replace(/\./g, "-")}`;

      if (args.value !== undefined) {
        const scopeFlag = args.scope === "global" ? "--global" : "--local";
        const result = await execGit(
          ["config", scopeFlag, args.key, args.value],
          { cwd },
        );
        if (result.exitCode !== 0) {
          throw new Error(
            `git config set failed (exit ${result.exitCode}): ${result.stderr}`,
          );
        }

        span.setAttribute(Attr.METHOD, "config");
        span.setAttribute(Attr.EXIT_CODE, result.exitCode);

        ctx.logger.info(`set ${args.key}`);

        const handle = await ctx.writeResource(
          "configResult",
          resourceName,
          { key: args.key, value: args.value },
          { tags: { method: "config", key: args.key } },
        );

        return { dataHandles: [handle] };
      }

      const result = await execGit(["config", args.key], { cwd });
      if (result.exitCode !== 0) {
        throw new Error(
          `git config get failed (exit ${result.exitCode}): ${result.stderr}`,
        );
      }

      const value = result.stdout.trim();

      span.setAttribute(Attr.METHOD, "config");
      span.setAttribute(Attr.EXIT_CODE, result.exitCode);

      const handle = await ctx.writeResource(
        "configResult",
        resourceName,
        { key: args.key, value },
        { tags: { method: "config", key: args.key } },
      );

      return { dataHandles: [handle] };
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

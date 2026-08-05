import { z } from "npm:zod@4.3.6";
import {
  BranchArgsSchema,
  BranchResultSchema,
  CloneArgsSchema,
  CloneResultSchema,
  CommitArgsSchema,
  CommitResultSchema,
  ConfigArgsSchema,
  ConfigResultSchema,
  DiffArgsSchema,
  DiffResultSchema,
  GlobalArgsSchema,
  LogArgsSchema,
  LogResultSchema,
  PushArgsSchema,
  PushResultSchema,
  StatusArgsSchema,
  StatusResultSchema,
} from "./_lib/schemas.ts";
import {
  runBranch,
  runClone,
  runCommit,
  runConfig,
  runDiff,
  runLog,
  runPush,
  runStatus,
} from "./_lib/operations.ts";
import { checkGitAvailable, checkRepoInitialized } from "./_lib/checks.ts";
import type { GitContext } from "./_lib/types.ts";

/**
 * Git repository operations — structured CLI wrapper for CI automation.
 *
 * @module
 */

/** Git model — clone, diff, status, log, commit, push, branch, config. */
export const model = {
  type: "@swamp/git",
  version: "2026.08.05.1",

  globalArguments: GlobalArgsSchema,

  upgrades: [] as Array<{
    toVersion: string;
    description: string;
    upgradeAttributes: (
      old: Record<string, unknown>,
    ) => Record<string, unknown>;
  }>,

  resources: {
    cloneResult: {
      description: "Result of a git clone operation",
      schema: CloneResultSchema,
      lifetime: "ephemeral" as const,
      garbageCollection: 5,
    },
    diffResult: {
      description:
        "Changed files and raw diff output from a git diff operation",
      schema: DiffResultSchema,
      lifetime: "ephemeral" as const,
      garbageCollection: 10,
    },
    statusResult: {
      description:
        "Working tree status: structured entries, clean/dirty flag, count",
      schema: StatusResultSchema,
      lifetime: "ephemeral" as const,
      garbageCollection: 10,
    },
    logResult: {
      description: "Commit history with structured entries",
      schema: LogResultSchema,
      lifetime: "ephemeral" as const,
      garbageCollection: 10,
    },
    commitResult: {
      description: "Result of a git commit: SHA and message",
      schema: CommitResultSchema,
      lifetime: "ephemeral" as const,
      garbageCollection: 10,
    },
    pushResult: {
      description: "Result of a git push operation",
      schema: PushResultSchema,
      lifetime: "ephemeral" as const,
      garbageCollection: 5,
    },
    branchResult: {
      description:
        "Branch operation result: current branch, list, or creation status",
      schema: BranchResultSchema,
      lifetime: "ephemeral" as const,
      garbageCollection: 5,
    },
    configResult: {
      description: "Git config get/set result",
      schema: ConfigResultSchema,
      lifetime: "ephemeral" as const,
      garbageCollection: 5,
    },
  },

  checks: {
    "git-available": {
      description: "Verify git binary is available on PATH",
      labels: ["prerequisite"],
      appliesTo: [
        "clone",
        "diff",
        "status",
        "log",
        "commit",
        "push",
        "branch",
        "config",
      ],
      execute: checkGitAvailable,
    },
    "repo-initialized": {
      description: "Verify the working directory is a git repository",
      labels: ["prerequisite"],
      appliesTo: [
        "diff",
        "status",
        "log",
        "commit",
        "push",
        "branch",
        "config",
      ],
      execute: checkRepoInitialized,
    },
  },

  methods: {
    clone: {
      description: "Clone a git repository",
      arguments: CloneArgsSchema,
      execute: (args: z.input<typeof CloneArgsSchema>, ctx: GitContext) =>
        runClone(CloneArgsSchema.parse(args), ctx),
    },
    diff: {
      description:
        "Show changes between refs with optional name-only and path filtering",
      arguments: DiffArgsSchema,
      execute: (args: z.input<typeof DiffArgsSchema>, ctx: GitContext) =>
        runDiff(DiffArgsSchema.parse(args), ctx),
    },
    status: {
      description: "Show working tree status with structured output",
      arguments: StatusArgsSchema,
      execute: (args: z.input<typeof StatusArgsSchema>, ctx: GitContext) =>
        runStatus(StatusArgsSchema.parse(args), ctx),
    },
    log: {
      description: "Show commit history with structured entries",
      arguments: LogArgsSchema,
      execute: (args: z.input<typeof LogArgsSchema>, ctx: GitContext) =>
        runLog(LogArgsSchema.parse(args), ctx),
    },
    commit: {
      description: "Stage files and create a commit",
      arguments: CommitArgsSchema,
      execute: (args: z.input<typeof CommitArgsSchema>, ctx: GitContext) =>
        runCommit(CommitArgsSchema.parse(args), ctx),
    },
    push: {
      description: "Push commits to a remote",
      arguments: PushArgsSchema,
      execute: (args: z.input<typeof PushArgsSchema>, ctx: GitContext) =>
        runPush(PushArgsSchema.parse(args), ctx),
    },
    branch: {
      description: "Create, switch, or list branches",
      arguments: BranchArgsSchema,
      execute: (args: z.input<typeof BranchArgsSchema>, ctx: GitContext) =>
        runBranch(BranchArgsSchema.parse(args), ctx),
    },
    config: {
      description: "Get or set git configuration values",
      arguments: ConfigArgsSchema,
      execute: (args: z.input<typeof ConfigArgsSchema>, ctx: GitContext) =>
        runConfig(ConfigArgsSchema.parse(args), ctx),
    },
  },
};

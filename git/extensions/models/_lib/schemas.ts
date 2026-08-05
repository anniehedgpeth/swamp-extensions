import { z } from "npm:zod@4.3.6";

// ---------------------------------------------------------------------------
// Global arguments
// ---------------------------------------------------------------------------

export const GlobalArgsSchema = z.object({
  repoPath: z.string().default(".")
    .describe("Path to the git repository"),
  remote: z.string().default("origin").refine(
    (v) => !v.startsWith("-"),
    { message: "must not start with a dash (interpreted as a git flag)" },
  )
    .describe("Default remote name"),
  authorName: z.string().optional()
    .describe("Commit author name (applied via git -c flags)"),
  authorEmail: z.string().optional()
    .describe("Commit author email (applied via git -c flags)"),
});

export type GlobalArgs = z.infer<typeof GlobalArgsSchema>;

// ---------------------------------------------------------------------------
// Shared refinements
// ---------------------------------------------------------------------------

const safeRef = z.string().refine(
  (v) => !v.startsWith("-"),
  { message: "must not start with a dash (interpreted as a git flag)" },
);

const safeRefOptional = z.string().optional().refine(
  (v) => v === undefined || !v.startsWith("-"),
  { message: "must not start with a dash (interpreted as a git flag)" },
);

// ---------------------------------------------------------------------------
// Method argument schemas
// ---------------------------------------------------------------------------

export const CloneArgsSchema = z.object({
  url: z.string().min(1)
    .describe("Repository URL to clone"),
  path: z.string().optional()
    .describe("Destination path (defaults to repo name)"),
  depth: z.number().int().min(0).optional()
    .describe("Clone depth (0 = full history, omit for default)"),
  branch: safeRefOptional
    .describe("Branch to checkout after clone"),
  token: z.string().optional().meta({ sensitive: true })
    .describe("Auth token for authenticated HTTPS clone"),
});

export type CloneArgs = z.infer<typeof CloneArgsSchema>;

export const DiffArgsSchema = z.object({
  base: safeRef
    .describe("Base ref (SHA, branch, tag, HEAD~1, etc.)"),
  head: safeRef.default("HEAD")
    .describe("Head ref"),
  nameOnly: z.boolean().default(false)
    .describe("Only return changed file paths"),
  diffFilter: z.string().optional()
    .describe("Diff filter flags (e.g. 'd' to exclude deleted files)"),
  paths: z.array(z.string()).optional()
    .describe("Path filters (git pathspecs after --)"),
  stat: z.boolean().default(false)
    .describe("Show diffstat summary instead of patch"),
  threeWay: z.boolean().default(false)
    .describe("Use three-dot (merge-base) diff syntax"),
});

export type DiffArgs = z.infer<typeof DiffArgsSchema>;

export const StatusArgsSchema = z.object({
  paths: z.array(z.string()).optional()
    .describe("Filter status to specific paths"),
});

export type StatusArgs = z.infer<typeof StatusArgsSchema>;

export const LogArgsSchema = z.object({
  paths: z.array(z.string()).optional()
    .describe("Scope log to specific directories or files"),
  maxCount: z.number().int().positive().optional()
    .describe("Maximum number of commits to return"),
  format: z.string().optional()
    .describe("Custom --format string (disables structured parsing)"),
});

export type LogArgs = z.infer<typeof LogArgsSchema>;

export const CommitArgsSchema = z.object({
  message: z.string().min(1)
    .describe("Commit message"),
  paths: z.array(z.string()).optional()
    .describe("Specific paths to stage before committing"),
  addAll: z.boolean().default(false)
    .describe("Run git add -A before committing"),
});

export type CommitArgs = z.infer<typeof CommitArgsSchema>;

export const PushArgsSchema = z.object({
  remote: safeRefOptional
    .describe("Remote name (defaults to global remote)"),
  branch: safeRef
    .describe("Branch to push"),
  force: z.boolean().default(false)
    .describe("Force push (--force)"),
  setUpstream: z.boolean().default(false)
    .describe("Set upstream tracking (-u)"),
});

export type PushArgs = z.infer<typeof PushArgsSchema>;

export const BranchArgsSchema = z.object({
  name: safeRefOptional
    .describe("Branch name to create or switch to"),
  create: z.boolean().default(false)
    .describe("Create a new branch"),
  startPoint: safeRefOptional
    .describe("Base ref for new branch creation"),
  list: z.boolean().default(false)
    .describe("List all local branches"),
});

export type BranchArgs = z.infer<typeof BranchArgsSchema>;

export const ConfigArgsSchema = z.object({
  key: z.string().min(1).refine(
    (v) => !v.startsWith("-"),
    { message: "must not start with a dash (interpreted as a git flag)" },
  )
    .describe("Config key (e.g. user.name, user.email)"),
  value: z.string().optional().refine(
    (v) => v === undefined || !v.startsWith("-"),
    { message: "must not start with a dash (interpreted as a git flag)" },
  )
    .describe("Value to set (omit to read current value)"),
  scope: z.enum(["local", "global"]).default("local")
    .describe("Config scope for set operations"),
});

export type ConfigArgs = z.infer<typeof ConfigArgsSchema>;

// ---------------------------------------------------------------------------
// Resource schemas
// ---------------------------------------------------------------------------

export const CloneResultSchema = z.object({
  path: z.string(),
  url: z.string(),
  depth: z.number().int().optional(),
  branch: z.string().optional(),
});

export const DiffResultSchema = z.object({
  files: z.array(z.string()),
  raw: z.string(),
  count: z.number().int(),
  base: z.string(),
  head: z.string(),
});

export const StatusEntrySchema = z.object({
  path: z.string(),
  status: z.string(),
});

export const StatusResultSchema = z.object({
  entries: z.array(StatusEntrySchema),
  clean: z.boolean(),
  count: z.number().int(),
  raw: z.string(),
});

export const CommitEntrySchema = z.object({
  sha: z.string(),
  author: z.string(),
  date: z.string(),
  message: z.string(),
});

export const LogResultSchema = z.object({
  commits: z.array(CommitEntrySchema),
  count: z.number().int(),
  raw: z.string().optional(),
});

export const CommitResultSchema = z.object({
  sha: z.string(),
  message: z.string(),
});

export const PushResultSchema = z.object({
  remote: z.string(),
  branch: z.string(),
  forced: z.boolean(),
});

export const BranchResultSchema = z.object({
  current: z.string().optional(),
  branches: z.array(z.string()).optional(),
  created: z.boolean().optional(),
});

export const ConfigResultSchema = z.object({
  key: z.string(),
  value: z.string(),
});

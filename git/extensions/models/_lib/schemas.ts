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

export const PullArgsSchema = z.object({
  remote: safeRefOptional
    .describe("Remote name (defaults to global remote)"),
  branch: safeRefOptional
    .describe("Branch to pull"),
  rebase: z.boolean().default(false)
    .describe("Rebase local commits on top of upstream (--rebase)"),
  ffOnly: z.boolean().default(false)
    .describe("Only fast-forward, fail if not possible (--ff-only)"),
});

export type PullArgs = z.infer<typeof PullArgsSchema>;

export const FetchArgsSchema = z.object({
  remote: safeRefOptional
    .describe("Remote name (defaults to global remote)"),
  tags: z.boolean().default(false)
    .describe("Fetch all tags from the remote (--tags)"),
  prune: z.boolean().default(false)
    .describe("Remove remote-tracking refs that no longer exist (--prune)"),
  depth: z.number().int().min(0).optional()
    .describe("Limit fetch to specified depth"),
});

export type FetchArgs = z.infer<typeof FetchArgsSchema>;

export const CherryPickArgsSchema = z.object({
  commits: z.array(safeRef).optional()
    .describe("Commit SHAs to cherry-pick (in order)"),
  noCommit: z.boolean().default(false)
    .describe("Apply changes without committing (--no-commit)"),
  abort: z.boolean().default(false)
    .describe("Abort an in-progress cherry-pick (--abort)"),
});

export type CherryPickArgs = z.infer<typeof CherryPickArgsSchema>;

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

export const PullResultSchema = z.object({
  remote: z.string(),
  branch: z.string().optional(),
  alreadyUpToDate: z.boolean(),
  raw: z.string(),
});

export const FetchResultSchema = z.object({
  remote: z.string(),
  tags: z.boolean(),
  pruned: z.boolean(),
  raw: z.string(),
});

export const CherryPickResultSchema = z.object({
  commits: z.array(z.string()),
  conflict: z.boolean(),
  conflictFiles: z.array(z.string()).optional(),
  aborted: z.boolean().optional(),
  raw: z.string(),
});

export const ConfigResultSchema = z.object({
  key: z.string(),
  value: z.string(),
});

// ---------------------------------------------------------------------------
// upstream_state
// ---------------------------------------------------------------------------

export const UpstreamStateArgsSchema = z.object({
  branch: safeRefOptional
    .describe("Branch to check (defaults to current HEAD branch)"),
});

export type UpstreamStateArgs = z.infer<typeof UpstreamStateArgsSchema>;

export const UpstreamStateResultSchema = z.object({
  branch: z.string(),
  hasUpstream: z.boolean()
    .describe(
      "True when the branch has a configured upstream (remote + merge ref), even if the tracking ref is not locally available",
    ),
  upstream: z.string()
    .describe(
      "Upstream tracking ref (e.g. origin/main) when trackingRefAvailable is true, otherwise empty string",
    ),
  configuredUpstream: z.string()
    .describe(
      "Configured upstream from branch.<name>.remote + branch.<name>.merge (e.g. origin/feature), or empty string when no upstream is configured",
    ),
  trackingRefAvailable: z.boolean()
    .describe(
      "Whether the remote-tracking ref exists locally (git rev-parse @{u} resolved). When false, ahead/behind/pushed/synced are defaults (0/false) — check this field first.",
    ),
  ahead: z.number().int(),
  behind: z.number().int(),
  pushed: z.boolean(),
  synced: z.boolean(),
});

import { assertEquals, assertRejects } from "jsr:@std/assert@1.0.19";
import { model } from "./git.ts";
import { resetCommandExecutor, setCommandExecutor } from "./_lib/runner.ts";
import type { DataHandle, ExecResult, GitContext } from "./_lib/types.ts";

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------

interface Harness {
  ctx: GitContext;
  writes: {
    specName: string;
    name: string;
    data: Record<string, unknown>;
    tags?: Record<string, string>;
  }[];
  logs: { level: string; message: string }[];
}

function makeHarness(
  globalArgs: Record<string, unknown> = {},
): Harness {
  const writes: Harness["writes"] = [];
  const logs: Harness["logs"] = [];

  const log = (level: string) => (message: string) => {
    logs.push({ level, message });
  };

  const ctx: GitContext = {
    signal: new AbortController().signal,
    globalArgs: { repoPath: ".", remote: "origin", ...globalArgs },
    logger: {
      debug: log("debug"),
      info: log("info"),
      warn: log("warn"),
      error: log("error"),
    },
    writeResource: (
      specName: string,
      name: string,
      data: Record<string, unknown>,
      overrides?: { tags?: Record<string, string> },
    ): Promise<DataHandle> => {
      writes.push({ specName, name, data, tags: overrides?.tags });
      return Promise.resolve({ name, tags: overrides?.tags });
    },
    readResource: (): Promise<Record<string, unknown> | null> =>
      Promise.resolve(null),
  };

  return { ctx, writes, logs };
}

function ok(stdout = ""): ExecResult {
  return { stdout, stderr: "", exitCode: 0 };
}

function fail(stderr = "error", exitCode = 1): ExecResult {
  return { stdout: "", stderr, exitCode };
}

// ---------------------------------------------------------------------------
// Model export shape
// ---------------------------------------------------------------------------

Deno.test("model export has correct type", () => {
  assertEquals(model.type, "@swamp/git");
});

Deno.test("model version is CalVer format", () => {
  const parts = model.version.split(".");
  assertEquals(parts.length, 4);
  assertEquals(Number(parts[0]) >= 2026, true);
});

Deno.test("globalArguments defaults repoPath and remote", () => {
  const result = model.globalArguments.parse({});
  assertEquals(result.repoPath, ".");
  assertEquals(result.remote, "origin");
});

Deno.test("globalArguments accepts full config", () => {
  const result = model.globalArguments.parse({
    repoPath: "/repo",
    remote: "upstream",
    authorName: "Bot",
    authorEmail: "bot@example.com",
  });
  assertEquals(result.repoPath, "/repo");
  assertEquals(result.remote, "upstream");
  assertEquals(result.authorName, "Bot");
  assertEquals(result.authorEmail, "bot@example.com");
});

// ---------------------------------------------------------------------------
// Resource declarations
// ---------------------------------------------------------------------------

Deno.test("all 12 resource specs exist", () => {
  const names = Object.keys(model.resources);
  assertEquals(names.length, 12);
  for (
    const name of [
      "cloneResult",
      "diffResult",
      "statusResult",
      "logResult",
      "commitResult",
      "pushResult",
      "branchResult",
      "configResult",
      "pullResult",
      "fetchResult",
      "cherryPickResult",
      "upstreamStateResult",
    ]
  ) {
    assertEquals(
      name in model.resources,
      true,
      `missing resource: ${name}`,
    );
  }
});

Deno.test("resources have description and schema", () => {
  for (const [name, spec] of Object.entries(model.resources)) {
    assertEquals(
      typeof spec.description,
      "string",
      `${name} missing description`,
    );
    assertEquals(spec.schema !== undefined, true, `${name} missing schema`);
  }
});

// ---------------------------------------------------------------------------
// Method declarations
// ---------------------------------------------------------------------------

Deno.test("all 12 methods exist", () => {
  const names = Object.keys(model.methods);
  assertEquals(names.length, 12);
  for (
    const name of [
      "clone",
      "diff",
      "status",
      "log",
      "commit",
      "push",
      "pull",
      "fetch",
      "cherry_pick",
      "branch",
      "config",
      "upstream_state",
    ]
  ) {
    assertEquals(name in model.methods, true, `missing method: ${name}`);
  }
});

Deno.test("methods have description and execute function", () => {
  for (const [name, spec] of Object.entries(model.methods)) {
    assertEquals(
      typeof spec.description,
      "string",
      `${name} missing description`,
    );
    assertEquals(
      typeof spec.execute,
      "function",
      `${name} missing execute`,
    );
  }
});

// ---------------------------------------------------------------------------
// Check declarations
// ---------------------------------------------------------------------------

Deno.test("git-available check exists and covers all methods", () => {
  assertEquals(typeof model.checks["git-available"].execute, "function");
  assertEquals(
    model.checks["git-available"].appliesTo.includes("clone"),
    true,
  );
  assertEquals(
    model.checks["git-available"].appliesTo.includes("pull"),
    true,
  );
  assertEquals(
    model.checks["git-available"].appliesTo.includes("fetch"),
    true,
  );
  assertEquals(
    model.checks["git-available"].appliesTo.includes("cherry_pick"),
    true,
  );
  assertEquals(
    model.checks["git-available"].appliesTo.includes("upstream_state"),
    true,
  );
});

Deno.test("repo-initialized check exists and excludes clone", () => {
  assertEquals(typeof model.checks["repo-initialized"].execute, "function");
  assertEquals(
    model.checks["repo-initialized"].appliesTo.includes("clone"),
    false,
  );
  assertEquals(
    model.checks["repo-initialized"].appliesTo.includes("diff"),
    true,
  );
  assertEquals(
    model.checks["repo-initialized"].appliesTo.includes("pull"),
    true,
  );
  assertEquals(
    model.checks["repo-initialized"].appliesTo.includes("fetch"),
    true,
  );
  assertEquals(
    model.checks["repo-initialized"].appliesTo.includes("cherry_pick"),
    true,
  );
  assertEquals(
    model.checks["repo-initialized"].appliesTo.includes("upstream_state"),
    true,
  );
});

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

Deno.test("DiffArgs requires base", () => {
  const result = model.methods.diff.arguments.safeParse({});
  assertEquals(result.success, false);
});

Deno.test("DiffArgs defaults", () => {
  const result = model.methods.diff.arguments.parse({ base: "HEAD~1" });
  assertEquals(result.head, "HEAD");
  assertEquals(result.nameOnly, false);
  assertEquals(result.stat, false);
  assertEquals(result.threeWay, false);
});

Deno.test("CommitArgs requires message", () => {
  const result = model.methods.commit.arguments.safeParse({});
  assertEquals(result.success, false);
});

Deno.test("CommitArgs defaults addAll to false", () => {
  const result = model.methods.commit.arguments.parse({
    message: "test commit",
  });
  assertEquals(result.addAll, false);
});

Deno.test("PushArgs requires branch", () => {
  const result = model.methods.push.arguments.safeParse({});
  assertEquals(result.success, false);
});

Deno.test("PushArgs defaults force to false", () => {
  const result = model.methods.push.arguments.parse({ branch: "main" });
  assertEquals(result.force, false);
  assertEquals(result.setUpstream, false);
});

Deno.test("BranchArgs defaults", () => {
  const result = model.methods.branch.arguments.parse({});
  assertEquals(result.create, false);
  assertEquals(result.list, false);
});

Deno.test("ConfigArgs requires key", () => {
  const result = model.methods.config.arguments.safeParse({});
  assertEquals(result.success, false);
});

Deno.test("ConfigArgs defaults scope to local", () => {
  const result = model.methods.config.arguments.parse({ key: "user.name" });
  assertEquals(result.scope, "local");
});

Deno.test("CloneArgs requires url", () => {
  const result = model.methods.clone.arguments.safeParse({});
  assertEquals(result.success, false);
});

Deno.test("StatusArgs parses empty input", () => {
  const result = model.methods.status.arguments.parse({});
  assertEquals(result.paths, undefined);
});

// ---------------------------------------------------------------------------
// diff operation
// ---------------------------------------------------------------------------

Deno.test("diff name-only returns file list", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("src/main.ts\nsrc/lib.ts\n");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.diff.execute(
      { base: "HEAD~1", head: "HEAD", nameOnly: true },
      ctx,
    );

    assertEquals(writes.length, 1);
    assertEquals(writes[0].specName, "diffResult");
    const data = writes[0].data;
    assertEquals((data.files as string[]).length, 2);
    assertEquals((data.files as string[])[0], "src/main.ts");
    assertEquals(data.count, 2);

    const argv = calls[0];
    assertEquals(argv.includes("--name-only"), true);
    assertEquals(argv.includes("HEAD~1"), true);
    assertEquals(argv.includes("HEAD"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("diff three-way uses ... separator", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("file.ts\n");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.diff.execute(
      { base: "abc123", head: "def456", nameOnly: true, threeWay: true },
      ctx,
    );

    const argv = calls[0];
    assertEquals(argv.includes("abc123...def456"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("diff two-way uses separate refs", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.diff.execute(
      { base: "HEAD~1", head: "HEAD", nameOnly: true },
      ctx,
    );

    const argv = calls[0];
    assertEquals(argv.includes("HEAD~1"), true);
    assertEquals(argv.includes("HEAD"), true);
    assertEquals(argv.some((a) => a.includes("...")), false);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("diff passes diff-filter flag", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.diff.execute(
      { base: "HEAD~1", head: "HEAD", nameOnly: true, diffFilter: "d" },
      ctx,
    );

    assertEquals(calls[0].includes("--diff-filter=d"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("diff passes path filters after --", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.diff.execute(
      {
        base: "HEAD~1",
        head: "HEAD",
        nameOnly: true,
        paths: ["*/manifest.yaml"],
      },
      ctx,
    );

    const argv = calls[0];
    const dashIdx = argv.indexOf("--");
    assertEquals(dashIdx > 0, true);
    assertEquals(argv[dashIdx + 1], "*/manifest.yaml");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("diff stat mode", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok(" 3 files changed, 10 insertions(+)");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.diff.execute(
      { base: "HEAD~1", head: "HEAD", stat: true },
      ctx,
    );

    assertEquals(calls[0].includes("--stat"), true);
    assertEquals((writes[0].data.files as string[]).length, 0);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("diff throws on non-zero exit", async () => {
  setCommandExecutor(() => fail("fatal: bad ref"));
  try {
    const { ctx } = makeHarness();
    await assertRejects(
      () =>
        model.methods.diff.execute(
          { base: "nonexistent", head: "HEAD", nameOnly: true },
          ctx,
        ),
      Error,
      "git diff failed",
    );
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("diff uses repoPath from globalArgs", async () => {
  const calls: { argv: string[]; opts?: { cwd?: string } }[] = [];
  setCommandExecutor((argv, opts) => {
    calls.push({ argv, opts });
    return ok("");
  });
  try {
    const { ctx } = makeHarness({ repoPath: "/my/repo" });
    await model.methods.diff.execute(
      { base: "HEAD~1", head: "HEAD", nameOnly: true },
      ctx,
    );

    assertEquals(calls[0].opts?.cwd, "/my/repo");
  } finally {
    resetCommandExecutor();
  }
});

// ---------------------------------------------------------------------------
// status operation
// ---------------------------------------------------------------------------

Deno.test("status porcelain parses entries", async () => {
  setCommandExecutor(() => ok(" M src/main.ts\n?? new-file.ts\n"));
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.status.execute({}, ctx);

    const data = writes[0].data;
    assertEquals(data.clean, false);
    assertEquals(data.count, 2);
    const entries = data.entries as { path: string; status: string }[];
    assertEquals(entries[0].status, " M");
    assertEquals(entries[0].path, "src/main.ts");
    assertEquals(entries[1].status, "??");
    assertEquals(entries[1].path, "new-file.ts");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("status clean repo", async () => {
  setCommandExecutor(() => ok(""));
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.status.execute({}, ctx);

    assertEquals(writes[0].data.clean, true);
    assertEquals(writes[0].data.count, 0);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("status with path filter", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok(" M model/aws/deno.json\n");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.status.execute(
      { paths: ["*/deno.json"] },
      ctx,
    );

    const argv = calls[0];
    const dashIdx = argv.indexOf("--");
    assertEquals(dashIdx > 0, true);
    assertEquals(argv[dashIdx + 1], "*/deno.json");
  } finally {
    resetCommandExecutor();
  }
});

// ---------------------------------------------------------------------------
// log operation
// ---------------------------------------------------------------------------

Deno.test("log returns structured commits", async () => {
  const N = "\x00";
  const output =
    `abc1234${N}Alice${N}2026-08-05T10:00:00+00:00${N}fix: something${N}def5678${N}Bob${N}2026-08-04T09:00:00+00:00${N}feat: another${N}`;

  setCommandExecutor(() => ok(output));
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.log.execute({}, ctx);

    const data = writes[0].data;
    assertEquals(data.count, 2);
    const commits = data.commits as {
      sha: string;
      author: string;
      date: string;
      message: string;
    }[];
    assertEquals(commits[0].sha, "abc1234");
    assertEquals(commits[0].author, "Alice");
    assertEquals(commits[1].sha, "def5678");
    assertEquals(commits[1].message, "feat: another");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("log with custom format returns raw output", async () => {
  setCommandExecutor(() =>
    ok("abc1234 fix: something\ndef5678 feat: another\n")
  );
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.log.execute({ format: "%h %s" }, ctx);

    const data = writes[0].data;
    assertEquals((data.commits as unknown[]).length, 0);
    assertEquals(data.count, 0);
    assertEquals(
      (data.raw as string).includes("abc1234 fix: something"),
      true,
    );
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("log passes maxCount", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.log.execute({ maxCount: 5 }, ctx);

    assertEquals(calls[0].includes("-n"), true);
    assertEquals(calls[0].includes("5"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("log passes path scope", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.log.execute({ paths: ["codegen/aws/"] }, ctx);

    const argv = calls[0];
    const dashIdx = argv.indexOf("--");
    assertEquals(dashIdx > 0, true);
    assertEquals(argv[dashIdx + 1], "codegen/aws/");
  } finally {
    resetCommandExecutor();
  }
});

// ---------------------------------------------------------------------------
// commit operation
// ---------------------------------------------------------------------------

Deno.test("commit with addAll stages then commits", async () => {
  const calls: string[][] = [];
  let callIdx = 0;
  setCommandExecutor((argv) => {
    calls.push(argv);
    callIdx++;
    if (callIdx === 3) return ok("abc1234def\n");
    return ok("");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.commit.execute(
      { message: "test commit", addAll: true },
      ctx,
    );

    assertEquals(calls.length, 3);
    assertEquals(calls[0].includes("add"), true);
    assertEquals(calls[0].includes("-A"), true);
    assertEquals(calls[1].includes("commit"), true);
    assertEquals(calls[1].includes("-m"), true);
    assertEquals(calls[1].includes("test commit"), true);
    assertEquals(calls[2].includes("rev-parse"), true);

    assertEquals(writes[0].specName, "commitResult");
    assertEquals(writes[0].data.message, "test commit");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("commit with specific paths", async () => {
  const calls: string[][] = [];
  let callIdx = 0;
  setCommandExecutor((argv) => {
    calls.push(argv);
    callIdx++;
    if (callIdx === 3) return ok("abc1234def\n");
    return ok("");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.commit.execute(
      { message: "update", paths: ["src/main.ts", "src/lib.ts"] },
      ctx,
    );

    assertEquals(calls[0].includes("add"), true);
    const dashIdx = calls[0].indexOf("--");
    assertEquals(dashIdx > 0, true);
    assertEquals(calls[0].includes("src/main.ts"), true);
    assertEquals(calls[0].includes("src/lib.ts"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("commit uses -c flags for author config", async () => {
  const calls: string[][] = [];
  let callIdx = 0;
  setCommandExecutor((argv) => {
    calls.push(argv);
    callIdx++;
    if (callIdx === 2) return ok("sha123\n");
    return ok("");
  });
  try {
    const { ctx } = makeHarness({
      authorName: "Bot",
      authorEmail: "bot@example.com",
    });
    await model.methods.commit.execute({ message: "auto" }, ctx);

    const commitArgv = calls[0];
    assertEquals(commitArgv.includes("-c"), true);
    assertEquals(commitArgv.includes("user.name=Bot"), true);
    assertEquals(commitArgv.includes("user.email=bot@example.com"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("commit throws on failure", async () => {
  setCommandExecutor(() => fail("nothing to commit"));
  try {
    const { ctx } = makeHarness();
    await assertRejects(
      () => model.methods.commit.execute({ message: "test" }, ctx),
      Error,
      "git commit failed",
    );
  } finally {
    resetCommandExecutor();
  }
});

// ---------------------------------------------------------------------------
// push operation
// ---------------------------------------------------------------------------

Deno.test("push normal", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.push.execute({ branch: "main" }, ctx);

    const argv = calls[0];
    assertEquals(argv.includes("push"), true);
    assertEquals(argv.includes("origin"), true);
    assertEquals(argv.includes("main"), true);
    assertEquals(argv.includes("--force"), false);

    assertEquals(writes[0].data.remote, "origin");
    assertEquals(writes[0].data.branch, "main");
    assertEquals(writes[0].data.forced, false);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("push force", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.push.execute({
      branch: "automated/regen",
      force: true,
    }, ctx);

    assertEquals(calls[0].includes("--force"), true);
    assertEquals(writes[0].data.forced, true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("push set-upstream", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.push.execute({
      branch: "feature",
      setUpstream: true,
    }, ctx);

    assertEquals(calls[0].includes("-u"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("push uses override remote", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.push.execute({
      remote: "upstream",
      branch: "main",
    }, ctx);

    assertEquals(calls[0].includes("upstream"), true);
  } finally {
    resetCommandExecutor();
  }
});

// ---------------------------------------------------------------------------
// branch operation
// ---------------------------------------------------------------------------

Deno.test("branch list", async () => {
  setCommandExecutor(() => ok("* main\n  feature-a\n  feature-b\n"));
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.branch.execute({ list: true }, ctx);

    const data = writes[0].data;
    assertEquals(data.current, "main");
    assertEquals((data.branches as string[]).length, 3);
    assertEquals((data.branches as string[]).includes("main"), true);
    assertEquals((data.branches as string[]).includes("feature-a"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("branch create", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.branch.execute({
      name: "automated/regen",
      create: true,
    }, ctx);

    assertEquals(calls[0].includes("checkout"), true);
    assertEquals(calls[0].includes("-b"), true);
    assertEquals(calls[0].includes("automated/regen"), true);

    assertEquals(writes[0].data.current, "automated/regen");
    assertEquals(writes[0].data.created, true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("branch create with startPoint", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.branch.execute({
      name: "hotfix",
      create: true,
      startPoint: "v1.0.0",
    }, ctx);

    assertEquals(calls[0].includes("v1.0.0"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("branch switch", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.branch.execute({ name: "main" }, ctx);

    assertEquals(calls[0].includes("checkout"), true);
    assertEquals(calls[0].includes("main"), true);
    assertEquals(calls[0].includes("-b"), false);

    assertEquals(writes[0].data.created, false);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("branch requires name when not listing", async () => {
  setCommandExecutor(() => ok(""));
  try {
    const { ctx } = makeHarness();
    await assertRejects(
      () => model.methods.branch.execute({}, ctx),
      Error,
      "branch name is required",
    );
  } finally {
    resetCommandExecutor();
  }
});

// ---------------------------------------------------------------------------
// config operation
// ---------------------------------------------------------------------------

Deno.test("config get", async () => {
  setCommandExecutor(() => ok("Alice\n"));
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.config.execute({ key: "user.name" }, ctx);

    assertEquals(writes[0].data.key, "user.name");
    assertEquals(writes[0].data.value, "Alice");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("config set local", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes, logs } = makeHarness();
    await model.methods.config.execute({
      key: "user.name",
      value: "Bot",
    }, ctx);

    assertEquals(calls[0].includes("--local"), true);
    assertEquals(calls[0].includes("user.name"), true);
    assertEquals(calls[0].includes("Bot"), true);

    assertEquals(writes[0].data.key, "user.name");
    assertEquals(writes[0].data.value, "Bot");
    assertEquals(logs.some((l) => l.message.includes("user.name")), true);
    assertEquals(logs.some((l) => l.message.includes("Bot")), false);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("config set global", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.config.execute({
      key: "user.email",
      value: "bot@test.com",
      scope: "global",
    }, ctx);

    assertEquals(calls[0].includes("--global"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("config get throws on failure", async () => {
  setCommandExecutor(() => fail("key not found"));
  try {
    const { ctx } = makeHarness();
    await assertRejects(
      () => model.methods.config.execute({ key: "nonexistent.key" }, ctx),
      Error,
      "git config get failed",
    );
  } finally {
    resetCommandExecutor();
  }
});

// ---------------------------------------------------------------------------
// flag injection prevention
// ---------------------------------------------------------------------------

Deno.test("diff rejects base starting with dash", () => {
  const result = model.methods.diff.arguments.safeParse({
    base: "--output=/tmp/exfil",
  });
  assertEquals(result.success, false);
});

Deno.test("push rejects branch starting with dash", () => {
  const result = model.methods.push.arguments.safeParse({
    branch: "--mirror",
  });
  assertEquals(result.success, false);
});

Deno.test("config rejects key starting with dash", () => {
  const result = model.methods.config.arguments.safeParse({
    key: "--file=/etc/passwd",
  });
  assertEquals(result.success, false);
});

Deno.test("config rejects value starting with dash", () => {
  const result = model.methods.config.arguments.safeParse({
    key: "user.name",
    value: "--unset",
  });
  assertEquals(result.success, false);
});

Deno.test("globalArguments rejects remote starting with dash", () => {
  const result = model.globalArguments.safeParse({
    remote: "--mirror",
  });
  assertEquals(result.success, false);
});

Deno.test("branch rejects name starting with dash", () => {
  const result = model.methods.branch.arguments.safeParse({
    name: "--track",
    create: true,
  });
  assertEquals(result.success, false);
});

// ---------------------------------------------------------------------------
// clone operation
// ---------------------------------------------------------------------------

Deno.test("clone basic", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.clone.execute({
      url: "https://github.com/org/repo.git",
    }, ctx);

    assertEquals(calls[0].includes("clone"), true);
    const dashIdx = calls[0].indexOf("--");
    assertEquals(dashIdx > 0, true, "clone must use -- before positional args");
    assertEquals(
      calls[0].indexOf("https://github.com/org/repo.git") > dashIdx,
      true,
      "URL must come after --",
    );

    assertEquals(writes[0].data.url, "https://github.com/org/repo.git");
    assertEquals(writes[0].data.path, "repo");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("clone with depth", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.clone.execute({
      url: "https://github.com/org/repo",
      depth: 2,
    }, ctx);

    assertEquals(calls[0].includes("--depth"), true);
    assertEquals(calls[0].includes("2"), true);
    assertEquals(writes[0].data.depth, 2);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("clone depth 0 means full (no --depth flag)", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.clone.execute({
      url: "https://github.com/org/repo",
      depth: 0,
    }, ctx);

    assertEquals(calls[0].includes("--depth"), false);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("clone with branch", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.clone.execute({
      url: "https://github.com/org/repo",
      branch: "develop",
    }, ctx);

    assertEquals(calls[0].includes("--branch"), true);
    assertEquals(calls[0].includes("develop"), true);
    assertEquals(writes[0].data.branch, "develop");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("clone with token rewrites URL", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.clone.execute({
      url: "https://github.com/org/repo",
      token: "ghp_abc123",
    }, ctx);

    const cloneUrl = calls[0].find((a) =>
      a.startsWith("https://x-access-token")
    );
    assertEquals(cloneUrl !== undefined, true);
    assertEquals(cloneUrl!.includes("ghp_abc123"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("clone scrubs credentials from resource and tags", async () => {
  setCommandExecutor(() => ok(""));
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.clone.execute({
      url: "https://user:secret@github.com/org/repo",
    }, ctx);

    const data = writes[0].data;
    assertEquals((data.url as string).includes("secret"), false);
    assertEquals((data.url as string).includes("***@"), true);
    assertEquals(writes[0].tags!.url.includes("secret"), false);
    assertEquals(writes[0].tags!.url.includes("***@"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("clone with token on non-https URL throws", async () => {
  setCommandExecutor(() => ok(""));
  try {
    const { ctx } = makeHarness();
    await assertRejects(
      () =>
        model.methods.clone.execute({
          url: "http://github.com/org/repo",
          token: "ghp_abc123",
        }, ctx),
      Error,
      "token authentication requires an https:// URL",
    );
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("clone failure scrubs credentials from error", async () => {
  setCommandExecutor(() =>
    fail(
      "fatal: unable to access 'https://x-access-token:ghp_secret@github.com/org/repo/': The requested URL returned error: 401",
    )
  );
  try {
    const { ctx } = makeHarness();
    try {
      await model.methods.clone.execute({
        url: "https://github.com/org/repo",
        token: "ghp_secret",
      }, ctx);
      throw new Error("should have thrown");
    } catch (e) {
      const msg = (e as Error).message;
      assertEquals(msg.includes("ghp_secret"), false);
      assertEquals(msg.includes("***@"), true);
    }
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("clone with custom path", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.clone.execute({
      url: "https://github.com/org/repo",
      path: "/tmp/checkout",
    }, ctx);

    assertEquals(calls[0].includes("/tmp/checkout"), true);
    assertEquals(writes[0].data.path, "/tmp/checkout");
  } finally {
    resetCommandExecutor();
  }
});

// ---------------------------------------------------------------------------
// checks
// ---------------------------------------------------------------------------

Deno.test("git-available check passes when git exists", async () => {
  setCommandExecutor(() => ok("git version 2.45.0\n"));
  try {
    const result = await model.checks["git-available"].execute({
      globalArgs: {},
    });
    assertEquals(result.pass, true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("git-available check fails on non-zero exit", async () => {
  setCommandExecutor(() => fail("not found"));
  try {
    const result = await model.checks["git-available"].execute({
      globalArgs: {},
    });
    assertEquals(result.pass, false);
    assertEquals(result.errors!.length > 0, true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("repo-initialized check passes for valid repo", async () => {
  setCommandExecutor(() => ok("true\n"));
  try {
    const result = await model.checks["repo-initialized"].execute({
      globalArgs: { repoPath: "/repo" },
    });
    assertEquals(result.pass, true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("repo-initialized check fails for non-repo", async () => {
  setCommandExecutor(() => fail("not a git repository"));
  try {
    const result = await model.checks["repo-initialized"].execute({
      globalArgs: { repoPath: "/tmp/empty" },
    });
    assertEquals(result.pass, false);
    assertEquals(result.errors!.length > 0, true);
  } finally {
    resetCommandExecutor();
  }
});

// ---------------------------------------------------------------------------
// Harness smoke tests
// ---------------------------------------------------------------------------

Deno.test("harness writeResource records writes", async () => {
  const { ctx, writes } = makeHarness();

  await ctx.writeResource("diffResult", "test-1", { files: [] }, {
    tags: { method: "diff" },
  });

  assertEquals(writes.length, 1);
  assertEquals(writes[0].specName, "diffResult");
  assertEquals(writes[0].name, "test-1");
  assertEquals(writes[0].tags?.method, "diff");
});

Deno.test("harness readResource returns null for missing", async () => {
  const { ctx } = makeHarness();
  const result = await ctx.readResource("nonexistent");
  assertEquals(result, null);
});

// ---------------------------------------------------------------------------
// pull schema validation
// ---------------------------------------------------------------------------

Deno.test("PullArgs defaults", () => {
  const result = model.methods.pull.arguments.parse({});
  assertEquals(result.rebase, false);
  assertEquals(result.ffOnly, false);
});

Deno.test("PullArgs rejects remote starting with dash", () => {
  const result = model.methods.pull.arguments.safeParse({
    remote: "--mirror",
  });
  assertEquals(result.success, false);
});

Deno.test("PullArgs rejects branch starting with dash", () => {
  const result = model.methods.pull.arguments.safeParse({
    branch: "--upload-pack",
  });
  assertEquals(result.success, false);
});

// ---------------------------------------------------------------------------
// pull operation
// ---------------------------------------------------------------------------

Deno.test("pull: basic pull from origin", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("Updating abc1234..def5678\nFast-forward\n");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.pull.execute({}, ctx);

    const argv = calls[0];
    assertEquals(argv.includes("pull"), true);
    assertEquals(argv.includes("origin"), true);

    assertEquals(writes[0].specName, "pullResult");
    assertEquals(writes[0].data.remote, "origin");
    assertEquals(writes[0].data.alreadyUpToDate, false);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("pull: already up to date", async () => {
  setCommandExecutor(() => ok("Already up to date.\n"));
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.pull.execute({}, ctx);

    assertEquals(writes[0].data.alreadyUpToDate, true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("pull: with rebase flag", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("Already up to date.\n");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.pull.execute({ rebase: true }, ctx);

    assertEquals(calls[0].includes("--rebase"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("pull: with ff-only flag", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("Already up to date.\n");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.pull.execute({ ffOnly: true }, ctx);

    assertEquals(calls[0].includes("--ff-only"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("pull: with specific branch", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("Already up to date.\n");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.pull.execute({ branch: "develop" }, ctx);

    assertEquals(calls[0].includes("develop"), true);
    assertEquals(writes[0].data.branch, "develop");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("pull: override remote", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("Already up to date.\n");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.pull.execute({ remote: "upstream" }, ctx);

    assertEquals(calls[0].includes("upstream"), true);
    assertEquals(writes[0].data.remote, "upstream");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("pull: throws on failure", async () => {
  setCommandExecutor(() => fail("fatal: not a git repository"));
  try {
    const { ctx } = makeHarness();
    await assertRejects(
      () => model.methods.pull.execute({}, ctx),
      Error,
      "git pull failed",
    );
  } finally {
    resetCommandExecutor();
  }
});

// ---------------------------------------------------------------------------
// fetch schema validation
// ---------------------------------------------------------------------------

Deno.test("FetchArgs defaults", () => {
  const result = model.methods.fetch.arguments.parse({});
  assertEquals(result.tags, false);
  assertEquals(result.prune, false);
});

Deno.test("FetchArgs rejects remote starting with dash", () => {
  const result = model.methods.fetch.arguments.safeParse({
    remote: "--upload-pack",
  });
  assertEquals(result.success, false);
});

// ---------------------------------------------------------------------------
// fetch operation
// ---------------------------------------------------------------------------

Deno.test("fetch: basic fetch from origin", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.fetch.execute({}, ctx);

    const argv = calls[0];
    assertEquals(argv.includes("fetch"), true);
    assertEquals(argv.includes("origin"), true);
    assertEquals(argv.includes("--tags"), false);

    assertEquals(writes[0].specName, "fetchResult");
    assertEquals(writes[0].data.remote, "origin");
    assertEquals(writes[0].data.tags, false);
    assertEquals(writes[0].data.pruned, false);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("fetch: with tags", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.fetch.execute({ tags: true }, ctx);

    assertEquals(calls[0].includes("--tags"), true);
    assertEquals(writes[0].data.tags, true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("fetch: with prune", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.fetch.execute({ prune: true }, ctx);

    assertEquals(calls[0].includes("--prune"), true);
    assertEquals(writes[0].data.pruned, true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("fetch: with depth", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.fetch.execute({ depth: 5 }, ctx);

    assertEquals(calls[0].includes("--depth"), true);
    assertEquals(calls[0].includes("5"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("fetch: override remote", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.fetch.execute({ remote: "upstream", tags: true }, ctx);

    assertEquals(calls[0].includes("upstream"), true);
    assertEquals(writes[0].data.remote, "upstream");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("fetch: throws on failure", async () => {
  setCommandExecutor(() => fail("fatal: not a git repository"));
  try {
    const { ctx } = makeHarness();
    await assertRejects(
      () => model.methods.fetch.execute({}, ctx),
      Error,
      "git fetch failed",
    );
  } finally {
    resetCommandExecutor();
  }
});

// ---------------------------------------------------------------------------
// cherry_pick schema validation
// ---------------------------------------------------------------------------

Deno.test("CherryPickArgs defaults", () => {
  const result = model.methods.cherry_pick.arguments.parse({});
  assertEquals(result.noCommit, false);
  assertEquals(result.abort, false);
});

Deno.test("CherryPickArgs rejects commits starting with dash", () => {
  const result = model.methods.cherry_pick.arguments.safeParse({
    commits: ["--exec=malicious"],
  });
  assertEquals(result.success, false);
});

// ---------------------------------------------------------------------------
// cherry_pick operation
// ---------------------------------------------------------------------------

Deno.test("cherry_pick: single commit success", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("[main abc1234] cherry picked commit\n");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.cherry_pick.execute(
      { commits: ["abc1234"] },
      ctx,
    );

    const argv = calls[0];
    assertEquals(argv.includes("cherry-pick"), true);
    const dashIdx = argv.indexOf("--");
    assertEquals(dashIdx > 0, true);
    assertEquals(argv.includes("abc1234"), true);

    assertEquals(writes[0].specName, "cherryPickResult");
    assertEquals(writes[0].data.conflict, false);
    assertEquals((writes[0].data.commits as string[])[0], "abc1234");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("cherry_pick: multiple commits", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.cherry_pick.execute(
      { commits: ["abc1234", "def5678"] },
      ctx,
    );

    const argv = calls[0];
    assertEquals(argv.includes("abc1234"), true);
    assertEquals(argv.includes("def5678"), true);
    assertEquals((writes[0].data.commits as string[]).length, 2);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("cherry_pick: with noCommit flag", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx } = makeHarness();
    await model.methods.cherry_pick.execute(
      { commits: ["abc1234"], noCommit: true },
      ctx,
    );

    assertEquals(calls[0].includes("--no-commit"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("cherry_pick: conflict detection", async () => {
  let callIdx = 0;
  setCommandExecutor(() => {
    callIdx++;
    if (callIdx === 1) {
      return {
        stdout: "",
        stderr:
          "error: could not apply abc1234... some commit\nhint: after resolving the conflicts",
        exitCode: 1,
      };
    }
    return ok("src/main.ts\nsrc/lib.ts\n");
  });
  try {
    const { ctx, writes, logs } = makeHarness();
    await model.methods.cherry_pick.execute(
      { commits: ["abc1234"] },
      ctx,
    );

    assertEquals(writes[0].data.conflict, true);
    const conflictFiles = writes[0].data.conflictFiles as string[];
    assertEquals(conflictFiles.length, 2);
    assertEquals(conflictFiles[0], "src/main.ts");
    assertEquals(logs.some((l) => l.level === "warn"), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("cherry_pick: CONFLICT marker detection", async () => {
  let callIdx = 0;
  setCommandExecutor(() => {
    callIdx++;
    if (callIdx === 1) {
      return {
        stdout: "CONFLICT (content): Merge conflict in src/main.ts\n",
        stderr: "",
        exitCode: 1,
      };
    }
    return ok("src/main.ts\n");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.cherry_pick.execute(
      { commits: ["abc1234"] },
      ctx,
    );

    assertEquals(writes[0].data.conflict, true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("cherry_pick: non-conflict error throws", async () => {
  setCommandExecutor(() => fail("fatal: bad object abc1234"));
  try {
    const { ctx } = makeHarness();
    await assertRejects(
      () =>
        model.methods.cherry_pick.execute(
          { commits: ["abc1234"] },
          ctx,
        ),
      Error,
      "git cherry-pick failed",
    );
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("cherry_pick: abort success", async () => {
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    return ok("");
  });
  try {
    const { ctx, writes, logs } = makeHarness();
    await model.methods.cherry_pick.execute({ abort: true }, ctx);

    assertEquals(calls[0].includes("cherry-pick"), true);
    assertEquals(calls[0].includes("--abort"), true);

    assertEquals(writes[0].data.aborted, true);
    assertEquals(writes[0].data.conflict, false);
    assertEquals((writes[0].data.commits as string[]).length, 0);
    assertEquals(logs.some((l) => l.message.includes("aborted")), true);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("cherry_pick: abort when no cherry-pick in progress throws", async () => {
  setCommandExecutor(() => fail("error: no cherry-pick or revert in progress"));
  try {
    const { ctx } = makeHarness();
    await assertRejects(
      () => model.methods.cherry_pick.execute({ abort: true }, ctx),
      Error,
      "git cherry-pick --abort failed",
    );
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("cherry_pick: requires commits when not aborting", async () => {
  setCommandExecutor(() => ok(""));
  try {
    const { ctx } = makeHarness();
    await assertRejects(
      () => model.methods.cherry_pick.execute({}, ctx),
      Error,
      "commits are required",
    );
  } finally {
    resetCommandExecutor();
  }
});

// ---------------------------------------------------------------------------
// upstream_state schema validation
// ---------------------------------------------------------------------------

Deno.test("UpstreamStateArgs parses empty input", () => {
  const result = model.methods.upstream_state.arguments.parse({});
  assertEquals(result.branch, undefined);
});

Deno.test("UpstreamStateArgs accepts optional branch", () => {
  const result = model.methods.upstream_state.arguments.parse({
    branch: "main",
  });
  assertEquals(result.branch, "main");
});

Deno.test("UpstreamStateArgs rejects branch starting with dash", () => {
  const result = model.methods.upstream_state.arguments.safeParse({
    branch: "--evil",
  });
  assertEquals(result.success, false);
});

// ---------------------------------------------------------------------------
// upstream_state operation
// ---------------------------------------------------------------------------

Deno.test("upstream_state: synced with upstream", async () => {
  let callIdx = 0;
  setCommandExecutor(() => {
    callIdx++;
    if (callIdx === 1) return ok("main\n");
    if (callIdx === 2) return ok("origin/main\n");
    return ok("0\t0\n");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.upstream_state.execute({}, ctx);

    assertEquals(writes.length, 1);
    assertEquals(writes[0].specName, "upstreamStateResult");
    const data = writes[0].data;
    assertEquals(data.branch, "main");
    assertEquals(data.hasUpstream, true);
    assertEquals(data.upstream, "origin/main");
    assertEquals(data.ahead, 0);
    assertEquals(data.behind, 0);
    assertEquals(data.pushed, true);
    assertEquals(data.synced, true);
    assertEquals(writes[0].tags?.pushed, "true");
    assertEquals(writes[0].tags?.synced, "true");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("upstream_state: ahead only (unpushed commits)", async () => {
  let callIdx = 0;
  setCommandExecutor(() => {
    callIdx++;
    if (callIdx === 1) return ok("feature\n");
    if (callIdx === 2) return ok("origin/feature\n");
    return ok("0\t3\n");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.upstream_state.execute({}, ctx);

    const data = writes[0].data;
    assertEquals(data.branch, "feature");
    assertEquals(data.hasUpstream, true);
    assertEquals(data.ahead, 3);
    assertEquals(data.behind, 0);
    assertEquals(data.pushed, false);
    assertEquals(data.synced, false);
    assertEquals(writes[0].tags?.pushed, "false");
    assertEquals(writes[0].tags?.synced, "false");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("upstream_state: behind only", async () => {
  let callIdx = 0;
  setCommandExecutor(() => {
    callIdx++;
    if (callIdx === 1) return ok("main\n");
    if (callIdx === 2) return ok("origin/main\n");
    return ok("5\t0\n");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.upstream_state.execute({}, ctx);

    const data = writes[0].data;
    assertEquals(data.ahead, 0);
    assertEquals(data.behind, 5);
    assertEquals(data.pushed, true);
    assertEquals(data.synced, false);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("upstream_state: both ahead and behind", async () => {
  let callIdx = 0;
  setCommandExecutor(() => {
    callIdx++;
    if (callIdx === 1) return ok("feature\n");
    if (callIdx === 2) return ok("origin/feature\n");
    return ok("2\t4\n");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.upstream_state.execute({}, ctx);

    const data = writes[0].data;
    assertEquals(data.ahead, 4);
    assertEquals(data.behind, 2);
    assertEquals(data.pushed, false);
    assertEquals(data.synced, false);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("upstream_state: no upstream configured", async () => {
  let callIdx = 0;
  setCommandExecutor(() => {
    callIdx++;
    if (callIdx === 1) return ok("feature\n");
    return fail("fatal: no upstream configured for branch 'feature'");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.upstream_state.execute({}, ctx);

    const data = writes[0].data;
    assertEquals(data.branch, "feature");
    assertEquals(data.hasUpstream, false);
    assertEquals(data.upstream, "");
    assertEquals(data.ahead, 0);
    assertEquals(data.behind, 0);
    assertEquals(data.pushed, false);
    assertEquals(data.synced, false);
    assertEquals(writes[0].tags?.pushed, "false");
    assertEquals(writes[0].tags?.synced, "false");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("upstream_state: detached HEAD", async () => {
  let callIdx = 0;
  setCommandExecutor(() => {
    callIdx++;
    if (callIdx === 1) return ok("HEAD\n");
    return fail("fatal: no upstream configured for branch 'HEAD'");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.upstream_state.execute({}, ctx);

    const data = writes[0].data;
    assertEquals(data.branch, "HEAD");
    assertEquals(data.hasUpstream, false);
    assertEquals(data.pushed, false);
    assertEquals(data.synced, false);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("upstream_state: explicit branch arg", async () => {
  let callIdx = 0;
  const calls: string[][] = [];
  setCommandExecutor((argv) => {
    calls.push(argv);
    callIdx++;
    if (callIdx === 1) return ok("origin/develop\n");
    return ok("1\t2\n");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.upstream_state.execute({ branch: "develop" }, ctx);

    assertEquals(calls.length, 2);
    assertEquals(calls[0].includes("develop@{u}"), true);

    const data = writes[0].data;
    assertEquals(data.branch, "develop");
    assertEquals(data.hasUpstream, true);
    assertEquals(data.upstream, "origin/develop");
    assertEquals(data.ahead, 2);
    assertEquals(data.behind, 1);
    assertEquals(data.pushed, false);
    assertEquals(data.synced, false);
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("upstream_state: branch with slash sanitizes resource name", async () => {
  let callIdx = 0;
  setCommandExecutor(() => {
    callIdx++;
    if (callIdx === 1) return ok("feature/foo\n");
    if (callIdx === 2) return ok("origin/feature/foo\n");
    return ok("0\t1\n");
  });
  try {
    const { ctx, writes } = makeHarness();
    await model.methods.upstream_state.execute({}, ctx);

    assertEquals(writes[0].name, "upstream-state-feature-foo");
    assertEquals(writes[0].data.branch, "feature/foo");
  } finally {
    resetCommandExecutor();
  }
});

Deno.test("upstream_state: malformed rev-list output throws", async () => {
  let callIdx = 0;
  setCommandExecutor(() => {
    callIdx++;
    if (callIdx === 1) return ok("main\n");
    if (callIdx === 2) return ok("origin/main\n");
    return ok("garbage output\n");
  });
  try {
    const { ctx } = makeHarness();
    await assertRejects(
      () => model.methods.upstream_state.execute({}, ctx),
      Error,
      "unexpected rev-list output",
    );
  } finally {
    resetCommandExecutor();
  }
});

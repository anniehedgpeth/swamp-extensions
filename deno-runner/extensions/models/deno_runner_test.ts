import { assertEquals } from "jsr:@std/assert@1.0.19";
import { model } from "./deno_runner.ts";
import type { DataHandle, DenoRunnerContext } from "./_lib/types.ts";

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------

interface Harness {
  ctx: DenoRunnerContext;
  writes: {
    specName: string;
    name: string;
    data: Record<string, unknown>;
    tags?: Record<string, string>;
  }[];
  logs: { level: string; message: string }[];
}

function makeHarness(
  globalArgs: Record<string, unknown>,
  seed: Record<string, Record<string, unknown>> = {},
): Harness {
  const resources = new Map<string, Record<string, unknown>>(
    Object.entries(seed),
  );
  const writes: Harness["writes"] = [];
  const logs: Harness["logs"] = [];

  const log = (level: string) => (message: string) => {
    logs.push({ level, message });
  };

  const ctx: DenoRunnerContext = {
    signal: new AbortController().signal,
    globalArgs,
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
      resources.set(name, data);
      return Promise.resolve({ name, tags: overrides?.tags });
    },
    readResource: (name: string): Promise<Record<string, unknown> | null> =>
      Promise.resolve(resources.get(name) ?? null),
  };

  return { ctx, writes, logs };
}

// ---------------------------------------------------------------------------
// Model export shape
// ---------------------------------------------------------------------------

Deno.test("model export has correct type", () => {
  assertEquals(model.type, "@swamp/deno-runner");
});

Deno.test("model export has version", () => {
  assertEquals(typeof model.version, "string");
  const parts = model.version.split(".");
  assertEquals(parts.length, 4);
});

Deno.test("model export has globalArguments schema", () => {
  const result = model.globalArguments.parse({
    version: "2.7.5",
  });
  assertEquals(result.version, "2.7.5");
});

Deno.test("globalArguments rejects missing version", () => {
  const result = model.globalArguments.safeParse({});
  assertEquals(result.success, false);
});

Deno.test("globalArguments rejects version with path separators", () => {
  const result = model.globalArguments.safeParse({
    version: "2.7.5/../../../etc/passwd",
  });
  assertEquals(result.success, false);
});

Deno.test("globalArguments rejects version with dot-dot segment", () => {
  const result = model.globalArguments.safeParse({
    version: "..",
  });
  assertEquals(result.success, false);
});

Deno.test("globalArguments rejects version starting with dot", () => {
  const result = model.globalArguments.safeParse({
    version: ".hidden",
  });
  assertEquals(result.success, false);
});

Deno.test("globalArguments accepts valid semver version", () => {
  const result = model.globalArguments.safeParse({
    version: "2.7.5",
  });
  assertEquals(result.success, true);
});

// ---------------------------------------------------------------------------
// Methods
// ---------------------------------------------------------------------------

Deno.test("model export has install method", () => {
  assertEquals(typeof model.methods.install.execute, "function");
  assertEquals(typeof model.methods.install.description, "string");
});

Deno.test("model export has run method", () => {
  assertEquals(typeof model.methods.run.execute, "function");
  assertEquals(typeof model.methods.run.description, "string");
});

Deno.test("model export has task method", () => {
  assertEquals(typeof model.methods.task.execute, "function");
  assertEquals(typeof model.methods.task.description, "string");
});

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

Deno.test("model export has installResult resource", () => {
  assertEquals(typeof model.resources.installResult.description, "string");
  assertEquals(model.resources.installResult.lifetime, "infinite");
});

Deno.test("model export has commandResult resource", () => {
  assertEquals(typeof model.resources.commandResult.description, "string");
  assertEquals(model.resources.commandResult.lifetime, "infinite");
});

// ---------------------------------------------------------------------------
// Run args validation
// ---------------------------------------------------------------------------

Deno.test("run args require non-empty args array", () => {
  const result = model.methods.run.arguments.safeParse({
    args: [],
  });
  assertEquals(result.success, false);
});

Deno.test("run args reject missing args", () => {
  const result = model.methods.run.arguments.safeParse({});
  assertEquals(result.success, false);
});

Deno.test("run args accept valid input", () => {
  const result = model.methods.run.arguments.parse({
    args: ["check", "src/main.ts"],
    workingDir: "/repo",
    env: { DENO_DIR: "/cache" },
  });
  assertEquals(result.args, ["check", "src/main.ts"]);
  assertEquals(result.workingDir, "/repo");
  assertEquals(result.env?.DENO_DIR, "/cache");
});

Deno.test("run args accept args without optional fields", () => {
  const result = model.methods.run.arguments.parse({
    args: ["lint", "src/"],
  });
  assertEquals(result.args, ["lint", "src/"]);
  assertEquals(result.workingDir, undefined);
  assertEquals(result.env, undefined);
});

Deno.test("run args accept inheritEnv", () => {
  const result = model.methods.run.arguments.parse({
    args: ["check", "src/main.ts"],
    inheritEnv: true,
  });
  assertEquals(result.inheritEnv, true);
});

Deno.test("run args default inheritEnv to undefined", () => {
  const result = model.methods.run.arguments.parse({
    args: ["check", "src/main.ts"],
  });
  assertEquals(result.inheritEnv, undefined);
});

// ---------------------------------------------------------------------------
// Task args validation
// ---------------------------------------------------------------------------

Deno.test("task args require taskName", () => {
  const result = model.methods.task.arguments.safeParse({});
  assertEquals(result.success, false);
});

Deno.test("task args reject empty taskName", () => {
  const result = model.methods.task.arguments.safeParse({
    taskName: "",
  });
  assertEquals(result.success, false);
});

Deno.test("task args accept valid input", () => {
  const result = model.methods.task.arguments.parse({
    taskName: "generate:aws",
    taskArgs: ["ec2", "s3"],
    workingDir: "/codegen",
  });
  assertEquals(result.taskName, "generate:aws");
  assertEquals(result.taskArgs, ["ec2", "s3"]);
  assertEquals(result.workingDir, "/codegen");
});

Deno.test("task args accept taskName without optional fields", () => {
  const result = model.methods.task.arguments.parse({
    taskName: "check",
  });
  assertEquals(result.taskName, "check");
  assertEquals(result.taskArgs, undefined);
  assertEquals(result.workingDir, undefined);
});

Deno.test("task args accept inheritEnv", () => {
  const result = model.methods.task.arguments.parse({
    taskName: "build",
    inheritEnv: true,
  });
  assertEquals(result.inheritEnv, true);
});

Deno.test("task args default inheritEnv to undefined", () => {
  const result = model.methods.task.arguments.parse({
    taskName: "build",
  });
  assertEquals(result.inheritEnv, undefined);
});

// ---------------------------------------------------------------------------
// InstallResult schema
// ---------------------------------------------------------------------------

Deno.test("InstallResult schema parses valid result", () => {
  const result = model.resources.installResult.schema.parse({
    binaryPath: "/cache/deno-runner/bin/2.7.5/deno",
    version: "2.7.5",
    platform: "darwin-arm64",
  });
  assertEquals(result.binaryPath, "/cache/deno-runner/bin/2.7.5/deno");
  assertEquals(result.version, "2.7.5");
  assertEquals(result.platform, "darwin-arm64");
});

// ---------------------------------------------------------------------------
// CommandResult schema
// ---------------------------------------------------------------------------

Deno.test("CommandResult schema parses valid result", () => {
  const result = model.resources.commandResult.schema.parse({
    stdout: "ok\n",
    stderr: "",
    exitCode: 0,
    command: "deno check src/main.ts",
  });
  assertEquals(result.exitCode, 0);
  assertEquals(result.command, "deno check src/main.ts");
});

// ---------------------------------------------------------------------------
// Harness smoke tests
// ---------------------------------------------------------------------------

Deno.test("harness writeResource records writes", async () => {
  const { ctx, writes } = makeHarness({ version: "2.7.5" });

  await ctx.writeResource(
    "commandResult",
    "test-1",
    { stdout: "ok", stderr: "", exitCode: 0, command: "deno check" },
    { tags: { exitCode: "0" } },
  );

  assertEquals(writes.length, 1);
  assertEquals(writes[0].specName, "commandResult");
  assertEquals(writes[0].name, "test-1");
  assertEquals(writes[0].data.exitCode, 0);
});

Deno.test("harness readResource returns seeded data", async () => {
  const { ctx } = makeHarness(
    { version: "2.7.5" },
    {
      "my-result": {
        stdout: "hello",
        stderr: "",
        exitCode: 0,
        command: "deno run",
      },
    },
  );

  const result = await ctx.readResource("my-result");
  assertEquals(result?.stdout, "hello");
});

Deno.test("harness readResource returns null for missing", async () => {
  const { ctx } = makeHarness({ version: "2.7.5" });
  const result = await ctx.readResource("nonexistent");
  assertEquals(result, null);
});

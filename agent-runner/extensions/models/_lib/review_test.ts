import { assertEquals } from "jsr:@std/assert@1.0.19";
import { buildReviewPrompt, injectDiffModeTools } from "./review.ts";
import { ReviewArgsSchema } from "./schemas.ts";

// ---------------------------------------------------------------------------
// buildReviewPrompt — file list mode
// ---------------------------------------------------------------------------

Deno.test("buildReviewPrompt: file list mode includes file names", () => {
  const result = buildReviewPrompt(
    "Review template",
    "Write JSON to the output path.",
    "/tmp/result.json",
    { files: ["src/a.ts", "src/b.ts"] },
  );

  assertEquals(result.includes("CHANGED FILES"), true);
  assertEquals(result.includes("src/a.ts\nsrc/b.ts"), true);
  assertEquals(result.includes("DIFF"), false);
});

// ---------------------------------------------------------------------------
// buildReviewPrompt — diff mode
// ---------------------------------------------------------------------------

Deno.test("buildReviewPrompt: diff mode includes diff content", () => {
  const diff = `diff --git a/src/a.ts b/src/a.ts
--- a/src/a.ts
+++ b/src/a.ts
@@ -1,3 +1,4 @@
+import { foo } from "./foo.ts";
 const x = 1;`;

  const result = buildReviewPrompt(
    "Review template",
    "Write JSON to the output path.",
    "/tmp/result.json",
    { diff },
  );

  assertEquals(result.includes("DIFF (review these changes"), true);
  assertEquals(result.includes(diff), true);
  assertEquals(result.includes("CHANGED FILES"), false);
});

Deno.test("buildReviewPrompt: template and output instructions present in both modes", () => {
  const result = buildReviewPrompt(
    "My custom template",
    "Custom output instructions",
    "/out/result.json",
    { diff: "some diff" },
  );

  assertEquals(result.includes("My custom template"), true);
  assertEquals(result.includes("Custom output instructions"), true);
  assertEquals(result.includes("/out/result.json"), true);
});

// ---------------------------------------------------------------------------
// injectDiffModeTools
// ---------------------------------------------------------------------------

Deno.test("injectDiffModeTools: injects scoped Bash for tee output", () => {
  const result = injectDiffModeTools("claude", {});

  assertEquals(result, {
    claude: { allowedTools: ["Read", "Grep", "Glob", "Bash(tee:*)"] },
  });
});

Deno.test("injectDiffModeTools: preserves existing provider config", () => {
  const result = injectDiffModeTools("claude", {
    claude: { disallowedTools: ["Write"] },
  });

  assertEquals(result, {
    claude: {
      disallowedTools: ["Write"],
      allowedTools: ["Read", "Grep", "Glob", "Bash(tee:*)"],
    },
  });
});

Deno.test("injectDiffModeTools: does not override explicit allowedTools", () => {
  const config = {
    claude: { allowedTools: ["Read", "Bash"] },
  };
  const result = injectDiffModeTools("claude", config);

  assertEquals(result, config);
});

Deno.test("injectDiffModeTools: preserves other provider keys", () => {
  const result = injectDiffModeTools("claude", {
    codex: { someOption: true },
  });

  assertEquals(result, {
    codex: { someOption: true },
    claude: { allowedTools: ["Read", "Grep", "Glob", "Bash(tee:*)"] },
  });
});

Deno.test("injectDiffModeTools: filters tools that conflict with disallowedTools", () => {
  const result = injectDiffModeTools("claude", {
    claude: { disallowedTools: ["Bash"] },
  });

  assertEquals(result, {
    claude: {
      disallowedTools: ["Bash"],
      allowedTools: ["Read", "Grep", "Glob"],
    },
  });
});

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

Deno.test("schema: accepts files-only input", () => {
  const parsed = ReviewArgsSchema.parse({
    promptFile: "review.md",
    files: ["src/a.ts"],
  });
  assertEquals(parsed.files, ["src/a.ts"]);
  assertEquals(parsed.diff, undefined);
});

Deno.test("schema: accepts diff-only input", () => {
  const parsed = ReviewArgsSchema.parse({
    promptFile: "review.md",
    diff: "diff --git a/x.ts b/x.ts\n...",
  });
  assertEquals(parsed.files, undefined);
  assertEquals(parsed.diff, "diff --git a/x.ts b/x.ts\n...");
});

Deno.test("schema: accepts neither files nor diff at schema level", () => {
  const parsed = ReviewArgsSchema.parse({
    promptFile: "review.md",
  });
  assertEquals(parsed.files, undefined);
  assertEquals(parsed.diff, undefined);
});

Deno.test("schema: rejects empty diff string", () => {
  const result = ReviewArgsSchema.safeParse({
    promptFile: "review.md",
    diff: "",
  });
  assertEquals(result.success, false);
});

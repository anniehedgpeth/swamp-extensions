// Swamp, an Automation Framework
// Copyright (C) 2026 Elder Swamp Club, Inc.
//
// This file is part of Swamp.
//
// Swamp is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License version 3
// as published by the Free Software Foundation, with the Swamp
// Extension and Definition Exception (found in the "COPYING-EXCEPTION"
// file).
//
// Swamp is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Swamp.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Tests for resolveSelection — the single funnel that turns a method's `hosts`
 * selector into matched hosts and produces the agent-readable diagnostics
 * (precise no-match error, legacy-CEL deprecation warning, parse-error
 * wrapper). Driven by a structural FleetContext fake; no real swamp context,
 * no live SSH.
 *
 * @module
 */

import { assert, assertEquals, assertThrows } from "jsr:@std/assert@1.0.19";
import { createModelTestContext } from "@systeminit/swamp-testing";
import { type FleetContext, resolveSelection, runOpen } from "./operations.ts";
import { type GlobalArgs, GlobalArgsSchema } from "./schemas.ts";
import {
  type ExecRequest,
  resetCommandExecutor,
  setCommandExecutor,
} from "./runner.ts";

const makeCelEnv = createModelTestContext().context.createCelEnvironment;

function globals(): GlobalArgs {
  return GlobalArgsSchema.parse({
    name: "fleet",
    transport: { kind: "ssh" },
    hosts: [
      { name: "web-1", address: "10.0.0.1", tags: ["web", "prod"] },
      { name: "db-1", address: "10.0.5.1", tags: ["db", "prod"] },
    ],
  });
}

function fakeContext() {
  const warns: string[] = [];
  const logger = {
    debug() {},
    info() {},
    warn(msg: string) {
      warns.push(msg);
    },
    error() {},
  };
  const ctx = {
    signal: new AbortController().signal,
    globalArgs: {},
    modelType: "@swamp/ssh",
    modelId: "test",
    methodName: "exec",
    logger,
    writeResource: () => Promise.resolve({ name: "x" }),
    readResource: () => Promise.resolve(null),
    createCelEnvironment: makeCelEnv,
    dataRepository: {
      findAllForModel: () => Promise.resolve([]),
      delete: () => Promise.resolve(),
    },
  } as unknown as FleetContext;
  return { ctx, warns };
}

Deno.test("resolveSelection: plain identifier no-match throws a prescriptive error", () => {
  const { ctx } = fakeContext();
  assertThrows(
    () => resolveSelection(ctx, globals(), "ghost"),
    Error,
    "name:ghost",
  );
});

Deno.test("resolveSelection: bare name resolves", () => {
  const { ctx } = fakeContext();
  const hosts = resolveSelection(ctx, globals(), "db-1");
  assert(hosts.length === 1 && hosts[0].name === "db-1");
});

Deno.test("resolveSelection: legacy bare CEL resolves and warns exactly once", () => {
  const { ctx, warns } = fakeContext();
  const hosts = resolveSelection(ctx, globals(), '"prod" in host.tags');
  assert(hosts.length === 2);
  assert(warns.length === 1, `expected one warning, got ${warns.length}`);
  assert(warns[0].includes("deprecated"));
});

Deno.test("resolveSelection: cel: parse error surfaces as 'Invalid selector expression'", () => {
  const { ctx } = fakeContext();
  assertThrows(
    () => resolveSelection(ctx, globals(), "cel:size(host.tags"),
    Error,
    "Invalid selector expression",
  );
});

// ---------------------------------------------------------------------------
// runOpen — sshpass wrapping for password-auth hosts (#1339)
// ---------------------------------------------------------------------------

function openContext(globalArgs: GlobalArgs) {
  const { ctx } = fakeContext();
  return {
    ...ctx,
    globalArgs: globalArgs as unknown as Record<string, unknown>,
    methodName: "open",
  } as unknown as FleetContext;
}

Deno.test("runOpen: password-auth host argv is wrapped in sshpass -e", async () => {
  const requests: ExecRequest[] = [];
  setCommandExecutor((req: ExecRequest) => {
    requests.push(req);
    return Promise.resolve({ code: 0, signal: null, stdout: "", stderr: "" });
  });
  const savedTmpdir = Deno.env.get("TMPDIR");
  const tmpDir = await Deno.makeTempDir({ prefix: "open-sshpass-" });
  Deno.env.set("TMPDIR", tmpDir);
  try {
    const g = GlobalArgsSchema.parse({
      name: "test-fleet",
      transport: { kind: "ssh" },
      hosts: [{
        name: "pw-host",
        address: "10.0.0.1",
        transport: {
          kind: "ssh",
          auth: { kind: "password", password: "hunter2" },
        },
      }],
    });
    await runOpen({ hosts: "all" }, openContext(g));
    assertEquals(requests.length, 1, "expected exactly one spawn");
    const argv = [requests[0].command, ...requests[0].args];
    assertEquals(argv[0], "sshpass");
    assertEquals(argv[1], "-e");
    assertEquals(argv[2], "ssh");
    assertEquals(requests[0].env.SSHPASS, "hunter2");
  } finally {
    resetCommandExecutor();
    if (savedTmpdir !== undefined) {
      Deno.env.set("TMPDIR", savedTmpdir);
    } else {
      Deno.env.delete("TMPDIR");
    }
    await Deno.remove(tmpDir, { recursive: true }).catch(() => {});
  }
});

Deno.test("runOpen: key-auth host argv is NOT wrapped in sshpass", async () => {
  const requests: ExecRequest[] = [];
  setCommandExecutor((req: ExecRequest) => {
    requests.push(req);
    return Promise.resolve({ code: 0, signal: null, stdout: "", stderr: "" });
  });
  const savedTmpdir = Deno.env.get("TMPDIR");
  const tmpDir = await Deno.makeTempDir({ prefix: "open-key-" });
  Deno.env.set("TMPDIR", tmpDir);
  try {
    const g = GlobalArgsSchema.parse({
      name: "test-fleet",
      transport: { kind: "ssh" },
      hosts: [{
        name: "key-host",
        address: "10.0.0.2",
      }],
    });
    await runOpen({ hosts: "all" }, openContext(g));
    assertEquals(requests.length, 1, "expected exactly one spawn");
    assertEquals(requests[0].command, "ssh");
    assertEquals(requests[0].env.SSHPASS, undefined);
  } finally {
    resetCommandExecutor();
    if (savedTmpdir !== undefined) {
      Deno.env.set("TMPDIR", savedTmpdir);
    } else {
      Deno.env.delete("TMPDIR");
    }
    await Deno.remove(tmpDir, { recursive: true }).catch(() => {});
  }
});

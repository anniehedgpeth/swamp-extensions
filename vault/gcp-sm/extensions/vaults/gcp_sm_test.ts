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

import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
} from "jsr:@std/assert@1.0.19";
import { assertVaultExportConformance } from "@systeminit/swamp-testing";
import {
  _createTestProvider,
  createVaultAnnotation,
  GcpSmVaultProvider,
  vault,
  type VaultAnnotationProvider,
} from "./gcp_sm.ts";
import { GcpSmOperationError } from "./gcp_sm_errors.ts";

// --- Export conformance ---

Deno.test("vault export conforms to VaultProvider contract", () => {
  assertVaultExportConformance(vault, {
    validConfigs: [
      { project_id: "my-project" },
      { project_id: "my-project", secret_prefix: "dev-" },
      {},
    ],
    invalidConfigs: [
      { project_id: "" },
      { project_id: 123 },
    ],
  });
});

Deno.test("createProvider throws on invalid config", () => {
  assertThrows(
    () => vault.configSchema.parse({ project_id: "" }),
    Error,
  );
});

// --- Mock GCP Secret Manager REST Server ---

interface SecretState {
  value: Uint8Array;
  hasVersion: boolean;
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

interface MockOverrides {
  createSecret?: MockResponse;
  addSecretVersion?: MockResponse;
  accessSecretVersion?: MockResponse;
  listSecrets?: MockResponse;
  deleteSecret?: MockResponse;
  getSecret?: MockResponse;
  updateSecret?: MockResponse;
}

interface MockResponse {
  status: number;
  body: unknown;
}

const TEST_PROJECT = "test-project";

function startMockGcpServer(overrides: MockOverrides = {}): {
  port: number;
  server: Deno.HttpServer;
  secrets: Map<string, SecretState>;
} {
  const secrets = new Map<string, SecretState>();

  const server = Deno.serve({ port: 0, onListen: () => {} }, (req) => {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // POST /v1/projects/{project}/secrets?secretId={id}
    if (
      method === "POST" &&
      /^\/v1\/projects\/[^/]+\/secrets$/.test(path) &&
      url.searchParams.has("secretId")
    ) {
      if (overrides.createSecret) {
        return Response.json(overrides.createSecret.body, {
          status: overrides.createSecret.status,
        });
      }
      const secretId = url.searchParams.get("secretId")!;
      if (secrets.has(secretId)) {
        return Response.json(
          {
            error: {
              code: 409,
              message: "Already exists",
              status: "ALREADY_EXISTS",
            },
          },
          { status: 409 },
        );
      }
      return req.json().then((body) => {
        const labels = body?.labels ?? {};
        secrets.set(secretId, {
          value: new Uint8Array(),
          hasVersion: false,
          labels,
          annotations: {},
        });
        return Response.json({
          name: `projects/${TEST_PROJECT}/secrets/${secretId}`,
          labels,
          annotations: {},
        });
      });
    }

    // POST /v1/projects/{project}/secrets/{secret}:addVersion
    const addVersionMatch = path.match(
      /^\/v1\/projects\/[^/]+\/secrets\/([^/:]+):addVersion$/,
    );
    if (method === "POST" && addVersionMatch) {
      if (overrides.addSecretVersion) {
        return Response.json(overrides.addSecretVersion.body, {
          status: overrides.addSecretVersion.status,
        });
      }
      const secretId = addVersionMatch[1];
      const state = secrets.get(secretId);
      if (!state) {
        return Response.json(
          { error: { code: 404, message: "Not found", status: "NOT_FOUND" } },
          { status: 404 },
        );
      }
      return req.json().then((body) => {
        const dataStr = body?.payload?.data;
        if (typeof dataStr === "string") {
          state.value = base64Decode(dataStr);
        }
        state.hasVersion = true;
        return Response.json({
          name: `projects/${TEST_PROJECT}/secrets/${secretId}/versions/1`,
          state: "ENABLED",
        });
      });
    }

    // GET /v1/projects/{project}/secrets/{secret}/versions/latest:access
    const accessMatch = path.match(
      /^\/v1\/projects\/[^/]+\/secrets\/([^/:]+)\/versions\/latest:access$/,
    );
    if (method === "GET" && accessMatch) {
      if (overrides.accessSecretVersion) {
        return Response.json(overrides.accessSecretVersion.body, {
          status: overrides.accessSecretVersion.status,
        });
      }
      const secretId = accessMatch[1];
      const state = secrets.get(secretId);
      if (!state || !state.hasVersion) {
        return Response.json(
          { error: { code: 404, message: "Not found", status: "NOT_FOUND" } },
          { status: 404 },
        );
      }
      return Response.json({
        name: `projects/${TEST_PROJECT}/secrets/${secretId}/versions/1`,
        payload: { data: base64Encode(state.value) },
      });
    }

    // GET /v1/projects/{project}/secrets
    if (method === "GET" && /^\/v1\/projects\/[^/]+\/secrets$/.test(path)) {
      if (overrides.listSecrets) {
        return Response.json(overrides.listSecrets.body, {
          status: overrides.listSecrets.status,
        });
      }
      const secretList = [];
      for (const [id, state] of secrets) {
        secretList.push({
          name: `projects/${TEST_PROJECT}/secrets/${id}`,
          labels: state.labels,
          annotations: state.annotations,
        });
      }
      return Response.json({ secrets: secretList });
    }

    // DELETE /v1/projects/{project}/secrets/{secret}
    const deleteMatch = path.match(
      /^\/v1\/projects\/[^/]+\/secrets\/([^/:]+)$/,
    );
    if (method === "DELETE" && deleteMatch) {
      if (overrides.deleteSecret) {
        return Response.json(overrides.deleteSecret.body, {
          status: overrides.deleteSecret.status,
        });
      }
      const secretId = deleteMatch[1];
      if (!secrets.has(secretId)) {
        return Response.json(
          { error: { code: 404, message: "Not found", status: "NOT_FOUND" } },
          { status: 404 },
        );
      }
      secrets.delete(secretId);
      return Response.json({});
    }

    // GET /v1/projects/{project}/secrets/{secret}
    const getSecretMatch = path.match(
      /^\/v1\/projects\/[^/]+\/secrets\/([^/:]+)$/,
    );
    if (method === "GET" && getSecretMatch) {
      if (overrides.getSecret) {
        return Response.json(overrides.getSecret.body, {
          status: overrides.getSecret.status,
        });
      }
      const secretId = getSecretMatch[1];
      const state = secrets.get(secretId);
      if (!state) {
        return Response.json(
          { error: { code: 404, message: "Not found", status: "NOT_FOUND" } },
          { status: 404 },
        );
      }
      return Response.json({
        name: `projects/${TEST_PROJECT}/secrets/${secretId}`,
        labels: state.labels,
        annotations: state.annotations,
      });
    }

    // PATCH /v1/projects/{project}/secrets/{secret}
    const updateMatch = path.match(
      /^\/v1\/projects\/[^/]+\/secrets\/([^/:]+)$/,
    );
    if (method === "PATCH" && updateMatch) {
      if (overrides.updateSecret) {
        return Response.json(overrides.updateSecret.body, {
          status: overrides.updateSecret.status,
        });
      }
      const secretId = updateMatch[1];
      const state = secrets.get(secretId);
      if (!state) {
        return Response.json(
          { error: { code: 404, message: "Not found", status: "NOT_FOUND" } },
          { status: 404 },
        );
      }
      return req.json().then((body) => {
        if (body.labels !== undefined) state.labels = body.labels ?? {};
        if (body.annotations !== undefined) {
          state.annotations = body.annotations ?? {};
        }
        return Response.json({
          name: `projects/${TEST_PROJECT}/secrets/${secretId}`,
          labels: state.labels,
          annotations: state.annotations,
        });
      });
    }

    return Response.json({ error: { code: 404 } }, { status: 404 });
  });

  const addr = server.addr as Deno.NetAddr;
  return { port: addr.port, server, secrets };
}

function base64Encode(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64Decode(encoded: string): Uint8Array {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function mockFetchFn(port: number) {
  return async (
    url: string,
    opts: { method: string; body?: unknown },
  ): Promise<Response> => {
    const redirected = url.replace(
      /^https:\/\/secretmanager\.googleapis\.com/,
      `http://localhost:${port}`,
    );
    return await fetch(redirected, {
      method: opts.method,
      headers: { "Content-Type": "application/json" },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  };
}

function withMockGcp(
  fn: (
    provider: GcpSmVaultProvider,
    secrets: Map<string, SecretState>,
  ) => Promise<void>,
  overrides?: MockOverrides,
): () => Promise<void> {
  return async () => {
    const { port, server, secrets } = startMockGcpServer(overrides);
    try {
      const provider = _createTestProvider(
        "test-vault",
        { project_id: TEST_PROJECT },
        TEST_PROJECT,
        mockFetchFn(port),
      );
      await fn(provider, secrets);
    } finally {
      await server.shutdown();
    }
  };
}

// --- Core CRUD Tests ---

Deno.test(
  "get: returns secret value",
  withMockGcp(async (provider, secrets) => {
    secrets.set("my-secret", {
      hasVersion: true,
      value: new TextEncoder().encode("my-value"),
      labels: {},
      annotations: {},
    });
    const value = await provider.get("my-secret");
    assertEquals(value, "my-value");
  }),
);

Deno.test(
  "put + get: round-trips empty string value",
  withMockGcp(async (provider) => {
    await provider.put("empty", "");
    const value = await provider.get("empty");
    assertEquals(value, "");
  }),
);

Deno.test(
  "get: throws on missing secret",
  withMockGcp(async (provider) => {
    await assertRejects(() => provider.get("missing"));
  }),
);

Deno.test(
  "put: creates a new secret and version",
  withMockGcp(async (provider, secrets) => {
    await provider.put("new-secret", "new-value");
    assert(secrets.has("new-secret"));
    assertEquals(
      new TextDecoder().decode(secrets.get("new-secret")!.value),
      "new-value",
    );
  }),
);

Deno.test(
  "put: overwrites existing secret with new version",
  withMockGcp(async (provider, secrets) => {
    secrets.set("existing", {
      hasVersion: true,
      value: new TextEncoder().encode("old"),
      labels: {},
      annotations: {},
    });
    await provider.put("existing", "new");
    assertEquals(
      new TextDecoder().decode(secrets.get("existing")!.value),
      "new",
    );
  }),
);

Deno.test(
  "put: passes tags as labels on creation",
  withMockGcp(async (provider, secrets) => {
    await provider.put("tagged", "val", {
      tags: { env: "prod", team: "platform" },
    });
    assertEquals(secrets.get("tagged")!.labels["env"], "prod");
    assertEquals(secrets.get("tagged")!.labels["team"], "platform");
  }),
);

Deno.test(
  "put: does not overwrite labels on existing secret",
  withMockGcp(async (provider, secrets) => {
    secrets.set("labeled", {
      hasVersion: true,
      value: new TextEncoder().encode("old"),
      labels: { env: "staging" },
      annotations: {},
    });
    await provider.put("labeled", "new", { tags: { env: "prod" } });
    assertEquals(secrets.get("labeled")!.labels["env"], "staging");
  }),
);

Deno.test(
  "list: returns sorted secret names",
  withMockGcp(async (provider, secrets) => {
    secrets.set("bravo", {
      hasVersion: true,
      value: new TextEncoder().encode("b"),
      labels: {},
      annotations: {},
    });
    secrets.set("alpha", {
      hasVersion: true,
      value: new TextEncoder().encode("a"),
      labels: {},
      annotations: {},
    });
    secrets.set("charlie", {
      hasVersion: true,
      value: new TextEncoder().encode("c"),
      labels: {},
      annotations: {},
    });
    const names = await provider.list();
    assertEquals(names, ["alpha", "bravo", "charlie"]);
  }),
);

Deno.test(
  "delete: removes a secret",
  withMockGcp(async (provider, secrets) => {
    secrets.set("doomed", {
      hasVersion: true,
      value: new TextEncoder().encode("bye"),
      labels: {},
      annotations: {},
    });
    await provider.delete("doomed");
    assert(!secrets.has("doomed"));
  }),
);

Deno.test(
  "delete: throws on missing secret",
  withMockGcp(async (provider) => {
    await assertRejects(() => provider.delete("nonexistent"));
  }),
);

Deno.test(
  "getName: returns vault name",
  withMockGcp((provider) => {
    assertEquals(provider.getName(), "test-vault");
    return Promise.resolve();
  }),
);

Deno.test(
  "put + get: round-trips non-ASCII (UTF-8) values",
  withMockGcp(async (provider) => {
    await provider.put("unicode", '{"name": "日本語", "emoji": "🔐"}');
    const value = await provider.get("unicode");
    assertEquals(value, '{"name": "日本語", "emoji": "🔐"}');
  }),
);

Deno.test(
  "get: normalizes slashes to hyphens",
  withMockGcp(async (provider, secrets) => {
    secrets.set("path-to-secret", {
      hasVersion: true,
      value: new TextEncoder().encode("normalized"),
      labels: {},
      annotations: {},
    });
    assertEquals(await provider.get("path/to/secret"), "normalized");
  }),
);

// --- Prefix tests ---

Deno.test("list: filters and strips prefix", async () => {
  const { port, server, secrets } = startMockGcpServer();
  try {
    const provider = _createTestProvider(
      "prefixed",
      { project_id: TEST_PROJECT, secret_prefix: "dev-" },
      TEST_PROJECT,
      mockFetchFn(port),
    );
    secrets.set("dev-alpha", {
      hasVersion: true,
      value: new TextEncoder().encode("a"),
      labels: {},
      annotations: {},
    });
    secrets.set("dev-bravo", {
      hasVersion: true,
      value: new TextEncoder().encode("b"),
      labels: {},
      annotations: {},
    });
    secrets.set("prod-charlie", {
      hasVersion: true,
      value: new TextEncoder().encode("c"),
      labels: {},
      annotations: {},
    });
    assertEquals(await provider.list(), ["alpha", "bravo"]);
  } finally {
    await server.shutdown();
  }
});

// --- Annotation Tests ---

Deno.test(
  "getAnnotation: returns null for unannotated secret",
  withMockGcp(async (provider, secrets) => {
    secrets.set("plain", {
      hasVersion: true,
      value: new TextEncoder().encode("v"),
      labels: {},
      annotations: {},
    });
    const ann = await (provider as unknown as VaultAnnotationProvider)
      .getAnnotation("plain");
    assertEquals(ann, null);
  }),
);

Deno.test(
  "putAnnotation + getAnnotation: round-trip",
  withMockGcp(async (provider, secrets) => {
    secrets.set("annotated", {
      hasVersion: true,
      value: new TextEncoder().encode("v"),
      labels: {},
      annotations: {},
    });
    const ap = provider as unknown as VaultAnnotationProvider;
    await ap.putAnnotation(
      "annotated",
      createVaultAnnotation({
        url: "https://example.com/docs?page=1&lang=en",
        notes: "production credentials",
        labels: { env: "prod" },
      }),
    );
    const retrieved = await ap.getAnnotation("annotated");
    assert(retrieved !== null);
    assertEquals(retrieved.url, "https://example.com/docs?page=1&lang=en");
    assertEquals(retrieved.notes, "production credentials");
    assertEquals(retrieved.labels["env"], "prod");
  }),
);

Deno.test(
  "putAnnotation: preserves non-swamp annotations and labels",
  withMockGcp(async (provider, secrets) => {
    secrets.set("mixed", {
      hasVersion: true,
      value: new TextEncoder().encode("v"),
      labels: { team: "platform" },
      annotations: { "custom-key": "custom-value" },
    });
    const ap = provider as unknown as VaultAnnotationProvider;
    await ap.putAnnotation("mixed", createVaultAnnotation({ notes: "note" }));
    const state = secrets.get("mixed")!;
    assertEquals(state.annotations["custom-key"], "custom-value");
    assertEquals(state.annotations["swamp-notes"], "note");
    assertEquals(state.labels["team"], "platform");
  }),
);

Deno.test(
  "putAnnotation: partial update preserves existing fields",
  withMockGcp(async (provider, secrets) => {
    secrets.set("partial", {
      hasVersion: true,
      value: new TextEncoder().encode("v"),
      labels: {},
      annotations: {
        "swamp-notes": "original notes",
        "swamp-url": "https://original.com",
        "swamp-updated-at": new Date().toISOString(),
      },
    });
    const ap = provider as unknown as VaultAnnotationProvider;
    await ap.putAnnotation(
      "partial",
      createVaultAnnotation({ url: "https://updated.com" }),
    );
    const retrieved = await ap.getAnnotation("partial");
    assert(retrieved !== null);
    assertEquals(retrieved.url, "https://updated.com");
    assertEquals(retrieved.notes, "original notes");
  }),
);

Deno.test(
  "deleteAnnotation: removes swamp entries, preserves others",
  withMockGcp(async (provider, secrets) => {
    secrets.set("cleanup", {
      hasVersion: true,
      value: new TextEncoder().encode("v"),
      labels: { team: "ops", "swamp-env": "prod" },
      annotations: {
        custom: "kept",
        "swamp-notes": "removed",
        "swamp-url": "removed",
      },
    });
    const ap = provider as unknown as VaultAnnotationProvider;
    await ap.deleteAnnotation("cleanup");
    const state = secrets.get("cleanup")!;
    assertEquals(state.annotations["custom"], "kept");
    assertEquals(state.annotations["swamp-notes"], undefined);
    assertEquals(state.labels["team"], "ops");
    assertEquals(state.labels["swamp-env"], undefined);
  }),
);

Deno.test(
  "listAnnotations: returns only annotated secrets",
  withMockGcp(async (provider, secrets) => {
    secrets.set("ann-one", {
      hasVersion: true,
      value: new TextEncoder().encode("v"),
      labels: {},
      annotations: { "swamp-notes": "yes" },
    });
    secrets.set("plain-one", {
      hasVersion: true,
      value: new TextEncoder().encode("v"),
      labels: {},
      annotations: {},
    });
    secrets.set("ann-two", {
      hasVersion: true,
      value: new TextEncoder().encode("v"),
      labels: { "swamp-env": "prod" },
      annotations: {},
    });
    const ap = provider as unknown as VaultAnnotationProvider;
    const result = await ap.listAnnotations();
    assertEquals(result.size, 2);
    assert(result.has("ann-one"));
    assert(result.has("ann-two"));
    assert(!result.has("plain-one"));
  }),
);

// --- Error wrapping tests ---

Deno.test(
  "get: wraps HTTP 403 as GcpSmOperationError with IAM hint",
  withMockGcp(
    async (provider) => {
      const err = await assertRejects(() => provider.get("any"));
      assert(err instanceof GcpSmOperationError);
      assert(err.message.includes("GCP Secret Manager"));
      assert(
        err.message.includes("IAM"),
        `Expected IAM hint in: ${err.message}`,
      );
    },
    {
      accessSecretVersion: {
        status: 403,
        body: {
          error: {
            code: 403,
            message: "forbidden",
            status: "PERMISSION_DENIED",
          },
        },
      },
    },
  ),
);

Deno.test(
  "get: wraps HTTP 401 as GcpSmOperationError with credential hint",
  withMockGcp(
    async (provider) => {
      const err = await assertRejects(() => provider.get("any"));
      assert(err instanceof GcpSmOperationError);
      assert(
        err.message.includes("gcloud auth application-default login"),
        `Expected credential hint in: ${err.message}`,
      );
    },
    {
      accessSecretVersion: {
        status: 401,
        body: {
          error: {
            code: 401,
            message: "unauthenticated",
            status: "UNAUTHENTICATED",
          },
        },
      },
    },
  ),
);

// --- floci-gcp emulator integration tests ---

const hasFloci = Deno.env.get("FLOCI_ENABLED") === "1";

function flociProvider(prefix?: string): GcpSmVaultProvider {
  return _createTestProvider(
    "floci-test",
    {
      project_id: "floci-local",
      secret_prefix: prefix,
      api_endpoint: "http://localhost:4588",
    },
    "floci-local",
    async (url, opts) => {
      return await fetch(url, {
        method: opts.method,
        headers: { "Content-Type": "application/json" },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
    },
  );
}

const flociTestPrefix = `swamp-test-${Date.now()}-`;

Deno.test({
  name: "floci: put + get round-trip",
  ignore: !hasFloci,
  fn: async () => {
    const provider = flociProvider(flociTestPrefix);
    await provider.put("roundtrip", "hello-floci");
    assertEquals(await provider.get("roundtrip"), "hello-floci");
    await provider.delete("roundtrip");
  },
});

Deno.test({
  name: "floci: put overwrites with new version",
  ignore: !hasFloci,
  fn: async () => {
    const provider = flociProvider(flociTestPrefix);
    await provider.put("overwrite", "v1");
    await provider.put("overwrite", "v2");
    assertEquals(await provider.get("overwrite"), "v2");
    await provider.delete("overwrite");
  },
});

Deno.test({
  name: "floci: list returns stored secrets",
  ignore: !hasFloci,
  fn: async () => {
    const provider = flociProvider(flociTestPrefix);
    await provider.put("list-a", "a");
    await provider.put("list-b", "b");
    const names = await provider.list();
    assert(names.includes("list-a"));
    assert(names.includes("list-b"));
    await provider.delete("list-a");
    await provider.delete("list-b");
  },
});

Deno.test({
  name: "floci: delete removes secret",
  ignore: !hasFloci,
  fn: async () => {
    const provider = flociProvider(flociTestPrefix);
    await provider.put("delete-me", "gone");
    await provider.delete("delete-me");
    await assertRejects(() => provider.get("delete-me"));
  },
});

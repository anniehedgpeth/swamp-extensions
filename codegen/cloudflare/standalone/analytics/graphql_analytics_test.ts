import { assertEquals, assertRejects } from "@std/assert";
import { model } from "./graphql_analytics.ts";

function mockGraphQLServer(
  handler: (body: Record<string, unknown>) => Response,
): { server: Deno.HttpServer; port: number } {
  const server = Deno.serve({ port: 0, onListen: () => {} }, async (req) => {
    const url = new URL(req.url);

    if (url.pathname === "/graphql") {
      const body = await req.json();
      return handler(body);
    }

    return new Response("Not found", { status: 404 });
  });

  const addr = server.addr as Deno.NetAddr;
  return { server, port: addr.port };
}

function patchFetch(port: number): () => void {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    const url = typeof input === "string"
      ? input
      : input instanceof URL
      ? input.toString()
      : input.url;
    const redirected = url.replace(
      "https://api.cloudflare.com/client/v4",
      `http://localhost:${port}`,
    );
    return originalFetch(redirected, init);
  };
  return () => {
    globalThis.fetch = originalFetch;
  };
}

Deno.test({
  name: "query returns rows with dimensions and count",
  sanitizeResources: false,
  fn: async () => {
    const { server, port } = mockGraphQLServer((body) => {
      const vars = body.variables as Record<string, unknown>;
      assertEquals(vars.zoneTag, "test-zone-id");
      assertEquals(vars.mintime, "2026-07-01T00:00:00Z");
      assertEquals(vars.limit, 50);

      return new Response(
        JSON.stringify({
          data: {
            viewer: {
              zones: [
                {
                  httpRequestsAdaptiveGroups: [
                    {
                      dimensions: {
                        clientIP: "1.2.3.4",
                        edgeResponseStatus: 200,
                      },
                      count: 42,
                    },
                    {
                      dimensions: {
                        clientIP: "5.6.7.8",
                        edgeResponseStatus: 404,
                      },
                      count: 7,
                    },
                  ],
                },
              ],
            },
          },
          errors: null,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    });

    const savedToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const restoreFetch = patchFetch(port);
    try {
      Deno.env.set("CLOUDFLARE_API_TOKEN", "test-token");

      const { query: graphqlQuery } = await import("./_lib/graphql.ts");

      const data = await graphqlQuery(
        "query { viewer { zones { httpRequestsAdaptiveGroups { count } } } }",
        { zoneTag: "test-zone-id", mintime: "2026-07-01T00:00:00Z", limit: 50 },
      );

      const viewer = data.viewer as Record<string, unknown>;
      const zones = viewer.zones as Array<Record<string, unknown>>;
      const groups = zones[0].httpRequestsAdaptiveGroups as Array<
        Record<string, unknown>
      >;
      assertEquals(groups.length, 2);
      assertEquals(
        (groups[0].dimensions as Record<string, unknown>).clientIP,
        "1.2.3.4",
      );
      assertEquals(groups[0].count, 42);
    } finally {
      restoreFetch();
      if (savedToken) Deno.env.set("CLOUDFLARE_API_TOKEN", savedToken);
      else Deno.env.delete("CLOUDFLARE_API_TOKEN");
      await server.shutdown();
    }
  },
});

Deno.test({
  name: "GraphQL error response throws with error message",
  sanitizeResources: false,
  fn: async () => {
    const { server, port } = mockGraphQLServer(() => {
      return new Response(
        JSON.stringify({
          data: null,
          errors: [
            {
              message:
                "Access denied: field 'clientAsn' requires Enterprise plan",
            },
          ],
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    });

    const savedToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const restoreFetch = patchFetch(port);
    try {
      Deno.env.set("CLOUDFLARE_API_TOKEN", "test-token");

      const { query: graphqlQuery } = await import("./_lib/graphql.ts");

      await assertRejects(
        () =>
          graphqlQuery("query { viewer { zones { test } } }", { zoneTag: "z" }),
        Error,
        "Access denied: field 'clientAsn' requires Enterprise plan",
      );
    } finally {
      restoreFetch();
      if (savedToken) Deno.env.set("CLOUDFLARE_API_TOKEN", savedToken);
      else Deno.env.delete("CLOUDFLARE_API_TOKEN");
      await server.shutdown();
    }
  },
});

Deno.test({
  name: "auth falls back to API key + email when no token is set",
  sanitizeResources: false,
  fn: async () => {
    let receivedHeaders: Record<string, string> = {};
    const { server, port } = mockGraphQLServer((_body) => {
      return new Response(
        JSON.stringify({ data: { viewer: {} }, errors: null }),
        { headers: { "Content-Type": "application/json" } },
      );
    });

    const savedToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const savedKey = Deno.env.get("CLOUDFLARE_API_KEY");
    const savedEmail = Deno.env.get("CLOUDFLARE_EMAIL");
    const restoreFetch = patchFetch(port);
    try {
      Deno.env.delete("CLOUDFLARE_API_TOKEN");
      Deno.env.set("CLOUDFLARE_API_KEY", "test-api-key");
      Deno.env.set("CLOUDFLARE_EMAIL", "test@example.com");

      const { query: graphqlQuery } = await import("./_lib/graphql.ts");

      const origInner = globalThis.fetch;
      globalThis.fetch = (
        input: string | URL | Request,
        init?: RequestInit,
      ) => {
        const url = typeof input === "string"
          ? input
          : input instanceof URL
          ? input.toString()
          : input.url;
        if (url.includes("/graphql")) {
          receivedHeaders = Object.fromEntries(
            Object.entries(init?.headers ?? {}).map((
              [k, v],
            ) => [k, v as string]),
          );
        }
        return origInner(input, init);
      };

      await graphqlQuery("query { viewer { zones { test } } }", {
        zoneTag: "z",
      });

      assertEquals(receivedHeaders["X-Auth-Key"], "test-api-key");
      assertEquals(receivedHeaders["X-Auth-Email"], "test@example.com");
    } finally {
      restoreFetch();
      if (savedToken) Deno.env.set("CLOUDFLARE_API_TOKEN", savedToken);
      else Deno.env.delete("CLOUDFLARE_API_TOKEN");
      if (savedKey) Deno.env.set("CLOUDFLARE_API_KEY", savedKey);
      else Deno.env.delete("CLOUDFLARE_API_KEY");
      if (savedEmail) Deno.env.set("CLOUDFLARE_EMAIL", savedEmail);
      else Deno.env.delete("CLOUDFLARE_EMAIL");
      await server.shutdown();
    }
  },
});

Deno.test({
  name: "rate limit 429 retries and succeeds",
  sanitizeResources: false,
  fn: async () => {
    let attempt = 0;
    const { server, port } = mockGraphQLServer(() => {
      attempt++;
      if (attempt === 1) {
        return new Response("Rate limited", {
          status: 429,
          headers: { "Retry-After": "0" },
        });
      }
      return new Response(
        JSON.stringify({ data: { viewer: {} }, errors: null }),
        { headers: { "Content-Type": "application/json" } },
      );
    });

    const savedToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const restoreFetch = patchFetch(port);
    try {
      Deno.env.set("CLOUDFLARE_API_TOKEN", "test-token");

      const { query: graphqlQuery } = await import("./_lib/graphql.ts");

      const data = await graphqlQuery("query { viewer { zones { test } } }", {
        zoneTag: "z",
      });
      assertEquals(data.viewer !== undefined, true);
      assertEquals(attempt, 2);
    } finally {
      restoreFetch();
      if (savedToken) Deno.env.set("CLOUDFLARE_API_TOKEN", savedToken);
      else Deno.env.delete("CLOUDFLARE_API_TOKEN");
      await server.shutdown();
    }
  },
});

Deno.test({
  name: "response with sum and avg metric wrappers is parsed correctly",
  sanitizeResources: false,
  fn: async () => {
    const { server, port } = mockGraphQLServer(() => {
      return new Response(
        JSON.stringify({
          data: {
            viewer: {
              zones: [
                {
                  httpRequestsAdaptiveGroups: [
                    {
                      dimensions: { datetimeHour: "2026-07-01T10:00:00Z" },
                      count: 1500,
                      sum: { edgeResponseBytes: 19849385, visits: 4383 },
                      avg: { sampleInterval: 1.2 },
                    },
                  ],
                },
              ],
            },
          },
          errors: null,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    });

    const savedToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const restoreFetch = patchFetch(port);
    try {
      Deno.env.set("CLOUDFLARE_API_TOKEN", "test-token");

      const { query: graphqlQuery } = await import("./_lib/graphql.ts");

      const data = await graphqlQuery("query { test }", { zoneTag: "z" });
      const viewer = data.viewer as Record<string, unknown>;
      const zones = viewer.zones as Array<Record<string, unknown>>;
      const row = (
        zones[0].httpRequestsAdaptiveGroups as Array<Record<string, unknown>>
      )[0];

      assertEquals(row.count, 1500);
      assertEquals(
        (row.sum as Record<string, unknown>).edgeResponseBytes,
        19849385,
      );
      assertEquals((row.sum as Record<string, unknown>).visits, 4383);
      assertEquals((row.avg as Record<string, unknown>).sampleInterval, 1.2);
    } finally {
      restoreFetch();
      if (savedToken) Deno.env.set("CLOUDFLARE_API_TOKEN", savedToken);
      else Deno.env.delete("CLOUDFLARE_API_TOKEN");
      await server.shutdown();
    }
  },
});

Deno.test({
  name: "sync re-queries with stored filters, orderBy, and limit",
  sanitizeResources: false,
  fn: async () => {
    const queries: Array<
      { query: string; variables: Record<string, unknown> }
    > = [];
    const { server, port } = mockGraphQLServer((body) => {
      queries.push({
        query: body.query as string,
        variables: body.variables as Record<string, unknown>,
      });
      return new Response(
        JSON.stringify({
          data: {
            viewer: {
              zones: [
                {
                  httpRequestsAdaptiveGroups: [
                    {
                      dimensions: { clientIP: "1.2.3.4" },
                      count: 10,
                      sum: { edgeResponseBytes: 500 },
                    },
                  ],
                },
              ],
            },
          },
          errors: null,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    });

    const savedToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const restoreFetch = patchFetch(port);
    try {
      Deno.env.set("CLOUDFLARE_API_TOKEN", "test-token");

      const stored: Record<string, Record<string, unknown>> = {};
      const context = {
        globalArgs: { zone_id: "test-zone" },
        modelType: "test-type",
        modelId: "test-id",
        writeResource: (
          _resourceName: string,
          instanceName: string,
          data: Record<string, unknown>,
        ) => {
          stored[instanceName] = data;
          return Promise.resolve({
            resourceName: _resourceName,
            instanceName,
          });
        },
        dataRepository: {
          getContent: (
            _type: string,
            _modelId: string,
            dataName: string,
          ) => {
            const data = stored[dataName];
            if (!data) return Promise.resolve(null);
            return Promise.resolve(
              new TextEncoder().encode(JSON.stringify(data)),
            );
          },
        },
      };

      await model.methods.query.execute(
        {
          dataset: "httpRequestsAdaptiveGroups",
          dimensions: ["clientIP"],
          sumFields: ["edgeResponseBytes"],
          datetime_geq: "2026-07-27T00:00:00Z",
          datetime_lt: "2026-07-27T23:59:59Z",
          filters: { edgeResponseStatus: 200 },
          orderBy: ["count_DESC"],
          limit: 1000,
        },
        context,
      );

      assertEquals(queries.length, 1);
      assertEquals(stored["current"].dataset, "httpRequestsAdaptiveGroups");
      assertEquals(stored["current"].limit, 1000);
      assertEquals(
        (stored["current"].filters as Record<string, unknown>)
          .edgeResponseStatus,
        200,
      );
      assertEquals(
        (stored["current"].orderBy as string[])[0],
        "count_DESC",
      );

      await model.methods.sync.execute({ identifier: "current" }, context);

      assertEquals(queries.length, 2);
      const syncQuery = queries[1];
      assertEquals(syncQuery.variables.limit, 1000);
      assertEquals(
        syncQuery.query.includes("edgeResponseStatus: 200"),
        true,
      );
      assertEquals(syncQuery.query.includes("count_DESC"), true);
    } finally {
      restoreFetch();
      if (savedToken) Deno.env.set("CLOUDFLARE_API_TOKEN", savedToken);
      else Deno.env.delete("CLOUDFLARE_API_TOKEN");
      await server.shutdown();
    }
  },
});

Deno.test({
  name: "sync throws when no existing result",
  sanitizeResources: false,
  fn: async () => {
    const context = {
      globalArgs: { zone_id: "test-zone" },
      modelType: "test-type",
      modelId: "test-id",
      writeResource: () =>
        Promise.resolve({ resourceName: "", instanceName: "" }),
      dataRepository: {
        getContent: () => Promise.resolve(null),
      },
    };

    await assertRejects(
      () => model.methods.sync.execute({}, context),
      Error,
      'No existing result found for instance "current"',
    );
  },
});

Deno.test({
  name: "invalid GraphQL identifiers are rejected",
  sanitizeResources: false,
  fn: async () => {
    const context = {
      globalArgs: { zone_id: "test-zone" },
      modelType: "test-type",
      modelId: "test-id",
      writeResource: () =>
        Promise.resolve({ resourceName: "", instanceName: "" }),
      dataRepository: { getContent: () => Promise.resolve(null) },
    };

    await assertRejects(
      () =>
        model.methods.query.execute(
          {
            dataset: "foo { __schema { types { name } } }",
            dimensions: ["clientIP"],
            datetime_geq: "2026-07-27T00:00:00Z",
            datetime_lt: "2026-07-27T23:59:59Z",
          },
          context,
        ),
      Error,
      "Invalid GraphQL identifier for dataset",
    );
  },
});

Deno.test({
  name: "model exports have correct shape",
  fn: () => {
    assertEquals(model.type, "@swamp/cloudflare/analytics/graphql-analytics");
    assertEquals(typeof model.version, "string");
    assertEquals(typeof model.globalArguments, "object");
    assertEquals(typeof model.inputsSchema, "object");
    assertEquals(typeof model.resources.result, "object");
    assertEquals(typeof model.methods.query, "object");
    assertEquals(typeof model.methods.sync, "object");
    assertEquals(typeof model.methods.query.execute, "function");
    assertEquals(typeof model.methods.sync.execute, "function");
  },
});

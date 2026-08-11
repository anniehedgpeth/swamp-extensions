import { assertEquals } from "@std/assert";
import { parseResources } from "./pipeline.ts";

type OApiSpec = Parameters<typeof parseResources>[0];

function jsonBody(props: Record<string, { type: string }>) {
  return {
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: props,
          },
        },
      },
    },
  };
}

function getOp(props: Record<string, { type: string }>) {
  return {
    responses: {
      "200": {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                result: {
                  type: "object",
                  properties: props,
                },
              },
            },
          },
        },
      },
    },
  };
}

Deno.test("parseResources skips account-scoped paths with empty resource path", () => {
  const spec = {
    paths: {
      "/accounts/{account_id}": {
        post: jsonBody({ name: { type: "string" } }),
      },
      "/accounts/{account_id}/{booking_id}": {
        get: getOp({ id: { type: "string" }, name: { type: "string" } }),
        delete: {},
      },
    },
  } as OApiSpec;

  const { resources, skipped } = parseResources(spec);

  assertEquals(resources.length, 0);
  const emptyPathSkip = skipped.find((s) =>
    s.path === "/accounts/{account_id}"
  );
  assertEquals(emptyPathSkip?.reason, "failed to extract resource");
});

Deno.test("parseResources skips zone-scoped paths with empty resource path", () => {
  const spec = {
    paths: {
      "/zones/{zone_id}": {
        post: jsonBody({ name: { type: "string" } }),
      },
      "/zones/{zone_id}/{record_id}": {
        get: getOp({ id: { type: "string" }, name: { type: "string" } }),
        delete: {},
      },
    },
  } as OApiSpec;

  const { resources, skipped } = parseResources(spec);

  assertEquals(resources.length, 0);
  const emptyPathSkip = skipped.find((s) => s.path === "/zones/{zone_id}");
  assertEquals(emptyPathSkip?.reason, "failed to extract resource");
});

Deno.test("parseResources accepts valid account-scoped paths", () => {
  const spec = {
    paths: {
      "/accounts/{account_id}/workers": {
        post: jsonBody({ name: { type: "string" } }),
      },
      "/accounts/{account_id}/workers/{worker_id}": {
        get: getOp({ id: { type: "string" }, name: { type: "string" } }),
        patch: jsonBody({ name: { type: "string" } }),
        delete: {},
      },
    },
  } as OApiSpec;

  const { resources } = parseResources(spec);

  assertEquals(resources.length, 1);
  assertEquals(resources[0].service, "workers");
  assertEquals(resources[0].modelSlug, "workers");
  assertEquals(resources[0].fileName, "workers.ts");
});

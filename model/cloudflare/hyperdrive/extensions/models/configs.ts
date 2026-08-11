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

// Auto-generated extension model for @swamp/cloudflare/hyperdrive/configs
// Do not edit manually. Re-generate with: deno task generate:cloudflare

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for a Cloudflare Configs.
 *
 * Wraps the Cloudflare API as a swamp model so create, get, lookup,
 * adopt, update, delete, and sync can be driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import {
  create,
  listAll,
  read,
  remove,
  tryRead,
  update,
} from "./_lib/cloudflare.ts";

const GlobalArgsSchema = z.object({
  account_id: z.string().describe("Cloudflare account ID"),
  caching: z.object({
    disabled: z.boolean().optional(),
    max_age: z.number().int().optional(),
    stale_while_revalidate: z.number().int().optional(),
  }).optional(),
  mtls: z.object({
    ca_certificate_id: z.string().optional(),
    mtls_certificate_id: z.string().optional(),
    sslmode: z.string().optional(),
  }).describe(
    "mTLS configuration for the origin connection. Cannot be used with VPC Service origins; TLS must be managed on the VPC Service.",
  ).optional(),
  name: z.string().describe(
    "The name of the Hyperdrive configuration. Used to identify the configuration in the Cloudflare dashboard and API.",
  ),
  origin: z.object({
    database: z.string().optional(),
    password: z.string().optional(),
    scheme: z.enum(["postgres", "postgresql", "mysql"]).optional(),
    user: z.string().optional(),
    host: z.string().optional(),
    port: z.number().int().optional(),
    access_client_id: z.string().optional(),
    access_client_secret: z.string().optional(),
    service_id: z.string().optional(),
  }),
  origin_connection_limit: z.number().int().min(5).describe(
    "The (soft) maximum number of connections the Hyperdrive is allowed to make to the origin database.\n\nMaximum allowed: 20 for free tier accounts, 100 for paid tier accounts.\nIf not specified, defaults to 20 for free tier and 60 for paid tier.\nCertain Cloudflare-managed origins may be permitted a higher limit.\nContact Cloudflare if you need a higher limit.\n",
  ).optional(),
  created_on: z.string().describe(
    "Defines the creation time of the Hyperdrive configuration.",
  ).optional(),
  id: z.string().max(32).describe(
    "Define configurations using a unique string identifier.",
  ),
  modified_on: z.string().describe(
    "Defines the last modified time of the Hyperdrive configuration.",
  ).optional(),
  restarted_on: z.string().describe(
    "Defines the last time the Hyperdrive connection pool was explicitly restarted via the restart endpoint. Omitted if the pool has never been explicitly restarted.",
  ).optional(),
  apiToken: z.string().meta({ sensitive: true }).describe(
    "Cloudflare API token; overrides the CLOUDFLARE_API_TOKEN environment variable. Wire with a vault.get(...) expression to source it from a vault.",
  ).optional(),
  apiKey: z.string().meta({ sensitive: true }).describe(
    "Cloudflare API key for the legacy key+email auth path; overrides the CLOUDFLARE_API_KEY environment variable. Wire with a vault.get(...) expression. Requires email.",
  ).optional(),
  email: z.string().meta({ sensitive: true }).describe(
    "Cloudflare account email for the legacy key+email auth path; overrides the CLOUDFLARE_EMAIL environment variable. Requires apiKey.",
  ).optional(),
});

const ResourceSchema = z.object({
  caching: z.object({
    disabled: z.boolean().optional(),
    max_age: z.number().optional(),
    stale_while_revalidate: z.number().optional(),
  }).optional(),
  created_on: z.string().optional(),
  id: z.string(),
  modified_on: z.string().optional(),
  mtls: z.object({
    ca_certificate_id: z.string().optional(),
    mtls_certificate_id: z.string().optional(),
    sslmode: z.string().optional(),
  }).optional(),
  name: z.string().optional(),
  origin: z.object({
    database: z.string().optional(),
    password: z.string().optional(),
    scheme: z.string().optional(),
    user: z.string().optional(),
    host: z.string().optional(),
    port: z.number().optional(),
    access_client_id: z.string().optional(),
    access_client_secret: z.string().optional(),
    service_id: z.string().optional(),
  }).optional(),
  origin_connection_limit: z.number().optional(),
  restarted_on: z.string().optional(),
}).passthrough();

type ResourceData = z.infer<typeof ResourceSchema>;

const InputsSchema = z.object({
  account_id: z.string().optional(),
  caching: z.object({
    disabled: z.boolean().optional(),
    max_age: z.number().int().optional(),
    stale_while_revalidate: z.number().int().optional(),
  }).optional(),
  mtls: z.object({
    ca_certificate_id: z.string().optional(),
    mtls_certificate_id: z.string().optional(),
    sslmode: z.string().optional(),
  }).optional(),
  name: z.string().optional(),
  origin: z.object({
    database: z.string().optional(),
    password: z.string().optional(),
    scheme: z.enum(["postgres", "postgresql", "mysql"]).optional(),
    user: z.string().optional(),
    host: z.string().optional(),
    port: z.number().int().optional(),
    access_client_id: z.string().optional(),
    access_client_secret: z.string().optional(),
    service_id: z.string().optional(),
  }).optional(),
  origin_connection_limit: z.number().int().min(5).optional(),
  created_on: z.string().optional(),
  id: z.string().max(32).optional(),
  modified_on: z.string().optional(),
  restarted_on: z.string().optional(),
  apiToken: z.string().meta({ sensitive: true }).optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  email: z.string().meta({ sensitive: true }).optional(),
});

/** Swamp extension model for Cloudflare Configs. Registered at `@swamp/cloudflare/hyperdrive/configs`. */
export const model = {
  type: "@swamp/cloudflare/hyperdrive/configs",
  version: "2026.08.11.1",
  upgrades: [
    {
      toVersion: "2026.05.29.1",
      description: "Added: apiToken, apiKey, email",
      upgradeAttributes: (old: Record<string, unknown>) => old,
    },
    {
      toVersion: "2026.06.08.1",
      description: "No schema changes",
      upgradeAttributes: (old: Record<string, unknown>) => old,
    },
    {
      toVersion: "2026.07.18.1",
      description: "No schema changes",
      upgradeAttributes: (old: Record<string, unknown>) => old,
    },
    {
      toVersion: "2026.07.21.1",
      description: "No schema changes",
      upgradeAttributes: (old: Record<string, unknown>) => old,
    },
    {
      toVersion: "2026.07.24.1",
      description: "Added: restarted_on",
      upgradeAttributes: (old: Record<string, unknown>) => old,
    },
    {
      toVersion: "2026.08.05.1",
      description: "No schema changes",
      upgradeAttributes: (old: Record<string, unknown>) => old,
    },
    {
      toVersion: "2026.08.11.1",
      description: "No schema changes",
      upgradeAttributes: (old: Record<string, unknown>) => old,
    },
  ],
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Configs resource state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    create: {
      description: "Create a Configs",
      arguments: z.object({}),
      execute: async (_args: Record<string, never>, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id + "/hyperdrive/configs";
        const body: Record<string, unknown> = {};
        if (g.caching !== undefined) body.caching = g.caching;
        if (g.created_on !== undefined) body.created_on = g.created_on;
        if (g.id !== undefined) body.id = g.id;
        if (g.modified_on !== undefined) body.modified_on = g.modified_on;
        if (g.mtls !== undefined) body.mtls = g.mtls;
        if (g.name !== undefined) body.name = g.name;
        if (g.origin !== undefined) body.origin = g.origin;
        if (g.origin_connection_limit !== undefined) {
          body.origin_connection_limit = g.origin_connection_limit;
        }
        if (g.restarted_on !== undefined) body.restarted_on = g.restarted_on;
        const result = await create(endpoint, body, {
          apiToken: g.apiToken,
          apiKey: g.apiKey,
          email: g.email,
        }) as ResourceData;
        const instanceName = (g.name?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    get: {
      description: "Get a Configs",
      arguments: z.object({ id: z.string().describe("The ID of the Configs") }),
      execute: async (args: { id: string }, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id + "/hyperdrive/configs";
        const result = await read(endpoint, args.id, {
          apiToken: g.apiToken,
          apiKey: g.apiKey,
          email: g.email,
        }) as ResourceData;
        const instanceName = (g.name?.toString() ?? args.id).replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    lookup: {
      description:
        "Look up an existing Configs by matching global argument values and import it into state",
      arguments: z.object({}),
      execute: async (_args: Record<string, never>, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id + "/hyperdrive/configs";
        const filters: [string, string][] = [];
        if (g.name !== undefined) filters.push(["name", String(g.name)]);
        if (g.origin_connection_limit !== undefined) {
          filters.push([
            "origin_connection_limit",
            String(g.origin_connection_limit),
          ]);
        }
        if (g.created_on !== undefined) {
          filters.push(["created_on", String(g.created_on)]);
        }
        if (g.id !== undefined) filters.push(["id", String(g.id)]);
        if (g.modified_on !== undefined) {
          filters.push(["modified_on", String(g.modified_on)]);
        }
        if (g.restarted_on !== undefined) {
          filters.push(["restarted_on", String(g.restarted_on)]);
        }
        if (filters.length === 0) {
          throw new Error(
            "At least one global argument must be set to filter by",
          );
        }
        const items = await listAll(endpoint, "page", undefined, {
          apiToken: g.apiToken,
          apiKey: g.apiKey,
          email: g.email,
        });
        const matches = items.filter((item) => {
          for (const [key, val] of filters) {
            if (String((item as Record<string, unknown>)[key]) !== val) {
              return false;
            }
          }
          return true;
        });
        if (matches.length === 0) {
          const filterDesc = filters.map(([k, v]) =>
            `${k}=${JSON.stringify(v)}`
          ).join(", ");
          throw new Error(`No configs found matching filters: ${filterDesc}`);
        }
        if (matches.length > 1) {
          const filterDesc = filters.map(([k, v]) =>
            `${k}=${JSON.stringify(v)}`
          ).join(", ");
          throw new Error(
            `Expected exactly 1 match, found ${matches.length} for filters: ${filterDesc}`,
          );
        }
        const result = matches[0] as ResourceData;
        const instanceName =
          (g.name?.toString() ?? result.id?.toString() ?? "current").replace(
            /[\/\\]/g,
            "_",
          ).replace(/\.\./g, "_").replace(/\0/g, "");
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    adopt: {
      description: "Import an existing Configs by ID into state for management",
      arguments: z.object({
        id: z.string().describe("The ID of the Configs to import"),
      }),
      execute: async (args: { id: string }, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id + "/hyperdrive/configs";
        const result = await read(endpoint, args.id, {
          apiToken: g.apiToken,
          apiKey: g.apiKey,
          email: g.email,
        }) as ResourceData;
        const instanceName =
          (result.name?.toString() ?? g.name?.toString() ?? args.id).replace(
            /[\/\\]/g,
            "_",
          ).replace(/\.\./g, "_").replace(/\0/g, "");
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    update: {
      description: "Update Configs attributes",
      arguments: z.object({
        identifier: z.string().describe(
          "Target a specific Configs by id (e.g. one discovered by list)",
        ).optional(),
      }),
      execute: async (args: { identifier?: string }, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id + "/hyperdrive/configs";
        const instanceName =
          (g.name?.toString() ?? args.identifier ?? "current").replace(
            /[\/\\]/g,
            "_",
          ).replace(/\.\./g, "_").replace(/\0/g, "");
        const content = await context.dataRepository.getContent(
          context.modelType,
          context.modelId,
          instanceName,
        );
        if (!content) {
          throw new Error("No data found - run create, get, or list first");
        }
        const existing = JSON.parse(new TextDecoder().decode(content));
        const body: Record<string, unknown> = {};
        if (g.caching !== undefined) body.caching = g.caching;
        if (g.mtls !== undefined) body.mtls = g.mtls;
        if (g.name !== undefined) body.name = g.name;
        if (g.origin !== undefined) body.origin = g.origin;
        if (g.origin_connection_limit !== undefined) {
          body.origin_connection_limit = g.origin_connection_limit;
        }
        const result = await update(endpoint, existing.id, body, "PATCH", {
          apiToken: g.apiToken,
          apiKey: g.apiKey,
          email: g.email,
        }) as ResourceData;
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    delete: {
      description: "Delete the Configs",
      arguments: z.object({ id: z.string().describe("The ID of the Configs") }),
      execute: async (args: { id: string }, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id + "/hyperdrive/configs";
        const { existed } = await remove(endpoint, args.id, {
          apiToken: g.apiToken,
          apiKey: g.apiKey,
          email: g.email,
        });
        const instanceName = (context.globalArgs.name?.toString() ?? args.id)
          .replace(/[\/\\]/g, "_").replace(/\.\./g, "_").replace(/\0/g, "");
        const handle = await context.writeResource("state", instanceName, {
          id: args.id,
          existed,
          status: existed ? "deleted" : "not_found",
          deletedAt: new Date().toISOString(),
        });
        return { dataHandles: [handle] };
      },
    },
    sync: {
      description: "Sync Configs state from Cloudflare",
      arguments: z.object({
        identifier: z.string().describe(
          "Target a specific Configs by id (e.g. one discovered by list)",
        ).optional(),
      }),
      execute: async (args: { identifier?: string }, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id + "/hyperdrive/configs";
        const instanceName =
          (g.name?.toString() ?? args.identifier ?? "current").replace(
            /[\/\\]/g,
            "_",
          ).replace(/\.\./g, "_").replace(/\0/g, "");
        const content = await context.dataRepository.getContent(
          context.modelType,
          context.modelId,
          instanceName,
        );
        if (!content) {
          throw new Error("No data found - run create, get, or list first");
        }
        const existing = JSON.parse(new TextDecoder().decode(content));
        if (!existing.id) {
          throw new Error("Stored state has no id - cannot sync");
        }
        const result = await tryRead(endpoint, existing.id, {
          apiToken: g.apiToken,
          apiKey: g.apiKey,
          email: g.email,
        }) as ResourceData | null;
        if (result) {
          const handle = await context.writeResource(
            "state",
            instanceName,
            result,
          );
          return { dataHandles: [handle] };
        }
        const handle = await context.writeResource("state", instanceName, {
          id: existing.id,
          status: "not_found",
          syncedAt: new Date().toISOString(),
        });
        return { dataHandles: [handle] };
      },
    },
  },
};

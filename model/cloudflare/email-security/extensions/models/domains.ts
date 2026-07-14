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

// Auto-generated extension model for @swamp/cloudflare/email-security/domains
// Do not edit manually. Re-generate with: deno task generate:cloudflare

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for a Cloudflare Domains.
 *
 * Wraps the Cloudflare API as a swamp model so create, get, update,
 * delete, and sync can be driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { create, read, remove, tryRead, update } from "./_lib/cloudflare.ts";

const GlobalArgsSchema = z.object({
  account_id: z.string().describe("Cloudflare account ID"),
  name: z.string().describe(
    "Instance name for this resource (used as the unique identifier in the factory pattern)",
  ),
  allowed_delivery_modes: z.array(
    z.enum(["DIRECT", "BCC", "JOURNAL", "API", "RETRO_SCAN"]),
  ),
  domain: z.string(),
  drop_dispositions: z.array(
    z.enum([
      "MALICIOUS",
      "MALICIOUS-BEC",
      "SUSPICIOUS",
      "SPOOF",
      "SPAM",
      "BULK",
      "ENCRYPTED",
      "EXTERNAL",
      "UNKNOWN",
      "NONE",
    ]),
  ),
  folder: z.enum(["AllItems", "Inbox"]).optional(),
  integration_id: z.string().optional(),
  ip_restrictions: z.array(z.string()),
  lookback_hops: z.number().int().min(1).max(20).optional(),
  regions: z.array(z.enum(["GLOBAL", "AU", "DE", "IN", "US"])),
  require_tls_inbound: z.boolean().optional(),
  require_tls_outbound: z.boolean().optional(),
  transport: z.string().optional(),
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
  allowed_delivery_modes: z.array(z.string()).optional(),
  authorization: z.object({
    authorized: z.boolean().optional(),
    status_message: z.string().optional(),
    timestamp: z.string().optional(),
  }).optional(),
  created_at: z.string().optional(),
  dmarc_status: z.string().optional(),
  domain: z.string().optional(),
  drop_dispositions: z.array(z.string()).optional(),
  emails_processed: z.object({
    timestamp: z.string().optional(),
    total_emails_processed: z.number().optional(),
    total_emails_processed_previous: z.number().optional(),
  }).optional(),
  folder: z.string().optional(),
  id: z.string(),
  inbox_provider: z.string().optional(),
  integration_id: z.string().optional(),
  ip_restrictions: z.array(z.string()).optional(),
  last_modified: z.string().optional(),
  lookback_hops: z.number().optional(),
  modified_at: z.string().optional(),
  o365_tenant_id: z.string().optional(),
  regions: z.array(z.string()).optional(),
  require_tls_inbound: z.boolean().optional(),
  require_tls_outbound: z.boolean().optional(),
  spf_status: z.string().optional(),
  status: z.string().optional(),
  transport: z.string().optional(),
}).passthrough();

type ResourceData = z.infer<typeof ResourceSchema>;

const InputsSchema = z.object({
  account_id: z.string().optional(),
  name: z.string().optional(),
  allowed_delivery_modes: z.array(
    z.enum(["DIRECT", "BCC", "JOURNAL", "API", "RETRO_SCAN"]),
  ).optional(),
  domain: z.string().optional(),
  drop_dispositions: z.array(
    z.enum([
      "MALICIOUS",
      "MALICIOUS-BEC",
      "SUSPICIOUS",
      "SPOOF",
      "SPAM",
      "BULK",
      "ENCRYPTED",
      "EXTERNAL",
      "UNKNOWN",
      "NONE",
    ]),
  ).optional(),
  folder: z.enum(["AllItems", "Inbox"]).optional(),
  integration_id: z.string().optional(),
  ip_restrictions: z.array(z.string()).optional(),
  lookback_hops: z.number().int().min(1).max(20).optional(),
  regions: z.array(z.enum(["GLOBAL", "AU", "DE", "IN", "US"])).optional(),
  require_tls_inbound: z.boolean().optional(),
  require_tls_outbound: z.boolean().optional(),
  transport: z.string().optional(),
  apiToken: z.string().meta({ sensitive: true }).optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  email: z.string().meta({ sensitive: true }).optional(),
});

/** Swamp extension model for Cloudflare Domains. Registered at `@swamp/cloudflare/email-security/domains`. */
export const model = {
  type: "@swamp/cloudflare/email-security/domains",
  version: "2026.07.14.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Domains resource state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    create: {
      description: "Create a Domains",
      arguments: z.object({}),
      execute: async (_args: Record<string, never>, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id +
          "/email-security/settings/domains";
        const body: Record<string, unknown> = {};
        if (g.allowed_delivery_modes !== undefined) {
          body.allowed_delivery_modes = g.allowed_delivery_modes;
        }
        if (g.domain !== undefined) body.domain = g.domain;
        if (g.drop_dispositions !== undefined) {
          body.drop_dispositions = g.drop_dispositions;
        }
        if (g.folder !== undefined) body.folder = g.folder;
        if (g.integration_id !== undefined) {
          body.integration_id = g.integration_id;
        }
        if (g.ip_restrictions !== undefined) {
          body.ip_restrictions = g.ip_restrictions;
        }
        if (g.lookback_hops !== undefined) body.lookback_hops = g.lookback_hops;
        if (g.regions !== undefined) body.regions = g.regions;
        if (g.require_tls_inbound !== undefined) {
          body.require_tls_inbound = g.require_tls_inbound;
        }
        if (g.require_tls_outbound !== undefined) {
          body.require_tls_outbound = g.require_tls_outbound;
        }
        if (g.transport !== undefined) body.transport = g.transport;
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
      description: "Get a Domains",
      arguments: z.object({ id: z.string().describe("The ID of the Domains") }),
      execute: async (args: { id: string }, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id +
          "/email-security/settings/domains";
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
    update: {
      description: "Update Domains attributes",
      arguments: z.object({}),
      execute: async (_args: Record<string, never>, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id +
          "/email-security/settings/domains";
        const instanceName = (g.name?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const content = await context.dataRepository.getContent(
          context.modelType,
          context.modelId,
          instanceName,
        );
        if (!content) throw new Error("No data found - run create first");
        const existing = JSON.parse(new TextDecoder().decode(content));
        const body: Record<string, unknown> = {};
        if (g.allowed_delivery_modes !== undefined) {
          body.allowed_delivery_modes = g.allowed_delivery_modes;
        }
        if (g.domain !== undefined) body.domain = g.domain;
        if (g.drop_dispositions !== undefined) {
          body.drop_dispositions = g.drop_dispositions;
        }
        if (g.folder !== undefined) body.folder = g.folder;
        if (g.integration_id !== undefined) {
          body.integration_id = g.integration_id;
        }
        if (g.ip_restrictions !== undefined) {
          body.ip_restrictions = g.ip_restrictions;
        }
        if (g.lookback_hops !== undefined) body.lookback_hops = g.lookback_hops;
        if (g.regions !== undefined) body.regions = g.regions;
        if (g.require_tls_inbound !== undefined) {
          body.require_tls_inbound = g.require_tls_inbound;
        }
        if (g.require_tls_outbound !== undefined) {
          body.require_tls_outbound = g.require_tls_outbound;
        }
        if (g.transport !== undefined) body.transport = g.transport;
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
      description: "Delete the Domains",
      arguments: z.object({ id: z.string().describe("The ID of the Domains") }),
      execute: async (args: { id: string }, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id +
          "/email-security/settings/domains";
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
      description: "Sync Domains state from Cloudflare",
      arguments: z.object({}),
      execute: async (_args: Record<string, never>, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id +
          "/email-security/settings/domains";
        const instanceName = (g.name?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const content = await context.dataRepository.getContent(
          context.modelType,
          context.modelId,
          instanceName,
        );
        if (!content) {
          throw new Error("No data found - run create or get first");
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

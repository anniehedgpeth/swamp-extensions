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

// Auto-generated extension model for @swamp/cloudflare//
// Do not edit manually. Re-generate with: deno task generate:cloudflare

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for a Cloudflare .
 *
 * Wraps the Cloudflare API as a swamp model so create, get, lookup,
 * adopt, update, delete, and sync can be driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { create, listAll, read, tryRead, remove } from "./_lib/cloudflare.ts";

const GlobalArgsSchema = z.object({
  account_id: z.string().describe("Cloudflare account ID"),
  category: z.string().min(1).describe("Support category/problem summary. Customers select this from the create-case flow. The server uses the configured eligibility mapping to resolve it to a skill group, determine available engineers, and decide whether to offer scheduling."),
  customer_phone: z.object({
    country_code: z.string().regex(new RegExp("^[A-Z]{2}$")),
    phone_number: z.string().min(1),
  }).describe("Customer contact number for the callback, captured at booking time and validated against the selected country code. This directly addresses wrong/international phone numbers (notably EMEA/APJC) that were a top pain point with the prior ad-hoc callback feature."),
  customer_timezone: z.string().regex(new RegExp("^[A-Za-z_+0-9-]+/[A-Za-z_+0-9-]+(?:/[A-Za-z_+0-9-]+)?$")).describe("IANA timezone identifier, echoed back on the booking for display and confirmation purposes."),
  description: z.string().describe("Additional details about the support request.").optional(),
  slot_token: z.string().describe("Token for the specific slot to claim, as GET .../booking/availability returned. The booking fails with 409 if the slot becomes unavailable."),
  subject: z.string().describe("Short summary of the support request.").optional(),
  apiToken: z.string().meta({ sensitive: true }).describe("Cloudflare API token; overrides the CLOUDFLARE_API_TOKEN environment variable. Wire with a vault.get(...) expression to source it from a vault.").optional(),
  apiKey: z.string().meta({ sensitive: true }).describe("Cloudflare API key for the legacy key+email auth path; overrides the CLOUDFLARE_API_KEY environment variable. Wire with a vault.get(...) expression. Requires email.").optional(),
  email: z.string().meta({ sensitive: true }).describe("Cloudflare account email for the legacy key+email auth path; overrides the CLOUDFLARE_EMAIL environment variable. Requires apiKey.").optional(),
});

const ResourceSchema = z.object({
  booking: z.object({
    booking_id: z.string().optional(),
    case_id: z.string().optional(),
    category: z.string().optional(),
    channel: z.string().optional(),
    created_at: z.string().optional(),
    customer_phone: z.object({
    country_code: z.string().optional(),
    phone_number: z.string().optional(),
  }).optional(),
    customer_timezone: z.string().optional(),
    description: z.string().optional(),
    end_time: z.string().optional(),
    start_time: z.string().optional(),
    status: z.string().optional(),
    subject: z.string().optional(),
    updated_at: z.string().optional(),
  }).optional(),
  id: z.string(),
}).passthrough();

type ResourceData = z.infer<typeof ResourceSchema>;

const InputsSchema = z.object({
  account_id: z.string().optional(),
  category: z.string().min(1).optional(),
  customer_phone: z.object({
    country_code: z.string().regex(new RegExp("^[A-Z]{2}$")),
    phone_number: z.string().min(1),
  }).optional(),
  customer_timezone: z.string().regex(new RegExp("^[A-Za-z_+0-9-]+/[A-Za-z_+0-9-]+(?:/[A-Za-z_+0-9-]+)?$")).optional(),
  description: z.string().optional(),
  slot_token: z.string().optional(),
  subject: z.string().optional(),
  apiToken: z.string().meta({ sensitive: true }).optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  email: z.string().meta({ sensitive: true }).optional(),
});

/** Swamp extension model for Cloudflare . Registered at `@swamp/cloudflare//`. */
export const model = {
  type: "@swamp/cloudflare//",
  version: "2026.08.07.1",
  upgrades: [
{
      toVersion: "2026.08.06.1",
      description: "No schema changes",
      upgradeAttributes: (old: Record<string, unknown>) => old,
    },
    {
      toVersion: "2026.08.07.1",
      description: "No schema changes",
      upgradeAttributes: (old: Record<string, unknown>) => old,
    },
  ],
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: " resource state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    create: {
      description: "Create a ",
      arguments: z.object({}),
      execute: async (_args: Record<string, never>, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id + "/";
        const body: Record<string, unknown> = {};
        if (g.category !== undefined) body.category = g.category;
        if (g.customer_phone !== undefined) body.customer_phone = g.customer_phone;
        if (g.customer_timezone !== undefined) body.customer_timezone = g.customer_timezone;
        if (g.description !== undefined) body.description = g.description;
        if (g.slot_token !== undefined) body.slot_token = g.slot_token;
        if (g.subject !== undefined) body.subject = g.subject;
        const result = await create(endpoint, body, { apiToken: g.apiToken, apiKey: g.apiKey, email: g.email }) as ResourceData;
        const instanceName = (g.description?.toString() ?? "current").replace(/[\/\\]/g, "_").replace(/\.\./g, "_").replace(/\0/g, "");
        const handle = await context.writeResource("state", instanceName, result);
        return { dataHandles: [handle] };
      },
    },
    get: {
      description: "Get a ",
      arguments: z.object({ id: z.string().describe("The ID of the ") }),
      execute: async (args: { id: string }, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id + "/";
        const result = await read(endpoint, args.id, { apiToken: g.apiToken, apiKey: g.apiKey, email: g.email }) as ResourceData;
        const instanceName = (g.description?.toString() ?? args.id).replace(/[\/\\]/g, "_").replace(/\.\./g, "_").replace(/\0/g, "");
        const handle = await context.writeResource("state", instanceName, result);
        return { dataHandles: [handle] };
      },
    },
    lookup: {
      description: "Look up an existing  by matching global argument values and import it into state",
      arguments: z.object({}),
      execute: async (_args: Record<string, never>, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id + "/";
        const filters: [string, string][] = [];
        if (g.category !== undefined) filters.push(["category", String(g.category)]);
        if (g.customer_timezone !== undefined) filters.push(["customer_timezone", String(g.customer_timezone)]);
        if (g.description !== undefined) filters.push(["description", String(g.description)]);
        if (g.slot_token !== undefined) filters.push(["slot_token", String(g.slot_token)]);
        if (g.subject !== undefined) filters.push(["subject", String(g.subject)]);
        if (filters.length === 0) throw new Error("At least one global argument must be set to filter by");
        const items = await listAll(endpoint, "none", undefined, { apiToken: g.apiToken, apiKey: g.apiKey, email: g.email });
        const matches = items.filter(item => {
          for (const [key, val] of filters) {
            if (String((item as Record<string, unknown>)[key]) !== val) return false;
          }
          return true;
        });
        if (matches.length === 0) {
          const filterDesc = filters.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(", ");
          throw new Error(`No  found matching filters: ${filterDesc}`);
        }
        if (matches.length > 1) {
          const filterDesc = filters.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(", ");
          throw new Error(`Expected exactly 1 match, found ${matches.length} for filters: ${filterDesc}`);
        }
        const result = matches[0] as ResourceData;
        const instanceName = (g.description?.toString() ?? result.id?.toString() ?? "current").replace(/[\/\\]/g, "_").replace(/\.\./g, "_").replace(/\0/g, "");
        const handle = await context.writeResource("state", instanceName, result);
        return { dataHandles: [handle] };
      },
    },
    adopt: {
      description: "Import an existing  by ID into state for management",
      arguments: z.object({ id: z.string().describe("The ID of the  to import") }),
      execute: async (args: { id: string }, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id + "/";
        const result = await read(endpoint, args.id, { apiToken: g.apiToken, apiKey: g.apiKey, email: g.email }) as ResourceData;
        const instanceName = (result.description?.toString() ?? g.description?.toString() ?? args.id).replace(/[\/\\]/g, "_").replace(/\.\./g, "_").replace(/\0/g, "");
        const handle = await context.writeResource("state", instanceName, result);
        return { dataHandles: [handle] };
      },
    },
    delete: {
      description: "Delete the ",
      arguments: z.object({ id: z.string().describe("The ID of the ") }),
      execute: async (args: { id: string }, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id + "/";
        const { existed } = await remove(endpoint, args.id, { apiToken: g.apiToken, apiKey: g.apiKey, email: g.email });
        const instanceName = (context.globalArgs.description?.toString() ?? args.id).replace(/[\/\\]/g, "_").replace(/\.\./g, "_").replace(/\0/g, "");
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
      description: "Sync  state from Cloudflare",
      arguments: z.object({ identifier: z.string().describe("Target a specific  by id (e.g. one discovered by list)").optional() }),
      execute: async (args: { identifier?: string }, context: any) => {
        const g = context.globalArgs;
        const endpoint = "/accounts/" + g.account_id + "/";
        const instanceName = (g.description?.toString() ?? args.identifier ?? "current").replace(/[\/\\]/g, "_").replace(/\.\./g, "_").replace(/\0/g, "");
        const content = await context.dataRepository.getContent(
          context.modelType, context.modelId, instanceName,
        );
        if (!content) throw new Error("No data found - run create, get, or list first");
        const existing = JSON.parse(new TextDecoder().decode(content));
        if (!existing.id) throw new Error("Stored state has no id - cannot sync");
        const result = await tryRead(endpoint, existing.id, { apiToken: g.apiToken, apiKey: g.apiKey, email: g.email }) as ResourceData | null;
        if (result) {
          const handle = await context.writeResource("state", instanceName, result);
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

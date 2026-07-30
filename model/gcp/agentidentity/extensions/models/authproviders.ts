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

// Auto-generated extension model for @swamp/gcp/agentidentity/authproviders
// Do not edit manually. Re-generate with: deno task generate:gcp

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for Google Cloud Agent Identity AuthProviders.
 *
 * Message describing AuthProvider object
 *
 * Wraps the GCP resource as a swamp model so create, get, update,
 * delete, and sync can be driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import {
  createResource,
  deleteResource,
  type ExplicitGcpCredentials,
  getProjectId,
  isResourceNotFoundError,
  listResources,
  readResource,
  updateResource,
} from "./_lib/gcp.ts";

/** Construct the fully-qualified resource name from parent and short name. */
function buildResourceName(parent: string, shortName: string): string {
  return `${parent}/authProviders/${shortName}`;
}

const BASE_URL = "https://agentidentity.googleapis.com/";

const GET_CONFIG = {
  "id": "agentidentity.projects.locations.authProviders.get",
  "path": "v1/{+name}",
  "httpMethod": "GET",
  "parameterOrder": [
    "name",
  ],
  "parameters": {
    "name": {
      "location": "path",
      "required": true,
    },
  },
} as const;

const INSERT_CONFIG = {
  "id": "agentidentity.projects.locations.authProviders.create",
  "path": "v1/{+parent}/authProviders",
  "httpMethod": "POST",
  "parameterOrder": [
    "parent",
  ],
  "parameters": {
    "authProviderId": {
      "location": "query",
    },
    "parent": {
      "location": "path",
      "required": true,
    },
    "requestId": {
      "location": "query",
    },
  },
} as const;

const PATCH_CONFIG = {
  "id": "agentidentity.projects.locations.authProviders.patch",
  "path": "v1/{+name}",
  "httpMethod": "PATCH",
  "parameterOrder": [
    "name",
  ],
  "parameters": {
    "name": {
      "location": "path",
      "required": true,
    },
    "requestId": {
      "location": "query",
    },
    "updateMask": {
      "location": "query",
    },
  },
} as const;

const DELETE_CONFIG = {
  "id": "agentidentity.projects.locations.authProviders.delete",
  "path": "v1/{+name}",
  "httpMethod": "DELETE",
  "parameterOrder": [
    "name",
  ],
  "parameters": {
    "name": {
      "location": "path",
      "required": true,
    },
    "requestId": {
      "location": "query",
    },
  },
} as const;

const LIST_CONFIG = {
  "id": "agentidentity.projects.locations.authProviders.list",
  "path": "v1/{+parent}/authProviders",
  "httpMethod": "GET",
  "parameterOrder": [
    "parent",
  ],
  "parameters": {
    "filter": {
      "location": "query",
    },
    "orderBy": {
      "location": "query",
    },
    "pageSize": {
      "location": "query",
    },
    "pageToken": {
      "location": "query",
    },
    "parent": {
      "location": "path",
      "required": true,
    },
    "showDeleted": {
      "location": "query",
    },
  },
} as const;

const GlobalArgsSchema = z.object({
  accessToken: z.string().meta({ sensitive: true }).describe(
    "GCP OAuth2 access token; overrides GCP_ACCESS_TOKEN environment variable. Wire with a vault.get(...) expression to source it from a vault.",
  ).optional(),
  credentialsJson: z.string().meta({ sensitive: true }).describe(
    "GCP service account JSON credentials; overrides GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable. Wire with a vault.get(...) expression to source it from a vault.",
  ).optional(),
  project: z.string().describe(
    "GCP project ID; overrides GCP_PROJECT / GOOGLE_CLOUD_PROJECT environment variables.",
  ).optional(),
  scopes: z.string().describe(
    "Comma-separated OAuth scopes to request when minting access tokens via gcloud. Defaults to the API's Discovery Document scopes.",
  ).optional(),
  quotaProject: z.string().describe(
    "GCP project ID for quota and billing attribution; sets the x-goog-user-project header. Overrides GOOGLE_CLOUD_QUOTA_PROJECT environment variable. Required for APIs like Cloud Identity when using user credentials.",
  ).optional(),
  allowedScopes: z.array(z.string()).describe(
    "Optional. List of scopes that are allowed to be requested for this auth_provider. If this list is non-empty, only scopes within this list may be requested. If this list is empty, all scopes may be requested. Scopes appearing in `blocked_scopes` are disallowed even if they appear in `allowed_scopes`. The number of allowed scopes is limited to 200.",
  ).optional(),
  authProviderTypeParams: z.object({
    apiKey: z.object({
      apiKey: z.string().describe(
        "Optional. Input only. The API key for this auth_provider.",
      ).optional(),
    }).describe("ApiKey AuthProvider type parameters.").optional(),
    geAuthProvider: z.object({}).describe(
      "GeminiEnterprise auth_provider type parameters.",
    ).optional(),
    threeLeggedOauth: z.object({
      authorizationUrl: z.string().describe(
        'Optional. The authorization endpoint to send users to for consenting to delegate to the agent. eg. "https://auth.atlassian.com/authorize"',
      ).optional(),
      clientId: z.string().describe(
        "Optional. The client ID of the OAuth client.",
      ).optional(),
      clientSecret: z.string().describe(
        "Optional. Input only. The client secret of the OAuth client.",
      ).optional(),
      defaultContinueUri: z.string().describe(
        "Optional. The default continue URI for 3LO flow and it will be used when no continue URI is provided in the RetrieveCredentials request.",
      ).optional(),
      enablePkce: z.boolean().describe(
        "Optional. Enables Proof Key for Code Exchange (PKCE) for the OAuth flow to prevent authorization code interception attacks.",
      ).optional(),
      redirectUrl: z.string().describe(
        "Output only. The redirect URL this auth_provider uses for the OAuth exchange. This is deterministic based on the name of the auth_provider.",
      ).optional(),
      tokenUrl: z.string().describe(
        'Optional. The token endpoint for requesting tokens on behalf of an end user. eg. "https://auth.atlassian.com/oauth/token"',
      ).optional(),
    }).describe("ThreeLeggedOAuth AuthProvider type parameters.").optional(),
    twoLeggedOauth: z.object({
      clientId: z.string().describe(
        "Optional. The client ID of the OAuth client.",
      ).optional(),
      clientSecret: z.string().describe(
        "Optional. Input only. The client secret of the OAuth client.",
      ).optional(),
      tokenUrl: z.string().describe(
        "Optional. The token endpoint of the OAuth client.",
      ).optional(),
    }).describe("TwoLeggedOAuth AuthProvider type parameters.").optional(),
  }).describe("Required. AuthProvider type specific parameters.").optional(),
  blockedScopes: z.array(z.string()).describe(
    "Optional. List of scopes that are blocked from being requested for this auth_provider. If a scope appears in this list, it will not be requested, even if it also appears in `allowed_scopes`. `blocked_scopes` takes precedence over `allowed_scopes`. The number of blocked scopes is limited to 200.",
  ).optional(),
  description: z.string().describe(
    "Optional. Description of the resource. Must be less than 256 characters.",
  ).optional(),
  labels: z.record(z.string(), z.string()).describe(
    "Optional. Labels as key value pairs",
  ).optional(),
  name: z.string().describe(
    "Identifier. The full resource name of the auth_provider. Format: projects/{project}/locations/{location}/authProviders/{auth_provider}",
  ).optional(),
  workloadIds: z.array(z.string()).describe(
    "Optional. Input only. Represents the workload identity in IAM `principal://` format of the agent(s) that will use this AuthProvider. Example: `principal://agents.global.org-${ORG_ID}.system.id.goog/resources/aiplatform/projects/{PROJECT_ID}/locations/{LOCATIONS}/reasoningEngines/{ID}`",
  ).optional(),
  authProviderId: z.string().describe(
    "Required. The ID to use for the AuthProvider, which will become the final segment of the AuthProvider's resource name. This value should be 1-63 characters, and valid characters are /a-z-/. The first character must be a lowercase letter, and the last character must be a lowercase letter or a number.",
  ).optional(),
  requestId: z.string().describe(
    "Optional. An optional request ID to identify requests. Specify a unique request ID so that if you must retry your request, the server will know to ignore the request if it has already been completed. The server will guarantee that for at least 60 minutes since the first request. For example, consider a situation where you make an initial request and the request times out. If you make the request again with the same request ID, the server can check if original operation with the same request ID was received, and if so, will ignore the second request. This prevents clients from accidentally creating duplicate commitments. The request ID must be a valid UUID with the exception that zero UUID is not supported (00000000-0000-0000-0000-000000000000).",
  ).optional(),
  location: z.string().describe(
    "The location for this resource (e.g., 'us', 'us-central1', 'europe-west1')",
  ).optional(),
});

const StateSchema = z.object({
  allowedScopes: z.array(z.string()).optional(),
  authProviderTypeParams: z.object({
    apiKey: z.object({
      apiKey: z.string(),
    }),
    geAuthProvider: z.object({}),
    threeLeggedOauth: z.object({
      authorizationUrl: z.string(),
      clientId: z.string(),
      clientSecret: z.string(),
      defaultContinueUri: z.string(),
      enablePkce: z.boolean(),
      redirectUrl: z.string(),
      tokenUrl: z.string(),
    }),
    twoLeggedOauth: z.object({
      clientId: z.string(),
      clientSecret: z.string(),
      tokenUrl: z.string(),
    }),
  }).optional(),
  blockedScopes: z.array(z.string()).optional(),
  createTime: z.string().optional(),
  deleted: z.boolean().optional(),
  description: z.string().optional(),
  expireTime: z.string().optional(),
  labels: z.record(z.string(), z.unknown()).optional(),
  name: z.string(),
  state: z.string().optional(),
  updateTime: z.string().optional(),
  workloadIds: z.array(z.string()).optional(),
}).passthrough();

type StateData = z.infer<typeof StateSchema>;

const InputsSchema = z.object({
  accessToken: z.string().meta({ sensitive: true }).optional(),
  credentialsJson: z.string().meta({ sensitive: true }).optional(),
  project: z.string().optional(),
  scopes: z.string().optional(),
  quotaProject: z.string().optional(),
  allowedScopes: z.array(z.string()).describe(
    "Optional. List of scopes that are allowed to be requested for this auth_provider. If this list is non-empty, only scopes within this list may be requested. If this list is empty, all scopes may be requested. Scopes appearing in `blocked_scopes` are disallowed even if they appear in `allowed_scopes`. The number of allowed scopes is limited to 200.",
  ).optional(),
  authProviderTypeParams: z.object({
    apiKey: z.object({
      apiKey: z.string().describe(
        "Optional. Input only. The API key for this auth_provider.",
      ).optional(),
    }).describe("ApiKey AuthProvider type parameters.").optional(),
    geAuthProvider: z.object({}).describe(
      "GeminiEnterprise auth_provider type parameters.",
    ).optional(),
    threeLeggedOauth: z.object({
      authorizationUrl: z.string().describe(
        'Optional. The authorization endpoint to send users to for consenting to delegate to the agent. eg. "https://auth.atlassian.com/authorize"',
      ).optional(),
      clientId: z.string().describe(
        "Optional. The client ID of the OAuth client.",
      ).optional(),
      clientSecret: z.string().describe(
        "Optional. Input only. The client secret of the OAuth client.",
      ).optional(),
      defaultContinueUri: z.string().describe(
        "Optional. The default continue URI for 3LO flow and it will be used when no continue URI is provided in the RetrieveCredentials request.",
      ).optional(),
      enablePkce: z.boolean().describe(
        "Optional. Enables Proof Key for Code Exchange (PKCE) for the OAuth flow to prevent authorization code interception attacks.",
      ).optional(),
      redirectUrl: z.string().describe(
        "Output only. The redirect URL this auth_provider uses for the OAuth exchange. This is deterministic based on the name of the auth_provider.",
      ).optional(),
      tokenUrl: z.string().describe(
        'Optional. The token endpoint for requesting tokens on behalf of an end user. eg. "https://auth.atlassian.com/oauth/token"',
      ).optional(),
    }).describe("ThreeLeggedOAuth AuthProvider type parameters.").optional(),
    twoLeggedOauth: z.object({
      clientId: z.string().describe(
        "Optional. The client ID of the OAuth client.",
      ).optional(),
      clientSecret: z.string().describe(
        "Optional. Input only. The client secret of the OAuth client.",
      ).optional(),
      tokenUrl: z.string().describe(
        "Optional. The token endpoint of the OAuth client.",
      ).optional(),
    }).describe("TwoLeggedOAuth AuthProvider type parameters.").optional(),
  }).describe("Required. AuthProvider type specific parameters.").optional(),
  blockedScopes: z.array(z.string()).describe(
    "Optional. List of scopes that are blocked from being requested for this auth_provider. If a scope appears in this list, it will not be requested, even if it also appears in `allowed_scopes`. `blocked_scopes` takes precedence over `allowed_scopes`. The number of blocked scopes is limited to 200.",
  ).optional(),
  description: z.string().describe(
    "Optional. Description of the resource. Must be less than 256 characters.",
  ).optional(),
  labels: z.record(z.string(), z.string()).describe(
    "Optional. Labels as key value pairs",
  ).optional(),
  name: z.string().describe(
    "Identifier. The full resource name of the auth_provider. Format: projects/{project}/locations/{location}/authProviders/{auth_provider}",
  ).optional(),
  workloadIds: z.array(z.string()).describe(
    "Optional. Input only. Represents the workload identity in IAM `principal://` format of the agent(s) that will use this AuthProvider. Example: `principal://agents.global.org-${ORG_ID}.system.id.goog/resources/aiplatform/projects/{PROJECT_ID}/locations/{LOCATIONS}/reasoningEngines/{ID}`",
  ).optional(),
  authProviderId: z.string().describe(
    "Required. The ID to use for the AuthProvider, which will become the final segment of the AuthProvider's resource name. This value should be 1-63 characters, and valid characters are /a-z-/. The first character must be a lowercase letter, and the last character must be a lowercase letter or a number.",
  ).optional(),
  requestId: z.string().describe(
    "Optional. An optional request ID to identify requests. Specify a unique request ID so that if you must retry your request, the server will know to ignore the request if it has already been completed. The server will guarantee that for at least 60 minutes since the first request. For example, consider a situation where you make an initial request and the request times out. If you make the request again with the same request ID, the server can check if original operation with the same request ID was received, and if so, will ignore the second request. This prevents clients from accidentally creating duplicate commitments. The request ID must be a valid UUID with the exception that zero UUID is not supported (00000000-0000-0000-0000-000000000000).",
  ).optional(),
  location: z.string().describe(
    "The location for this resource (e.g., 'us', 'us-central1', 'europe-west1')",
  ).optional(),
});

const _credentialKeys = new Set([
  "accessToken",
  "credentialsJson",
  "project",
  "scopes",
  "quotaProject",
]);

function _buildGcpCredentials(
  g: Record<string, unknown>,
): ExplicitGcpCredentials {
  return {
    accessToken: g.accessToken as string | undefined,
    credentialsJson: g.credentialsJson as string | undefined,
    project: g.project as string | undefined,
    scopes: typeof g.scopes === "string"
      ? g.scopes.split(",").map((s: string) => s.trim())
      : undefined,
    quotaProject: g.quotaProject as string | undefined,
  };
}

/** Swamp extension model for Google Cloud Agent Identity AuthProviders. Registered at `@swamp/gcp/agentidentity/authproviders`. */
export const model = {
  type: "@swamp/gcp/agentidentity/authproviders",
  version: "2026.07.29.1",
  upgrades: [
    {
      toVersion: "2026.07.29.1",
      description: "No schema changes",
      upgradeAttributes: (old: Record<string, unknown>) => old,
    },
  ],
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Message describing AuthProvider object",
      schema: StateSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    create: {
      description: "Create a authProviders",
      arguments: z.object({
        waitForReady: z.boolean().describe(
          "Wait for the resource to reach a ready state after creation (default: true)",
        ).optional(),
      }),
      execute: async (args: { waitForReady?: boolean }, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        params["parent"] = `projects/${projectId}/locations/${
          String(g["location"] ?? "")
        }`;
        const body: Record<string, unknown> = {};
        if (g["allowedScopes"] !== undefined) {
          body["allowedScopes"] = g["allowedScopes"];
        }
        if (g["authProviderTypeParams"] !== undefined) {
          body["authProviderTypeParams"] = g["authProviderTypeParams"];
        }
        if (g["blockedScopes"] !== undefined) {
          body["blockedScopes"] = g["blockedScopes"];
        }
        if (g["description"] !== undefined) {
          body["description"] = g["description"];
        }
        if (g["labels"] !== undefined) body["labels"] = g["labels"];
        if (g["name"] !== undefined) body["name"] = g["name"];
        if (g["workloadIds"] !== undefined) {
          body["workloadIds"] = g["workloadIds"];
        }
        if (g["authProviderId"] !== undefined) {
          params["authProviderId"] = String(g["authProviderId"]);
        }
        if (g["requestId"] !== undefined) {
          params["requestId"] = String(g["requestId"]);
        }
        if (g["name"] !== undefined) {
          params["name"] = buildResourceName(
            `projects/${projectId}/locations/${String(g["location"] ?? "")}`,
            String(g["name"]),
          );
        }
        const result = await createResource(
          BASE_URL,
          INSERT_CONFIG,
          params,
          body,
          GET_CONFIG,
          (args.waitForReady ?? true)
            ? {
              "statusField": "state",
              "readyValues": ["ENABLED"],
              "failedValues": [],
            }
            : undefined,
          {
            listConfig: LIST_CONFIG,
            listParams: {
              "parent": `projects/${projectId}/locations/${
                String(g["location"] ?? "")
              }`,
            },
            matchField: "name",
            matchValue: String(g["name"] ?? ""),
          },
          credentials,
        ) as StateData;
        const instanceName = ((g.name ?? result.name)?.toString() ?? "current")
          .replace(/[\/\\]/g, "_").replace(/\.\./g, "_").replace(/\0/g, "");
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    get: {
      description: "Get a authProviders",
      arguments: z.object({
        identifier: z.string().describe("The name of the authProviders"),
      }),
      execute: async (args: { identifier: string }, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        params["name"] = buildResourceName(
          `projects/${projectId}/locations/${String(g["location"] ?? "")}`,
          args.identifier,
        );
        const result = await readResource(
          BASE_URL,
          GET_CONFIG,
          params,
          credentials,
        ) as StateData;
        const instanceName =
          ((g.name ?? result.name)?.toString() ?? args.identifier).replace(
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
      description: "Update authProviders attributes",
      arguments: z.object({
        identifier: z.string().describe(
          "Target a specific authProviders by name (e.g. one discovered by list)",
        ).optional(),
        waitForReady: z.boolean().describe(
          "Wait for the resource to reach a ready state after update (default: true)",
        ).optional(),
      }),
      execute: async (
        args: { identifier?: string; waitForReady?: boolean },
        context: any,
      ) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
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
          throw new Error(
            "No existing state found - run create, get, or list first",
          );
        }
        const existing = JSON.parse(new TextDecoder().decode(content));
        const params: Record<string, string> = { project: projectId };
        const existingName = existing["name"]?.toString();
        if (existingName && existingName.includes("/")) {
          params["name"] = existingName;
        } else {
          params["name"] = buildResourceName(
            `projects/${projectId}/locations/${String(g["location"] ?? "")}`,
            existingName ?? g["name"]?.toString() ?? "",
          );
        }
        const body: Record<string, unknown> = {};
        if (g["allowedScopes"] !== undefined) {
          body["allowedScopes"] = g["allowedScopes"];
        }
        if (g["authProviderTypeParams"] !== undefined) {
          body["authProviderTypeParams"] = g["authProviderTypeParams"];
        }
        if (g["blockedScopes"] !== undefined) {
          body["blockedScopes"] = g["blockedScopes"];
        }
        if (g["description"] !== undefined) {
          body["description"] = g["description"];
        }
        if (g["labels"] !== undefined) body["labels"] = g["labels"];
        if (g["workloadIds"] !== undefined) {
          body["workloadIds"] = g["workloadIds"];
        }
        const updateMaskKeys = Object.keys(body);
        if (updateMaskKeys.length > 0) {
          params["updateMask"] = updateMaskKeys.join(",");
        }
        for (const key of Object.keys(existing)) {
          if (
            key === "fingerprint" || key === "labelFingerprint" ||
            key === "etag" || key.endsWith("Fingerprint")
          ) {
            body[key] = existing[key];
          }
        }
        const result = await updateResource(
          BASE_URL,
          PATCH_CONFIG,
          params,
          body,
          GET_CONFIG,
          (args.waitForReady ?? true)
            ? {
              "statusField": "state",
              "readyValues": ["ENABLED"],
              "failedValues": [],
            }
            : undefined,
          credentials,
        ) as StateData;
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    delete: {
      description: "Delete the authProviders",
      arguments: z.object({
        identifier: z.string().describe("The name of the authProviders"),
      }),
      execute: async (args: { identifier: string }, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        params["name"] = buildResourceName(
          `projects/${projectId}/locations/${String(g["location"] ?? "")}`,
          args.identifier,
        );
        const { existed } = await deleteResource(
          BASE_URL,
          DELETE_CONFIG,
          params,
          credentials,
        );
        const instanceName = (g.name?.toString() ?? args.identifier).replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const handle = await context.writeResource("state", instanceName, {
          identifier: args.identifier,
          existed,
          status: existed ? "deleted" : "not_found",
          deletedAt: new Date().toISOString(),
        });
        return { dataHandles: [handle] };
      },
    },
    sync: {
      description: "Sync authProviders state from GCP",
      arguments: z.object({
        identifier: z.string().describe(
          "Target a specific authProviders by name (e.g. one discovered by list)",
        ).optional(),
      }),
      execute: async (args: { identifier?: string }, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
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
          throw new Error(
            "No existing state found - run create, get, or list first",
          );
        }
        const existing = JSON.parse(new TextDecoder().decode(content));
        try {
          const params: Record<string, string> = { project: projectId };
          const existingName = existing.name?.toString();
          if (existingName && existingName.includes("/")) {
            params["name"] = existingName;
          } else {
            const shortName = existingName ?? g["name"]?.toString();
            if (!shortName) throw new Error("No identifier found");
            params["name"] = buildResourceName(
              `projects/${projectId}/locations/${String(g["location"] ?? "")}`,
              shortName,
            );
          }
          const result = await readResource(
            BASE_URL,
            GET_CONFIG,
            params,
            credentials,
          ) as StateData;
          const handle = await context.writeResource(
            "state",
            instanceName,
            result,
          );
          return { dataHandles: [handle] };
        } catch (error: unknown) {
          if (isResourceNotFoundError(error)) {
            const handle = await context.writeResource("state", instanceName, {
              status: "not_found",
              syncedAt: new Date().toISOString(),
            });
            return { dataHandles: [handle] };
          }
          throw error;
        }
      },
    },
    list: {
      description: "List authProviders resources",
      arguments: z.object({
        filter: z.string().describe(
          "Optional. Filter results. This field is currently ignored.",
        ).optional(),
        orderBy: z.string().describe(
          "Optional. Currently ignored. Defaults to ordering by auth_provider_id in ascending order.",
        ).optional(),
        pageSize: z.number().describe(
          "Optional. Requested page size. Server may return fewer items than requested. If unspecified, server will pick an appropriate default.",
        ).optional(),
        showDeleted: z.boolean().describe(
          "Optional. Deleted auth_providers will be kept with a soft-delete for 30 days before being purged. If this field is set to true, deleted auth_providers will also be returned.",
        ).optional(),
        maxPages: z.number().describe(
          "Maximum number of pages to fetch (default: 10)",
        ).optional(),
      }),
      execute: async (args: Record<string, unknown>, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        params["parent"] = `projects/${projectId}/locations/${
          String(g["location"] ?? "")
        }`;
        if (args["filter"] !== undefined) {
          params["filter"] = String(args["filter"]);
        }
        if (args["orderBy"] !== undefined) {
          params["orderBy"] = String(args["orderBy"]);
        }
        if (args["pageSize"] !== undefined) {
          params["pageSize"] = String(args["pageSize"]);
        }
        if (args["showDeleted"] !== undefined) {
          params["showDeleted"] = String(args["showDeleted"]);
        }
        const { items, nextPageToken } = await listResources(
          BASE_URL,
          LIST_CONFIG,
          params,
          "authProviders",
          (args.maxPages as number | undefined) ?? 10,
          credentials,
        );
        const dataHandles = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i] as StateData;
          const instanceName = (item.name?.toString() ?? String(i)).replace(
            /[\/\\]/g,
            "_",
          ).replace(/\.\./g, "_").replace(/\0/g, "");
          const handle = await context.writeResource(
            "state",
            instanceName,
            item,
          );
          dataHandles.push(handle);
        }
        return { dataHandles, result: { count: items.length, nextPageToken } };
      },
    },
    disable: {
      description: "disable",
      arguments: z.object({
        requestId: z.any().optional(),
      }),
      execute: async (args: Record<string, unknown>, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        if (g["name"] !== undefined) {
          params["name"] = buildResourceName(
            `projects/${projectId}/locations/${String(g["location"] ?? "")}`,
            String(g["name"]),
          );
        }
        const body: Record<string, unknown> = {};
        if (args["requestId"] !== undefined) {
          body["requestId"] = args["requestId"];
        }
        const result = await createResource(
          BASE_URL,
          {
            "id": "agentidentity.projects.locations.authProviders.disable",
            "path": "v1/{+name}:disable",
            "httpMethod": "POST",
            "parameterOrder": ["name"],
            "parameters": { "name": { "location": "path", "required": true } },
          },
          params,
          body,
          undefined,
          undefined,
          undefined,
          credentials,
        );
        return { result };
      },
    },
    enable: {
      description: "enable",
      arguments: z.object({
        requestId: z.any().optional(),
      }),
      execute: async (args: Record<string, unknown>, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        if (g["name"] !== undefined) {
          params["name"] = buildResourceName(
            `projects/${projectId}/locations/${String(g["location"] ?? "")}`,
            String(g["name"]),
          );
        }
        const body: Record<string, unknown> = {};
        if (args["requestId"] !== undefined) {
          body["requestId"] = args["requestId"];
        }
        const result = await createResource(
          BASE_URL,
          {
            "id": "agentidentity.projects.locations.authProviders.enable",
            "path": "v1/{+name}:enable",
            "httpMethod": "POST",
            "parameterOrder": ["name"],
            "parameters": { "name": { "location": "path", "required": true } },
          },
          params,
          body,
          undefined,
          undefined,
          undefined,
          credentials,
        );
        return { result };
      },
    },
    get_iam_policy: {
      description: "get iam policy",
      arguments: z.object({}),
      execute: async (_args: Record<string, unknown>, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        const content = await context.dataRepository.getContent(
          context.modelType,
          context.modelId,
          (g.name?.toString() ?? "current").replace(/[\/\\]/g, "_").replace(
            /\.\./g,
            "_",
          ).replace(/\0/g, ""),
        );
        if (!content) {
          throw new Error("No existing state found - run create or get first");
        }
        const existing = JSON.parse(new TextDecoder().decode(content));
        params["resource"] = existing["name"]?.toString() ??
          g["name"]?.toString() ?? "";
        const result = await createResource(
          BASE_URL,
          {
            "id": "agentidentity.projects.locations.authProviders.getIamPolicy",
            "path": "v1/{+resource}:getIamPolicy",
            "httpMethod": "GET",
            "parameterOrder": ["resource"],
            "parameters": {
              "options.requestedPolicyVersion": { "location": "query" },
              "resource": { "location": "path", "required": true },
            },
          },
          params,
          undefined,
          undefined,
          undefined,
          undefined,
          credentials,
        );
        return { result };
      },
    },
    query: {
      description: "query",
      arguments: z.object({}),
      execute: async (_args: Record<string, unknown>, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        params["parent"] = `projects/${projectId}/locations/${
          String(g["location"] ?? "")
        }`;
        const result = await createResource(
          BASE_URL,
          {
            "id": "agentidentity.projects.locations.authProviders.query",
            "path": "v1/{+parent}/authProviders:query",
            "httpMethod": "GET",
            "parameterOrder": ["parent"],
            "parameters": {
              "pageSize": { "location": "query" },
              "pageToken": { "location": "query" },
              "parent": { "location": "path", "required": true },
              "workloadId": { "location": "query" },
            },
          },
          params,
          undefined,
          undefined,
          undefined,
          undefined,
          credentials,
        );
        return { result };
      },
    },
    query_workloads: {
      description: "query workloads",
      arguments: z.object({}),
      execute: async (_args: Record<string, unknown>, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        if (g["name"] !== undefined) {
          params["name"] = buildResourceName(
            `projects/${projectId}/locations/${String(g["location"] ?? "")}`,
            String(g["name"]),
          );
        }
        const result = await createResource(
          BASE_URL,
          {
            "id":
              "agentidentity.projects.locations.authProviders.queryWorkloads",
            "path": "v1/{+name}:queryWorkloads",
            "httpMethod": "GET",
            "parameterOrder": ["name"],
            "parameters": {
              "name": { "location": "path", "required": true },
              "pageSize": { "location": "query" },
              "pageToken": { "location": "query" },
            },
          },
          params,
          undefined,
          undefined,
          undefined,
          undefined,
          credentials,
        );
        return { result };
      },
    },
    revoke_authorization: {
      description: "revoke authorization",
      arguments: z.object({
        userId: z.any().optional(),
      }),
      execute: async (args: Record<string, unknown>, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        if (g["name"] !== undefined) {
          params["name"] = buildResourceName(
            `projects/${projectId}/locations/${String(g["location"] ?? "")}`,
            String(g["name"]),
          );
        }
        const body: Record<string, unknown> = {};
        if (args["userId"] !== undefined) body["userId"] = args["userId"];
        const result = await createResource(
          BASE_URL,
          {
            "id":
              "agentidentity.projects.locations.authProviders.revokeAuthorization",
            "path": "v1/{+name}:revokeAuthorization",
            "httpMethod": "POST",
            "parameterOrder": ["name"],
            "parameters": { "name": { "location": "path", "required": true } },
          },
          params,
          body,
          undefined,
          undefined,
          undefined,
          credentials,
        );
        return { result };
      },
    },
    set_iam_policy: {
      description: "set iam policy",
      arguments: z.object({
        policy: z.any().optional(),
        updateMask: z.any().optional(),
      }),
      execute: async (args: Record<string, unknown>, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        const content = await context.dataRepository.getContent(
          context.modelType,
          context.modelId,
          (g.name?.toString() ?? "current").replace(/[\/\\]/g, "_").replace(
            /\.\./g,
            "_",
          ).replace(/\0/g, ""),
        );
        if (!content) {
          throw new Error("No existing state found - run create or get first");
        }
        const existing = JSON.parse(new TextDecoder().decode(content));
        params["resource"] = existing["name"]?.toString() ??
          g["name"]?.toString() ?? "";
        const body: Record<string, unknown> = {};
        if (args["policy"] !== undefined) body["policy"] = args["policy"];
        if (args["updateMask"] !== undefined) {
          body["updateMask"] = args["updateMask"];
        }
        const result = await createResource(
          BASE_URL,
          {
            "id": "agentidentity.projects.locations.authProviders.setIamPolicy",
            "path": "v1/{+resource}:setIamPolicy",
            "httpMethod": "POST",
            "parameterOrder": ["resource"],
            "parameters": {
              "resource": { "location": "path", "required": true },
            },
          },
          params,
          body,
          undefined,
          undefined,
          undefined,
          credentials,
        );
        return { result };
      },
    },
    test_iam_permissions: {
      description: "test iam permissions",
      arguments: z.object({
        permissions: z.any().optional(),
      }),
      execute: async (args: Record<string, unknown>, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        const content = await context.dataRepository.getContent(
          context.modelType,
          context.modelId,
          (g.name?.toString() ?? "current").replace(/[\/\\]/g, "_").replace(
            /\.\./g,
            "_",
          ).replace(/\0/g, ""),
        );
        if (!content) {
          throw new Error("No existing state found - run create or get first");
        }
        const existing = JSON.parse(new TextDecoder().decode(content));
        params["resource"] = existing["name"]?.toString() ??
          g["name"]?.toString() ?? "";
        const body: Record<string, unknown> = {};
        if (args["permissions"] !== undefined) {
          body["permissions"] = args["permissions"];
        }
        const result = await createResource(
          BASE_URL,
          {
            "id":
              "agentidentity.projects.locations.authProviders.testIamPermissions",
            "path": "v1/{+resource}:testIamPermissions",
            "httpMethod": "POST",
            "parameterOrder": ["resource"],
            "parameters": {
              "resource": { "location": "path", "required": true },
            },
          },
          params,
          body,
          undefined,
          undefined,
          undefined,
          credentials,
        );
        return { result };
      },
    },
    undelete: {
      description: "undelete",
      arguments: z.object({
        requestId: z.any().optional(),
      }),
      execute: async (args: Record<string, unknown>, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        if (g["name"] !== undefined) {
          params["name"] = buildResourceName(
            `projects/${projectId}/locations/${String(g["location"] ?? "")}`,
            String(g["name"]),
          );
        }
        const body: Record<string, unknown> = {};
        if (args["requestId"] !== undefined) {
          body["requestId"] = args["requestId"];
        }
        const result = await createResource(
          BASE_URL,
          {
            "id": "agentidentity.projects.locations.authProviders.undelete",
            "path": "v1/{+name}:undelete",
            "httpMethod": "POST",
            "parameterOrder": ["name"],
            "parameters": { "name": { "location": "path", "required": true } },
          },
          params,
          body,
          undefined,
          undefined,
          undefined,
          credentials,
        );
        return { result };
      },
    },
  },
};

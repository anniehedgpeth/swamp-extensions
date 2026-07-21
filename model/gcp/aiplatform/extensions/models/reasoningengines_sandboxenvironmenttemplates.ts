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

// Auto-generated extension model for @swamp/gcp/aiplatform/reasoningengines-sandboxenvironmenttemplates
// Do not edit manually. Re-generate with: deno task generate:gcp

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for Google Cloud Agent Platform ReasoningEngines.SandboxEnvironmentTemplates.
 *
 * The specification of a SandboxEnvironmentTemplate. A SandboxEnvironmentTemplate defines a template for creating SandboxEnvironments.
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
} from "./_lib/gcp.ts";

/** Construct the fully-qualified resource name from parent and short name. */
function buildResourceName(parent: string, shortName: string): string {
  return `${parent}/sandboxEnvironmentTemplates/${shortName}`;
}

const BASE_URL = "https://aiplatform.googleapis.com/";

const GET_CONFIG = {
  "id":
    "aiplatform.projects.locations.reasoningEngines.sandboxEnvironmentTemplates.get",
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
  "id":
    "aiplatform.projects.locations.reasoningEngines.sandboxEnvironmentTemplates.create",
  "path": "v1/{+parent}/sandboxEnvironmentTemplates",
  "httpMethod": "POST",
  "parameterOrder": [
    "parent",
  ],
  "parameters": {
    "parent": {
      "location": "path",
      "required": true,
    },
  },
} as const;

const DELETE_CONFIG = {
  "id":
    "aiplatform.projects.locations.reasoningEngines.sandboxEnvironmentTemplates.delete",
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
  },
} as const;

const LIST_CONFIG = {
  "id":
    "aiplatform.projects.locations.reasoningEngines.sandboxEnvironmentTemplates.list",
  "path": "v1/{+parent}/sandboxEnvironmentTemplates",
  "httpMethod": "GET",
  "parameterOrder": [
    "parent",
  ],
  "parameters": {
    "filter": {
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
  customContainerEnvironment: z.object({
    customContainerSpec: z.object({
      imageUri: z.string().describe(
        "Required. The Artifact Registry Docker image URI (e.g., us-central1-docker.pkg.dev/my-project/my-repo/my-image:tag) of the container image that is to be run on each worker replica.",
      ).optional(),
    }).describe("The specification of the custom container environment.")
      .optional(),
    ports: z.array(z.object({
      port: z.number().int().describe(
        "Optional. Port number to expose. This must be a valid port number, between 1 and 65535.",
      ).optional(),
      protocol: z.enum(["PROTOCOL_UNSPECIFIED", "TCP", "UDP"]).describe(
        "Optional. Protocol for port. Defaults to TCP if not specified.",
      ).optional(),
    })).describe("Ports to expose from the container.").optional(),
    resources: z.object({
      limits: z.record(z.string(), z.string()).describe(
        'Optional. The maximum amounts of compute resources allowed. Keys are resource names (e.g., "cpu", "memory"). Values are quantities (e.g., "500m", "1Gi").',
      ).optional(),
      requests: z.record(z.string(), z.string()).describe(
        'Optional. The requested amounts of compute resources. Keys are resource names (e.g., "cpu", "memory"). Values are quantities (e.g., "250m", "512Mi").',
      ).optional(),
    }).describe("Resource requests and limits for the container.").optional(),
  }).describe("The sandbox environment for custom container workloads.")
    .optional(),
  defaultContainerEnvironment: z.object({
    defaultContainerCategory: z.enum([
      "DEFAULT_CONTAINER_CATEGORY_UNSPECIFIED",
      "DEFAULT_CONTAINER_CATEGORY_COMPUTER_USE",
    ]).describe("Required. The category of the default container image.")
      .optional(),
    resources: z.object({
      limits: z.record(z.string(), z.string()).describe(
        'Optional. The maximum amounts of compute resources allowed. Keys are resource names (e.g., "cpu", "memory"). Values are quantities (e.g., "500m", "1Gi").',
      ).optional(),
      requests: z.record(z.string(), z.string()).describe(
        'Optional. The requested amounts of compute resources. Keys are resource names (e.g., "cpu", "memory"). Values are quantities (e.g., "250m", "512Mi").',
      ).optional(),
    }).describe(
      "Optional. Resource requests and limits for the default container.",
    ).optional(),
  }).describe("The sandbox environment for default container workloads.")
    .optional(),
  displayName: z.string().describe(
    "Required. The display name of the SandboxEnvironmentTemplate.",
  ).optional(),
  egressControlConfig: z.object({
    internetAccess: z.boolean().describe(
      "Optional. Whether to allow internet access.",
    ).optional(),
  }).describe(
    "Optional. The configuration for egress control of this template.",
  ).optional(),
  name: z.string().describe(
    "Identifier. The resource name of the SandboxEnvironmentTemplate. Format: `projects/{project}/locations/{location}/reasoningEngines/{reasoning_engine}/sandboxEnvironmentTemplates/{sandbox_environment_template}`",
  ).optional(),
  parent: z.string().describe(
    "The parent resource name (e.g., projects/my-project/locations/us-central1, organizations/123, folders/456)",
  ).optional(),
  location: z.string().describe(
    "The location for this resource (e.g., 'us', 'us-central1', 'europe-west1')",
  ).optional(),
});

const StateSchema = z.object({
  createTime: z.string().optional(),
  customContainerEnvironment: z.object({
    customContainerSpec: z.object({
      imageUri: z.string(),
    }),
    ports: z.array(z.object({
      port: z.number(),
      protocol: z.string(),
    })),
    resources: z.object({
      limits: z.record(z.string(), z.unknown()),
      requests: z.record(z.string(), z.unknown()),
    }),
  }).optional(),
  defaultContainerEnvironment: z.object({
    defaultContainerCategory: z.string(),
    resources: z.object({
      limits: z.record(z.string(), z.unknown()),
      requests: z.record(z.string(), z.unknown()),
    }),
  }).optional(),
  displayName: z.string().optional(),
  egressControlConfig: z.object({
    internetAccess: z.boolean(),
  }).optional(),
  name: z.string(),
  state: z.string().optional(),
  updateTime: z.string().optional(),
}).passthrough();

type StateData = z.infer<typeof StateSchema>;

const InputsSchema = z.object({
  accessToken: z.string().meta({ sensitive: true }).optional(),
  credentialsJson: z.string().meta({ sensitive: true }).optional(),
  project: z.string().optional(),
  scopes: z.string().optional(),
  customContainerEnvironment: z.object({
    customContainerSpec: z.object({
      imageUri: z.string().describe(
        "Required. The Artifact Registry Docker image URI (e.g., us-central1-docker.pkg.dev/my-project/my-repo/my-image:tag) of the container image that is to be run on each worker replica.",
      ).optional(),
    }).describe("The specification of the custom container environment.")
      .optional(),
    ports: z.array(z.object({
      port: z.number().int().describe(
        "Optional. Port number to expose. This must be a valid port number, between 1 and 65535.",
      ).optional(),
      protocol: z.enum(["PROTOCOL_UNSPECIFIED", "TCP", "UDP"]).describe(
        "Optional. Protocol for port. Defaults to TCP if not specified.",
      ).optional(),
    })).describe("Ports to expose from the container.").optional(),
    resources: z.object({
      limits: z.record(z.string(), z.string()).describe(
        'Optional. The maximum amounts of compute resources allowed. Keys are resource names (e.g., "cpu", "memory"). Values are quantities (e.g., "500m", "1Gi").',
      ).optional(),
      requests: z.record(z.string(), z.string()).describe(
        'Optional. The requested amounts of compute resources. Keys are resource names (e.g., "cpu", "memory"). Values are quantities (e.g., "250m", "512Mi").',
      ).optional(),
    }).describe("Resource requests and limits for the container.").optional(),
  }).describe("The sandbox environment for custom container workloads.")
    .optional(),
  defaultContainerEnvironment: z.object({
    defaultContainerCategory: z.enum([
      "DEFAULT_CONTAINER_CATEGORY_UNSPECIFIED",
      "DEFAULT_CONTAINER_CATEGORY_COMPUTER_USE",
    ]).describe("Required. The category of the default container image.")
      .optional(),
    resources: z.object({
      limits: z.record(z.string(), z.string()).describe(
        'Optional. The maximum amounts of compute resources allowed. Keys are resource names (e.g., "cpu", "memory"). Values are quantities (e.g., "500m", "1Gi").',
      ).optional(),
      requests: z.record(z.string(), z.string()).describe(
        'Optional. The requested amounts of compute resources. Keys are resource names (e.g., "cpu", "memory"). Values are quantities (e.g., "250m", "512Mi").',
      ).optional(),
    }).describe(
      "Optional. Resource requests and limits for the default container.",
    ).optional(),
  }).describe("The sandbox environment for default container workloads.")
    .optional(),
  displayName: z.string().describe(
    "Required. The display name of the SandboxEnvironmentTemplate.",
  ).optional(),
  egressControlConfig: z.object({
    internetAccess: z.boolean().describe(
      "Optional. Whether to allow internet access.",
    ).optional(),
  }).describe(
    "Optional. The configuration for egress control of this template.",
  ).optional(),
  name: z.string().describe(
    "Identifier. The resource name of the SandboxEnvironmentTemplate. Format: `projects/{project}/locations/{location}/reasoningEngines/{reasoning_engine}/sandboxEnvironmentTemplates/{sandbox_environment_template}`",
  ).optional(),
  parent: z.string().describe(
    "The parent resource name (e.g., projects/my-project/locations/us-central1, organizations/123, folders/456)",
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
  };
}

/** Swamp extension model for Google Cloud Agent Platform ReasoningEngines.SandboxEnvironmentTemplates. Registered at `@swamp/gcp/aiplatform/reasoningengines-sandboxenvironmenttemplates`. */
export const model = {
  type: "@swamp/gcp/aiplatform/reasoningengines-sandboxenvironmenttemplates",
  version: "2026.07.21.1",
  upgrades: [
    {
      toVersion: "2026.07.21.1",
      description: "No schema changes",
      upgradeAttributes: (old: Record<string, unknown>) => old,
    },
  ],
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description:
        "The specification of a SandboxEnvironmentTemplate. A SandboxEnvironmentTempla...",
      schema: StateSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    create: {
      description: "Create a sandboxEnvironmentTemplates",
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
        if (g["parent"] !== undefined) params["parent"] = String(g["parent"]);
        const body: Record<string, unknown> = {};
        if (g["customContainerEnvironment"] !== undefined) {
          body["customContainerEnvironment"] = g["customContainerEnvironment"];
        }
        if (g["defaultContainerEnvironment"] !== undefined) {
          body["defaultContainerEnvironment"] =
            g["defaultContainerEnvironment"];
        }
        if (g["displayName"] !== undefined) {
          body["displayName"] = g["displayName"];
        }
        if (g["egressControlConfig"] !== undefined) {
          body["egressControlConfig"] = g["egressControlConfig"];
        }
        if (g["name"] !== undefined) body["name"] = g["name"];
        if (g["parent"] !== undefined && g["name"] !== undefined) {
          params["name"] = buildResourceName(
            String(g["parent"]),
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
              "readyValues": ["ACTIVE"],
              "failedValues": ["FAILED"],
            }
            : undefined,
          {
            listConfig: LIST_CONFIG,
            listParams: {
              "parent": String(body["parent"] ?? g["parent"] ?? ""),
            },
            matchField: "displayName",
            matchValue: String(g["displayName"] ?? ""),
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
      description: "Get a sandboxEnvironmentTemplates",
      arguments: z.object({
        identifier: z.string().describe(
          "The name of the sandboxEnvironmentTemplates",
        ),
      }),
      execute: async (args: { identifier: string }, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        params["name"] = buildResourceName(
          String(g["parent"] ?? ""),
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
    delete: {
      description: "Delete the sandboxEnvironmentTemplates",
      arguments: z.object({
        identifier: z.string().describe(
          "The name of the sandboxEnvironmentTemplates",
        ),
      }),
      execute: async (args: { identifier: string }, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildGcpCredentials(g);
        const projectId = await getProjectId(credentials);
        const params: Record<string, string> = { project: projectId };
        params["name"] = buildResourceName(
          String(g["parent"] ?? ""),
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
      description: "Sync sandboxEnvironmentTemplates state from GCP",
      arguments: z.object({
        identifier: z.string().describe(
          "Target a specific sandboxEnvironmentTemplates by name (e.g. one discovered by list)",
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
              String(g["parent"] ?? ""),
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
      description: "List sandboxEnvironmentTemplates resources",
      arguments: z.object({
        filter: z.string().describe(
          "Optional. The standard list filter. More detail in [AIP-160](https://google.aip.dev/160).",
        ).optional(),
        pageSize: z.number().describe(
          "Optional. The maximum number of SandboxEnvironmentTemplates to return. The service may return fewer than this value. If unspecified, at most 100 SandboxEnvironmentTemplates will be returned.",
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
        if (g["parent"] !== undefined) params["parent"] = String(g["parent"]);
        if (args["filter"] !== undefined) {
          params["filter"] = String(args["filter"]);
        }
        if (args["pageSize"] !== undefined) {
          params["pageSize"] = String(args["pageSize"]);
        }
        const { items, nextPageToken } = await listResources(
          BASE_URL,
          LIST_CONFIG,
          params,
          "sandboxEnvironmentTemplates",
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
  },
};

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

// Auto-generated extension model for @swamp/aws/codeartifact/package
// Do not edit manually. Re-generate with: deno task generate:aws

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for CodeArtifact Package (AWS::CodeArtifact::Package).
 *
 * Wraps the CloudFormation resource type as a swamp model so create,
 * get, update, delete, and sync can be driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { isResourceNotFoundError, readResource } from "./_lib/aws.ts";
import type { AwsCredentials } from "./_lib/aws.ts";

const GlobalArgsSchema = z.object({
  name: z.string().describe(
    "Instance name for this resource (used as the unique identifier in the factory pattern)",
  ),
  accessKeyId: z.string().meta({ sensitive: true }).describe(
    "AWS access key ID; overrides AWS_ACCESS_KEY_ID environment variable. Wire with a vault.get(...) expression to source it from a vault.",
  ).optional(),
  secretAccessKey: z.string().meta({ sensitive: true }).describe(
    "AWS secret access key; overrides AWS_SECRET_ACCESS_KEY environment variable. Wire with a vault.get(...) expression to source it from a vault.",
  ).optional(),
  sessionToken: z.string().meta({ sensitive: true }).describe(
    "AWS session token for temporary credentials; overrides AWS_SESSION_TOKEN environment variable. Wire with a vault.get(...) expression to source it from a vault.",
  ).optional(),
  region: z.string().describe(
    "AWS region; overrides AWS_REGION / AWS_DEFAULT_REGION environment variables and ~/.aws/config profile region. Defaults to us-east-1.",
  ).optional(),
  DomainName: z.string().min(2).max(50).regex(
    new RegExp("^[a-z][a-z0-9\\-]{0,48}[a-z0-9]$"),
  ).describe(
    "The name of the domain that contains the repository that contains the package.",
  ),
  Repository: z.string().min(2).max(100).regex(
    new RegExp("^[A-Za-z0-9][A-Za-z0-9._\\-]{1,99}$"),
  ).describe("The name of the repository that contains the package."),
  Format: z.enum([
    "npm",
    "pypi",
    "maven",
    "nuget",
    "generic",
    "ruby",
    "swift",
    "cargo",
  ]).describe("The format of the package."),
  Namespace: z.string().min(1).max(255).regex(new RegExp("^[^#/\\s]+$"))
    .describe("The namespace of the package.").optional(),
  Name: z.string().min(1).max(255).regex(new RegExp("^[^#/\\s]+$")).describe(
    "The name of the package.",
  ),
  OriginConfiguration: z.object({
    Restrictions: z.object({
      Publish: z.enum(["ALLOW", "BLOCK"]).describe(
        "The package origin configuration that determines if new versions of the package can be published directly to the repository.",
      ).optional(),
      Upstream: z.enum(["ALLOW", "BLOCK"]).describe(
        "The package origin configuration that determines if new versions of the package can be added to the repository from an external connection or upstream source.",
      ).optional(),
    }).describe("The origin restrictions for the package.").optional(),
  }).describe("The package origin configuration for the package.").optional(),
});

const StateSchema = z.object({
  Arn: z.string(),
  DomainName: z.string().optional(),
  Repository: z.string().optional(),
  Format: z.string().optional(),
  Namespace: z.string().optional(),
  Name: z.string().optional(),
  OriginConfiguration: z.object({
    Restrictions: z.object({
      Publish: z.string(),
      Upstream: z.string(),
    }),
  }).optional(),
}).passthrough();

type StateData = z.infer<typeof StateSchema>;

const InputsSchema = z.object({
  name: z.string().optional(),
  accessKeyId: z.string().meta({ sensitive: true }).optional(),
  secretAccessKey: z.string().meta({ sensitive: true }).optional(),
  sessionToken: z.string().meta({ sensitive: true }).optional(),
  region: z.string().optional(),
  DomainName: z.string().min(2).max(50).regex(
    new RegExp("^[a-z][a-z0-9\\-]{0,48}[a-z0-9]$"),
  ).describe(
    "The name of the domain that contains the repository that contains the package.",
  ).optional(),
  Repository: z.string().min(2).max(100).regex(
    new RegExp("^[A-Za-z0-9][A-Za-z0-9._\\-]{1,99}$"),
  ).describe("The name of the repository that contains the package.")
    .optional(),
  Format: z.enum([
    "npm",
    "pypi",
    "maven",
    "nuget",
    "generic",
    "ruby",
    "swift",
    "cargo",
  ]).describe("The format of the package.").optional(),
  Namespace: z.string().min(1).max(255).regex(new RegExp("^[^#/\\s]+$"))
    .describe("The namespace of the package.").optional(),
  Name: z.string().min(1).max(255).regex(new RegExp("^[^#/\\s]+$")).describe(
    "The name of the package.",
  ).optional(),
  OriginConfiguration: z.object({
    Restrictions: z.object({
      Publish: z.enum(["ALLOW", "BLOCK"]).describe(
        "The package origin configuration that determines if new versions of the package can be published directly to the repository.",
      ).optional(),
      Upstream: z.enum(["ALLOW", "BLOCK"]).describe(
        "The package origin configuration that determines if new versions of the package can be added to the repository from an external connection or upstream source.",
      ).optional(),
    }).describe("The origin restrictions for the package.").optional(),
  }).describe("The package origin configuration for the package.").optional(),
});

const _credentialKeys = new Set([
  "accessKeyId",
  "secretAccessKey",
  "sessionToken",
  "region",
]);

function _buildCredentials(g: Record<string, unknown>): AwsCredentials {
  return {
    accessKeyId: g.accessKeyId as string | undefined,
    secretAccessKey: g.secretAccessKey as string | undefined,
    sessionToken: g.sessionToken as string | undefined,
    region: g.region as string | undefined,
  };
}

/** Swamp extension model for CodeArtifact Package. Registered at `@swamp/aws/codeartifact/package`. */
export const model = {
  type: "@swamp/aws/codeartifact/package",
  version: "2026.07.24.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "CodeArtifact Package resource state",
      schema: StateSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    get: {
      description: "Get a CodeArtifact Package",
      arguments: z.object({
        identifier: z.string().describe(
          "The primary identifier of the CodeArtifact Package",
        ),
      }),
      execute: async (args: { identifier: string }, context: any) => {
        const credentials = _buildCredentials(context.globalArgs);
        const result = await readResource(
          "AWS::CodeArtifact::Package",
          args.identifier,
          credentials,
        ) as StateData;
        const instanceName =
          (context.globalArgs.name?.toString() ?? args.identifier).replace(
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
    sync: {
      description: "Sync CodeArtifact Package state from AWS",
      arguments: z.object({}),
      execute: async (_args: Record<string, never>, context: any) => {
        const g = context.globalArgs;
        const credentials = _buildCredentials(g);
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
          throw new Error("No existing state found - run create or get first");
        }
        const existing = JSON.parse(new TextDecoder().decode(content));
        const identifier = existing.Arn?.toString();
        if (!identifier) {
          throw new Error("No identifier found in existing state");
        }
        try {
          const result = await readResource(
            "AWS::CodeArtifact::Package",
            identifier,
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
              identifier,
              status: "not_found",
              syncedAt: new Date().toISOString(),
            });
            return { dataHandles: [handle] };
          }
          throw error;
        }
      },
    },
  },
};

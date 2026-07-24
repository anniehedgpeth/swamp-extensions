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

// Auto-generated extension model for @swamp/aws/mediapackage/harvest-job
// Do not edit manually. Re-generate with: deno task generate:aws

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for MediaPackage HarvestJob (AWS::MediaPackage::HarvestJob).
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
  EndTime: z.string().describe(
    "The end of the time-window which will be harvested.",
  ),
  Id: z.string().describe(
    "The ID of the HarvestJob. The ID must be unique within the region and it cannot be changed after the HarvestJob is submitted.",
  ),
  OriginEndpointId: z.string().describe(
    "The ID of the OriginEndpoint that the HarvestJob will harvest from.",
  ),
  S3Destination: z.object({
    BucketName: z.string().describe(
      "The name of an S3 bucket within which harvested content will be exported.",
    ),
    ManifestKey: z.string().describe(
      "The key in the specified S3 bucket where the harvested top-level manifest will be placed.",
    ),
    RoleArn: z.string().describe(
      "The IAM role used to write to the specified S3 bucket.",
    ),
  }).describe(
    "Configuration parameters for where in an S3 bucket to place the harvested content.",
  ),
  StartTime: z.string().describe(
    "The start of the time-window which will be harvested.",
  ),
});

const StateSchema = z.object({
  Arn: z.string(),
  ChannelId: z.string().optional(),
  CreatedAt: z.string().optional(),
  EndTime: z.string().optional(),
  Id: z.string().optional(),
  OriginEndpointId: z.string().optional(),
  S3Destination: z.object({
    BucketName: z.string(),
    ManifestKey: z.string(),
    RoleArn: z.string(),
  }).optional(),
  StartTime: z.string().optional(),
  Status: z.string().optional(),
}).passthrough();

type StateData = z.infer<typeof StateSchema>;

const InputsSchema = z.object({
  name: z.string().optional(),
  accessKeyId: z.string().meta({ sensitive: true }).optional(),
  secretAccessKey: z.string().meta({ sensitive: true }).optional(),
  sessionToken: z.string().meta({ sensitive: true }).optional(),
  region: z.string().optional(),
  EndTime: z.string().describe(
    "The end of the time-window which will be harvested.",
  ).optional(),
  Id: z.string().describe(
    "The ID of the HarvestJob. The ID must be unique within the region and it cannot be changed after the HarvestJob is submitted.",
  ).optional(),
  OriginEndpointId: z.string().describe(
    "The ID of the OriginEndpoint that the HarvestJob will harvest from.",
  ).optional(),
  S3Destination: z.object({
    BucketName: z.string().describe(
      "The name of an S3 bucket within which harvested content will be exported.",
    ).optional(),
    ManifestKey: z.string().describe(
      "The key in the specified S3 bucket where the harvested top-level manifest will be placed.",
    ).optional(),
    RoleArn: z.string().describe(
      "The IAM role used to write to the specified S3 bucket.",
    ).optional(),
  }).describe(
    "Configuration parameters for where in an S3 bucket to place the harvested content.",
  ).optional(),
  StartTime: z.string().describe(
    "The start of the time-window which will be harvested.",
  ).optional(),
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

/** Swamp extension model for MediaPackage HarvestJob. Registered at `@swamp/aws/mediapackage/harvest-job`. */
export const model = {
  type: "@swamp/aws/mediapackage/harvest-job",
  version: "2026.07.24.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "MediaPackage HarvestJob resource state",
      schema: StateSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    get: {
      description: "Get a MediaPackage HarvestJob",
      arguments: z.object({
        identifier: z.string().describe(
          "The primary identifier of the MediaPackage HarvestJob",
        ),
      }),
      execute: async (args: { identifier: string }, context: any) => {
        const credentials = _buildCredentials(context.globalArgs);
        const result = await readResource(
          "AWS::MediaPackage::HarvestJob",
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
      description: "Sync MediaPackage HarvestJob state from AWS",
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
            "AWS::MediaPackage::HarvestJob",
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

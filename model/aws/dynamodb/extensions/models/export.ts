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

// Auto-generated extension model for @swamp/aws/dynamodb/export
// Do not edit manually. Re-generate with: deno task generate:aws

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for DynamoDB Export (AWS::DynamoDB::Export).
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
  TableArn: z.string().min(1).max(1024).describe(
    "The Amazon Resource Name (ARN) of the table that was exported.",
  ),
  S3Bucket: z.string().max(255).regex(
    new RegExp("^[a-z0-9A-Z]+[\\.\\-\\w]*[a-z0-9A-Z]+$"),
  ).describe("The name of the Amazon S3 bucket containing the export."),
  S3BucketOwner: z.string().regex(new RegExp("^[0-9]{12}$")).describe(
    "The ID of the Amazon Web Services account that owns the bucket containing the export.",
  ).optional(),
  S3Prefix: z.string().max(1024).describe(
    "The Amazon S3 bucket prefix used as the file name and path of the exported snapshot.",
  ).optional(),
  S3SseAlgorithm: z.enum(["AES256", "KMS"]).describe(
    "Type of encryption used on the bucket where export data is stored.",
  ).optional(),
  ExportFormat: z.enum(["DYNAMODB_JSON", "ION"]).describe(
    "The format of the exported data.",
  ).optional(),
  ExportType: z.enum(["FULL_EXPORT", "INCREMENTAL_EXPORT"]).describe(
    "The type of export that was performed.",
  ).optional(),
});

const StateSchema = z.object({
  ExportArn: z.string(),
  TableName: z.string().optional(),
  ExportId: z.string().optional(),
  ExportStatus: z.string().optional(),
  TableArn: z.string().optional(),
  TableId: z.string().optional(),
  ExportTime: z.string().optional(),
  S3Bucket: z.string().optional(),
  S3BucketOwner: z.string().optional(),
  S3Prefix: z.string().optional(),
  S3SseAlgorithm: z.string().optional(),
  ExportFormat: z.string().optional(),
  ExportType: z.string().optional(),
  StartTime: z.string().optional(),
  EndTime: z.string().optional(),
  ExportManifest: z.string().optional(),
  BilledSizeBytes: z.number().optional(),
  ItemCount: z.number().optional(),
}).passthrough();

type StateData = z.infer<typeof StateSchema>;

const InputsSchema = z.object({
  name: z.string().optional(),
  accessKeyId: z.string().meta({ sensitive: true }).optional(),
  secretAccessKey: z.string().meta({ sensitive: true }).optional(),
  sessionToken: z.string().meta({ sensitive: true }).optional(),
  region: z.string().optional(),
  TableArn: z.string().min(1).max(1024).describe(
    "The Amazon Resource Name (ARN) of the table that was exported.",
  ).optional(),
  S3Bucket: z.string().max(255).regex(
    new RegExp("^[a-z0-9A-Z]+[\\.\\-\\w]*[a-z0-9A-Z]+$"),
  ).describe("The name of the Amazon S3 bucket containing the export.")
    .optional(),
  S3BucketOwner: z.string().regex(new RegExp("^[0-9]{12}$")).describe(
    "The ID of the Amazon Web Services account that owns the bucket containing the export.",
  ).optional(),
  S3Prefix: z.string().max(1024).describe(
    "The Amazon S3 bucket prefix used as the file name and path of the exported snapshot.",
  ).optional(),
  S3SseAlgorithm: z.enum(["AES256", "KMS"]).describe(
    "Type of encryption used on the bucket where export data is stored.",
  ).optional(),
  ExportFormat: z.enum(["DYNAMODB_JSON", "ION"]).describe(
    "The format of the exported data.",
  ).optional(),
  ExportType: z.enum(["FULL_EXPORT", "INCREMENTAL_EXPORT"]).describe(
    "The type of export that was performed.",
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

/** Swamp extension model for DynamoDB Export. Registered at `@swamp/aws/dynamodb/export`. */
export const model = {
  type: "@swamp/aws/dynamodb/export",
  version: "2026.07.24.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "DynamoDB Export resource state",
      schema: StateSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    get: {
      description: "Get a DynamoDB Export",
      arguments: z.object({
        identifier: z.string().describe(
          "The primary identifier of the DynamoDB Export",
        ),
      }),
      execute: async (args: { identifier: string }, context: any) => {
        const credentials = _buildCredentials(context.globalArgs);
        const result = await readResource(
          "AWS::DynamoDB::Export",
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
      description: "Sync DynamoDB Export state from AWS",
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
        const identifier = existing.ExportArn?.toString();
        if (!identifier) {
          throw new Error("No identifier found in existing state");
        }
        try {
          const result = await readResource(
            "AWS::DynamoDB::Export",
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

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

// Auto-generated extension model for @swamp/aws/signer/signing-job
// Do not edit manually. Re-generate with: deno task generate:aws

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for Signer SigningJob (AWS::Signer::SigningJob).
 *
 * Wraps the CloudFormation resource type as a swamp model so create,
 * get, update, delete, and sync can be driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { isResourceNotFoundError, readResource } from "./_lib/aws.ts";
import type { AwsCredentials } from "./_lib/aws.ts";

const S3SourceSchema = z.object({
  BucketName: z.string().describe("Name of the S3 bucket."),
  Key: z.string().describe(
    "Key name of the bucket object that contains unsigned code.",
  ),
  Version: z.string().describe(
    "Version of the source image in the version-enabled S3 bucket.",
  ),
});

const S3SignedObjectSchema = z.object({
  BucketName: z.string().describe("Name of the S3 bucket.").optional(),
  Key: z.string().describe(
    "Key name that uniquely identifies a signed code image in the bucket.",
  ).optional(),
});

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
  Source: z.object({
    S3: S3SourceSchema.describe(
      "Information about the Amazon S3 bucket where unsigned code is stored.",
    ).optional(),
  }).describe("The S3 bucket that contains the object to sign.").optional(),
  ProfileName: z.string().min(2).max(64).regex(new RegExp("^[a-zA-Z0-9_]{2,}$"))
    .describe("The name of the signing profile."),
  SignedObject: z.object({
    S3: S3SignedObjectSchema.describe(
      "The Amazon S3 bucket name and key where Signer saved the signed code image.",
    ).optional(),
  }).describe("The S3 location of the signed code image.").optional(),
});

const StateSchema = z.object({
  Arn: z.string(),
  JobId: z.string().optional(),
  Source: z.object({
    S3: S3SourceSchema,
  }).optional(),
  ProfileName: z.string().optional(),
  ProfileVersion: z.string().optional(),
  PlatformId: z.string().optional(),
  PlatformDisplayName: z.string().optional(),
  CreatedAt: z.string().optional(),
  CompletedAt: z.string().optional(),
  SignatureExpiresAt: z.string().optional(),
  RequestedBy: z.string().optional(),
  Status: z.string().optional(),
  JobOwner: z.string().optional(),
  JobInvoker: z.string().optional(),
  SignedObject: z.object({
    S3: S3SignedObjectSchema,
  }).optional(),
}).passthrough();

type StateData = z.infer<typeof StateSchema>;

const InputsSchema = z.object({
  name: z.string().optional(),
  accessKeyId: z.string().meta({ sensitive: true }).optional(),
  secretAccessKey: z.string().meta({ sensitive: true }).optional(),
  sessionToken: z.string().meta({ sensitive: true }).optional(),
  region: z.string().optional(),
  Source: z.object({
    S3: S3SourceSchema.describe(
      "Information about the Amazon S3 bucket where unsigned code is stored.",
    ).optional(),
  }).describe("The S3 bucket that contains the object to sign.").optional(),
  ProfileName: z.string().min(2).max(64).regex(new RegExp("^[a-zA-Z0-9_]{2,}$"))
    .describe("The name of the signing profile.").optional(),
  SignedObject: z.object({
    S3: S3SignedObjectSchema.describe(
      "The Amazon S3 bucket name and key where Signer saved the signed code image.",
    ).optional(),
  }).describe("The S3 location of the signed code image.").optional(),
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

/** Swamp extension model for Signer SigningJob. Registered at `@swamp/aws/signer/signing-job`. */
export const model = {
  type: "@swamp/aws/signer/signing-job",
  version: "2026.07.24.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Signer SigningJob resource state",
      schema: StateSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    get: {
      description: "Get a Signer SigningJob",
      arguments: z.object({
        identifier: z.string().describe(
          "The primary identifier of the Signer SigningJob",
        ),
      }),
      execute: async (args: { identifier: string }, context: any) => {
        const credentials = _buildCredentials(context.globalArgs);
        const result = await readResource(
          "AWS::Signer::SigningJob",
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
      description: "Sync Signer SigningJob state from AWS",
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
            "AWS::Signer::SigningJob",
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

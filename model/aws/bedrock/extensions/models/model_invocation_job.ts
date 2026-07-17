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

// Auto-generated extension model for @swamp/aws/bedrock/model-invocation-job
// Do not edit manually. Re-generate with: deno task generate:aws

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for Bedrock ModelInvocationJob (AWS::Bedrock::ModelInvocationJob).
 *
 * Wraps the CloudFormation resource type as a swamp model so create,
 * get, update, delete, and sync can be driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { isResourceNotFoundError, readResource } from "./_lib/aws.ts";
import type { AwsCredentials } from "./_lib/aws.ts";

const ModelInvocationJobS3InputDataConfigSchema = z.object({
  S3Uri: z.string().min(1).max(1024).regex(
    new RegExp(
      "^s3://[a-z0-9][-.a-z0-9]{1,61}[a-z0-9](?:/[-!_*'().a-z0-9A-Z]+(?:/[-!_*'().a-z0-9A-Z]+)*)?/?$",
    ),
  ).describe("The S3 location of the input data."),
  S3BucketOwner: z.string().regex(new RegExp("^[0-9]{12}$")).describe(
    "The ID of the AWS account that owns the S3 bucket containing the input data.",
  ).optional(),
});

const ModelInvocationJobS3OutputDataConfigSchema = z.object({
  S3Uri: z.string().min(1).max(1024).regex(
    new RegExp(
      "^s3://[a-z0-9][-.a-z0-9]{1,61}[a-z0-9](?:/[-!_*'().a-z0-9A-Z]+(?:/[-!_*'().a-z0-9A-Z]+)*)?/?$",
    ),
  ).describe("The S3 location of the output data."),
  S3EncryptionKeyId: z.string().min(1).max(2048).regex(
    new RegExp(
      "^(arn:aws(-[^:]+)?:kms:[a-zA-Z0-9-]*:[0-9]{12}:((key/[a-zA-Z0-9-]{36})|(alias/[a-zA-Z0-9-_/]+)))|([a-zA-Z0-9-]{36})|(alias/[a-zA-Z0-9-_/]+)$",
    ),
  ).describe(
    "The unique identifier of the key that encrypts the S3 location of the output data.",
  ).optional(),
  S3BucketOwner: z.string().regex(new RegExp("^[0-9]{12}$")).describe(
    "The ID of the AWS account that owns the S3 bucket containing the output data.",
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
  InputDataConfig: z.object({
    S3InputDataConfig: ModelInvocationJobS3InputDataConfigSchema.describe(
      "Contains the configuration of the S3 location of the input data.",
    ),
  }).describe(
    "Details about the location of the input to the batch inference job.",
  ).optional(),
  OutputDataConfig: z.object({
    S3OutputDataConfig: ModelInvocationJobS3OutputDataConfigSchema.describe(
      "Contains the configuration of the S3 location of the output data.",
    ),
  }).describe(
    "Details about the location of the output of the batch inference job.",
  ).optional(),
  VpcConfig: z.object({
    SubnetIds: z.array(z.string().max(32).regex(new RegExp("^[-0-9a-zA-Z]+$")))
      .describe("An array of IDs for each subnet in the VPC to use."),
    SecurityGroupIds: z.array(
      z.string().max(32).regex(new RegExp("^[-0-9a-zA-Z]+$")),
    ).describe("An array of IDs for each security group in the VPC to use."),
  }).describe(
    "The configuration of the Virtual Private Cloud (VPC) for the data in the batch inference job.",
  ).optional(),
});

const StateSchema = z.object({
  JobArn: z.string(),
  JobName: z.string().optional(),
  ModelId: z.string().optional(),
  RoleArn: z.string().optional(),
  InputDataConfig: z.object({
    S3InputDataConfig: ModelInvocationJobS3InputDataConfigSchema,
  }).optional(),
  OutputDataConfig: z.object({
    S3OutputDataConfig: ModelInvocationJobS3OutputDataConfigSchema,
  }).optional(),
  VpcConfig: z.object({
    SubnetIds: z.array(z.string()),
    SecurityGroupIds: z.array(z.string()),
  }).optional(),
  TimeoutDurationInHours: z.number().optional(),
  Status: z.string().optional(),
  SubmitTime: z.string().optional(),
  LastModifiedTime: z.string().optional(),
  JobExpirationTime: z.string().optional(),
  Tags: z.array(z.object({
    Key: z.string(),
    Value: z.string(),
  })).optional(),
}).passthrough();

type StateData = z.infer<typeof StateSchema>;

const InputsSchema = z.object({
  name: z.string().optional(),
  accessKeyId: z.string().meta({ sensitive: true }).optional(),
  secretAccessKey: z.string().meta({ sensitive: true }).optional(),
  sessionToken: z.string().meta({ sensitive: true }).optional(),
  region: z.string().optional(),
  InputDataConfig: z.object({
    S3InputDataConfig: ModelInvocationJobS3InputDataConfigSchema.describe(
      "Contains the configuration of the S3 location of the input data.",
    ).optional(),
  }).describe(
    "Details about the location of the input to the batch inference job.",
  ).optional(),
  OutputDataConfig: z.object({
    S3OutputDataConfig: ModelInvocationJobS3OutputDataConfigSchema.describe(
      "Contains the configuration of the S3 location of the output data.",
    ).optional(),
  }).describe(
    "Details about the location of the output of the batch inference job.",
  ).optional(),
  VpcConfig: z.object({
    SubnetIds: z.array(z.string().max(32).regex(new RegExp("^[-0-9a-zA-Z]+$")))
      .describe("An array of IDs for each subnet in the VPC to use.")
      .optional(),
    SecurityGroupIds: z.array(
      z.string().max(32).regex(new RegExp("^[-0-9a-zA-Z]+$")),
    ).describe("An array of IDs for each security group in the VPC to use.")
      .optional(),
  }).describe(
    "The configuration of the Virtual Private Cloud (VPC) for the data in the batch inference job.",
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

/** Swamp extension model for Bedrock ModelInvocationJob. Registered at `@swamp/aws/bedrock/model-invocation-job`. */
export const model = {
  type: "@swamp/aws/bedrock/model-invocation-job",
  version: "2026.07.17.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Bedrock ModelInvocationJob resource state",
      schema: StateSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    get: {
      description: "Get a Bedrock ModelInvocationJob",
      arguments: z.object({
        identifier: z.string().describe(
          "The primary identifier of the Bedrock ModelInvocationJob",
        ),
      }),
      execute: async (args: { identifier: string }, context: any) => {
        const credentials = _buildCredentials(context.globalArgs);
        const result = await readResource(
          "AWS::Bedrock::ModelInvocationJob",
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
      description: "Sync Bedrock ModelInvocationJob state from AWS",
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
        const identifier = existing.JobArn?.toString();
        if (!identifier) {
          throw new Error("No identifier found in existing state");
        }
        try {
          const result = await readResource(
            "AWS::Bedrock::ModelInvocationJob",
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

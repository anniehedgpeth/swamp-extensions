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

// Auto-generated extension model for @swamp/aws/emr/notebook-execution
// Do not edit manually. Re-generate with: deno task generate:aws

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for EMR NotebookExecution (AWS::EMR::NotebookExecution).
 *
 * Wraps the CloudFormation resource type as a swamp model so create,
 * get, update, delete, and sync can be driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { isResourceNotFoundError, readResource } from "./_lib/aws.ts";
import type { AwsCredentials } from "./_lib/aws.ts";

const TagSchema = z.object({
  Key: z.string().min(1).max(128).describe("The tag key."),
  Value: z.string().min(0).max(256).describe("The tag value."),
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
  NotebookExecutionName: z.string().max(256).describe(
    "An optional name for the notebook execution.",
  ).optional(),
  NotebookParams: z.string().max(10280).describe(
    "Input parameters in JSON format passed to the Amazon EMR Notebook at runtime for execution.",
  ).optional(),
  ExecutionEngine: z.object({
    Id: z.string().max(256).describe(
      "The unique identifier of the execution engine. For an Amazon EMR cluster, this is the cluster ID.",
    ),
    Type: z.enum(["EMR"]).describe("The type of execution engine.").optional(),
  }).describe(
    "Specifies the execution engine (cluster) to run the notebook and perform the notebook execution.",
  ).optional(),
  NotebookS3Location: z.object({
    Bucket: z.string().max(256).describe(
      "The Amazon S3 bucket that stores the notebook execution input.",
    ).optional(),
    Key: z.string().min(1).max(10280).describe(
      "The key to the Amazon S3 location that stores the notebook execution input.",
    ).optional(),
  }).describe(
    "The Amazon S3 location that stores the notebook execution input.",
  ).optional(),
  OutputNotebookS3Location: z.object({
    Bucket: z.string().max(256).describe(
      "The Amazon S3 bucket that stores the notebook execution output.",
    ).optional(),
    Key: z.string().min(1).max(10280).describe(
      "The key to the Amazon S3 location that stores the notebook execution output.",
    ).optional(),
  }).describe("The Amazon S3 location for the notebook execution output.")
    .optional(),
  OutputNotebookFormat: z.enum(["HTML"]).describe(
    "The output format for the notebook execution.",
  ).optional(),
  EnvironmentVariables: z.record(z.string(), z.string().max(10280)).describe(
    "The environment variables associated with the notebook execution. Keys must be prefixed with KERNEL_ (except LOG_CONTEXT).",
  ).optional(),
  Tags: z.array(TagSchema).describe(
    "A list of tags associated with a notebook execution.",
  ).optional(),
});

const StateSchema = z.object({
  NotebookExecutionId: z.string().optional(),
  Arn: z.string(),
  NotebookExecutionName: z.string().optional(),
  NotebookParams: z.string().optional(),
  ExecutionEngine: z.object({
    Id: z.string(),
    Type: z.string(),
  }).optional(),
  NotebookS3Location: z.object({
    Bucket: z.string(),
    Key: z.string(),
  }).optional(),
  OutputNotebookS3Location: z.object({
    Bucket: z.string(),
    Key: z.string(),
  }).optional(),
  OutputNotebookFormat: z.string().optional(),
  EnvironmentVariables: z.record(z.string(), z.unknown()).optional(),
  Status: z.string().optional(),
  StartTime: z.string().optional(),
  Tags: z.array(TagSchema).optional(),
}).passthrough();

type StateData = z.infer<typeof StateSchema>;

const InputsSchema = z.object({
  name: z.string().optional(),
  accessKeyId: z.string().meta({ sensitive: true }).optional(),
  secretAccessKey: z.string().meta({ sensitive: true }).optional(),
  sessionToken: z.string().meta({ sensitive: true }).optional(),
  region: z.string().optional(),
  NotebookExecutionName: z.string().max(256).describe(
    "An optional name for the notebook execution.",
  ).optional(),
  NotebookParams: z.string().max(10280).describe(
    "Input parameters in JSON format passed to the Amazon EMR Notebook at runtime for execution.",
  ).optional(),
  ExecutionEngine: z.object({
    Id: z.string().max(256).describe(
      "The unique identifier of the execution engine. For an Amazon EMR cluster, this is the cluster ID.",
    ).optional(),
    Type: z.enum(["EMR"]).describe("The type of execution engine.").optional(),
  }).describe(
    "Specifies the execution engine (cluster) to run the notebook and perform the notebook execution.",
  ).optional(),
  NotebookS3Location: z.object({
    Bucket: z.string().max(256).describe(
      "The Amazon S3 bucket that stores the notebook execution input.",
    ).optional(),
    Key: z.string().min(1).max(10280).describe(
      "The key to the Amazon S3 location that stores the notebook execution input.",
    ).optional(),
  }).describe(
    "The Amazon S3 location that stores the notebook execution input.",
  ).optional(),
  OutputNotebookS3Location: z.object({
    Bucket: z.string().max(256).describe(
      "The Amazon S3 bucket that stores the notebook execution output.",
    ).optional(),
    Key: z.string().min(1).max(10280).describe(
      "The key to the Amazon S3 location that stores the notebook execution output.",
    ).optional(),
  }).describe("The Amazon S3 location for the notebook execution output.")
    .optional(),
  OutputNotebookFormat: z.enum(["HTML"]).describe(
    "The output format for the notebook execution.",
  ).optional(),
  EnvironmentVariables: z.record(z.string(), z.string().max(10280)).describe(
    "The environment variables associated with the notebook execution. Keys must be prefixed with KERNEL_ (except LOG_CONTEXT).",
  ).optional(),
  Tags: z.array(TagSchema).describe(
    "A list of tags associated with a notebook execution.",
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

/** Swamp extension model for EMR NotebookExecution. Registered at `@swamp/aws/emr/notebook-execution`. */
export const model = {
  type: "@swamp/aws/emr/notebook-execution",
  version: "2026.07.24.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "EMR NotebookExecution resource state",
      schema: StateSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    get: {
      description: "Get a EMR NotebookExecution",
      arguments: z.object({
        identifier: z.string().describe(
          "The primary identifier of the EMR NotebookExecution",
        ),
      }),
      execute: async (args: { identifier: string }, context: any) => {
        const credentials = _buildCredentials(context.globalArgs);
        const result = await readResource(
          "AWS::EMR::NotebookExecution",
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
      description: "Sync EMR NotebookExecution state from AWS",
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
            "AWS::EMR::NotebookExecution",
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

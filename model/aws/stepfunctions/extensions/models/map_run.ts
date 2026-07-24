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

// Auto-generated extension model for @swamp/aws/stepfunctions/map-run
// Do not edit manually. Re-generate with: deno task generate:aws

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for StepFunctions MapRun (AWS::StepFunctions::MapRun).
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
  ExecutionArn: z.string().min(1).max(256).describe(
    "The Amazon Resource Name (ARN) that identifies the execution in which the Map Run was started.",
  ).optional(),
  ItemCounts: z.object({
    Pending: z.number().int().min(0).describe(
      "The total number of items to process in child workflow executions that haven't started running yet.",
    ).optional(),
    Running: z.number().int().min(0).describe(
      "The total number of items being processed in child workflow executions that are currently in-progress.",
    ).optional(),
    Succeeded: z.number().int().min(0).describe(
      "The total number of items processed in child workflow executions that have completed successfully.",
    ).optional(),
    Failed: z.number().int().min(0).describe(
      "The total number of items processed in child workflow executions that have failed.",
    ).optional(),
    TimedOut: z.number().int().min(0).describe(
      "The total number of items processed in child workflow executions that have timed out.",
    ).optional(),
    Aborted: z.number().int().min(0).describe(
      "The total number of items processed in child workflow executions that were stopped.",
    ).optional(),
    Total: z.number().int().min(0).describe(
      "The total number of items processed in all the child workflow executions started by a Map Run.",
    ).optional(),
    ResultsWritten: z.number().int().min(0).describe(
      "The count of items whose results were written by ResultWriter.",
    ).optional(),
    FailuresNotRedrivable: z.number().int().describe(
      "The number of items in child workflow executions that cannot be redriven.",
    ).optional(),
    PendingRedrive: z.number().int().describe(
      "The number of unsuccessful items currently waiting to be redriven.",
    ).optional(),
  }).describe(
    "Contains details about items processed in all child workflow executions started by a Map Run.",
  ).optional(),
  ExecutionCounts: z.object({
    Pending: z.number().int().min(0).describe(
      "The total number of child workflow executions that haven't started executing yet.",
    ).optional(),
    Running: z.number().int().min(0).describe(
      "The total number of child workflow executions that are currently in-progress.",
    ).optional(),
    Succeeded: z.number().int().min(0).describe(
      "The total number of child workflow executions that have completed successfully.",
    ).optional(),
    Failed: z.number().int().min(0).describe(
      "The total number of child workflow executions that have failed.",
    ).optional(),
    TimedOut: z.number().int().min(0).describe(
      "The total number of child workflow executions that have timed out.",
    ).optional(),
    Aborted: z.number().int().min(0).describe(
      "The total number of child workflow executions that were stopped.",
    ).optional(),
    Total: z.number().int().min(0).describe(
      "The total number of child workflow executions started by a Map Run.",
    ).optional(),
    ResultsWritten: z.number().int().min(0).describe(
      "The count of child workflow executions whose results were written by ResultWriter.",
    ).optional(),
    FailuresNotRedrivable: z.number().int().describe(
      "The number of child workflow executions that cannot be redriven.",
    ).optional(),
    PendingRedrive: z.number().int().describe(
      "The number of unsuccessful child workflow executions waiting to be redriven.",
    ).optional(),
  }).describe(
    "Contains details about all child workflow executions started by a Map Run.",
  ).optional(),
});

const StateSchema = z.object({
  MapRunArn: z.string(),
  ExecutionArn: z.string().optional(),
  Status: z.string().optional(),
  StartDate: z.string().optional(),
  StopDate: z.string().optional(),
  MaxConcurrency: z.number().optional(),
  ToleratedFailurePercentage: z.number().optional(),
  ToleratedFailureCount: z.number().optional(),
  ItemCounts: z.object({
    Pending: z.number(),
    Running: z.number(),
    Succeeded: z.number(),
    Failed: z.number(),
    TimedOut: z.number(),
    Aborted: z.number(),
    Total: z.number(),
    ResultsWritten: z.number(),
    FailuresNotRedrivable: z.number(),
    PendingRedrive: z.number(),
  }).optional(),
  ExecutionCounts: z.object({
    Pending: z.number(),
    Running: z.number(),
    Succeeded: z.number(),
    Failed: z.number(),
    TimedOut: z.number(),
    Aborted: z.number(),
    Total: z.number(),
    ResultsWritten: z.number(),
    FailuresNotRedrivable: z.number(),
    PendingRedrive: z.number(),
  }).optional(),
}).passthrough();

type StateData = z.infer<typeof StateSchema>;

const InputsSchema = z.object({
  name: z.string().optional(),
  accessKeyId: z.string().meta({ sensitive: true }).optional(),
  secretAccessKey: z.string().meta({ sensitive: true }).optional(),
  sessionToken: z.string().meta({ sensitive: true }).optional(),
  region: z.string().optional(),
  ExecutionArn: z.string().min(1).max(256).describe(
    "The Amazon Resource Name (ARN) that identifies the execution in which the Map Run was started.",
  ).optional(),
  ItemCounts: z.object({
    Pending: z.number().int().min(0).describe(
      "The total number of items to process in child workflow executions that haven't started running yet.",
    ).optional(),
    Running: z.number().int().min(0).describe(
      "The total number of items being processed in child workflow executions that are currently in-progress.",
    ).optional(),
    Succeeded: z.number().int().min(0).describe(
      "The total number of items processed in child workflow executions that have completed successfully.",
    ).optional(),
    Failed: z.number().int().min(0).describe(
      "The total number of items processed in child workflow executions that have failed.",
    ).optional(),
    TimedOut: z.number().int().min(0).describe(
      "The total number of items processed in child workflow executions that have timed out.",
    ).optional(),
    Aborted: z.number().int().min(0).describe(
      "The total number of items processed in child workflow executions that were stopped.",
    ).optional(),
    Total: z.number().int().min(0).describe(
      "The total number of items processed in all the child workflow executions started by a Map Run.",
    ).optional(),
    ResultsWritten: z.number().int().min(0).describe(
      "The count of items whose results were written by ResultWriter.",
    ).optional(),
    FailuresNotRedrivable: z.number().int().describe(
      "The number of items in child workflow executions that cannot be redriven.",
    ).optional(),
    PendingRedrive: z.number().int().describe(
      "The number of unsuccessful items currently waiting to be redriven.",
    ).optional(),
  }).describe(
    "Contains details about items processed in all child workflow executions started by a Map Run.",
  ).optional(),
  ExecutionCounts: z.object({
    Pending: z.number().int().min(0).describe(
      "The total number of child workflow executions that haven't started executing yet.",
    ).optional(),
    Running: z.number().int().min(0).describe(
      "The total number of child workflow executions that are currently in-progress.",
    ).optional(),
    Succeeded: z.number().int().min(0).describe(
      "The total number of child workflow executions that have completed successfully.",
    ).optional(),
    Failed: z.number().int().min(0).describe(
      "The total number of child workflow executions that have failed.",
    ).optional(),
    TimedOut: z.number().int().min(0).describe(
      "The total number of child workflow executions that have timed out.",
    ).optional(),
    Aborted: z.number().int().min(0).describe(
      "The total number of child workflow executions that were stopped.",
    ).optional(),
    Total: z.number().int().min(0).describe(
      "The total number of child workflow executions started by a Map Run.",
    ).optional(),
    ResultsWritten: z.number().int().min(0).describe(
      "The count of child workflow executions whose results were written by ResultWriter.",
    ).optional(),
    FailuresNotRedrivable: z.number().int().describe(
      "The number of child workflow executions that cannot be redriven.",
    ).optional(),
    PendingRedrive: z.number().int().describe(
      "The number of unsuccessful child workflow executions waiting to be redriven.",
    ).optional(),
  }).describe(
    "Contains details about all child workflow executions started by a Map Run.",
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

/** Swamp extension model for StepFunctions MapRun. Registered at `@swamp/aws/stepfunctions/map-run`. */
export const model = {
  type: "@swamp/aws/stepfunctions/map-run",
  version: "2026.07.24.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "StepFunctions MapRun resource state",
      schema: StateSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    get: {
      description: "Get a StepFunctions MapRun",
      arguments: z.object({
        identifier: z.string().describe(
          "The primary identifier of the StepFunctions MapRun",
        ),
      }),
      execute: async (args: { identifier: string }, context: any) => {
        const credentials = _buildCredentials(context.globalArgs);
        const result = await readResource(
          "AWS::StepFunctions::MapRun",
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
      description: "Sync StepFunctions MapRun state from AWS",
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
        const identifier = existing.MapRunArn?.toString();
        if (!identifier) {
          throw new Error("No identifier found in existing state");
        }
        try {
          const result = await readResource(
            "AWS::StepFunctions::MapRun",
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

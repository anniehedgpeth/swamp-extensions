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

// Auto-generated extension model for @swamp/aws/sagemaker/transform-job
// Do not edit manually. Re-generate with: deno task generate:aws

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for SageMaker TransformJob (AWS::SageMaker::TransformJob).
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
  ModelName: z.string().max(63).regex(
    new RegExp("^[a-zA-Z0-9]([\\-a-zA-Z0-9]*[a-zA-Z0-9])?$"),
  ).describe(
    "The name of the model that you want to use for the transform job.",
  ),
  MaxConcurrentTransforms: z.number().int().min(0).describe(
    "The maximum number of parallel requests that can be sent to each instance in a transform job.",
  ).optional(),
  ModelClientConfig: z.object({
    InvocationsTimeoutInSeconds: z.number().int().min(1).max(3600).describe(
      "The timeout value in seconds for an invocation request.",
    ).optional(),
    InvocationsMaxRetries: z.number().int().min(0).max(3).describe(
      "The maximum number of retries when invocation requests are failing.",
    ).optional(),
  }).describe(
    "Configures the timeout and maximum number of retries for processing a transform job invocation.",
  ).optional(),
  MaxPayloadInMB: z.number().int().min(0).describe(
    "The maximum allowed size of the payload, in MB.",
  ).optional(),
  BatchStrategy: z.enum(["MultiRecord", "SingleRecord"]).describe(
    "Specifies the number of records to include in a mini-batch for an HTTP inference request.",
  ).optional(),
  Environment: z.record(z.string(), z.string().max(10240)).describe(
    "The environment variables to set in the Docker container.",
  ).optional(),
  TransformInput: z.object({
    DataSource: z.object({
      S3DataSource: z.object({
        S3DataType: z.enum([
          "ManifestFile",
          "S3Prefix",
          "AugmentedManifestFile",
          "Converse",
        ]).describe("The data type."),
        S3Uri: z.string().max(1024).regex(
          new RegExp("^(https|s3)://([^/]+)/?(.*)$"),
        ).describe("The S3 URI."),
      }).describe("The S3 location of the data source."),
    }).describe("Describes the location of the channel data."),
    ContentType: z.string().max(256).describe(
      "The multipurpose internet mail extension (MIME) type of the data.",
    ).optional(),
    CompressionType: z.enum(["None", "Gzip"]).describe(
      "If your transform data is compressed, specify the compression type.",
    ).optional(),
    SplitType: z.enum(["None", "Line", "RecordIO", "TFRecord"]).describe(
      "The method to use to split the transform job's data files into smaller batches.",
    ).optional(),
  }).describe(
    "Describes the input source and the way the transform job consumes it.",
  ),
  TransformOutput: z.object({
    S3OutputPath: z.string().max(1024).regex(
      new RegExp("^(https|s3)://([^/]+)/?(.*)$"),
    ).describe(
      "The Amazon S3 path where you want Amazon SageMaker to store the results of the transform job.",
    ),
    Accept: z.string().max(256).describe(
      "The MIME type used to specify the output data.",
    ).optional(),
    AssembleWith: z.enum(["None", "Line"]).describe(
      "Defines how to assemble the results of the transform job as a single S3 object.",
    ).optional(),
    KmsKeyId: z.string().max(2048).regex(new RegExp("^[a-zA-Z0-9:/_-]*$"))
      .describe(
        "The AWS KMS key that Amazon SageMaker uses to encrypt the model artifacts at rest using Amazon S3 server-side encryption.",
      ).optional(),
  }).describe("Describes the results of the transform job."),
  DataCaptureConfig: z.object({
    DestinationS3Uri: z.string().max(1024).regex(
      new RegExp("^(https|s3)://([^/]+)/?(.*)$"),
    ).describe("The Amazon S3 location being used to capture the data."),
    KmsKeyId: z.string().max(2048).regex(new RegExp("^[a-zA-Z0-9:/_-]*$"))
      .describe(
        "The ARN of a KMS key that SageMaker uses to encrypt data on the storage volume.",
      ).optional(),
    GenerateInferenceId: z.boolean().describe(
      "Flag that indicates whether to append inference id to the output.",
    ).optional(),
  }).describe("Configuration to control how SageMaker captures inference data.")
    .optional(),
  TransformResources: z.object({
    InstanceType: z.string().describe(
      "The ML compute instance type for the transform job.",
    ),
    InstanceCount: z.number().int().min(1).describe(
      "The number of ML compute instances to use in the transform job.",
    ),
    VolumeKmsKeyId: z.string().max(2048).regex(new RegExp("^[a-zA-Z0-9:/_-]*$"))
      .describe(
        "The AWS KMS key that Amazon SageMaker uses to encrypt model data on the storage volume.",
      ).optional(),
  }).describe(
    "Describes the resources, including ML instance types and ML instance count, to use for the transform job.",
  ),
  DataProcessing: z.object({
    InputFilter: z.string().max(63).describe(
      "A JSONPath expression used to select a portion of the input data to pass to the algorithm.",
    ).optional(),
    OutputFilter: z.string().max(63).describe(
      "A JSONPath expression used to select a portion of the joined dataset to save in the output file.",
    ).optional(),
    JoinSource: z.enum(["Input", "None"]).describe(
      "Specifies the source of the data to join with the transformed data.",
    ).optional(),
  }).describe(
    "The data structure used to specify the data to be used for inference in a batch transform job.",
  ).optional(),
  ExperimentConfig: z.object({
    ExperimentName: z.string().min(1).max(120).regex(
      new RegExp("^[a-zA-Z0-9](-*[a-zA-Z0-9]){0,119}$"),
    ).describe(
      "The name of an existing experiment to associate with the trial component.",
    ).optional(),
    TrialName: z.string().min(1).max(120).regex(
      new RegExp("^[a-zA-Z0-9](-*[a-zA-Z0-9]){0,119}$"),
    ).describe(
      "The name of an existing trial to associate the trial component with.",
    ).optional(),
    TrialComponentDisplayName: z.string().min(1).max(120).regex(
      new RegExp("^[a-zA-Z0-9](-*[a-zA-Z0-9]){0,119}$"),
    ).describe("The display name for the trial component.").optional(),
  }).describe(
    "Associates a SageMaker job as a trial component with an experiment and trial.",
  ).optional(),
  Tags: z.array(z.object({
    Key: z.string().min(1).max(128).describe("The tag key."),
    Value: z.string().max(256).describe("The tag value."),
  })).describe("An array of key-value pairs.").optional(),
});

const StateSchema = z.object({
  TransformJobArn: z.string(),
  TransformJobName: z.string().optional(),
  TransformJobStatus: z.string().optional(),
  ModelName: z.string().optional(),
  MaxConcurrentTransforms: z.number().optional(),
  ModelClientConfig: z.object({
    InvocationsTimeoutInSeconds: z.number(),
    InvocationsMaxRetries: z.number(),
  }).optional(),
  MaxPayloadInMB: z.number().optional(),
  BatchStrategy: z.string().optional(),
  Environment: z.record(z.string(), z.unknown()).optional(),
  TransformInput: z.object({
    DataSource: z.object({
      S3DataSource: z.object({
        S3DataType: z.string(),
        S3Uri: z.string(),
      }),
    }),
    ContentType: z.string(),
    CompressionType: z.string(),
    SplitType: z.string(),
  }).optional(),
  TransformOutput: z.object({
    S3OutputPath: z.string(),
    Accept: z.string(),
    AssembleWith: z.string(),
    KmsKeyId: z.string(),
  }).optional(),
  DataCaptureConfig: z.object({
    DestinationS3Uri: z.string(),
    KmsKeyId: z.string(),
    GenerateInferenceId: z.boolean(),
  }).optional(),
  TransformResources: z.object({
    InstanceType: z.string(),
    InstanceCount: z.number(),
    VolumeKmsKeyId: z.string(),
  }).optional(),
  DataProcessing: z.object({
    InputFilter: z.string(),
    OutputFilter: z.string(),
    JoinSource: z.string(),
  }).optional(),
  ExperimentConfig: z.object({
    ExperimentName: z.string(),
    TrialName: z.string(),
    TrialComponentDisplayName: z.string(),
  }).optional(),
  Tags: z.array(z.object({
    Key: z.string(),
    Value: z.string(),
  })).optional(),
  CreationTime: z.string().optional(),
  TransformStartTime: z.string().optional(),
  TransformEndTime: z.string().optional(),
}).passthrough();

type StateData = z.infer<typeof StateSchema>;

const InputsSchema = z.object({
  name: z.string().optional(),
  accessKeyId: z.string().meta({ sensitive: true }).optional(),
  secretAccessKey: z.string().meta({ sensitive: true }).optional(),
  sessionToken: z.string().meta({ sensitive: true }).optional(),
  region: z.string().optional(),
  ModelName: z.string().max(63).regex(
    new RegExp("^[a-zA-Z0-9]([\\-a-zA-Z0-9]*[a-zA-Z0-9])?$"),
  ).describe(
    "The name of the model that you want to use for the transform job.",
  ).optional(),
  MaxConcurrentTransforms: z.number().int().min(0).describe(
    "The maximum number of parallel requests that can be sent to each instance in a transform job.",
  ).optional(),
  ModelClientConfig: z.object({
    InvocationsTimeoutInSeconds: z.number().int().min(1).max(3600).describe(
      "The timeout value in seconds for an invocation request.",
    ).optional(),
    InvocationsMaxRetries: z.number().int().min(0).max(3).describe(
      "The maximum number of retries when invocation requests are failing.",
    ).optional(),
  }).describe(
    "Configures the timeout and maximum number of retries for processing a transform job invocation.",
  ).optional(),
  MaxPayloadInMB: z.number().int().min(0).describe(
    "The maximum allowed size of the payload, in MB.",
  ).optional(),
  BatchStrategy: z.enum(["MultiRecord", "SingleRecord"]).describe(
    "Specifies the number of records to include in a mini-batch for an HTTP inference request.",
  ).optional(),
  Environment: z.record(z.string(), z.string().max(10240)).describe(
    "The environment variables to set in the Docker container.",
  ).optional(),
  TransformInput: z.object({
    DataSource: z.object({
      S3DataSource: z.object({
        S3DataType: z.enum([
          "ManifestFile",
          "S3Prefix",
          "AugmentedManifestFile",
          "Converse",
        ]).describe("The data type.").optional(),
        S3Uri: z.string().max(1024).regex(
          new RegExp("^(https|s3)://([^/]+)/?(.*)$"),
        ).describe("The S3 URI.").optional(),
      }).describe("The S3 location of the data source.").optional(),
    }).describe("Describes the location of the channel data.").optional(),
    ContentType: z.string().max(256).describe(
      "The multipurpose internet mail extension (MIME) type of the data.",
    ).optional(),
    CompressionType: z.enum(["None", "Gzip"]).describe(
      "If your transform data is compressed, specify the compression type.",
    ).optional(),
    SplitType: z.enum(["None", "Line", "RecordIO", "TFRecord"]).describe(
      "The method to use to split the transform job's data files into smaller batches.",
    ).optional(),
  }).describe(
    "Describes the input source and the way the transform job consumes it.",
  ).optional(),
  TransformOutput: z.object({
    S3OutputPath: z.string().max(1024).regex(
      new RegExp("^(https|s3)://([^/]+)/?(.*)$"),
    ).describe(
      "The Amazon S3 path where you want Amazon SageMaker to store the results of the transform job.",
    ).optional(),
    Accept: z.string().max(256).describe(
      "The MIME type used to specify the output data.",
    ).optional(),
    AssembleWith: z.enum(["None", "Line"]).describe(
      "Defines how to assemble the results of the transform job as a single S3 object.",
    ).optional(),
    KmsKeyId: z.string().max(2048).regex(new RegExp("^[a-zA-Z0-9:/_-]*$"))
      .describe(
        "The AWS KMS key that Amazon SageMaker uses to encrypt the model artifacts at rest using Amazon S3 server-side encryption.",
      ).optional(),
  }).describe("Describes the results of the transform job.").optional(),
  DataCaptureConfig: z.object({
    DestinationS3Uri: z.string().max(1024).regex(
      new RegExp("^(https|s3)://([^/]+)/?(.*)$"),
    ).describe("The Amazon S3 location being used to capture the data.")
      .optional(),
    KmsKeyId: z.string().max(2048).regex(new RegExp("^[a-zA-Z0-9:/_-]*$"))
      .describe(
        "The ARN of a KMS key that SageMaker uses to encrypt data on the storage volume.",
      ).optional(),
    GenerateInferenceId: z.boolean().describe(
      "Flag that indicates whether to append inference id to the output.",
    ).optional(),
  }).describe("Configuration to control how SageMaker captures inference data.")
    .optional(),
  TransformResources: z.object({
    InstanceType: z.string().describe(
      "The ML compute instance type for the transform job.",
    ).optional(),
    InstanceCount: z.number().int().min(1).describe(
      "The number of ML compute instances to use in the transform job.",
    ).optional(),
    VolumeKmsKeyId: z.string().max(2048).regex(new RegExp("^[a-zA-Z0-9:/_-]*$"))
      .describe(
        "The AWS KMS key that Amazon SageMaker uses to encrypt model data on the storage volume.",
      ).optional(),
  }).describe(
    "Describes the resources, including ML instance types and ML instance count, to use for the transform job.",
  ).optional(),
  DataProcessing: z.object({
    InputFilter: z.string().max(63).describe(
      "A JSONPath expression used to select a portion of the input data to pass to the algorithm.",
    ).optional(),
    OutputFilter: z.string().max(63).describe(
      "A JSONPath expression used to select a portion of the joined dataset to save in the output file.",
    ).optional(),
    JoinSource: z.enum(["Input", "None"]).describe(
      "Specifies the source of the data to join with the transformed data.",
    ).optional(),
  }).describe(
    "The data structure used to specify the data to be used for inference in a batch transform job.",
  ).optional(),
  ExperimentConfig: z.object({
    ExperimentName: z.string().min(1).max(120).regex(
      new RegExp("^[a-zA-Z0-9](-*[a-zA-Z0-9]){0,119}$"),
    ).describe(
      "The name of an existing experiment to associate with the trial component.",
    ).optional(),
    TrialName: z.string().min(1).max(120).regex(
      new RegExp("^[a-zA-Z0-9](-*[a-zA-Z0-9]){0,119}$"),
    ).describe(
      "The name of an existing trial to associate the trial component with.",
    ).optional(),
    TrialComponentDisplayName: z.string().min(1).max(120).regex(
      new RegExp("^[a-zA-Z0-9](-*[a-zA-Z0-9]){0,119}$"),
    ).describe("The display name for the trial component.").optional(),
  }).describe(
    "Associates a SageMaker job as a trial component with an experiment and trial.",
  ).optional(),
  Tags: z.array(z.object({
    Key: z.string().min(1).max(128).describe("The tag key.").optional(),
    Value: z.string().max(256).describe("The tag value.").optional(),
  })).describe("An array of key-value pairs.").optional(),
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

/** Swamp extension model for SageMaker TransformJob. Registered at `@swamp/aws/sagemaker/transform-job`. */
export const model = {
  type: "@swamp/aws/sagemaker/transform-job",
  version: "2026.07.18.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "SageMaker TransformJob resource state",
      schema: StateSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    get: {
      description: "Get a SageMaker TransformJob",
      arguments: z.object({
        identifier: z.string().describe(
          "The primary identifier of the SageMaker TransformJob",
        ),
      }),
      execute: async (args: { identifier: string }, context: any) => {
        const credentials = _buildCredentials(context.globalArgs);
        const result = await readResource(
          "AWS::SageMaker::TransformJob",
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
      description: "Sync SageMaker TransformJob state from AWS",
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
        const identifier = existing.TransformJobArn?.toString();
        if (!identifier) {
          throw new Error("No identifier found in existing state");
        }
        try {
          const result = await readResource(
            "AWS::SageMaker::TransformJob",
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

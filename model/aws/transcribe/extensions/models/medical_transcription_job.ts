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

// Auto-generated extension model for @swamp/aws/transcribe/medical-transcription-job
// Do not edit manually. Re-generate with: deno task generate:aws

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for Transcribe MedicalTranscriptionJob (AWS::Transcribe::MedicalTranscriptionJob).
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
  Key: z.string().min(1).max(128),
  Value: z.string().min(0).max(256),
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
  MedicalTranscriptionJobName: z.string().min(1).max(200).regex(
    new RegExp("^[0-9a-zA-Z._-]+$"),
  ).describe("A unique name for the medical transcription job"),
  LanguageCode: z.string().describe(
    "The language code for the language spoken in the input media file. Must be en-US.",
  ),
  MediaSampleRateHertz: z.number().int().min(16000).max(48000).describe(
    "The sample rate of the audio in hertz",
  ).optional(),
  MediaFormat: z.enum([
    "mp3",
    "mp4",
    "wav",
    "flac",
    "ogg",
    "amr",
    "webm",
    "m4a",
  ]).describe("The format of the input media file").optional(),
  Media: z.object({
    MediaFileUri: z.string().min(1).max(2000).regex(
      new RegExp("^(s3://|http(s*)://).+$"),
    ).describe("The Amazon S3 location of the media file").optional(),
  }).describe("Describes the Amazon S3 location of the media file"),
  Transcript: z.object({
    TranscriptFileUri: z.string().describe(
      "The Amazon S3 location of the transcript",
    ).optional(),
  }).describe("Provides the Amazon S3 URI for the transcript").optional(),
  Settings: z.object({
    ChannelIdentification: z.boolean().describe(
      "Enables channel identification in multi-channel audio",
    ).optional(),
    ShowAlternatives: z.boolean().describe("Include alternative transcriptions")
      .optional(),
  }).describe("Settings for the medical transcription job").optional(),
  Specialty: z.enum(["PRIMARYCARE"]).describe(
    "The medical specialty represented in the media",
  ),
  Type: z.enum(["CONVERSATION", "DICTATION"]).describe(
    "Whether the input media is a dictation or conversation",
  ),
  Tags: z.array(TagSchema).describe(
    "Tags associated with the medical transcription job",
  ).optional(),
});

const StateSchema = z.object({
  Arn: z.string(),
  MedicalTranscriptionJobName: z.string().optional(),
  TranscriptionJobStatus: z.string().optional(),
  LanguageCode: z.string().optional(),
  MediaSampleRateHertz: z.number().optional(),
  MediaFormat: z.string().optional(),
  Media: z.object({
    MediaFileUri: z.string(),
  }).optional(),
  Transcript: z.object({
    TranscriptFileUri: z.string(),
  }).optional(),
  CreationTime: z.string().optional(),
  Settings: z.object({
    ChannelIdentification: z.boolean(),
    ShowAlternatives: z.boolean(),
  }).optional(),
  Specialty: z.string().optional(),
  Type: z.string().optional(),
  Tags: z.array(TagSchema).optional(),
}).passthrough();

type StateData = z.infer<typeof StateSchema>;

const InputsSchema = z.object({
  name: z.string().optional(),
  accessKeyId: z.string().meta({ sensitive: true }).optional(),
  secretAccessKey: z.string().meta({ sensitive: true }).optional(),
  sessionToken: z.string().meta({ sensitive: true }).optional(),
  region: z.string().optional(),
  MedicalTranscriptionJobName: z.string().min(1).max(200).regex(
    new RegExp("^[0-9a-zA-Z._-]+$"),
  ).describe("A unique name for the medical transcription job").optional(),
  LanguageCode: z.string().describe(
    "The language code for the language spoken in the input media file. Must be en-US.",
  ).optional(),
  MediaSampleRateHertz: z.number().int().min(16000).max(48000).describe(
    "The sample rate of the audio in hertz",
  ).optional(),
  MediaFormat: z.enum([
    "mp3",
    "mp4",
    "wav",
    "flac",
    "ogg",
    "amr",
    "webm",
    "m4a",
  ]).describe("The format of the input media file").optional(),
  Media: z.object({
    MediaFileUri: z.string().min(1).max(2000).regex(
      new RegExp("^(s3://|http(s*)://).+$"),
    ).describe("The Amazon S3 location of the media file").optional(),
  }).describe("Describes the Amazon S3 location of the media file").optional(),
  Transcript: z.object({
    TranscriptFileUri: z.string().describe(
      "The Amazon S3 location of the transcript",
    ).optional(),
  }).describe("Provides the Amazon S3 URI for the transcript").optional(),
  Settings: z.object({
    ChannelIdentification: z.boolean().describe(
      "Enables channel identification in multi-channel audio",
    ).optional(),
    ShowAlternatives: z.boolean().describe("Include alternative transcriptions")
      .optional(),
  }).describe("Settings for the medical transcription job").optional(),
  Specialty: z.enum(["PRIMARYCARE"]).describe(
    "The medical specialty represented in the media",
  ).optional(),
  Type: z.enum(["CONVERSATION", "DICTATION"]).describe(
    "Whether the input media is a dictation or conversation",
  ).optional(),
  Tags: z.array(TagSchema).describe(
    "Tags associated with the medical transcription job",
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

/** Swamp extension model for Transcribe MedicalTranscriptionJob. Registered at `@swamp/aws/transcribe/medical-transcription-job`. */
export const model = {
  type: "@swamp/aws/transcribe/medical-transcription-job",
  version: "2026.07.24.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Transcribe MedicalTranscriptionJob resource state",
      schema: StateSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    get: {
      description: "Get a Transcribe MedicalTranscriptionJob",
      arguments: z.object({
        identifier: z.string().describe(
          "The primary identifier of the Transcribe MedicalTranscriptionJob",
        ),
      }),
      execute: async (args: { identifier: string }, context: any) => {
        const credentials = _buildCredentials(context.globalArgs);
        const result = await readResource(
          "AWS::Transcribe::MedicalTranscriptionJob",
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
      description: "Sync Transcribe MedicalTranscriptionJob state from AWS",
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
            "AWS::Transcribe::MedicalTranscriptionJob",
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

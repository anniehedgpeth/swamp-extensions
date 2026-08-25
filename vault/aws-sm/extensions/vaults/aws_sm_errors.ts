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

/**
 * Error wrapper for the aws-sm vault. Credential classification and hint
 * formatting come from the shared aws_credentials module; this file adds
 * the vault-specific error class and wrapping logic.
 *
 * @module
 */

import {
  classifyAwsCredentialError,
  deriveAwsErrorCode,
  formatAwsCredentialHint,
} from "./_lib/aws_credentials.ts";

export {
  type AwsCredentialErrorKind,
  classifyAwsCredentialError,
  deriveAwsErrorCode,
  formatAwsCredentialHint,
} from "./_lib/aws_credentials.ts";

/**
 * Error thrown by the aws-sm vault for SDK failures. Preserves the
 * original SDK error's `name` (so existing checks like
 * `error.name === "ResourceNotFoundException"` keep working), sets `cause`
 * to the original, and exposes HTTP-level detail.
 */
export class AwsSmOperationError extends Error {
  override readonly name: string;
  readonly httpStatusCode: number | undefined;
  readonly code: string | undefined;
  readonly requestId: string | undefined;

  constructor(
    message: string,
    opts: {
      name: string;
      cause: unknown;
      httpStatusCode: number | undefined;
      code: string | undefined;
      requestId: string | undefined;
    },
  ) {
    super(message, { cause: opts.cause });
    this.name = opts.name;
    this.httpStatusCode = opts.httpStatusCode;
    this.code = opts.code;
    this.requestId = opts.requestId;
  }
}

/**
 * Wrap an SDK error from a Secrets Manager command as an
 * `AwsSmOperationError` with status, code, requestId, and a
 * credential-remediation hint when applicable.
 *
 * The Unknown/UnknownError suppression is empirically required: at
 * @aws-sdk/client-secrets-manager@3.1024.0, an HTTP 400 response with
 * a body lacking `__type` produces `err.name === "Unknown"` and
 * `err.message === "UnknownError"`. Without these filters the wrapped
 * message would read e.g. "AWS Secrets Manager get failed HTTP 400
 * Unknown — UnknownError" — noisy, with no useful signal.
 */
export function wrapAwsSmError(op: string, err: unknown): Error {
  if (!(err instanceof Error)) return new Error(String(err));
  const e = err as Error & {
    $metadata?: { httpStatusCode?: number; requestId?: string };
    Code?: string;
  };
  const status = e.$metadata?.httpStatusCode;
  const requestId = e.$metadata?.requestId;
  const code = deriveAwsErrorCode(e);

  const credentialKind = classifyAwsCredentialError(code, status);
  const credentialHint = formatAwsCredentialHint(
    credentialKind,
    Deno.env.get("AWS_PROFILE"),
    "Vault",
  );

  const parts: string[] = [];
  if (credentialHint) parts.push(credentialHint);
  parts.push(`AWS Secrets Manager ${op} failed`);
  if (status != null) parts.push(`HTTP ${status}`);
  if (code && code !== "Unknown") parts.push(code);
  const rawMsg = e.message && e.message !== "UnknownError" ? e.message : "";
  if (rawMsg) parts.push(`— ${rawMsg}`);
  if ((status === 401 || status === 403) && credentialKind === "other") {
    parts.push(
      "(check AWS credentials — profile, env vars, or credential provider — then retry)",
    );
  }
  if (requestId) parts.push(`[requestId=${requestId}]`);

  return new AwsSmOperationError(parts.join(" "), {
    name: e.name,
    cause: e,
    httpStatusCode: status,
    code,
    requestId,
  });
}

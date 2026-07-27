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

export class AzureKvOperationError extends Error {
  override readonly name: string;
  readonly httpStatusCode: number | undefined;

  constructor(
    message: string,
    opts: {
      name: string;
      cause?: unknown;
      httpStatusCode?: number;
    },
  ) {
    super(message, { cause: opts.cause });
    this.name = opts.name;
    this.httpStatusCode = opts.httpStatusCode;
  }
}

export function wrapAzureKvError(
  op: string,
  error: unknown,
): AzureKvOperationError {
  if (!(error instanceof Error)) {
    return new AzureKvOperationError(
      `${op}: ${String(error)}`,
      { name: "AzureKvOperationError" },
    );
  }

  const statusCode = (error as { statusCode?: number }).statusCode;

  return new AzureKvOperationError(
    `${op}: ${error.message}`,
    {
      name: error.name === "Error" ? "AzureKvOperationError" : error.name,
      cause: error,
      httpStatusCode: statusCode,
    },
  );
}

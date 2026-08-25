import { generateCopyrightHeader } from "./licenseGenerator.ts";

/**
 * Generates a self-contained AWS credential utilities module. The returned
 * string is valid TypeScript ready to be written to a file or interpolated
 * into a larger template.
 *
 * This is the single source of truth for credential handling across all
 * AWS-touching extensions. Hand-written extensions receive a verbatim copy
 * via `deno task generate:aws-credentials`; the codegen template
 * (`libGenerator.ts`) interpolates a non-exported variant into the
 * generated `aws.ts`.
 */
export function generateAwsCredentialSource(opts: {
  exported?: boolean;
  includeFileHeader?: boolean;
  includePreflight?: boolean;
}): string {
  const exp = opts.exported !== false ? "export " : "";
  const includePreflight = opts.includePreflight !== false;
  const header = opts.includeFileHeader
    ? `${generateCopyrightHeader()}

// Auto-generated AWS credential utilities.
// Do not edit manually. Re-generate with: deno task generate:aws-credentials
// Canonical source: codegen/shared/awsCredentials.ts

`
    : "";

  // Inner template literals in the generated code use escaped backticks
  // and interpolation markers, following the libGenerator.ts convention.
  return `${header}${exp}type AwsCredentialErrorKind =
  | "session-expired"
  | "credentials-rejected"
  | "other";

${exp}function classifyAwsCredentialError(
  code: string | undefined,
  status: number | undefined,
): AwsCredentialErrorKind {
  if (code === "CredentialsProviderError" || code === "ExpiredTokenException") {
    return "session-expired";
  }
  if (
    code === "InvalidAccessKeyId" ||
    code === "SignatureDoesNotMatch" ||
    (status === 403 && code === "AccessDenied")
  ) {
    return "credentials-rejected";
  }
  return "other";
}

${exp}function deriveAwsErrorCode(e: {
  Code?: string;
  name?: string;
  cause?: unknown;
}): string | undefined {
  if (e.Code) return e.Code;
  if (e.name && e.name !== "Error") return e.name;
  if (e.cause instanceof Error && e.cause.name && e.cause.name !== "Error") {
    return e.cause.name.replace(/^_+/, "");
  }
  return undefined;
}

${exp}function formatAwsCredentialHint(
  kind: AwsCredentialErrorKind,
  awsProfile: string | undefined,
  context: string,
): string | undefined {
  if (kind === "session-expired") {
    const cmd = awsProfile
      ? 'aws sso login --profile "' + awsProfile + '"'
      : "aws sso login";
    return (
      context +
      " session expired: your AWS profile's SSO session is no longer valid. Run '" +
      cmd +
      "' to refresh, then retry."
    );
  }
  if (kind === "credentials-rejected") {
    const who = awsProfile ? "'" + awsProfile + "'" : "your AWS profile";
    return (
      context +
      " credentials rejected by AWS: verify " +
      who +
      ", environment variables, or credential provider, then retry."
    );
  }
  return undefined;
}

${exp}function disableImdsIfOffEc2(): void {
  if (
    !Deno.env.get("AWS_EC2_METADATA_DISABLED") &&
    !Deno.env.get("AWS_CONTAINER_CREDENTIALS_RELATIVE_URI") &&
    !Deno.env.get("AWS_CONTAINER_CREDENTIALS_FULL_URI")
  ) {
    Deno.env.set("AWS_EC2_METADATA_DISABLED", "true");
  }
}

${
    includePreflight
      ? `${exp}const PREFLIGHT_TIMEOUT_MS = 3_000;

${exp}async function preflightCredentials(
  probe: () => Promise<unknown>,
  timeoutMs: number = PREFLIGHT_TIMEOUT_MS,
): Promise<void> {
  const probePromise = probe();
  probePromise.catch(() => {});

  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(
            "Credential preflight timed out after " + timeoutMs + "ms \\u2014 " +
              "verify that AWS credentials are configured " +
              "(AWS_ACCESS_KEY_ID, AWS_PROFILE, or attached IAM role) " +
              "and that the credential source is responsive",
          ),
        ),
      timeoutMs,
    );
  });

  try {
    await Promise.race([probePromise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}
`
      : ""
  }`;
}

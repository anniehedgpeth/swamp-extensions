import { dirname, fromFileUrl, resolve } from "@std/path";
import { generateAwsCredentialSource } from "../shared/awsCredentials.ts";

const codegenDir = resolve(dirname(fromFileUrl(import.meta.url)), "..");
const repoRoot = resolve(codegenDir, "..");

const targets = [
  "datastore/s3/extensions/datastores/_lib/aws_credentials.ts",
  "vault/aws-sm/extensions/vaults/_lib/aws_credentials.ts",
  "workflows/s3-bootstrap/extensions/models/_lib/aws_credentials.ts",
];

const source = generateAwsCredentialSource({
  exported: true,
  includeFileHeader: true,
});

let changed = 0;
for (const target of targets) {
  const absPath = resolve(repoRoot, target);

  let existing = "";
  try {
    existing = Deno.readTextFileSync(absPath);
  } catch {
    // File doesn't exist yet — will be created
  }

  if (existing === source) {
    console.log(`[aws-credentials] ${target} — up to date`);
    continue;
  }

  Deno.writeTextFileSync(absPath, source);
  console.log(`[aws-credentials] ${target} — updated`);
  changed++;
}

console.log(
  changed > 0
    ? `[aws-credentials] ${changed} file(s) updated`
    : "[aws-credentials] all files up to date",
);

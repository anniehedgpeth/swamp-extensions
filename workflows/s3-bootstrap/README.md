# @swamp/s3-datastore-bootstrap

One-shot provisioner that creates an S3 bucket and a least-privilege IAM
managed policy for [`@swamp/s3-datastore`](../../datastore/s3/), then flips
the current repository's datastore over to S3.

Ships:

- a provisioner model (`@swamp/s3-datastore-bootstrap/provisioner`) that
  wraps the AWS S3 + IAM + STS calls behind a single `provision` method, and
- a workflow (`bootstrap-s3-datastore`) that runs the provisioner and then
  invokes `swamp datastore setup extension @swamp/s3-datastore --config ...`
  via the built-in `command/shell` model.

## Why

A fresh `swamp repo init` starts on the filesystem datastore. Moving to S3
is a three-part problem:

1. Create the bucket with safe defaults (private, versioned, encrypted).
2. Author an IAM policy with exactly the actions `@swamp/s3-datastore` uses.
3. Point swamp at the new bucket.

Each step is obvious in isolation and easy to botch in aggregate (over-broad
policies, public buckets, forgotten versioning). This extension collapses
all three into one workflow run.

## Prerequisites

- AWS credentials available through the default credential chain
  (`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`, an AWS profile, an
  instance/role profile) with permission to:
  - `s3:CreateBucket`, `s3:ListBucket` (authorizes HeadBucket), `s3:PutBucketVersioning`,
    `s3:PutEncryptionConfiguration`, `s3:PutBucketPublicAccessBlock`
  - `iam:CreatePolicy`, `iam:GetPolicy`
  - `sts:GetCallerIdentity`
- The caller that will run `swamp` after setup must already hold — or be
  able to attach — the managed policy the provisioner produces.

## What the provisioner creates

**S3 bucket:**

- Public access block (all four `Block*`/`Ignore*`/`Restrict*` flags on).
- Versioning enabled.
- SSE-S3 (AES256) default encryption with bucket key enabled.

**IAM managed policy** (default name: `swamp-s3-datastore-<bucket_name>`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SwampS3DatastoreBucketLevel",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::<bucket>"
    },
    {
      "Sid": "SwampS3DatastoreObjectLevel",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::<bucket>/*"
    }
  ]
}
```

Four IAM actions cover the six operations `@swamp/s3-datastore` uses —
`HeadBucket` is authorized through `s3:ListBucket` and `HeadObject` through
`s3:GetObject`, so the policy stays as tight as AWS allows.

## Usage (workflow)

```bash
swamp extension pull @swamp/s3-datastore-bootstrap

swamp model create @swamp/s3-datastore-bootstrap/provisioner \
  swamp-s3-datastore-provisioner

# Edit the instance so globalArguments are wired to workflow inputs:
#   bucket_name: ${{ inputs.bucket_name }}
#   region:      ${{ inputs.region }}
#   prefix:      ${{ inputs.prefix }}
#   policy_name: ${{ inputs.policy_name }}
swamp model edit swamp-s3-datastore-provisioner

# The command/shell instance used by the final workflow step
swamp model create command/shell swamp-s3-datastore-setup

swamp workflow run bootstrap-s3-datastore \
  --input bucket_name=my-swamp-state \
  --input region=us-east-1

# Ensure the datastore is looking good
swamp datastore status
```

Optional inputs (defaults shown in comments):

```bash
swamp workflow run bootstrap-s3-datastore \
  --input bucket_name=my-swamp-state \
  --input region=us-east-1 \
  --input prefix=swamp                         `# default: ""` \
  --input policy_name=my-custom-policy-name    `# default: swamp-s3-datastore-<bucket_name>`
```

## Usage (CLI, provisioner only)

If you want to create the bucket + policy but handle the datastore switch
yourself:

```bash
swamp model create @swamp/s3-datastore-bootstrap/provisioner my-store \
  --global-arg bucket_name=my-swamp-state \
  --global-arg region=us-east-1 --json

swamp model method run my-store provision --json

# Inspect outputs, then attach the policy to your principal, then:
swamp datastore setup extension @swamp/s3-datastore \
  --config '{"bucket":"my-swamp-state","region":"us-east-1"}' --json
```

## Idempotency

- **Bucket:** `HeadBucket` probes first; if the bucket exists, creation
  is skipped. `CreateBucket` also catches `BucketAlreadyOwnedByYou` so a
  concurrent provision run on the same name degrades to a reuse instead
  of an error. The three hardening calls (`PutPublicAccessBlock`,
  `PutBucketVersioning`, `PutBucketEncryption`) are declarative
  set-the-state operations and are re-applied on every run, so
  re-running after a partial failure restores the intended posture.

  > Note: this means pointing the bootstrap at an existing bucket will
  > overwrite its public-access-block, versioning, and SSE configuration
  > with swamp's defaults (AES256, versioning on, all public access
  > blocked). If the target bucket uses SSE-KMS or a different posture
  > you want to preserve, don't run the bootstrap against it —
  > provision a policy separately instead.

- **Policy:** `GetPolicy` probes the expected ARN (derived from
  `sts:GetCallerIdentity` + `policy_name`); if the policy exists, its
  ARN is reused as-is and the document is **not** updated. If
  `GetPolicy` misses and `CreatePolicy` loses a race against a concurrent
  run (`EntityAlreadyExistsException`), the expected ARN is still
  returned. Delete the policy and re-run if you need to pick up a
  changed statement set.

## Inputs

| input         | required | default                            | description                              |
| ------------- | -------- | ---------------------------------- | ---------------------------------------- |
| `bucket_name` | yes      | —                                  | S3 bucket name (AWS naming rules apply). |
| `region`      | yes      | —                                  | AWS region for the bucket.               |
| `prefix`      | no       | `""`                               | Key prefix within the bucket.            |
| `policy_name` | no       | `swamp-s3-datastore-<bucket_name>` | IAM managed policy name.                 |

## Caveats

- **Policy attachment is your job.** This extension creates the policy; it
  does not attach it to a principal. After the workflow completes, attach
  `policy_arn` to whichever IAM user, role, or instance profile will run
  swamp going forward.

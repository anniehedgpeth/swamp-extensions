import { trace } from "npm:@opentelemetry/api@1.9.0";

const TRACER_NAME = "@swamp/git";

export function getTracer() {
  return trace.getTracer(TRACER_NAME);
}

export const Attr = {
  METHOD: "git.method",
  REPO_PATH: "git.repo_path",
  EXIT_CODE: "git.exit_code",
  BASE_REF: "git.base_ref",
  HEAD_REF: "git.head_ref",
  BRANCH: "git.branch",
  REMOTE: "git.remote",
  COMMIT_SHA: "git.commit_sha",
  CHERRY_PICK_SHA: "git.cherry_pick_sha",
  UPSTREAM_REF: "git.upstream_ref",
  REF: "git.ref",
} as const;

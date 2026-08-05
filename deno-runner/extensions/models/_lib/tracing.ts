import { trace } from "npm:@opentelemetry/api@1.9.0";

const TRACER_NAME = "@swamp/deno-runner";

export function getTracer() {
  return trace.getTracer(TRACER_NAME);
}

export const Attr = {
  VERSION: "deno_runner.deno_version",
  METHOD: "deno_runner.method",
  COMMAND: "deno_runner.command",
  EXIT_CODE: "deno_runner.exit_code",
  PLATFORM: "deno_runner.platform",
} as const;

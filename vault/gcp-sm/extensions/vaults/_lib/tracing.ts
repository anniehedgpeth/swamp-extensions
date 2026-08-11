import { trace } from "npm:@opentelemetry/api@1.9.0";

export function getTracer() {
  return trace.getTracer("@swamp/gcp-sm-vault");
}

export const Attr = {
  RPC_SYSTEM: "rpc.system",
  RPC_SERVICE: "rpc.service",
  RPC_METHOD: "rpc.method",
  VAULT_NAME: "vault.name",
  VAULT_SECRET_KEY: "vault.secret_key",
  ERROR_TYPE: "error.type",
} as const;

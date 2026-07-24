import type { GcpEnrichment } from "./types.ts";

export const enrichment: GcpEnrichment = {
  resourceId: "cloudidentity.groups.memberships",
  npmImports: {},
  sourceFile: new URL(
    "./cloudidentity-groups-memberships.enrich.ts",
    import.meta.url,
  ).pathname,
  methodsExport: "membershipReconcileMethods",
};

import type { GcpEnrichment } from "./types.ts";

export const enrichment: GcpEnrichment = {
  resourceId: "cloudresourcemanager.projects",
  npmImports: {},
  sourceFile: new URL(
    "./cloudresourcemanager-projects.enrich.ts",
    import.meta.url,
  ).pathname,
  methodsExport: "iamBindingMethods",
};

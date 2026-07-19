import { assertEquals } from "@std/assert";
import {
  type GcpDiscoveryDocument,
  parseGcpDiscoveryDocument,
} from "./pipeline.ts";

function makeDiscoveryDoc(
  overrides: Partial<GcpDiscoveryDocument>,
): GcpDiscoveryDocument {
  return {
    kind: "discovery#restDescription",
    name: "testapi",
    version: "v1",
    title: "Test API",
    baseUrl: "https://test.googleapis.com/v1/",
    basePath: "/v1/",
    rootUrl: "https://test.googleapis.com/",
    servicePath: "v1/",
    schemas: {},
    ...overrides,
  };
}

Deno.test("parseGcpDiscoveryDocument - listResponseArrayField prefers resource name match over first candidate", () => {
  const doc = makeDiscoveryDoc({
    name: "calendar",
    title: "Calendar API",
    schemas: {
      Event: {
        type: "object",
        properties: {
          id: { type: "string" },
          summary: { type: "string" },
        },
      },
      Reminder: {
        type: "object",
        properties: {
          method: { type: "string" },
          minutes: { type: "integer" },
        },
      },
    },
    resources: {
      events: {
        methods: {
          get: {
            id: "calendar.events.get",
            path: "calendars/{calendarId}/events/{eventId}",
            httpMethod: "GET",
            parameterOrder: ["calendarId", "eventId"],
            parameters: {
              calendarId: { type: "string", location: "path", required: true },
              eventId: { type: "string", location: "path", required: true },
            },
            response: {
              type: "object",
              properties: {
                id: { type: "string" },
                summary: { type: "string" },
              },
            },
          },
          list: {
            id: "calendar.events.list",
            path: "calendars/{calendarId}/events",
            httpMethod: "GET",
            parameterOrder: ["calendarId"],
            parameters: {
              calendarId: { type: "string", location: "path", required: true },
              pageToken: { type: "string", location: "query" },
            },
            response: {
              type: "object",
              properties: {
                defaultReminders: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      method: { type: "string" },
                      minutes: { type: "integer" },
                    },
                  },
                },
                events: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      summary: { type: "string" },
                    },
                  },
                },
                nextPageToken: { type: "string" },
              },
            },
          },
        },
      },
    },
  });

  const resources = parseGcpDiscoveryDocument(doc);
  assertEquals(resources.length, 1);
  assertEquals(resources[0].listResponseArrayField, "events");
});

Deno.test("parseGcpDiscoveryDocument - listResponseArrayField falls back to 'items' when no resource name match", () => {
  const doc = makeDiscoveryDoc({
    name: "calendar",
    title: "Calendar API",
    schemas: {},
    resources: {
      events: {
        methods: {
          get: {
            id: "calendar.events.get",
            path: "calendars/{calendarId}/events/{eventId}",
            httpMethod: "GET",
            parameterOrder: ["calendarId", "eventId"],
            parameters: {
              calendarId: { type: "string", location: "path", required: true },
              eventId: { type: "string", location: "path", required: true },
            },
            response: {
              type: "object",
              properties: {
                id: { type: "string" },
                summary: { type: "string" },
              },
            },
          },
          list: {
            id: "calendar.events.list",
            path: "calendars/{calendarId}/events",
            httpMethod: "GET",
            parameterOrder: ["calendarId"],
            parameters: {
              calendarId: { type: "string", location: "path", required: true },
              pageToken: { type: "string", location: "query" },
            },
            response: {
              type: "object",
              properties: {
                defaultReminders: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      method: { type: "string" },
                      minutes: { type: "integer" },
                    },
                  },
                },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      summary: { type: "string" },
                    },
                  },
                },
                nextPageToken: { type: "string" },
              },
            },
          },
        },
      },
    },
  });

  const resources = parseGcpDiscoveryDocument(doc);
  assertEquals(resources.length, 1);
  assertEquals(resources[0].listResponseArrayField, "items");
});

Deno.test("parseGcpDiscoveryDocument - listResponseArrayField uses first candidate when no resource name or items match", () => {
  const doc = makeDiscoveryDoc({
    name: "customapi",
    title: "Custom API",
    schemas: {},
    resources: {
      widgets: {
        methods: {
          get: {
            id: "customapi.widgets.get",
            path: "widgets/{widgetId}",
            httpMethod: "GET",
            parameterOrder: ["widgetId"],
            parameters: {
              widgetId: { type: "string", location: "path", required: true },
            },
            response: {
              type: "object",
              properties: {
                id: { type: "string" },
              },
            },
          },
          list: {
            id: "customapi.widgets.list",
            path: "widgets",
            httpMethod: "GET",
            parameterOrder: [],
            parameters: {
              pageToken: { type: "string", location: "query" },
            },
            response: {
              type: "object",
              properties: {
                gadgets: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                    },
                  },
                },
                nextPageToken: { type: "string" },
              },
            },
          },
        },
      },
    },
  });

  const resources = parseGcpDiscoveryDocument(doc);
  assertEquals(resources.length, 1);
  assertEquals(resources[0].listResponseArrayField, "gadgets");
});

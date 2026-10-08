import { SITE_DESCRIPTION, SITE_URL } from "./site";

/* OpenAPI 3.1 description of the endpoints this site exposes to agents.
   Only endpoints that behave as described are listed: the OpenUI Cloud and
   demo-chat routes are internal to the website's own UI and are left out. */

const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/Error" } },
  },
});

export function buildOpenApiSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "OpenUI website API",
      version: "1.0.0",
      summary: "Documentation search, MCP access and machine-readable content for OpenUI.",
      description: `${SITE_DESCRIPTION} This API covers the public, read-mostly endpoints of ${SITE_URL}. The OpenUI libraries themselves (@openuidev/react-lang, @openuidev/cli) run locally and have no HTTP API.`,
      license: { name: "MIT", url: "https://github.com/thesysdev/openui/blob/main/LICENSE" },
    },
    servers: [{ url: SITE_URL }],
    tags: [
      { name: "docs", description: "Search and read the OpenUI documentation." },
      { name: "agents", description: "Agent-oriented entry points: MCP, llms.txt, benchmarks." },
      { name: "waitlist", description: "Early access sign-up." },
    ],
    paths: {
      "/api/search": {
        get: {
          operationId: "searchDocs",
          tags: ["docs"],
          summary: "Search the OpenUI documentation",
          description:
            "Full-text search over all documentation pages. Returns page, heading and text hits ordered by relevance, each with a URL you can open. Use this to find the right docs page before answering a question about OpenUI.",
          parameters: [
            {
              name: "query",
              in: "query",
              required: true,
              description: "Search text, for example 'defineComponent' or 'streaming'.",
              schema: { type: "string", minLength: 1, examples: ["defineComponent"] },
            },
          ],
          responses: {
            "200": {
              description: "Matching documentation fragments. Empty array when nothing matches.",
              content: {
                "application/json": {
                  schema: { type: "array", items: { $ref: "#/components/schemas/SearchResult" } },
                },
              },
            },
          },
        },
      },
      "/mcp": {
        post: {
          operationId: "callMcpServer",
          tags: ["agents"],
          summary: "Model Context Protocol server (Streamable HTTP)",
          description:
            "Stateless MCP endpoint speaking JSON-RPC 2.0 over HTTP POST. Supports initialize, ping, tools/list and tools/call with the tools search_docs and get_doc_page. Point an MCP client at this URL rather than calling it by hand.",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/JsonRpcRequest" } },
            },
          },
          responses: {
            "200": {
              description: "JSON-RPC response.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/JsonRpcResponse" } },
              },
            },
            "202": { description: "Notification accepted; no body." },
            "400": errorResponse("The body was not valid JSON-RPC."),
          },
        },
      },
      "/llms.txt": {
        get: {
          operationId: "getLlmsIndex",
          tags: ["agents"],
          summary: "Documentation index for LLMs (llms.txt)",
          description:
            "Plain-text index of every documentation page with when-to-use guidance. Fetch this first when you need to discover what OpenUI offers.",
          responses: {
            "200": {
              description: "llms.txt document.",
              content: { "text/plain": { schema: { type: "string" } } },
            },
          },
        },
      },
      "/llms-full.txt": {
        get: {
          operationId: "getLlmsFull",
          tags: ["agents"],
          summary: "Complete documentation as one text file",
          description:
            "All documentation pages concatenated. Large; prefer searchDocs or a single page unless you need everything.",
          responses: {
            "200": {
              description: "Full documentation text.",
              content: { "text/plain": { schema: { type: "string" } } },
            },
          },
        },
      },
      "/benchmarks/data.json": {
        get: {
          operationId: "getBenchmarkData",
          tags: ["agents"],
          summary: "Generative UI benchmark dataset",
          description:
            "Versioned machine-readable results comparing structural validity and cost across models generating OpenUI. Its JSON Schema is at /benchmarks/data.schema.json.",
          responses: {
            "200": {
              description: "Benchmark dataset.",
              content: { "application/json": { schema: { type: "object" } } },
            },
          },
        },
      },
      "/api/waitlist": {
        post: {
          operationId: "joinWaitlist",
          tags: ["waitlist"],
          summary: "Join the OpenUI Observability early-access list",
          description:
            "Adds an email address to the early-access list. Intended for the website's own form: requests must carry an Origin header equal to https://www.openui.com, otherwise the response is 403 origin_not_allowed. Do not call on a user's behalf without their explicit consent.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: {
                    email: { type: "string", format: "email", maxLength: 254 },
                  },
                  additionalProperties: false,
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Address stored.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["ok"],
                    properties: { ok: { type: "boolean", const: true } },
                  },
                },
              },
            },
            "400": errorResponse("Invalid or missing email (invalid_email, email_required)."),
            "403": errorResponse("Request origin not allowed (origin_not_allowed)."),
            "413": errorResponse("Body too large (body_too_large)."),
            "415": errorResponse("Content-Type was not application/json."),
            "503": errorResponse("Storage temporarily unavailable (waitlist_unavailable)."),
          },
        },
      },
    },
    components: {
      schemas: {
        Error: {
          type: "object",
          description:
            "Every JSON error from this API has this shape. Branch on `code`; show `error`; follow `hint`.",
          required: ["error", "code", "status"],
          properties: {
            error: { type: "string", description: "Human-readable message." },
            code: { type: "string", description: "Stable machine-readable error code." },
            status: { type: "integer", description: "HTTP status, repeated for convenience." },
            hint: { type: "string", description: "What to do next." },
          },
        },
        SearchResult: {
          type: "object",
          required: ["id", "url", "type", "content"],
          properties: {
            id: { type: "string" },
            url: { type: "string", description: "Site-relative URL of the hit." },
            type: { type: "string", enum: ["page", "heading", "text"] },
            content: { type: "string", description: "Matching text." },
          },
        },
        JsonRpcRequest: {
          type: "object",
          required: ["jsonrpc", "method"],
          properties: {
            jsonrpc: { type: "string", const: "2.0" },
            id: { type: ["string", "integer"] },
            method: {
              type: "string",
              examples: ["initialize", "tools/list", "tools/call", "ping"],
            },
            params: { type: "object" },
          },
        },
        JsonRpcResponse: {
          type: "object",
          required: ["jsonrpc"],
          properties: {
            jsonrpc: { type: "string", const: "2.0" },
            id: { type: ["string", "integer", "null"] },
            result: { type: "object" },
            error: {
              type: "object",
              required: ["code", "message"],
              properties: { code: { type: "integer" }, message: { type: "string" } },
            },
          },
        },
      },
    },
  } as const;
}

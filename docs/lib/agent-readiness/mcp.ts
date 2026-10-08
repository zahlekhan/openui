import { SITE_NAME } from "./site";

/* A small, stateless MCP server (Streamable HTTP transport, JSON responses).
   Spec: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
   Handles one JSON-RPC message per POST; no sessions, no server-initiated
   messages, so GET is answered 405 as the spec allows. */

export const MCP_PROTOCOL_VERSION = "2025-06-18";
const SUPPORTED_VERSIONS = new Set(["2025-06-18", "2025-03-26", "2024-11-05"]);

export interface DocHit {
  title: string;
  url: string;
  description: string;
}

export interface McpBackend {
  searchDocs(query: string, limit: number): Promise<DocHit[]>;
  getDocPage(path: string): Promise<string | null>;
}

type JsonRpcId = string | number | null;
interface JsonRpcMessage {
  jsonrpc?: unknown;
  id?: JsonRpcId;
  method?: unknown;
  params?: Record<string, unknown>;
}

const TOOLS = [
  {
    name: "search_docs",
    title: "Search OpenUI docs",
    description:
      "Search the OpenUI documentation by keyword and get matching pages with URLs. Use first when answering any question about OpenUI Lang, the React renderer, the CLI, OpenUI Cloud or integrations.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keywords, e.g. 'defineComponent streaming'." },
        limit: { type: "integer", minimum: 1, maximum: 20, default: 5 },
      },
      required: ["query"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_doc_page",
    title: "Read an OpenUI docs page",
    description:
      "Return one documentation page as Markdown. Pass the path from a search_docs result, e.g. '/docs/overview'.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", description: "Docs path starting with /docs/." } },
      required: ["path"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

const ok = (id: JsonRpcId, result: unknown) => ({ jsonrpc: "2.0" as const, id, result });
const fail = (id: JsonRpcId, code: number, message: string) => ({
  jsonrpc: "2.0" as const,
  id,
  error: { code, message },
});
const text = (value: string, isError = false) => ({
  content: [{ type: "text", text: value }],
  ...(isError ? { isError: true } : {}),
});

/** Returns the JSON-RPC response, or null when the message needs none (notification). */
export async function handleMcpMessage(msg: unknown, backend: McpBackend): Promise<object | null> {
  if (!msg || typeof msg !== "object" || Array.isArray(msg)) {
    return fail(null, -32600, "Invalid Request: expected a single JSON-RPC object.");
  }
  const m = msg as JsonRpcMessage;
  if (m.jsonrpc !== "2.0" || typeof m.method !== "string") {
    return fail(m.id ?? null, -32600, 'Invalid Request: need jsonrpc "2.0" and a method string.');
  }
  // No id => notification (or a client response); acknowledge with no body.
  if (m.id === undefined) return null;
  const id = m.id;

  switch (m.method) {
    case "initialize": {
      const asked = m.params?.protocolVersion;
      const version =
        typeof asked === "string" && SUPPORTED_VERSIONS.has(asked) ? asked : MCP_PROTOCOL_VERSION;
      return ok(id, {
        protocolVersion: version,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "openui-docs", title: `${SITE_NAME} documentation`, version: "1.0.0" },
        instructions:
          "Read-only access to OpenUI documentation. Call search_docs, then get_doc_page for the best hit.",
      });
    }
    case "ping":
      return ok(id, {});
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const name = m.params?.name;
      const args = (m.params?.arguments ?? {}) as Record<string, unknown>;
      if (name === "search_docs") {
        if (typeof args.query !== "string" || !args.query.trim()) {
          return ok(id, text("search_docs requires a non-empty string `query`.", true));
        }
        const limit = Math.min(20, Math.max(1, Number(args.limit) || 5));
        const hits = await backend.searchDocs(args.query, limit);
        if (hits.length === 0) {
          return ok(
            id,
            text(`No documentation pages matched "${args.query}". Try fewer keywords.`),
          );
        }
        return ok(
          id,
          text(hits.map((h) => `- [${h.title}](${h.url}): ${h.description}`).join("\n")),
        );
      }
      if (name === "get_doc_page") {
        if (typeof args.path !== "string") {
          return ok(id, text("get_doc_page requires a string `path`.", true));
        }
        const page = await backend.getDocPage(args.path);
        return ok(
          id,
          page === null
            ? text(`No docs page at "${args.path}". Use search_docs to find valid paths.`, true)
            : text(page),
        );
      }
      return fail(id, -32602, `Unknown tool: ${String(name)}`);
    }
    default:
      return fail(id, -32601, `Method not found: ${m.method}`);
  }
}

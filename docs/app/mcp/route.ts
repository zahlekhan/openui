import { apiError } from "@/lib/agent-readiness/api-error";
import { handleMcpMessage, type McpBackend } from "@/lib/agent-readiness/mcp";
import { BASE_URL, getLLMText, source } from "@/lib/source";

export const dynamic = "force-dynamic";

const backend: McpBackend = {
  async searchDocs(query, limit) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = source.getPages().map((page) => {
      const title = page.data.title.toLowerCase();
      const description = (page.data.description ?? "").toLowerCase();
      const url = page.url.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (title.includes(term)) score += 5;
        if (url.includes(term)) score += 3;
        if (description.includes(term)) score += 2;
      }
      return { page, score };
    });
    return scored
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ page }) => ({
        title: page.data.title,
        url: new URL(page.url, BASE_URL).toString(),
        description: page.data.description ?? "",
      }));
  },
  async getDocPage(path) {
    const pathname = path.startsWith("http") ? new URL(path).pathname : path;
    const slugs = pathname
      .replace(/^\/docs\/?/, "")
      .split("/")
      .filter(Boolean);
    const page = source.getPage(slugs);
    return page ? await getLLMText(page) : null;
  },
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id",
};

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(
      400,
      "malformed_json",
      "Body is not valid JSON.",
      "Send one JSON-RPC 2.0 message.",
      CORS,
    );
  }
  const response = await handleMcpMessage(body, backend);
  if (response === null) return new Response(null, { status: 202, headers: CORS });
  return Response.json(response, { headers: { "Cache-Control": "no-store", ...CORS } });
}

export function GET(): Response {
  return apiError(
    405,
    "method_not_allowed",
    "This MCP server does not offer a GET event stream.",
    "POST JSON-RPC messages to this URL.",
    { ...CORS, Allow: "POST, OPTIONS" },
  );
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS });
}

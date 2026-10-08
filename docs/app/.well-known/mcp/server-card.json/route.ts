import { SITE_URL } from "@/lib/agent-readiness/site";

export const dynamic = "force-static";

/* Discovery card for the MCP endpoint at /mcp. The server-card format is still
   a draft proposal in the MCP project, so this carries only widely used fields. */
export function GET() {
  return Response.json({
    name: "openui-docs",
    title: "OpenUI documentation",
    description: "Search and read the OpenUI documentation. Read-only, no authentication.",
    version: "1.0.0",
    websiteUrl: SITE_URL,
    remotes: [{ type: "streamable-http", url: `${SITE_URL}/mcp` }],
    authentication: { required: false },
    tools: ["search_docs", "get_doc_page"],
  });
}

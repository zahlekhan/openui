import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/source", () => ({
  BASE_URL: "https://www.openui.com",
  source: { getPages: () => [], getPage: () => undefined },
  getLLMText: async () => "",
}));

import { apiError } from "../lib/agent-readiness/api-error";
import { homeJsonLd } from "../lib/agent-readiness/json-ld";
import { handleMcpMessage, type McpBackend } from "../lib/agent-readiness/mcp";
import { withVaryAccept } from "../lib/agent-readiness/negotiation";
import { buildOpenApiSpec } from "../lib/agent-readiness/openapi";

const backend: McpBackend = {
  searchDocs: async (q) =>
    q === "none" ? [] : [{ title: "Overview", url: "https://x/docs/overview", description: "d" }],
  getDocPage: async (p) => (p === "/docs/overview" ? "# Overview" : null),
};

describe("apiError", () => {
  it("returns a structured JSON body with code, message, hint and status", async () => {
    const res = apiError(400, "bad", "Nope", "Fix it");
    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(await res.json()).toEqual({ error: "Nope", code: "bad", status: 400, hint: "Fix it" });
  });
});

describe("catch-all API route", () => {
  it("answers unknown paths with a JSON 404", async () => {
    const { GET, POST } = await import("../app/api/[...path]/route");
    for (const handler of [GET, POST]) {
      const res = handler();
      expect(res.status).toBe(404);
      expect((await res.json()).code).toBe("not_found");
    }
  });
});

describe("waitlist route errors", () => {
  it("rejects a foreign origin with a structured error", async () => {
    const { POST } = await import("../app/api/waitlist/route");
    const res = await POST(
      new Request("https://www.openui.com/api/waitlist", {
        method: "POST",
        headers: { origin: "https://evil.example", "content-type": "application/json" },
        body: "{}",
      }),
    );
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe("origin_not_allowed");
  });

  it("rejects an invalid email with a hint", async () => {
    const { POST } = await import("../app/api/waitlist/route");
    const res = await POST(
      new Request("https://www.openui.com/api/waitlist", {
        method: "POST",
        headers: { origin: "https://www.openui.com", "content-type": "application/json" },
        body: JSON.stringify({ email: "nope" }),
      }),
    );
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body).toMatchObject({ code: "invalid_email", error: expect.any(String) });
    expect(body.hint).toBeTruthy();
  });
});

describe("withVaryAccept", () => {
  it("adds Accept when Vary is absent", () => {
    const h = new Headers();
    withVaryAccept(h);
    expect(h.get("Vary")).toBe("Accept");
  });
  it("appends to existing Vary values and does not duplicate", () => {
    const h = new Headers({ Vary: "rsc, next-router-state-tree" });
    withVaryAccept(h);
    expect(h.get("Vary")).toBe("rsc, next-router-state-tree, Accept");
    withVaryAccept(h);
    expect(h.get("Vary")).toBe("rsc, next-router-state-tree, Accept");
  });
});

describe("OpenAPI spec", () => {
  const spec = buildOpenApiSpec();
  it("is OpenAPI 3.1 with a server", () => {
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.servers[0].url).toBe("https://www.openui.com");
  });
  it("gives every operation a unique operationId, summary and description", () => {
    const ids: string[] = [];
    for (const item of Object.values(spec.paths)) {
      for (const op of Object.values(item) as Array<Record<string, unknown>>) {
        expect(op.summary).toBeTruthy();
        expect(op.description).toBeTruthy();
        ids.push(op.operationId as string);
      }
    }
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("resolves every $ref", () => {
    const refs = JSON.stringify(spec).match(/#\/components\/schemas\/\w+/g) ?? [];
    for (const ref of refs) {
      expect(spec.components.schemas).toHaveProperty(ref.split("/").pop()!);
    }
  });
  it("is served as JSON by the route", async () => {
    const { GET } = await import("../app/openapi.json/route");
    const res = GET();
    expect(res.headers.get("content-type")).toContain("application/json");
    expect((await res.json()).openapi).toBe("3.1.0");
  });
});

describe("MCP server", () => {
  const rpc = (method: string, params?: object, id: number | undefined = 1) =>
    handleMcpMessage({ jsonrpc: "2.0", id, method, params }, backend) as Promise<any>;
  const notify = (method: string) => handleMcpMessage({ jsonrpc: "2.0", method }, backend);

  it("initializes and negotiates the protocol version", async () => {
    const res = await rpc("initialize", { protocolVersion: "2025-03-26" });
    expect(res.result.protocolVersion).toBe("2025-03-26");
    expect(res.result.capabilities.tools).toBeDefined();
    expect((await rpc("initialize", { protocolVersion: "1999" })).result.protocolVersion).toBe(
      "2025-06-18",
    );
  });
  it("lists tools with input schemas", async () => {
    const res = await rpc("tools/list");
    expect(res.result.tools.map((t: any) => t.name)).toEqual(["search_docs", "get_doc_page"]);
  });
  it("calls tools", async () => {
    const hit = await rpc("tools/call", { name: "search_docs", arguments: { query: "x" } });
    expect(hit.result.content[0].text).toContain("[Overview]");
    const miss = await rpc("tools/call", { name: "get_doc_page", arguments: { path: "/nope" } });
    expect(miss.result.isError).toBe(true);
    const page = await rpc("tools/call", {
      name: "get_doc_page",
      arguments: { path: "/docs/overview" },
    });
    expect(page.result.content[0].text).toBe("# Overview");
  });
  it("reports protocol errors", async () => {
    expect((await rpc("nope")).error.code).toBe(-32601);
    expect((await rpc("tools/call", { name: "zzz" })).error.code).toBe(-32602);
    expect(((await handleMcpMessage([], backend)) as any).error.code).toBe(-32600);
  });
  it("returns nothing for notifications", async () => {
    expect(await notify("notifications/initialized")).toBeNull();
  });
  it("POST handler: 400 for bad JSON, 202 for notifications, GET is 405", async () => {
    const { POST, GET } = await import("../app/mcp/route");
    const bad = await POST(new Request("https://x/mcp", { method: "POST", body: "{" }));
    expect(bad.status).toBe(400);
    const note = await POST(
      new Request("https://x/mcp", {
        method: "POST",
        body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
      }),
    );
    expect(note.status).toBe(202);
    expect(GET().status).toBe(405);
  });
});

describe("homepage JSON-LD", () => {
  const graph = homeJsonLd()["@graph"];
  it("describes the software and the organization", () => {
    expect(graph.map((n) => n["@type"])).toEqual(["Organization", "SoftwareApplication"]);
  });
  it("includes contactPoint and a PostalAddress on the Organization", () => {
    const org = graph[0] as any;
    expect(org.contactPoint.contactType).toBeTruthy();
    expect(org.address["@type"]).toBe("PostalAddress");
  });
  it("round-trips through JSON", () => {
    expect(() => JSON.parse(JSON.stringify(homeJsonLd()))).not.toThrow();
  });
});

describe("proxy Markdown negotiation", () => {
  it("rewrites / and docs pages to Markdown for Accept: text/markdown, and leaves HTML alone", async () => {
    const { NextRequest } = await import("next/server");
    const proxy = (await import("../proxy")).default;
    const md = { headers: { accept: "text/markdown" } };

    const home = proxy(new NextRequest("https://www.openui.com/", md));
    expect(home.headers.get("x-middleware-rewrite")).toContain("/index.md");
    expect(home.headers.get("Vary")).toContain("Accept");

    const doc = proxy(new NextRequest("https://www.openui.com/docs/overview", md));
    expect(doc.headers.get("x-middleware-rewrite")).toContain("/llms.mdx/docs/overview");

    const html = proxy(
      new NextRequest("https://www.openui.com/", { headers: { accept: "text/html" } }),
    );
    expect(html.headers.get("x-middleware-rewrite")).toBeNull();
  });
});

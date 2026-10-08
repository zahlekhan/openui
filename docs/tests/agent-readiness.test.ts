import { describe, expect, it } from "vitest";

import { apiError } from "../lib/agent-readiness/api-error";
import { homeJsonLd } from "../lib/agent-readiness/json-ld";
import { withVaryAccept } from "../lib/agent-readiness/negotiation";

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

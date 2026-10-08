/* acceptmarkdown.com: a response that varies on Accept must say so, or a CDN
   may hand the HTML variant to an agent that asked for Markdown. */
export function withVaryAccept(headers: Headers): void {
  const existing = headers.get("Vary");
  const tokens = (existing ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.some((t) => t === "*" || t.toLowerCase() === "accept")) return;
  headers.set("Vary", [...tokens, "Accept"].join(", "));
}

/* Pages that have a Markdown twin. Anything else falls back to HTML. */
export const MARKDOWN_TWINS: Record<string, string> = { "/": "/index.md" };

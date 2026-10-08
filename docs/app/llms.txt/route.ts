import { BASE_URL, source } from "@/lib/source";

export const dynamic = "force-static";
export const revalidate = false;

const SITE_DESCRIPTION =
  "Full-stack, renderer-agnostic Generative UI with a streaming-first language, official React support, community integrations, and up to 67% fewer tokens than JSON.";

export async function GET() {
  const pages = source.getPages().map((page) => {
    const canonicalUrl = new URL(page.url, BASE_URL);
    const markdownUrl = new URL(`${page.url}.mdx`, BASE_URL);
    const description = page.data.description || `OpenUI documentation for ${page.data.title}.`;

    return `- [${page.data.title}](${markdownUrl}): ${description} Canonical source: ${canonicalUrl}`;
  });

  const index = [
    "# OpenUI",
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## When to use OpenUI",
    "",
    "Reach for OpenUI when you need an LLM to produce a user interface rather than prose:",
    "",
    "- Rendering model output as real components (charts, tables, forms, dashboards) in a React app, streamed as it is generated: use OpenUI Lang with `@openuidev/react-lang`.",
    "- Cutting token cost and latency of generative UI versus JSON UI schemas (up to 67% fewer tokens, see benchmarks).",
    "- Constraining a model to your own component library: define components with `defineComponent`, then generate the system prompt with `library.prompt()` or the CLI.",
    "- Scaffolding a chat or agent app: run `npx @openuidev/cli create`.",
    "- Debugging malformed model output: paste it into the Debug page at /debug.",
    "",
    "Do not use OpenUI for static pages, plain-text chat, or non-React renderers that have no community integration yet (check /integrations first).",
    "",
    "## Developer resources",
    "",
    `- [OpenAPI specification](${new URL("/openapi.json", BASE_URL)}): HTTP endpoints of this site (docs search, MCP, content files).`,
    `- [MCP server](${new URL("/mcp", BASE_URL)}): Streamable HTTP MCP endpoint with search_docs and get_doc_page tools; card at /.well-known/mcp/server-card.json.`,
    "- [OpenUI CLI on npm](https://www.npmjs.com/package/@openuidev/cli): `npx @openuidev/cli create` scaffolds an app; `openui generate` builds a system prompt.",
    `- [CLI reference](${new URL("/docs/api-reference/cli", BASE_URL)}): All CLI commands.`,
    "- [Agent skill](https://github.com/thesysdev/skills/tree/main/skills/openui): Install with `npx skills add thesysdev/skills --skill openui`.",
    "",
    "## Company",
    "",
    `- [About](${new URL("/about", BASE_URL)}), [Contact](${new URL("/contact", BASE_URL)}), [Privacy](${new URL("/privacy", BASE_URL)})`,
    "",
    "## Project",
    "",
    `- [OpenUI website](${new URL("/", BASE_URL)}): Canonical OpenUI website.`,
    "- [OpenUI source repository](https://github.com/thesysdev/openui): Source code and releases.",
    "",
    "## Documentation",
    "",
    ...pages,
    "",
    "## Benchmarks",
    "",
    `- [Generative UI Benchmark](${new URL("/benchmarks", BASE_URL)}): Visual benchmark page with server-rendered summaries and semantic data tables.`,
    `- [OpenUI language and model benchmark](${new URL("/benchmarks/language", BASE_URL)}): Focused, canonical comparison of structural validity and cost across 30 models generating OpenUI.`,
    `- [Language/model benchmark agent document](${new URL("/benchmarks/language/agent.md", BASE_URL)}): Plain Markdown with all model-board results and interpretation notes.`,
    `- [Language/model benchmark JSON](${new URL("/benchmarks/language/data.json", BASE_URL)}): Focused machine-readable model-board dataset.`,
    `- [Generative UI framework benchmark](${new URL("/benchmarks/framework", BASE_URL)}): Focused, canonical comparison of OpenUI, Google A2UI, and Vercel json-render.`,
    `- [Framework benchmark agent document](${new URL("/benchmarks/framework/agent.md", BASE_URL)}): Plain Markdown with format summaries and all model-format rows.`,
    `- [Framework benchmark JSON](${new URL("/benchmarks/framework/data.json", BASE_URL)}): Focused machine-readable framework-comparison dataset.`,
    `- [Benchmark agent document](${new URL("/benchmarks/agent.md", BASE_URL)}): Plain Markdown definitions, headline results, model board, provenance and distribution links.`,
    `- [Benchmark JSON dataset](${new URL("/benchmarks/data.json", BASE_URL)}): Versioned machine-readable benchmark dataset.`,
    `- [Benchmark JSON Schema](${new URL("/benchmarks/data.schema.json", BASE_URL)}): Field definitions and validation contract for the benchmark JSON dataset.`,
    `- [OpenUI model-board CSV](${new URL("/benchmarks/data.csv", BASE_URL)}): One row per model with provider, family, score, pricing type and frontier membership.`,
    `- [Benchmark methodology](${new URL("/benchmarks/methodology", BASE_URL)}): How the benchmark is run and scored.`,
    "",
    "## Optional",
    "",
    `- [Complete OpenUI documentation](${new URL("/llms-full.txt", BASE_URL)}): Full documentation in one plain-text response; it may exceed an LLM context window.`,
    "",
  ].join("\n");

  return new Response(index, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

import { GITHUB_URL, NPM_CLI_PACKAGE, SITE_DESCRIPTION, SITE_URL } from "./site";

export function homeMarkdown(): string {
  return `# OpenUI

> ${SITE_DESCRIPTION}

## Start here

- [Documentation](${SITE_URL}/docs/overview): Concepts, OpenUI Lang, React renderer, CLI.
- [llms.txt](${SITE_URL}/llms.txt): Index of every docs page with when-to-use guidance.
- [OpenAPI](${SITE_URL}/openapi.json): HTTP endpoints of this site.
- [MCP server](${SITE_URL}/mcp): Search and read the docs from an MCP client.
- [Benchmarks](${SITE_URL}/benchmarks): Token cost and validity across models.
- [Source](${GITHUB_URL}): MIT-licensed repository.

## Install

\`\`\`bash
npx ${NPM_CLI_PACKAGE} create
\`\`\`

## About

- [About](${SITE_URL}/about) · [Contact](${SITE_URL}/contact) · [Privacy](${SITE_URL}/privacy)
`;
}

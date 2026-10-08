import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import { type NextRequest, NextResponse } from "next/server";
import { MARKDOWN_TWINS, withVaryAccept } from "./lib/agent-readiness/negotiation";

const { rewrite: rewriteLLM } = rewritePath("/docs{/*path}", "/llms.mdx/docs{/*path}");

export default function proxy(request: NextRequest) {
  let response = NextResponse.next();

  if (isMarkdownPreferred(request)) {
    const pathname = request.nextUrl.pathname;
    const markdownPath = rewriteLLM(pathname) || MARKDOWN_TWINS[pathname];

    if (markdownPath) {
      response = NextResponse.rewrite(new URL(markdownPath, request.nextUrl));
    }
  }

  withVaryAccept(response.headers);
  return response;
}

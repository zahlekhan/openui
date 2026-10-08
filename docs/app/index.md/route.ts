import { homeMarkdown } from "@/lib/agent-readiness/home-markdown";

export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return new Response(homeMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      Link: '<https://www.openui.com/>; rel="canonical"',
    },
  });
}

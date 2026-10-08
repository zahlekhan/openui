import { buildOpenApiSpec } from "@/lib/agent-readiness/openapi";

export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return Response.json(buildOpenApiSpec(), {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

import { apiError } from "@/lib/agent-readiness/api-error";

/* Catches every /api path that has no route of its own, so a wrong guess gets a
   JSON 404 rather than the HTML not-found page. Real routes win over this one. */

function notFound(): Response {
  return apiError(
    404,
    "not_found",
    "No API endpoint exists at this path.",
    "See /llms.txt for the documentation index.",
  );
}

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
export const OPTIONS = notFound;

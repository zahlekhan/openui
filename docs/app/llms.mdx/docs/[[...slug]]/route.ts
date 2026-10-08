import { BASE_URL, getLLMText, source } from "@/lib/source";

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<"/llms.mdx/docs/[[...slug]]">) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) {
    return new Response(
      "# Not found\n\nNo documentation page exists at this path.\n\n- [Documentation index](/llms.txt)\n- [Docs overview](/docs/overview)\n- [Sitemap](/sitemap.xml)\n",
      { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8", Vary: "Accept" } },
    );
  }
  const canonicalUrl = new URL(page.url, BASE_URL).toString();

  return new Response(await getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      Link: `<${canonicalUrl}>; rel="canonical"`,
    },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}

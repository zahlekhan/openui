import Link from "next/link";

/* Rendered with a real HTTP 404. The links are the recovery path for an agent
   (or a person) that guessed a URL: docs, the machine-readable indexes, and the
   sitemap. */
const LINKS = [
  ["/docs/overview", "Documentation"],
  ["/llms.txt", "llms.txt — index of every docs page"],
  ["/sitemap.xml", "Sitemap"],
  ["/openapi.json", "OpenAPI description of the site's API"],
  ["/blog", "Blog"],
  ["/benchmarks", "Benchmarks"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <h1 className="text-3xl font-bold">404 — page not found</h1>
      <p className="text-fd-muted-foreground">
        Nothing exists at this URL. Try one of these instead, or search the docs from{" "}
        <Link className="underline" href="/docs/overview">
          the documentation
        </Link>
        .
      </p>
      <ul className="list-disc pl-6">
        {LINKS.map(([href, label]) => (
          <li key={href}>
            <Link className="underline" href={href}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

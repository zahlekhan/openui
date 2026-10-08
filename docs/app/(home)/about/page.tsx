import type { Metadata } from "next";
import Link from "next/link";
import { TrustPage } from "../_trust/TrustPage";

export const metadata: Metadata = {
  title: "About OpenUI",
  description: "OpenUI is the open standard for Generative UI, built and maintained by Thesys.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <TrustPage
      title="About OpenUI"
      lead="An open standard for Generative UI, built by Thesys and developed in the open."
    >
      <h2>What OpenUI is</h2>
      <p>
        OpenUI is a full-stack, renderer-agnostic framework for Generative UI. Instead of replying
        with text, a language model writes OpenUI Lang, a compact, streaming-first language that is
        rendered into real components from your own design system. It has official React support and
        community integrations for other frameworks, and in our published benchmarks it uses up to
        67% fewer tokens than JSON-based UI formats.
      </p>
      <h2>Who builds it</h2>
      <p>
        OpenUI is created and maintained by Thesys Inc., a company based at 355 Bryant St, San
        Francisco, CA 94107. The core libraries, CLI and documentation are MIT licensed and
        developed in public on <a href="https://github.com/thesysdev/openui">GitHub</a>, where
        contributions and issues are welcome.
      </p>
      <h2>The OpenUI products</h2>
      <ul>
        <li>
          <strong>OpenUI</strong> — the open-source language, renderer, component libraries and CLI.
          Free forever.
        </li>
        <li>
          <strong>OpenUI Gateway</strong> — managed generation with validation and repair, for teams
          running Generative UI in production.
        </li>
        <li>
          <strong>OpenUI Observability</strong> — analytics for how people use your agent interface.
        </li>
      </ul>
      <p>
        See <a href="/pricing">pricing</a>, the <Link href="/docs/overview">documentation</Link>, or{" "}
        <a href="/contact">get in touch</a>.
      </p>
    </TrustPage>
  );
}

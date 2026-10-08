import type { Metadata } from "next";
import { TrustPage } from "../_trust/TrustPage";

export const metadata: Metadata = {
  title: "Contact OpenUI",
  description: "How to reach the OpenUI team: GitHub, Discord, X and our San Francisco office.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <TrustPage
      title="Contact"
      lead="The fastest way to reach the OpenUI team is in public, where answers help everyone."
    >
      <h2>Questions and bugs</h2>
      <p>
        Open an issue or start a discussion on{" "}
        <a href="https://github.com/thesysdev/openui/issues">GitHub</a>. For usage questions, the{" "}
        <a href="https://discord.com/invite/Pbv5PsqUSv">OpenUI Discord</a> is active and monitored
        by the maintainers.
      </p>
      <h2>Security reports</h2>
      <p>
        Please do not file public issues for vulnerabilities. Use the repository&apos;s &quot;Report
        a vulnerability&quot; button under the{" "}
        <a href="https://github.com/thesysdev/openui/security">Security tab</a>, as described in our{" "}
        <a href="https://github.com/thesysdev/openui/blob/main/SECURITY.md">security policy</a>.
      </p>
      <h2>Company and product enquiries</h2>
      <p>
        For OpenUI Gateway, OpenUI Observability or partnerships, message{" "}
        <a href="https://x.com/thesysdev">@thesysdev on X</a> or{" "}
        <a href="https://www.linkedin.com/company/thesysdev/">LinkedIn</a>, or join the early access
        list on the <a href="/cloud/observability">Observability page</a>.
      </p>
      <h2>Address</h2>
      <p>Thesys Inc., 355 Bryant St, San Francisco, CA 94107, United States.</p>
    </TrustPage>
  );
}
